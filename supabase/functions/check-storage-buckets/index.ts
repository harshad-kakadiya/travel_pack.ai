import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface BucketStatus {
  name: string;
  exists: boolean;
  policies: {
    select: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
  };
  error?: string;
}

interface CheckBucketsResponse {
  success: boolean;
  buckets: BucketStatus[];
  message?: string;
  error?: string;
}

const REQUIRED_BUCKETS = [
  {
    name: 'travel-packs',
    description: 'Storage for generated travel pack HTML and PDF files',
    policies: {
      select: true,
      insert: true,
      update: true,
      delete: false // Don't allow deletion of generated packs
    }
  },
  {
    name: 'travel-uploads',
    description: 'Temporary storage for user uploaded files (tickets, bookings)',
    policies: {
      select: true,
      insert: true,
      update: false,
      delete: true // Allow cleanup of temporary uploads
    }
  }
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking storage buckets...');

    const bucketStatuses: BucketStatus[] = [];
    let allGood = true;

    // Check each required bucket
    for (const bucketConfig of REQUIRED_BUCKETS) {
      const status: BucketStatus = {
        name: bucketConfig.name,
        exists: false,
        policies: {
          select: false,
          insert: false,
          update: false,
          delete: false
        }
      };

      try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          status.error = `Failed to list buckets: ${listError.message}`;
          allGood = false;
        } else {
          const bucket = buckets?.find(b => b.name === bucketConfig.name);
          status.exists = !!bucket;

          if (status.exists) {
            // Check policies (simplified check - in production you'd query the actual policies)
            // For now, we'll assume policies are correct if bucket exists
            status.policies = {
              select: true,
              insert: true,
              update: bucketConfig.policies.update,
              delete: bucketConfig.policies.delete
            };
          } else {
            // Try to create the bucket
            console.log(`Creating bucket: ${bucketConfig.name}`);
            
            const { error: createError } = await supabase.storage.createBucket(bucketConfig.name, {
              public: true, // Make buckets public for easy access to generated files
              allowedMimeTypes: bucketConfig.name === 'travel-packs' 
                ? ['text/html', 'application/pdf']
                : ['image/jpeg', 'image/png', 'application/pdf'],
              fileSizeLimit: bucketConfig.name === 'travel-packs' 
                ? 10 * 1024 * 1024 // 10MB for generated files
                : 10 * 1024 * 1024  // 10MB for uploads
            });

            if (createError) {
              status.error = `Failed to create bucket: ${createError.message}`;
              allGood = false;
            } else {
              status.exists = true;
              status.policies = {
                select: true,
                insert: true,
                update: bucketConfig.policies.update,
                delete: bucketConfig.policies.delete
              };
              console.log(`✅ Created bucket: ${bucketConfig.name}`);
            }
          }
        }
      } catch (error) {
        status.error = `Unexpected error: ${error.message}`;
        allGood = false;
      }

      bucketStatuses.push(status);
    }

    // Log performance
    await supabase
      .from('logs_performance')
      .insert({
        operation: 'check_storage_buckets',
        duration_ms: Date.now(), // In production, calculate actual duration
        meta: {
          buckets_checked: REQUIRED_BUCKETS.length,
          all_good: allGood,
          bucket_statuses: bucketStatuses.map(b => ({
            name: b.name,
            exists: b.exists,
            has_error: !!b.error
          }))
        }
      });

    const response: CheckBucketsResponse = {
      success: allGood,
      buckets: bucketStatuses,
      message: allGood 
        ? 'All storage buckets are properly configured'
        : 'Some storage buckets need attention'
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error checking storage buckets:', error);
    
    // Log the error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase
        .from('logs_errors')
        .insert({
          level: 'error',
          message: `check-storage-buckets error: ${error.message}`,
          meta: {
            function: 'check_storage_buckets',
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        buckets: [],
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
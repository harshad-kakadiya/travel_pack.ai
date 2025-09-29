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

/**
 * Admin utility to check and ensure storage buckets exist with correct policies
 * Only works when admin mode is enabled and user is whitelisted
 */
export async function checkStorageBuckets(): Promise<CheckBucketsResponse> {
  try {
    console.log('🔍 Checking storage buckets...');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-storage-buckets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: CheckBucketsResponse = await response.json();
    
    // Log results to console
    console.log('📊 Storage Bucket Status:');
    console.log('========================');
    
    result.buckets.forEach(bucket => {
      console.log(`\n📁 Bucket: ${bucket.name}`);
      console.log(`   Exists: ${bucket.exists ? '✅' : '❌'}`);
      
      if (bucket.exists) {
        console.log('   Policies:');
        console.log(`     SELECT: ${bucket.policies.select ? '✅' : '❌'}`);
        console.log(`     INSERT: ${bucket.policies.insert ? '✅' : '❌'}`);
        console.log(`     UPDATE: ${bucket.policies.update ? '✅' : '❌'}`);
        console.log(`     DELETE: ${bucket.policies.delete ? '✅' : '❌'}`);
      }
      
      if (bucket.error) {
        console.log(`   Error: ⚠️ ${bucket.error}`);
      }
    });

    if (result.message) {
      console.log(`\n💡 ${result.message}`);
    }

    console.log('\n========================');
    console.log(result.success ? '✅ Bucket check completed successfully' : '❌ Bucket check completed with issues');

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Failed to check storage buckets:', errorMessage);
    
    return {
      success: false,
      buckets: [],
      error: errorMessage
    };
  }
}

/**
 * Convenience function to run bucket check from browser console
 * Usage: window.checkBuckets()
 */
export function setupAdminConsoleCommands() {
  if (typeof window !== 'undefined') {
    (window as any).checkBuckets = async () => {
      const result = await checkStorageBuckets();
      return result;
    };
    
    console.log('🔧 Admin commands available:');
    console.log('   window.checkBuckets() - Check storage bucket status');
  }
}
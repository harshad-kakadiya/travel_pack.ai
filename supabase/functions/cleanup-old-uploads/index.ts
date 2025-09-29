import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 1 request per hour per IP (cleanup is admin-level operation)
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit(clientIP, 1, 3600000); // 1 request per hour
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for cleanup operation, IP ${clientIP}`);
      return createRateLimitResponse(rateLimitResult);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate cutoff time (48 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 48);

    // Find old pending sessions that haven't been paid for
    const { data: oldSessions, error: sessionError } = await supabase
      .from('pending_sessions')
      .select('id, upload_keys, created_at')
      .eq('has_paid', false)
      .lt('created_at', cutoffTime.toISOString());

    if (sessionError) {
      console.error('Error fetching old sessions:', sessionError);
      throw new Error('Failed to fetch old sessions');
    }

    let deletedFiles = 0;
    let deletedSessions = 0;
    const errors: string[] = [];

    // Process each old session
    for (const session of oldSessions || []) {
      try {
        // Delete associated upload files
        if (session.upload_keys && Array.isArray(session.upload_keys)) {
          for (const uploadKey of session.upload_keys) {
            try {
              const { error: deleteError } = await supabase.storage
                .from('travel-uploads')
                .remove([uploadKey]);

              if (deleteError) {
                console.error(`Failed to delete upload ${uploadKey}:`, deleteError);
                errors.push(`Failed to delete upload ${uploadKey}: ${deleteError.message}`);
              } else {
                deletedFiles++;
              }
            } catch (fileError) {
              console.error(`Error deleting file ${uploadKey}:`, fileError);
              errors.push(`Error deleting file ${uploadKey}: ${fileError.message}`);
            }
          }
        }

        // Delete booking data associated with this session
        const { error: bookingDeleteError } = await supabase
          .from('booking_data')
          .delete()
          .eq('pending_session_id', session.id);

        if (bookingDeleteError) {
          console.error(`Failed to delete booking data for session ${session.id}:`, bookingDeleteError);
          errors.push(`Failed to delete booking data for session ${session.id}`);
        }

        // Delete the pending session
        const { error: sessionDeleteError } = await supabase
          .from('pending_sessions')
          .delete()
          .eq('id', session.id);

        if (sessionDeleteError) {
          console.error(`Failed to delete session ${session.id}:`, sessionDeleteError);
          errors.push(`Failed to delete session ${session.id}`);
        } else {
          deletedSessions++;
        }

      } catch (sessionError) {
        console.error(`Error processing session ${session.id}:`, sessionError);
        errors.push(`Error processing session ${session.id}: ${sessionError.message}`);
      }
    }

    // Also clean up orphaned files in storage (files not referenced by any session)
    const { data: allFiles, error: listError } = await supabase.storage
      .from('travel-uploads')
      .list();

    if (!listError && allFiles) {
      // Get all upload keys currently referenced by sessions
      const { data: activeSessions } = await supabase
        .from('pending_sessions')
        .select('upload_keys');

      const activeUploadKeys = new Set();
      activeSessions?.forEach(session => {
        if (session.upload_keys && Array.isArray(session.upload_keys)) {
          session.upload_keys.forEach(key => activeUploadKeys.add(key));
        }
      });

      // Delete orphaned files
      for (const file of allFiles) {
        if (!activeUploadKeys.has(file.name)) {
          // Check if file is old enough to delete
          const fileDate = new Date(file.created_at || file.updated_at);
          if (fileDate < cutoffTime) {
            try {
              const { error: orphanDeleteError } = await supabase.storage
                .from('travel-uploads')
                .remove([file.name]);

              if (!orphanDeleteError) {
                deletedFiles++;
              } else {
                errors.push(`Failed to delete orphaned file ${file.name}`);
              }
            } catch (orphanError) {
              errors.push(`Error deleting orphaned file ${file.name}: ${orphanError.message}`);
            }
          }
        }
      }
    }

    // Log the cleanup operation
    await supabase
      .from('logs_performance')
      .insert({
        operation: 'cleanup_old_uploads',
        duration_ms: Date.now(), // In production, calculate actual duration
        meta: {
          deleted_files: deletedFiles,
          deleted_sessions: deletedSessions,
          errors: errors.length,
          cutoff_time: cutoffTime.toISOString()
        }
      });

    // Log any errors
    if (errors.length > 0) {
      await supabase
        .from('logs_errors')
        .insert({
          level: 'warning',
          message: `Cleanup completed with ${errors.length} errors`,
          meta: {
            function: 'cleanup_old_uploads',
            errors: errors.slice(0, 10) // Limit to first 10 errors
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted_files: deletedFiles,
        deleted_sessions: deletedSessions,
        errors: errors.length,
        message: `Cleanup completed. Deleted ${deletedFiles} files and ${deletedSessions} sessions.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error during cleanup:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Cleanup failed',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
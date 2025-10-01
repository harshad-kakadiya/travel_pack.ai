import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabaseClient: SupabaseClient | null = null;

if (url && anon) {
  supabaseClient = createClient(url, anon, { 
    auth: { 
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    } 
  });
} else {
  if (import.meta.env.DEV) {
    console.warn('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Skipping client init in dev.');
  }
}

export const supabase = supabaseClient;
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or use Edge Functions.');
  }
  return supabaseClient;
}

export interface UploadResult {
  success: boolean;
  uploadKey?: string;
  error?: string;
}

export interface ProcessUploadsResult {
  success: boolean;
  parsed?: any[];
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFileToStorage(file: File, pendingSessionId: string): Promise<UploadResult> {
  try {
    // Generate unique filename with timestamp and session ID
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadKey = `${pendingSessionId}/${timestamp}_${sanitizedName}`;

    // Upload file to travel-uploads bucket
    const { data, error } = await supabase.storage
      .from('travel-uploads')
      .upload(uploadKey, file, {
        contentType: file.type,
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      uploadKey: data.path
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadFilesToStorage(files: File[], pendingSessionId: string): Promise<{
  success: boolean;
  uploadKeys: string[];
  errors: string[];
}> {
  const uploadKeys: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadFileToStorage(file, pendingSessionId);
    
    if (result.success && result.uploadKey) {
      uploadKeys.push(result.uploadKey);
    } else {
      errors.push(`${file.name}: ${result.error || 'Unknown error'}`);
    }
  }

  return {
    success: uploadKeys.length > 0,
    uploadKeys,
    errors
  };
}

/**
 * Call the process-uploads Edge Function
 */
export async function processUploads(pendingSessionId: string, uploadKeys: string[]): Promise<ProcessUploadsResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/process-uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pending_session_id: pendingSessionId,
        upload_keys: uploadKeys
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: result.success,
      parsed: result.parsed
    };
  } catch (error) {
    console.error('Process uploads error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    };
  }
}

/**
 * Complete upload and processing workflow
 */
export async function uploadAndProcessFiles(files: File[], pendingSessionId: string): Promise<{
  success: boolean;
  uploadKeys: string[];
  parsedData?: any[];
  errors: string[];
}> {
  // Step 1: Upload files to storage
  const uploadResult = await uploadFilesToStorage(files, pendingSessionId);
  
  if (!uploadResult.success || uploadResult.uploadKeys.length === 0) {
    return {
      success: false,
      uploadKeys: [],
      errors: uploadResult.errors
    };
  }

  // Step 2: Process uploaded files
  const processResult = await processUploads(pendingSessionId, uploadResult.uploadKeys);
  
  if (!processResult.success) {
    return {
      success: false,
      uploadKeys: uploadResult.uploadKeys,
      errors: [...uploadResult.errors, processResult.error || 'Processing failed']
    };
  }

  return {
    success: true,
    uploadKeys: uploadResult.uploadKeys,
    parsedData: processResult.parsed,
    errors: uploadResult.errors
  };
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create a public client that doesn't require authentication
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Upload function that uses the public client
export async function uploadImageToBlogBucket(file: File, filename: string): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadKey = `blog-images/${timestamp}_${sanitizedName}`;

    console.log('Uploading to blog_image bucket:', uploadKey);

    // Upload using public client
    const { data, error } = await supabasePublic.storage
      .from('blog_image')
      .upload(uploadKey, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabasePublic.storage
      .from('blog_image')
      .getPublicUrl(data.path);

    console.log('Upload successful:', publicUrl);
    return {
      success: true,
      url: publicUrl
    };
  } catch (err) {
    console.error('Upload exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed'
    };
  }
}
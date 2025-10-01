import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, BlogPost } from '../../../lib/supabaseAdmin';
import { getAdminTokenFromRequest, isAdminTokenValid } from '../../../lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getAdminTokenFromRequest(req);
  if (!token || !isAdminTokenValid(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // List all blog posts
    try {
      const { data: posts, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.status(200).json({ posts: posts || [] });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  } else if (req.method === 'POST') {
    // Create new blog post
    try {
      const { title, slug, content, published_date, read_time, image_url } = req.body;

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content are required' });
      }

      // If image_url is a data URL (from filters), we need to upload it to storage
      let finalImageUrl = image_url;
      if (image_url && image_url.startsWith('data:')) {
        try {
          // Convert data URL to blob
          const response = await fetch(image_url);
          const blob = await response.blob();
          
          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = blob.type.split('/')[1] || 'jpg';
          const uploadKey = `blog-images/${timestamp}_filtered.${fileExtension}`;

          // Upload to blog_image bucket
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('blog_image')
            .upload(uploadKey, blob, {
              contentType: blob.type,
              upsert: false
            });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload image' });
          }

          // Get public URL
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('blog_image')
            .getPublicUrl(uploadData.path);

          finalImageUrl = publicUrl;
        } catch (error) {
          console.error('Error processing image:', error);
          return res.status(500).json({ error: 'Failed to process image' });
        }
      }

      const { data: post, error } = await supabaseAdmin
        .from('blog_posts')
        .insert({
          title,
          slug,
          content,
          published_date: published_date ? new Date(published_date).toISOString() : null,
          read_time,
          image_url: finalImageUrl,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'A blog post with this slug already exists' });
        }
        throw error;
      }

      res.status(201).json({ post });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
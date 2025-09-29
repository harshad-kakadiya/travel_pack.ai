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
      const { title, slug, content } = req.body;

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content are required' });
      }

      const { data: post, error } = await supabaseAdmin
        .from('blog_posts')
        .insert({
          title,
          slug,
          content,
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
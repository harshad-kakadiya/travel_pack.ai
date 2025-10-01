-- Add new fields to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS published_date date,
ADD COLUMN IF NOT EXISTS read_time text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy for blog images
CREATE POLICY "Blog images are publicly accessible" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'blog-images');

-- Set up authenticated users can upload policy
CREATE POLICY "Authenticated users can upload blog images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'blog-images');

-- Set up authenticated users can update their own images
CREATE POLICY "Authenticated users can update their own blog images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'blog-images');

-- Set up authenticated users can delete their own images
CREATE POLICY "Authenticated users can delete their own blog images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'blog-images');

-- Set up service role can perform all operations on blog images
CREATE POLICY "Service role can perform all operations on blog images" 
ON storage.objects FOR ALL 
TO service_role 
USING (bucket_id = 'blog-images');
-- Fix blog_image bucket policies to allow public uploads
-- First, drop existing policies
DROP POLICY IF EXISTS "Allow public read from blog_image" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to blog_image" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to blog_image" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update blog_image" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete blog_image" ON storage.objects;

-- Create new policies that allow public access
CREATE POLICY "Allow public read from blog_image"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'blog_image');

CREATE POLICY "Allow public upload to blog_image"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'blog_image');

CREATE POLICY "Allow public update blog_image"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'blog_image');

CREATE POLICY "Allow public delete blog_image"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'blog_image');

-- Also allow service role full access
CREATE POLICY "Allow service role full access to blog_image"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'blog_image');
-- Create blog_image storage bucket for blog post images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('blog_image', 'blog_image', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Storage policies for blog_image bucket
CREATE POLICY "Allow public read from blog_image"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'blog_image');

CREATE POLICY "Allow service role full access to blog_image"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'blog_image');

CREATE POLICY "Allow authenticated users to upload to blog_image"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog_image');

CREATE POLICY "Allow authenticated users to update blog_image"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog_image');

CREATE POLICY "Allow authenticated users to delete blog_image"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog_image');
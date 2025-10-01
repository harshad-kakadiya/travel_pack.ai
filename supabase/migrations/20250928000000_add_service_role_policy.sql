-- Add service role policy for blog-images bucket
CREATE POLICY "Service role can perform all operations on blog images" 
ON storage.objects FOR ALL 
TO service_role 
USING (bucket_id = 'blog-images');
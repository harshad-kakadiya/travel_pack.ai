-- Allow public users to upload blog images
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;

-- Create new policy allowing anyone to upload blog images
CREATE POLICY "Anyone can upload blog images" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'blog-images');

-- Allow public users to update blog images
DROP POLICY IF EXISTS "Authenticated users can update their own blog images" ON storage.objects;

-- Create new policy allowing anyone to update blog images
CREATE POLICY "Anyone can update blog images" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'blog-images');

-- Allow public users to delete blog images
DROP POLICY IF EXISTS "Authenticated users can delete their own blog images" ON storage.objects;

-- Create new policy allowing anyone to delete blog images
CREATE POLICY "Anyone can delete blog images" 
ON storage.objects FOR DELETE 
TO public 
USING (bucket_id = 'blog-images');
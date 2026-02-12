-- Create storage bucket for story images
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true);

-- Allow anyone to view story images
CREATE POLICY "Anyone can view story images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'story-images');

-- Only admins can upload story images
CREATE POLICY "Admins can upload story images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'story-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update story images
CREATE POLICY "Admins can update story images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'story-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete story images
CREATE POLICY "Admins can delete story images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'story-images' AND has_role(auth.uid(), 'admin'::app_role));
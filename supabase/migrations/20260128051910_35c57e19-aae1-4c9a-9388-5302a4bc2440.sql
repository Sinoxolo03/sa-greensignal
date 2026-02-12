-- Add image support to marketing_videos table
ALTER TABLE public.marketing_videos 
ADD COLUMN image_url TEXT,
ADD COLUMN image_file_path TEXT,
ADD COLUMN content_type TEXT NOT NULL DEFAULT 'video';

-- Add comment for clarity
COMMENT ON COLUMN public.marketing_videos.content_type IS 'Type of content: video or image';
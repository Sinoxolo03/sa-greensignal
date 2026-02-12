-- Create video analytics table
CREATE TABLE public.video_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.marketing_videos(id) ON DELETE CASCADE,
  view_type TEXT NOT NULL CHECK (view_type IN ('visit', 'watch')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_hash TEXT
);

-- Enable RLS
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous tracking)
CREATE POLICY "Anyone can insert analytics"
ON public.video_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Only admins can view analytics"
ON public.video_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_video_analytics_video_id ON public.video_analytics(video_id);
CREATE INDEX idx_video_analytics_created_at ON public.video_analytics(created_at);
CREATE INDEX idx_video_analytics_view_type ON public.video_analytics(view_type);

-- Add constraint to content_type column (yours is missing the constraint)
ALTER TABLE public.marketing_videos
ADD CONSTRAINT marketing_videos_content_type_check 
CHECK (content_type IN ('video', 'image'));
-- Create community_stories table for NGO/NPO/community stories
CREATE TABLE public.community_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

-- Anyone can view published stories
CREATE POLICY "Anyone can view published stories"
ON public.community_stories
FOR SELECT
USING (published = true);

-- Only admins can insert stories
CREATE POLICY "Only admins can insert stories"
ON public.community_stories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update stories
CREATE POLICY "Only admins can update stories"
ON public.community_stories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete stories
CREATE POLICY "Only admins can delete stories"
ON public.community_stories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_community_stories_updated_at
BEFORE UPDATE ON public.community_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
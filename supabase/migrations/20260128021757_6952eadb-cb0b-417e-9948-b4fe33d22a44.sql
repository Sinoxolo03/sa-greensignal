-- Create enum for traffic light states
CREATE TYPE public.traffic_light_state AS ENUM ('red', 'orange', 'green');

-- Create enum for job application methods
CREATE TYPE public.application_method AS ENUM ('email', 'whatsapp', 'external_link');

-- Create enum for job status
CREATE TYPE public.job_status AS ENUM ('pending', 'approved', 'filled');

-- Create enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- Traffic light state table (single row)
CREATE TABLE public.traffic_light (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state traffic_light_state NOT NULL DEFAULT 'red',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default traffic light state
INSERT INTO public.traffic_light (state) VALUES ('red');

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  category TEXT,
  application_method application_method NOT NULL DEFAULT 'email',
  contact_info TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  applications_count INTEGER DEFAULT 0,
  interviews_count INTEGER DEFAULT 0,
  hires_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  filled_at TIMESTAMP WITH TIME ZONE
);

-- Marketing videos table
CREATE TABLE public.marketing_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  video_url TEXT,
  video_file_path TEXT,
  description TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proof stats table for historical aggregated data
CREATE TABLE public.proof_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_companies INTEGER NOT NULL DEFAULT 0,
  total_applications INTEGER NOT NULL DEFAULT 0,
  total_interviews INTEGER NOT NULL DEFAULT 0,
  total_hires INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial proof stats
INSERT INTO public.proof_stats (total_companies, total_applications, total_interviews, total_hires) VALUES (0, 0, 0, 0);

-- User roles table (separate from profiles as required)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.traffic_light ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for traffic_light
CREATE POLICY "Anyone can view traffic light state"
  ON public.traffic_light FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update traffic light"
  ON public.traffic_light FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for jobs
CREATE POLICY "Anyone can view approved jobs"
  ON public.jobs FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete jobs"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for marketing_videos
CREATE POLICY "Anyone can view approved videos"
  ON public.marketing_videos FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert videos"
  ON public.marketing_videos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update videos"
  ON public.marketing_videos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete videos"
  ON public.marketing_videos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proof_stats
CREATE POLICY "Anyone can view proof stats"
  ON public.proof_stats FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update proof stats"
  ON public.proof_stats FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_traffic_light_updated_at
  BEFORE UPDATE ON public.traffic_light
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_videos_updated_at
  BEFORE UPDATE ON public.marketing_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proof_stats_updated_at
  BEFORE UPDATE ON public.proof_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for marketing videos
INSERT INTO storage.buckets (id, name, public) VALUES ('marketing-videos', 'marketing-videos', true);

-- Storage policies for marketing videos bucket
CREATE POLICY "Public can view marketing videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketing-videos');

CREATE POLICY "Admins can upload marketing videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'marketing-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete marketing videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'marketing-videos' AND public.has_role(auth.uid(), 'admin'));
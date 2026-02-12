-- Create job type enum
CREATE TYPE public.job_type AS ENUM ('job', 'learnership');

-- Add job_type column to jobs table with default 'job'
ALTER TABLE public.jobs 
ADD COLUMN job_type public.job_type NOT NULL DEFAULT 'job';
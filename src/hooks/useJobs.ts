import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type JobStatus = 'pending' | 'approved' | 'filled';
export type ApplicationMethod = 'email' | 'whatsapp' | 'external_link';
export type JobType = 'job' | 'learnership';

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  location: string;
  category: string | null;
  job_type: JobType;
  application_method: ApplicationMethod;
  contact_info: string;
  status: JobStatus;
  applications_count: number;
  interviews_count: number;
  hires_count: number;
  created_at: string;
  updated_at: string;
  filled_at: string | null;
  companies?: {
    name: string;
  };
}

export interface CreateJobData {
  company_id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  job_type: JobType;
  application_method: ApplicationMethod;
  contact_info: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: CreateJobData) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select('*, companies(name)')
        .single();

      if (error) throw error;
      
      setJobs(prev => [data, ...prev]);
      toast({
        title: 'Job Created',
        description: `${jobData.title} has been added.`,
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const approveJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'approved' as JobStatus } : j));
      toast({
        title: 'Job Approved',
        description: 'The job is now visible to users.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAsFilled = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'filled',
          filled_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'filled' as JobStatus } : j));
      toast({
        title: 'Job Marked as Filled',
        description: 'The job has been archived.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setJobs(prev => prev.filter(j => j.id !== id));
      toast({
        title: 'Job Deleted',
        description: 'The job has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const approvedJobs = jobs.filter(j => j.status === 'approved');
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const filledJobs = jobs.filter(j => j.status === 'filled');

  return { 
    jobs, 
    approvedJobs, 
    pendingJobs, 
    filledJobs,
    loading, 
    createJob, 
    approveJob, 
    markAsFilled, 
    deleteJob,
    refetch: fetchJobs 
  };
}

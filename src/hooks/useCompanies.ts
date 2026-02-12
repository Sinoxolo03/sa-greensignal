import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  details: string | null;
  created_at: string;
  updated_at: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (name: string, details: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name, details })
        .select()
        .single();

      if (error) throw error;
      
      setCompanies(prev => [data, ...prev]);
      toast({
        title: 'Company Created',
        description: `${name} has been added successfully.`,
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

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Company Deleted',
        description: 'The company has been removed.',
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
    fetchCompanies();
  }, []);

  return { companies, loading, createCompany, deleteCompany, refetch: fetchCompanies };
}

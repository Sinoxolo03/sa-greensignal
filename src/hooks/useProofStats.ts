import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProofStats {
  total_companies: number;
  total_applications: number;
  total_interviews: number;
}

export function useProofStats() {
  const [stats, setStats] = useState<ProofStats>({
    total_companies: 0,
    total_applications: 0,
    total_interviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('proof_stats')
        .select('total_companies, total_applications, total_interviews')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching proof stats:', error);
        setLoading(false);
        return;
      }

      setStats({
        total_companies: data?.total_companies || 0,
        total_applications: data?.total_applications || 0,
        total_interviews: data?.total_interviews || 0,
      });
    } catch (error) {
      console.error('Error fetching proof stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}

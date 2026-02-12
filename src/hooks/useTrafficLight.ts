import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type TrafficLightState = 'red' | 'orange' | 'green';

export function useTrafficLight() {
  const [state, setState] = useState<TrafficLightState>('red');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchState = async () => {
    try {
      const { data, error } = await supabase
        .from('traffic_light')
        .select('state')
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setState(data.state as TrafficLightState);
      }
    } catch (error) {
      console.error('Error fetching traffic light state:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = async (newState: TrafficLightState) => {
    try {
      const { error } = await supabase
        .from('traffic_light')
        .update({ state: newState })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

      if (error) throw error;
      
      setState(newState);
      toast({
        title: 'Traffic Light Updated',
        description: `System is now in ${newState.toUpperCase()} mode`,
      });
    } catch (error) {
      console.error('Error updating traffic light state:', error);
      toast({
        title: 'Error',
        description: 'Failed to update traffic light state',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchState();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('traffic_light_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'traffic_light',
        },
        (payload) => {
          if (payload.new && 'state' in payload.new) {
            setState(payload.new.state as TrafficLightState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { state, loading, updateState, refetch: fetchState };
}

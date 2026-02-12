import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVideoAnalytics(videoId: string | null) {
  const startTimeRef = useRef<number | null>(null);
  const hasRecordedRef = useRef<boolean>(false);

  const startTracking = useCallback(() => {
    if (!videoId) return;
    startTimeRef.current = Date.now();
    hasRecordedRef.current = false;
  }, [videoId]);

  const stopTracking = useCallback(async () => {
    if (!videoId || !startTimeRef.current || hasRecordedRef.current) return;

    const durationMs = Date.now() - startTimeRef.current;
    const durationSeconds = Math.floor(durationMs / 1000);
    const viewType = durationSeconds >= 5 ? 'watch' : 'visit';

    hasRecordedRef.current = true;

    try {
      await supabase.from('video_analytics').insert({
        video_id: videoId,
        view_type: viewType,
        duration_seconds: durationSeconds,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to record analytics:', error);
    }

    startTimeRef.current = null;
  }, [videoId]);

  const recordView = useCallback(async (durationSeconds: number) => {
    if (!videoId) return;

    const viewType = durationSeconds >= 5 ? 'watch' : 'visit';

    try {
      await supabase.from('video_analytics').insert({
        video_id: videoId,
        view_type: viewType,
        duration_seconds: durationSeconds,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to record analytics:', error);
    }
  }, [videoId]);

  return {
    startTracking,
    stopTracking,
    recordView,
  };
}

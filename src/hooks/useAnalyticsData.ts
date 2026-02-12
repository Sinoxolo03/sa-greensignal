import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsRow {
  id: string;
  video_id: string | null;
  view_type: string;
  duration_seconds: number;
  created_at: string;
  user_agent: string | null;
  video_title?: string;
  company_name?: string;
}

interface AnalyticsSummary {
  totalVisits: number;
  totalWatches: number;
  totalViews: number;
  avgDuration: number;
  byVideo: {
    videoId: string;
    videoTitle: string;
    companyName: string;
    visits: number;
    watches: number;
  }[];
  byDate: {
    date: string;
    visits: number;
    watches: number;
  }[];
}

export function useAnalyticsData() {
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch analytics with video and company info
      const { data: analytics, error } = await supabase
        .from('video_analytics')
        .select(`
          *,
          marketing_videos!inner(
            description,
            companies(name)
          )
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData: AnalyticsRow[] = (analytics || []).map((row: any) => ({
        id: row.id,
        video_id: row.video_id,
        view_type: row.view_type,
        duration_seconds: row.duration_seconds,
        created_at: row.created_at,
        user_agent: row.user_agent,
        video_title: row.marketing_videos?.description || 'Untitled Video',
        company_name: row.marketing_videos?.companies?.name || 'Unknown Company',
      }));

      setData(processedData);

      // Calculate summary
      const totalVisits = processedData.filter(r => r.view_type === 'visit').length;
      const totalWatches = processedData.filter(r => r.view_type === 'watch').length;
      const avgDuration = processedData.length > 0
        ? processedData.reduce((sum, r) => sum + r.duration_seconds, 0) / processedData.length
        : 0;

      // Group by video
      const videoMap = new Map<string, { visits: number; watches: number; title: string; company: string }>();
      processedData.forEach(row => {
        if (!row.video_id) return;
        const existing = videoMap.get(row.video_id) || { visits: 0, watches: 0, title: row.video_title || '', company: row.company_name || '' };
        if (row.view_type === 'visit') existing.visits++;
        else existing.watches++;
        existing.title = row.video_title || 'Untitled';
        existing.company = row.company_name || 'Unknown';
        videoMap.set(row.video_id, existing);
      });

      // Group by date
      const dateMap = new Map<string, { visits: number; watches: number }>();
      processedData.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString();
        const existing = dateMap.get(date) || { visits: 0, watches: 0 };
        if (row.view_type === 'visit') existing.visits++;
        else existing.watches++;
        dateMap.set(date, existing);
      });

      setSummary({
        totalVisits,
        totalWatches,
        totalViews: totalVisits + totalWatches,
        avgDuration: Math.round(avgDuration * 10) / 10,
        byVideo: Array.from(videoMap.entries()).map(([videoId, data]) => ({
          videoId,
          videoTitle: data.title,
          companyName: data.company,
          visits: data.visits,
          watches: data.watches,
        })),
        byDate: Array.from(dateMap.entries()).map(([date, data]) => ({
          date,
          visits: data.visits,
          watches: data.watches,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportToCSV = useCallback(() => {
    if (data.length === 0) return;

    const headers = ['Date', 'Video', 'Company', 'View Type', 'Duration (seconds)', 'User Agent'];
    const rows = data.map(row => [
      new Date(row.created_at).toLocaleString(),
      row.video_title || '',
      row.company_name || '',
      row.view_type === 'visit' ? 'Site Visit (<5s)' : 'Video Watch (5s+)',
      row.duration_seconds.toString(),
      row.user_agent || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `video-analytics-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [data, dateRange]);

  return {
    data,
    summary,
    loading,
    dateRange,
    setDateRange,
    refetch: fetchData,
    exportToCSV,
  };
}

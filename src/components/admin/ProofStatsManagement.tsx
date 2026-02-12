import { useState, useEffect } from 'react';
import { Building2, TrendingUp, Users, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ProofStatsManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statsId, setStatsId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_companies: 0,
    total_applications: 0,
    total_interviews: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('proof_stats')
        .select('id, total_companies, total_applications, total_interviews')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStatsId(data.id);
        setStats({
          total_companies: data.total_companies,
          total_applications: data.total_applications,
          total_interviews: data.total_interviews,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stats. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!statsId) {
      toast({
        title: 'Error',
        description: 'Stats record not found. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('proof_stats')
        .update({
          total_companies: stats.total_companies,
          total_applications: stats.total_applications,
          total_interviews: stats.total_interviews,
        })
        .eq('id', statsId);

      if (error) throw error;

      toast({
        title: 'Stats Updated',
        description: 'Proof stats have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to save stats. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Red Light Stats (History & Proof)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          These stats are displayed during the RED phase to show your platform's track record.
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Companies
            </Label>
            <Input
              id="companies"
              type="number"
              min="0"
              value={stats.total_companies}
              onChange={(e) => setStats(prev => ({ 
                ...prev, 
                total_companies: parseInt(e.target.value) || 0 
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applications" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Applications
            </Label>
            <Input
              id="applications"
              type="number"
              min="0"
              value={stats.total_applications}
              onChange={(e) => setStats(prev => ({ 
                ...prev, 
                total_applications: parseInt(e.target.value) || 0 
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviews" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Interviews
            </Label>
            <Input
              id="interviews"
              type="number"
              min="0"
              value={stats.total_interviews}
              onChange={(e) => setStats(prev => ({ 
                ...prev, 
                total_interviews: parseInt(e.target.value) || 0 
              }))}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Stats'}
        </Button>
      </CardContent>
    </Card>
  );
}
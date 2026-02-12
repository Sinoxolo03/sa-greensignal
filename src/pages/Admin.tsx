import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, Video } from 'lucide-react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { TrafficLightControl } from '@/components/admin/TrafficLightControl';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { JobManagement } from '@/components/admin/JobManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { ProofStatsManagement } from '@/components/admin/ProofStatsManagement';
import { StoryManagement } from '@/components/admin/StoryManagement';
import { VideoAnalytics } from '@/components/admin/VideoAnalytics';
import { StatCard } from '@/components/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTrafficLight } from '@/hooks/useTrafficLight';
import { useCompanies } from '@/hooks/useCompanies';
import { useJobs } from '@/hooks/useJobs';
import { useVideos } from '@/hooks/useVideos';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { state, updateState } = useTrafficLight();
  const { companies } = useCompanies();
  const { approvedJobs } = useJobs();
  const { videos } = useVideos();
  const navigate = useNavigate();

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, show login
  if (!user) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  // User is logged in, show admin dashboard
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <Separator />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Traffic Light Control */}
        <TrafficLightControl state={state} onStateChange={updateState} />

        {/* Proof Stats Management */}
        <ProofStatsManagement />

        {/* Community Stories Management */}
        <StoryManagement />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Companies"
            value={companies.length}
            icon={Building2}
            variant="blue"
          />
          <StatCard
            title="Active Jobs"
            value={approvedJobs.length}
            icon={Briefcase}
            variant="green"
          />
          <StatCard
            title="Videos"
            value={videos.length}
            icon={Video}
            variant="orange"
          />
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="companies" className="mt-6">
            <CompanyManagement />
          </TabsContent>
          <TabsContent value="jobs" className="mt-6">
            <JobManagement />
          </TabsContent>
          <TabsContent value="videos" className="mt-6">
            <VideoManagement />
          </TabsContent>
        </Tabs>
        {/* Video Analytics */}
        <VideoAnalytics />
      </main>
    </div>
  );
};

export default Admin;
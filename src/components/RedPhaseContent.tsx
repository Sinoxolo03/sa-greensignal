import { Building2, TrendingUp, Users } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useProofStats } from '@/hooks/useProofStats';
import { CommunityStories } from '@/components/CommunityStories';

export function RedPhaseContent() {
  const { stats, loading } = useProofStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <p className="text-lg text-muted-foreground">
          Track record of verified placements and successful connections
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
        <StatCard
          title="Companies"
          value={stats.total_companies}
          icon={Building2}
          variant="red"
          highlight
        />
        <StatCard
          title="Applications"
          value={stats.total_applications}
          icon={TrendingUp}
          variant="red"
        />
        <StatCard
          title="Interviews"
          value={stats.total_interviews}
          icon={Users}
          variant="red"
        />
      </div>

      {stats.total_companies === 0 && stats.total_applications === 0 && (
        <div className="text-center mt-12 py-8">
          <p className="text-muted-foreground">
            No placement history yet. Stats will appear once added by admin.
          </p>
        </div>
      )}

      {/* Community Stories Section */}
      <CommunityStories />
    </div>
  );
}
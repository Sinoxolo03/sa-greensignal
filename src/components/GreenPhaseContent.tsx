import { useState } from 'react';
import { Briefcase, MapPin, ExternalLink, GraduationCap } from 'lucide-react';
import { useJobs, Job, JobType } from '@/hooks/useJobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function JobCard({ job }: { job: Job }) {
  const handleApply = () => {
    window.open(job.contact_info, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">{job.title}</h3>
            <p className="text-primary font-medium">{job.companies?.name}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={job.job_type === 'learnership' ? 'default' : 'secondary'} className="w-fit">
              {job.job_type === 'learnership' ? 'Learnership / Internship' : 'Job'}
            </Badge>
            {job.category && (
              <Badge variant="outline" className="w-fit">
                {job.category}
              </Badge>
            )}
          </div>

          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          )}

          <Button 
            onClick={handleApply}
            className="w-full mt-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GreenPhaseContent() {
  const { approvedJobs, loading } = useJobs();
  const [filter, setFilter] = useState<'all' | JobType>('all');

  const filteredJobs = filter === 'all' 
    ? approvedJobs 
    : approvedJobs.filter(job => job.job_type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-traffic-green"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <p className="text-lg text-muted-foreground">
          All listings are verified and actively hiring
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | JobType)}>
          <TabsList className="grid grid-cols-3 w-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
            </TabsTrigger>
            <TabsTrigger value="job" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="learnership" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Intern/Learnerships
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? 'No open positions at the moment' 
              : filter === 'job' 
                ? 'No job positions available' 
                : 'No learnerships/internships available'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back soon for new opportunities
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

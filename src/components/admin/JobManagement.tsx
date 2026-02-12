import { useState } from 'react';
import { Plus, Trash2, Briefcase, Check, ClipboardCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobs, JobType } from '@/hooks/useJobs';
import { useCompanies } from '@/hooks/useCompanies';
import { format } from 'date-fns';

// Regex patterns for URL and email detection
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

// Function to detect if a string is an email
const isEmail = (text: string): boolean => {
  return EMAIL_REGEX.test(text.trim());
};

// Function to detect if a string is a URL
const isUrl = (text: string): boolean => {
  return URL_REGEX.test(text.trim());
};

// Component to render application link/email with appropriate action
const ApplicationLink = ({ text }: { text: string }) => {
  const trimmedText = text.trim();
  
  if (isEmail(trimmedText)) {
    return (
      <a
        href={`mailto:${trimmedText}`}
        className="inline-flex items-center gap-1 text-blue-500 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <Mail className="h-3 w-3" />
        {trimmedText}
      </a>
    );
  }
  
  if (isUrl(trimmedText)) {
    // Ensure URL has protocol
    const url = trimmedText.startsWith('http') ? trimmedText : `https://${trimmedText}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {trimmedText}
      </a>
    );
  }
  
  // If it's neither URL nor email, return as plain text
  return <span>{trimmedText}</span>;
};

export function JobManagement() {
  const { jobs, loading, createJob, approveJob, markAsFilled, deleteJob } = useJobs();
  const { companies } = useCompanies();
  const [open, setOpen] = useState(false);
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState<JobType>('job');
  const [applicationContact, setApplicationContact] = useState('');

  const resetForm = () => {
    setCompanyId('');
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setJobType('job');
    setApplicationContact('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !title.trim() || !location.trim() || !applicationContact.trim()) return;

    // Validate application contact
    const trimmedContact = applicationContact.trim();
    if (!isEmail(trimmedContact) && !isUrl(trimmedContact)) {
      // You might want to show an error message here
      console.error('Please enter a valid URL or email address');
      return;
    }

    setSubmitting(true);
    const { error } = await createJob({
      company_id: companyId,
      title,
      description,
      location,
      category: category || undefined,
      job_type: jobType,
      application_method: isEmail(trimmedContact) ? 'email' : 'external_link',
      contact_info: trimmedContact,
    });
    setSubmitting(false);

    if (!error) {
      resetForm();
      setOpen(false);
    }
  };

  const handleFill = async () => {
    if (!selectedJobId) return;
    setSubmitting(true);
    await markAsFilled(selectedJobId);
    setSubmitting(false);
    setFillDialogOpen(false);
    setSelectedJobId(null);
  };

  const openFillDialog = (jobId: string) => {
    setSelectedJobId(jobId);
    setFillDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Manage Jobs</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger className="border-primary">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Description</Label>
                <Textarea
                  id="jobDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobLocation">Location</Label>
                <Input
                  id="jobLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobCategory">Category (Optional)</Label>
                <Input
                  id="jobCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="learnership">Learnership / Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationContact">
                  Application Contact
                </Label>
                <Input
                  id="applicationContact"
                  type="text"
                  value={applicationContact}
                  onChange={(e) => setApplicationContact(e.target.value)}
                  placeholder="https://company.com/careers/apply OR careers@company.com"
                  required
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Enter a valid URL (https://...) or email address</p>
                  <p>• URLs will open in a new tab</p>
                  <p>• Emails will open your default email client</p>
                </div>
                {applicationContact.trim() && (
                  <div className="mt-2 p-2 border rounded-md bg-muted/50 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <ApplicationLink text={applicationContact} />
                  </div>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating...' : 'Create Job'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fill Dialog */}
      <Dialog open={fillDialogOpen} onOpenChange={setFillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Job as Filled</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to mark this job as filled? It will be archived and no longer visible to users.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setFillDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFill} disabled={submitting}>
                {submitting ? 'Updating...' : 'Mark as Filled'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {jobs.length === 0 ? (
        <div className="text-center py-10">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No jobs yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{job.title}</h4>
                      <Badge 
                        variant={
                          job.status === 'approved' ? 'default' : 
                          job.status === 'filled' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-primary font-medium">{job.companies?.name}</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                    {job.category && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Category: {job.category}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Type: {job.job_type === 'learnership' ? 'Learnership / Internship' : 'Job'}
                    </p>
                    {job.contact_info && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Apply via:</p>
                        <ApplicationLink text={job.contact_info} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {format(new Date(job.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {job.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveJob(job.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {job.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFillDialog(job.id)}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-1" />
                        Fill
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCompanies } from '@/hooks/useCompanies';
import { format } from 'date-fns';

export function CompanyManagement() {
  const { companies, loading, createCompany, deleteCompany } = useCompanies();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const { error } = await createCompany(name, details);
    setSubmitting(false);

    if (!error) {
      setName('');
      setDetails('');
      setOpen(false);
    }
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
        <h3 className="text-xl font-bold">Manage Companies</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter company name"
                  className="border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyDetails">Company Details</Label>
                <Textarea
                  id="companyDetails"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Enter company details"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Company'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-10">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No companies yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">{company.name}</h4>
                  <p className="text-muted-foreground text-sm">{company.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {format(new Date(company.created_at), 'dd/MM/yyyy')}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteCompany(company.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { Plus, Trash2, Video, Image, Check, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useVideos, ContentType } from '@/hooks/useVideos';
import { useCompanies } from '@/hooks/useCompanies';
import { format } from 'date-fns';

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Component to render description with clickable URLs
const DescriptionWithLinks = ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongText = text.length > maxLength;
  const displayText = isExpanded || !hasLongText ? text : text.slice(0, maxLength) + '...';
  
  // Split text by URLs and render accordingly
  const parts = displayText.split(URL_REGEX);
  
  return (
    <div className="text-sm text-muted-foreground">
      {parts.map((part, index) => {
        if (URL_REGEX.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
      
      {hasLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 text-blue-500 hover:underline text-sm font-medium"
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>
      )}
    </div>
  );
};

export function VideoManagement() {
  const { 
    content, 
    loading, 
    createContent, 
    approveContent, 
    rejectContent, 
    deleteContent, 
    uploadVideo,
    uploadImage 
  } = useVideos();
  const { companies } = useCompanies();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [contentType, setContentType] = useState<ContentType>('video');
  const [companyId, setCompanyId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setContentType('video');
    setCompanyId('');
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (contentType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    if (contentType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (50MB for videos, 5MB for images)
    const maxSize = contentType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${contentType === 'video' ? '50MB' : '5MB'}`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (contentType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      alert('Please select a company');
      return;
    }
    
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (!selectedFile) {
      alert(`Please select a ${contentType} file`);
      return;
    }

    setSubmitting(true);
    setUploading(true);

    let filePath: string | undefined;

    // Upload file
    if (contentType === 'video') {
      const { url, error } = await uploadVideo(selectedFile);
      if (error || !url) {
        setSubmitting(false);
        setUploading(false);
        return;
      }
      filePath = url;
    } else {
      const { url, error } = await uploadImage(selectedFile);
      if (error || !url) {
        setSubmitting(false);
        setUploading(false);
        return;
      }
      filePath = url;
    }

    // Create content entry
    const { error } = await createContent({
      company_id: companyId,
      content_type: contentType,
      video_url: undefined,
      video_file_path: contentType === 'video' ? filePath : undefined,
      image_url: undefined,
      image_file_path: contentType === 'image' ? filePath : undefined,
      description,
    });

    setSubmitting(false);
    setUploading(false);

    if (!error) {
      resetForm();
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
        <h3 className="text-xl font-bold">Manage Media</h3>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Marketing Content</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Content Type Selector */}
              <Tabs value={contentType} onValueChange={(v) => {
                setContentType(v as ContentType);
                setSelectedFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>Company *</Label>
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

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Upload {contentType === 'video' ? 'Video' : 'Image'} File *</Label>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={contentType === 'video' ? 'video/*' : 'image/jpeg,image/jpg,image/png,image/gif,image/webp'}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose {contentType === 'video' ? 'Video' : 'Image'}
                      </>
                    )}
                  </Button>
                  
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                      {contentType === 'video' ? (
                        <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Image className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}

                  {/* Image Preview */}
                  {contentType === 'image' && previewUrl && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {contentType === 'video' 
                    ? 'Max file size: 50MB. Supported formats: MP4, MOV, AVI, WebM' 
                    : 'Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentDescription">Description *</Label>
                <Textarea
                  id="contentDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  disabled={uploading}
                  placeholder="You can include URLs in the description. They will be clickable in the display."
                />
                <p className="text-xs text-muted-foreground">
                  URLs will automatically become clickable links. Use "See More" for long descriptions.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={submitting || uploading || !selectedFile || !companyId || !description.trim()} 
                className="w-full"
              >
                {uploading ? 'Uploading...' : submitting ? 'Creating...' : `Upload ${contentType === 'video' ? 'Video' : 'Image'}`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-10">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No media yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-md overflow-hidden">
                    {item.content_type === 'image' ? (
                      <img
                        src={item.image_url || item.image_file_path || ''}
                        alt={item.description || 'Marketing image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-lg">{item.companies?.name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {item.content_type}
                      </Badge>
                      <Badge variant={item.approved ? 'default' : 'secondary'}>
                        {item.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <DescriptionWithLinks text={item.description || ''} maxLength={100} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {format(new Date(item.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    {!item.approved && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveContent(item.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectContent(item.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteContent(item.id)}
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
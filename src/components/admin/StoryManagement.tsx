import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Heart, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStories, Story } from '@/hooks/useStories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function StoryManagement() {
  const { stories, loading, addStory, updateStory, deleteStory, togglePublish } = useStories();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ title: '', content: '', image_url: '' });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Invalid File', 
          description: 'Please select an image file (JPG, PNG, GIF, WebP)', 
          variant: 'destructive' 
        });
        return null;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({ 
          title: 'File Too Large', 
          description: 'Image must be less than 5MB', 
          variant: 'destructive' 
        });
        return null;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}.${fileExt}`;

      console.log('Starting upload:', { fileName, size: file.size, type: file.type });
      setUploading(true);
      
      const { data, error } = await supabase.storage
        .from('story-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);
      
      toast({ 
        title: 'Upload Successful', 
        description: 'Image has been uploaded successfully' 
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({ 
        title: 'Upload Failed', 
        description: error.message || 'Failed to upload image. Please try again.', 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload the file
    const url = await uploadImage(file);
    if (url) {
      console.log('=== IMAGE URL RECEIVED FROM UPLOAD ===');
      console.log('Full URL:', url);
      console.log('URL length:', url.length);
      console.log('URL type:', typeof url);
      console.log('First 50 chars:', url.substring(0, 50));
      console.log('=====================================');
      
      setFormData(prev => {
        const newData = { ...prev, image_url: url };
        console.log('Setting formData.image_url to:', url);
        console.log('New formData:', newData);
        return newData;
      });
    } else {
      // Clear preview if upload failed
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in title and content',
        variant: 'destructive'
      });
      return;
    }
    
    const imageUrl = formData.image_url.trim();
    console.log('Adding story with data:', {
      title: formData.title.trim(),
      content: formData.content.trim(),
      image_url: imageUrl,
      image_url_length: imageUrl.length
    });
    
    const success = await addStory({
      title: formData.title.trim(),
      content: formData.content.trim(),
      image_url: imageUrl || undefined
    });
    
    if (success) {
      resetForm();
      setIsAddOpen(false);
    }
  };

  const handleEdit = async () => {
    if (!editingStory || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in title and content',
        variant: 'destructive'
      });
      return;
    }
    
    const imageUrl = formData.image_url.trim();
    console.log('Updating story with data:', {
      id: editingStory.id,
      title: formData.title.trim(),
      content: formData.content.trim(),
      image_url: imageUrl,
      image_url_length: imageUrl.length
    });
    
    const success = await updateStory(editingStory.id, {
      title: formData.title.trim(),
      content: formData.content.trim(),
      image_url: imageUrl || null
    });
    
    if (success) {
      resetForm();
      setEditingStory(null);
    }
  };

  const openEditDialog = (story: Story) => {
    setFormData({
      title: story.title,
      content: story.content,
      image_url: story.image_url || ''
    });
    setPreviewImage(story.image_url || null);
    setEditingStory(story);
  };

  const ImageUploadSection = ({ isEdit = false }: { isEdit?: boolean }) => {
    const inputRef = isEdit ? editFileInputRef : fileInputRef;
    const currentImage = previewImage || formData.image_url;

    return (
      <div className="space-y-2">
        <Label>Image (optional)</Label>
        <div className="space-y-3">
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
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
                Choose Image
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Supported: JPG, PNG, GIF, WebP (max 5MB)
          </p>

          {currentImage && (
            <div className="relative border rounded-md overflow-hidden">
              <img
                src={currentImage}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error('Preview image failed to load:', currentImage);
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={clearImage}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <CardTitle>Community Stories</CardTitle>
        </div>
        <Dialog 
          open={isAddOpen} 
          onOpenChange={(open) => { 
            setIsAddOpen(open); 
            if (!open) resetForm(); 
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Community Story</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Story title"
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write about the NGO, NPO, or community member..."
                  rows={6}
                  disabled={uploading}
                />
              </div>
              <ImageUploadSection />
              <Button 
                onClick={handleAdd} 
                disabled={!formData.title.trim() || !formData.content.trim() || uploading} 
                className="w-full"
              >
                Add Story
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {stories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No stories yet. Add your first community story!
          </p>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex gap-3 flex-1 min-w-0 mr-4">
                  {story.image_url && story.image_url.startsWith('http') && (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        console.error('Story thumbnail failed to load:', story.image_url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium truncate">{story.title}</h4>
                      <Badge variant={story.published ? 'default' : 'secondary'}>
                        {story.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {story.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(story.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish(story.id, !story.published)}
                    title={story.published ? 'Unpublish' : 'Publish'}
                  >
                    {story.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Dialog 
                    open={editingStory?.id === story.id} 
                    onOpenChange={(open) => { 
                      if (!open) { 
                        setEditingStory(null); 
                        resetForm(); 
                      } 
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(story)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Story</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Title *</Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            disabled={uploading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-content">Content *</Label>
                          <Textarea
                            id="edit-content"
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            rows={6}
                            disabled={uploading}
                          />
                        </div>
                        <ImageUploadSection isEdit />
                        <Button 
                          onClick={handleEdit} 
                          disabled={!formData.title.trim() || !formData.content.trim() || uploading} 
                          className="w-full"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Story</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{story.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteStory(story.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
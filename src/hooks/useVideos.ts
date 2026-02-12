import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ContentType = 'video' | 'image';

export interface MarketingContent {
  id: string;
  company_id: string;
  content_type: ContentType;
  video_url: string | null;
  video_file_path: string | null;
  image_url: string | null;
  image_file_path: string | null;
  description: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
  companies?: {
    name: string;
  };
}

export type Video = MarketingContent;

export interface CreateContentData {
  company_id: string;
  content_type: ContentType;
  video_url?: string;
  video_file_path?: string;
  image_url?: string;
  image_file_path?: string;
  description: string;
}

export function useVideos() {
  const [content, setContent] = useState<MarketingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_videos')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent((data as MarketingContent[]) || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: CreateContentData) => {
    try {
      const { data, error } = await supabase
        .from('marketing_videos')
        .insert(contentData)
        .select('*, companies(name)')
        .single();

      if (error) throw error;
      
      setContent(prev => [data as MarketingContent, ...prev]);
      toast({
        title: contentData.content_type === 'video' ? 'Video Created' : 'Image Created',
        description: `The marketing ${contentData.content_type} has been added.`,
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const createVideo = createContent;

  const approveContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marketing_videos')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;
      
      setContent(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
      toast({
        title: 'Content Approved',
        description: 'The content is now visible to users.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const approveVideo = approveContent;

  const rejectContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marketing_videos')
        .update({ approved: false })
        .eq('id', id);

      if (error) throw error;
      
      setContent(prev => prev.map(c => c.id === id ? { ...c, approved: false } : c));
      toast({
        title: 'Content Rejected',
        description: 'The content has been rejected.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const rejectVideo = rejectContent;

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marketing_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContent(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Content Deleted',
        description: 'The content has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteVideo = deleteContent;

  const uploadVideo = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('marketing-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketing-videos')
        .getPublicUrl(filePath);

      return { path: filePath, url: publicUrl, error: null };
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message,
        variant: 'destructive',
      });
      return { path: null, url: null, error };
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('marketing-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketing-videos')
        .getPublicUrl(filePath);

      return { path: filePath, url: publicUrl, error: null };
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message,
        variant: 'destructive',
      });
      return { path: null, url: null, error };
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const approvedContent = content.filter(c => c.approved);
  const pendingContent = content.filter(c => !c.approved);

  const videos = content;
  const approvedVideos = approvedContent;
  const pendingVideos = pendingContent;

  return { 
    content,
    videos, 
    approvedContent,
    approvedVideos, 
    pendingContent,
    pendingVideos,
    loading, 
    createContent,
    createVideo, 
    approveContent,
    approveVideo, 
    rejectContent,
    rejectVideo,
    deleteContent,
    deleteVideo,
    uploadVideo,
    uploadImage,
    refetch: fetchContent 
  };
}
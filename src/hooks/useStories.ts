import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Story {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [publishedStories, setPublishedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
    } else {
      setStories(data || []);
      setPublishedStories((data || []).filter(s => s.published));
    }
    setLoading(false);
  };

  const addStory = async (story: { title: string; content: string; image_url?: string }) => {
    const { error } = await supabase
      .from('community_stories')
      .insert({
        title: story.title,
        content: story.content,
        image_url: story.image_url || null,
        published: true
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add story', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Story added successfully' });
    await fetchStories();
    return true;
  };

  const updateStory = async (id: string, updates: Partial<Story>) => {
    const { error } = await supabase
      .from('community_stories')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update story', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Story updated successfully' });
    await fetchStories();
    return true;
  };

  const deleteStory = async (id: string) => {
    const { error } = await supabase
      .from('community_stories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete story', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Story deleted successfully' });
    await fetchStories();
    return true;
  };

  const togglePublish = async (id: string, published: boolean) => {
    return updateStory(id, { published });
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    publishedStories,
    loading,
    addStory,
    updateStory,
    deleteStory,
    togglePublish,
    refetch: fetchStories
  };
}

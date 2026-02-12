import { useState } from 'react';
import { Heart, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStories, Story } from '@/hooks/useStories';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CONTENT_PREVIEW_LENGTH = 150;

function StoryCard({ story }: { story: Story }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const isLongContent = story.content.length > CONTENT_PREVIEW_LENGTH;

  const displayContent = isExpanded || !isLongContent
    ? story.content
    : story.content.slice(0, CONTENT_PREVIEW_LENGTH) + '...';

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', story.image_url);
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.error('Failed to load image:', story.image_url);
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
      {story.image_url && !imageError && (
        <div className="aspect-video overflow-hidden bg-muted relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <img
            src={story.image_url}
            alt={story.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              imageLoading ? "opacity-0" : "opacity-100 hover:scale-105"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{story.title}</CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(story.created_at), 'MMM d, yyyy')}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={cn(
          "text-sm text-muted-foreground whitespace-pre-line transition-all duration-300",
          !isExpanded && isLongContent && "line-clamp-4"
        )}>
          {displayContent}
        </p>
        
        {isLongContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent"
          >
            {isExpanded ? (
              <>
                Read Less
                <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Read More
                <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function CommunityStories() {
  const { publishedStories, loading } = useStories();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (publishedStories.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="text-3xl font-bold text-primary">Community Impact</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {publishedStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}

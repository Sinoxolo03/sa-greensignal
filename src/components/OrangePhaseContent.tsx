import { useRef, useEffect, useState } from 'react';
import { useVideos, MarketingContent } from '@/hooks/useVideos';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Image as ImageIcon } from 'lucide-react';
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Component to render description with clickable URLs and See More
const DescriptionWithLinks = ({ text, maxLength = 60 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongText = text.length > maxLength;
  const displayText = isExpanded || !hasLongText ? text : text.slice(0, maxLength) + '...';
  
  // Split text by URLs and render accordingly
  const parts = displayText.split(URL_REGEX);
  
  return (
    <div className="text-muted-foreground text-xs mt-1">
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
          className="ml-1 text-blue-500 hover:underline text-xs font-medium"
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>
      )}
    </div>
  );
};

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function extractVimeoId(url: string): string | null {
  const regExp = /vimeo.*\/(\d+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function MediaDisplay({ item }: { item: MarketingContent }) {
  const startTimeRef = useRef<number | null>(null);
  const hasTrackedRef = useRef(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { recordView } = useVideoAnalytics(item.id);

  useEffect(() => {
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    return () => {
      if (startTimeRef.current && !hasTrackedRef.current) {
        const durationMs = Date.now() - startTimeRef.current;
        const durationSeconds = Math.floor(durationMs / 1000);
        if (durationSeconds > 0) {
          recordView(durationSeconds);
          hasTrackedRef.current = true;
        }
      }
    };
  }, [item.id, recordView]);

  // Handle image content
  if (item.content_type === 'image') {
    const imageSource = item.image_url || item.image_file_path;
    
    return (
      <div className="relative w-full aspect-video bg-muted">
        {imageSource && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <img
              src={imageSource}
              alt={item.description || 'Marketing content'}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Failed to load image:', imageSource);
                setImageError(true);
              }}
              loading="eager"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  // Handle video content
  const videoUrl = item.video_url;
  const videoFilePath = item.video_file_path;
  const youtubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
  const vimeoId = videoUrl ? extractVimeoId(videoUrl) : null;

  // Determine which video source to use
  const hasYouTube = youtubeId !== null;
  const hasVimeo = vimeoId !== null;
  const hasDirectUrl = videoUrl && !hasYouTube && !hasVimeo;
  const hasFilePath = videoFilePath && !videoUrl;

  return (
    <div className="relative w-full aspect-video bg-muted">
      {hasYouTube && (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="eager"
          title={item.description || 'YouTube video'}
        />
      )}
      
      {hasVimeo && (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
          title={item.description || 'Vimeo video'}
        />
      )}
      
      {hasDirectUrl && !videoError && (
        <video
          src={videoUrl}
          controls
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => {
            console.error('Failed to load video:', videoUrl);
            setVideoError(true);
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}
      
      {hasFilePath && !videoError && (
        <video
          src={videoFilePath}
          controls
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => {
            console.error('Failed to load video:', videoFilePath);
            setVideoError(true);
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}
      
      {(!hasYouTube && !hasVimeo && !hasDirectUrl && !hasFilePath) || videoError ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <Play className="h-12 w-12 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Video unavailable</p>
        </div>
      ) : null}
    </div>
  );
}

function GridCard({ item }: { item: MarketingContent }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <CardContent className="p-0">
        <MediaDisplay item={item} />
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">
            {item.companies?.name}
          </h3>
          <DescriptionWithLinks text={item.description || ''} maxLength={60} />
        </div>
      </CardContent>
    </Card>
  );
}

export function OrangePhaseContent() {
  const { approvedContent, loading } = useVideos();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-traffic-orange"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-lg text-muted-foreground">
          Discover companies and their services.
        </p>
      </div>
      {approvedContent.length === 0 ? (
        <div className="text-center py-16">
          <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No marketing content available at the moment
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back soon for company showcases
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {approvedContent.map((item) => (
            <GridCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
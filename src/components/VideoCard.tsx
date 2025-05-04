import { Play, Settings } from "lucide-react";
import { TokenIcon } from "@/components/icons/TokenIcon";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Player, Thumbnail } from '@remotion/player';

interface VideoCardProps {
  id: string;
  name: string;
  duration: number | null;
  cost: number | null;
  component?: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
}

export const VideoCard = ({ 
  name, 
  duration,
  cost, 
  id,
  component: Component,
  defaultProps 
}: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPlaying(true);
  };

  const renderPreview = () => {
    if (!Component) {
      return <div className="w-full h-full bg-black/20 flex items-center justify-center">Preview not available</div>;
    }

    if (isPlaying) {
      return (
        <Player
          component={Component}
          inputProps={defaultProps}
          durationInFrames={300}
          fps={30}
          autoPlay={true}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{
            width: '100%',
            height: '100%',
          }}
          className="rounded-lg"
        />
      );
    }

    return (
      <Thumbnail
        component={Component}
        inputProps={defaultProps}
        durationInFrames={300}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        frameToDisplay={0}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    );
  };
  
  return (
    <div className="glass-card group hover:animate-card-hover">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        {Component ? renderPreview() : (
          <div className="w-full h-full bg-black/20 flex items-center justify-center">Preview not available</div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
          <button 
            className="p-4 rounded-full bg-primary hover:bg-primary-hover transition-colors"
            title="Preview"
            aria-label="Preview video"
            onClick={handlePlayClick}
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <Link 
            to={`/customize/${id}`}
            className="p-4 rounded-full bg-primary hover:bg-primary-hover transition-colors"
            title="Customize"
            aria-label="Customize video"
          >
            <Settings className="w-6 h-6 sm:w-7 sm:h-7" />
          </Link>
        </div>
        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-sm">
          {duration ? `${duration}s` : '--:--'}
        </span>
      </div>
      <Link 
        to={`/customize/${id}`} 
        className={`p-4 flex items-center justify-between ${isPlaying ? 'bg-primary' : ''}`}
      >
        <div className="flex items-center gap-2">
          {isPlaying && <Settings className="w-5 h-5" />}
          <h3 className="font-semibold text-lg truncate">{name}</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-card/80 border border-primary/20 rounded-full">
          {(!cost || cost === 0) ? (
            <span className="text-sm font-medium">Free</span>
          ) : (
            <>
              <TokenIcon className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">{cost}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};
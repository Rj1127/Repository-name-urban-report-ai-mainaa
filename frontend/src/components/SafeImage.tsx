import { useState } from 'react';
import { Camera, FileText, Wrench } from 'lucide-react';

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackIcon?: 'camera' | 'file' | 'wrench';
}

export default function SafeImage({ 
  src, 
  alt = "Issue preview", 
  className = "w-full h-full object-cover", 
  fallbackIcon = "camera" 
}: Props) {
  const [error, setError] = useState(() => {
    if (!src) return true;
    // Expired or session-locked blob URLs cannot be resolved across page reloads
    if (typeof src === 'string' && src.startsWith('blob:')) return true;
    return false;
  });

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-secondary/40 border border-border/40 p-2 text-center text-muted-foreground rounded-inherit ${className}`}>
        {fallbackIcon === 'wrench' ? (
          <Wrench className="h-6 w-6 opacity-50 mb-1 text-primary" />
        ) : fallbackIcon === 'file' ? (
          <FileText className="h-6 w-6 opacity-50 mb-1 text-primary" />
        ) : (
          <Camera className="h-6 w-6 opacity-50 mb-1 text-primary" />
        )}
        <span className="text-[9px] font-black uppercase tracking-tighter opacity-70 leading-none">
          Report Evidence
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

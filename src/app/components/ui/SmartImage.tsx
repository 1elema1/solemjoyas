import { useState, useEffect, useRef } from 'react';

const DEFAULT_FALLBACK_SVG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjNmI4ZjcxIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4=';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallbackSrc?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function SmartImage({
  src,
  alt = '',
  fallbackSrc = DEFAULT_FALLBACK_SVG,
  priority = false,
  aspectRatio,
  objectFit = 'cover',
  className = '',
  style = {},
  onLoad,
  onError,
  ...rest
}: SmartImageProps) {
  const isEmpty = !src || src.trim() === '';
  const [loaded, setLoaded] = useState(isEmpty);
  const [error, setError] = useState(isEmpty);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    const empty = !src || src.trim() === '';
    if (empty) {
      setLoaded(true);
      setError(true);
    } else {
      setError(false);
      // If already cached by browser, show instantly without transition
      if (imgRef.current?.complete) {
        setLoaded(true);
      } else {
        setLoaded(false);
      }
    }
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    setLoaded(true);
    if (onError) onError(e);
  };

  const currentSrc = error || !src || src.trim() === '' ? fallbackSrc : src;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        aspectRatio: aspectRatio || style?.aspectRatio,
        backgroundColor: 'rgba(107,143,113,0.06)',
        ...style,
      }}
    >
      {/* Skeleton Shimmer Overlay */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 z-10 animate-pulse pointer-events-none"
          style={{
            backgroundColor: 'rgba(0,0,0,0.06)',
            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-ignore - fetchpriority is valid HTML but might not be in React types yet
        fetchpriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: error ? 'center' : objectFit,
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: priority ? 'opacity 0.15s ease-in-out' : 'opacity 0.35s ease-in-out',
        }}
        {...rest}
      />
    </div>
  );
}

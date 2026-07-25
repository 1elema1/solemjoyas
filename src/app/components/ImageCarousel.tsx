import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartImage } from './ui/SmartImage';

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = (images || []).filter(img => img && img.trim() !== '');

  useEffect(() => {
    if (validImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImages.length]);

  if (validImages.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '280px', backgroundColor: 'rgba(107,143,113,0.05)' }}>
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validImages.map((img, idx) => (
          <div key={idx} className="w-full flex-shrink-0 h-full">
            <SmartImage
              src={img}
              alt={`Carrusel ${idx + 1}`}
              className="w-full h-full"
              objectFit="cover"
            />
          </div>
        ))}
      </div>

      {validImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(245,240,232,0.9)',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#1a1a1a',
              zIndex: 20,
            }}
            className="hover:bg-opacity-100 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(245,240,232,0.9)',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#1a1a1a',
              zIndex: 20,
            }}
            className="hover:bg-opacity-100 transition-all"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2" style={{ zIndex: 20 }}>
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: idx === currentIndex ? '#6B8F71' : 'rgba(245,240,232,0.6)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

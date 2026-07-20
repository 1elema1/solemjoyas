import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ImageCarousel } from './ImageCarousel';
import { SmartImage } from './ui/SmartImage';

export function Hero() {
  const { setCurrentView, setSelectedCategory, carouselImages, homeContent } = useStore();

  const goCategory = (cat: string) => { setSelectedCategory(cat); setCurrentView('products'); };
  const goAll = () => { setSelectedCategory(null); setCurrentView('products'); };

  // Parse heroTitle to extract italicized word
  const parseTitleParts = (title: string) => {
    const parts: Array<{ text: string; italic: boolean }> = [];
    const regex = /\*(.*?)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(title)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: title.substring(lastIndex, match.index), italic: false });
      }
      parts.push({ text: match[1], italic: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < title.length) {
      parts.push({ text: title.substring(lastIndex), italic: false });
    }

    return parts;
  };

  const titleParts = parseTitleParts(homeContent.heroTitle);

  useEffect(() => {
    if (homeContent.heroImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = homeContent.heroImage;
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }
  }, [homeContent.heroImage]);

  return (
    <div style={{ backgroundColor: '#F5F0E8' }}>

      {/* ── Hero 50/50 ── */}
      <section style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="grid md:grid-cols-2" style={{ minHeight: '82vh' }}>

          {/* Left — text */}
          <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20">
            <p
              style={{ color: '#6B8F71', fontSize: '0.68rem', letterSpacing: '0.28em' }}
              className="uppercase mb-8 tracking-widest"
            >
              {homeContent.heroTagline}
            </p>

            <h1
              style={{
                fontFamily: '"Cormorant Garamond", "Georgia", serif',
                fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)',
                lineHeight: '1.05',
                color: '#1a1a1a',
                fontWeight: 300,
                letterSpacing: '-0.01em',
              }}
              className="mb-8"
            >
              {titleParts.map((part, idx) => {
                const lines = part.text.split('\n');
                return lines.map((line, lineIdx) => (
                  <span key={`${idx}-${lineIdx}`}>
                    {part.italic ? (
                      <em style={{ fontStyle: 'italic', color: '#6B8F71', fontWeight: 400 }}>{line}</em>
                    ) : (
                      line
                    )}
                    {lineIdx < lines.length - 1 && <br />}
                  </span>
                ));
              })}
            </h1>

            <p
              style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.8', maxWidth: '360px' }}
              className="mb-12"
            >
              {homeContent.heroDescription}
            </p>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={goAll}
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#F5F0E8',
                  fontSize: '0.68rem',
                  letterSpacing: '0.2em',
                  padding: '15px 32px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="uppercase hover:bg-black/80 transition-colors"
              >
                {homeContent.heroButton1Text}
              </button>
              <button
                onClick={() => goCategory(homeContent.heroButton2Category)}
                style={{
                  border: '1px solid rgba(0,0,0,0.25)',
                  color: '#1a1a1a',
                  fontSize: '0.68rem',
                  letterSpacing: '0.2em',
                  padding: '15px 32px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
                className="uppercase hover:bg-black/5 transition-colors"
              >
                {homeContent.heroButton2Text}
              </button>
            </div>
          </div>

          {/* Right — image, exactly 50% */}
          <div className="relative hidden md:block" style={{ overflow: 'hidden' }}>
            <SmartImage
              src={homeContent.heroImage}
              alt="Joya SOLEM"
              priority={true}
              className="absolute inset-0 w-full h-full"
              style={{ objectPosition: 'center center' }}
            />
            {/* Subtle tag */}
            <div
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                backgroundColor: 'rgba(245,240,232,0.92)',
                padding: '14px 20px',
                backdropFilter: 'blur(8px)',
                zIndex: 20,
              }}
            >
              <p style={{ color: '#6B8F71', fontSize: '0.6rem', letterSpacing: '0.22em' }} className="uppercase mb-1">{homeContent.heroNewCollectionTag}</p>
              <p style={{ color: '#1a1a1a', fontSize: '0.72rem', letterSpacing: '0.12em' }} className="uppercase">{homeContent.heroNewCollectionText}</p>
            </div>
          </div>

          {/* Mobile image */}
          <div className="md:hidden h-72 overflow-hidden">
            <SmartImage
              src={homeContent.heroImage}
              alt="Joya SOLEM"
              priority={true}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ── Categories grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p style={{ color: '#6B8F71', fontSize: '0.68rem', letterSpacing: '0.25em' }} className="uppercase mb-4">
            {homeContent.categoriesTitle}
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              color: '#1a1a1a',
              fontWeight: 300,
            }}
          >
            {homeContent.categoriesSubtitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.keys(homeContent.categoryImages).map(cat => (
            <button
              key={cat}
              onClick={() => goCategory(cat)}
              className="group relative overflow-hidden text-left"
              style={{ aspectRatio: '1', borderRadius: '1px', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <SmartImage
                src={homeContent.categoryImages[cat]}
                alt={cat}
                className="w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)',
                  transition: 'opacity 0.3s',
                  zIndex: 15,
                }}
              />
              <p
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  color: 'white',
                  fontSize: '0.68rem',
                  letterSpacing: '0.2em',
                  fontWeight: 500,
                  zIndex: 20,
                }}
                className="uppercase"
              >
                {cat}
              </p>
            </button>
          ))}

          <button
            onClick={goAll}
            className="group relative overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: '1', backgroundColor: '#1a1a1a', borderRadius: '1px', border: 'none', cursor: 'pointer' }}
          >
            <div className="text-center">
              <div style={{ color: '#6B8F71', fontSize: '2.2rem', marginBottom: '10px', lineHeight: 1 }}>✦</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.68rem', letterSpacing: '0.2em' }} className="uppercase">
                Ver todo
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* ── Carousel section ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p style={{ color: '#6B8F71', fontSize: '0.68rem', letterSpacing: '0.25em' }} className="uppercase mb-2">
            {homeContent.carouselTitle}
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
              color: '#1a1a1a',
              fontWeight: 300,
            }}
          >
            {homeContent.carouselSubtitle}
          </h2>
        </div>
        <ImageCarousel images={carouselImages} />
      </section>

      {/* ── Footer strip ── */}
      <footer style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Ubicación</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                {homeContent.footerLocation.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Envíos</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                {homeContent.footerShipping.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Material</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                {homeContent.footerMaterial.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Pedidos</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                {homeContent.footerOrders.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '32px', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', letterSpacing: '0.12em' }}>
              {homeContent.footerCopyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { SmartImage } from './ui/SmartImage';
import { useNavigate } from 'react-router-dom';
import { Instagram, Music2, MessageCircle, Facebook, ArrowRight } from 'lucide-react';

// ── Mini product card for featured section ────────────────────────────────────
function FeaturedCard({ product, priority }: { product: { id: string; name: string; price: number; image: string; images?: string[] }; priority?: boolean }) {
  const navigate = useNavigate();
  const { setSelectedCategory } = useStore();

  const img = (product.images && product.images.length > 0) ? product.images[0] : product.image;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => { setSelectedCategory(null); navigate('/products'); }}
    >
      <div className="relative overflow-hidden mb-3" style={{ aspectRatio: '1', borderRadius: '2px' }}>
        <SmartImage
          src={img}
          alt={product.name}
          objectFit="cover"
          priority={priority}
          className="w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
        >
          <span style={{ color: 'white', fontSize: '0.6rem', letterSpacing: '0.18em' }} className="uppercase">
            Ver más
          </span>
        </div>
      </div>
      <p style={{ color: '#1a1a1a', fontSize: '0.82rem' }} className="mb-0.5 truncate">{product.name}</p>
      <p style={{ color: '#6B8F71', fontSize: '0.82rem' }}>${product.price.toLocaleString('es-AR')}</p>
    </div>
  );
}

// ── Category chip ─────────────────────────────────────────────────────────────
function CategoryChip({ label, image, onClick }: { label: string; image?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 flex-shrink-0"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
    >
      <div
        className="relative overflow-hidden"
        style={{ width: '120px', height: '120px', borderRadius: '80%', border: '3px solid rgba(107,143,113,0.25)' }}
      >
        {image ? (
          <SmartImage src={image} alt={label} objectFit="cover" className="w-full h-full group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(107,143,113,0.1)' }} />
        )}
      </div>
      <span style={{ color: '#1a1a1a', fontSize: '0.6rem', letterSpacing: '0.12em' }} className="uppercase">{label}</span>
    </button>
  );
}

// ── Social icon button ────────────────────────────────────────────────────────
function SocialBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 group"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="group-hover:scale-110 transition-transform duration-300"
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {icon}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.58rem', letterSpacing: '0.15em' }} className="uppercase">{label}</span>
    </a>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export function Hero() {
  const { setSelectedCategory, homeContent, clientProducts, categories } = useStore();
  const navigate = useNavigate();

  const goCategory = (cat: string) => { setSelectedCategory(cat); navigate('/products'); };
  const goAll = () => { setSelectedCategory(null); navigate('/products'); };

  // Parse heroTitle to extract italicized word
  const parseTitleParts = (title: string) => {
    const parts: Array<{ text: string; italic: boolean }> = [];
    const regex = /\*(.*?)\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(title)) !== null) {
      if (match.index > lastIndex) parts.push({ text: title.substring(lastIndex, match.index), italic: false });
      parts.push({ text: match[1], italic: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < title.length) parts.push({ text: title.substring(lastIndex), italic: false });
    return parts;
  };

  const titleParts = useMemo(() => parseTitleParts(homeContent.heroTitle), [homeContent.heroTitle]);

  // Preload hero image
  useEffect(() => {
    if (homeContent.heroImage) {
      const link = document.createElement('link');
      link.rel = 'preload'; link.as = 'image'; link.href = homeContent.heroImage;
      document.head.appendChild(link);
      return () => { try { document.head.removeChild(link); } catch {} };
    }
  }, [homeContent.heroImage]);

  // Featured products: use configured IDs first, fallback to first 8 active products
  const featuredProducts = useMemo(() => {
    const ids = homeContent.featuredProductIds;
    if (ids && ids.length > 0) {
      const ordered = ids.map(id => clientProducts.find(p => p.id === id)).filter(Boolean) as typeof clientProducts;
      return ordered.slice(0, 8);
    }
    return clientProducts.slice(0, 8);
  }, [clientProducts, homeContent.featuredProductIds]);

  const socialLinks = homeContent.socialLinks ?? {};
  const hasSocial = Object.values(socialLinks).some(v => v && v.trim() !== '');

  return (
    <div style={{ backgroundColor: '#F5F0E8' }}>

      {/* ── Hero 50/50 compacto ── */}
      <section style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="grid md:grid-cols-2" style={{ minHeight: '65vh' }}>
          {/* Left — texto */}
          <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-14">
            <p
              style={{ color: '#6B8F71', fontSize: '0.62rem', letterSpacing: '0.3em' }}
              className="uppercase mb-5 tracking-widest"
            >
              {homeContent.heroTagline}
            </p>
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", "Georgia", serif',
                fontSize: 'clamp(2.4rem, 4.5vw, 4.2rem)',
                lineHeight: '1.06',
                color: '#1a1a1a',
                fontWeight: 300,
                letterSpacing: '-0.01em',
              }}
              className="mb-6"
            >
              {titleParts.map((part, idx) => {
                const lines = part.text.split('\n');
                return lines.map((line, lineIdx) => (
                  <span key={`${idx}-${lineIdx}`}>
                    {part.italic
                      ? <em style={{ fontStyle: 'italic', color: '#6B8F71', fontWeight: 400 }}>{line}</em>
                      : line}
                    {lineIdx < lines.length - 1 && <br />}
                  </span>
                ));
              })}
            </h1>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.75', maxWidth: '340px' }} className="mb-8">
              {homeContent.heroDescription}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={goAll}
                style={{
                  backgroundColor: '#1a1a1a', color: '#F5F0E8',
                  fontSize: '0.64rem', letterSpacing: '0.2em',
                  padding: '13px 28px', border: 'none', cursor: 'pointer',
                }}
                className="uppercase hover:bg-black/80 transition-colors flex items-center gap-2"
              >
                {homeContent.heroButton1Text} <ArrowRight size={12} />
              </button>
              <button
                onClick={() => goCategory(homeContent.heroButton2Category)}
                style={{
                  border: '1px solid rgba(0,0,0,0.22)', color: '#1a1a1a',
                  fontSize: '0.64rem', letterSpacing: '0.2em',
                  padding: '13px 28px', backgroundColor: 'transparent', cursor: 'pointer',
                }}
                className="uppercase hover:bg-black/5 transition-colors"
              >
                {homeContent.heroButton2Text}
              </button>
            </div>
          </div>

          {/* Right — imagen hero */}
          <div className="relative hidden md:block" style={{ overflow: 'hidden' }}>
            <SmartImage
              src={homeContent.heroImage}
              alt="Joya SOLEM"
              priority={true}
              className="absolute inset-0 w-full h-full"
              style={{ objectPosition: 'center center' }}
            />
            <div style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              backgroundColor: 'rgba(245,240,232,0.92)', padding: '12px 18px',
              backdropFilter: 'blur(8px)', zIndex: 20,
            }}>
              <p style={{ color: '#6B8F71', fontSize: '0.58rem', letterSpacing: '0.22em' }} className="uppercase mb-0.5">{homeContent.heroNewCollectionTag}</p>
              <p style={{ color: '#1a1a1a', fontSize: '0.68rem', letterSpacing: '0.12em' }} className="uppercase">{homeContent.heroNewCollectionText}</p>
            </div>
          </div>

          {/* Mobile image */}
          <div className="md:hidden h-60 overflow-hidden">
            <SmartImage src={homeContent.heroImage} alt="Joya SOLEM" priority={true} className="w-full h-full" />
          </div>
        </div>
      </section>

      {/* ── Categorías scrollables ── */}
      <section style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', backgroundColor: '#F5F0E8' }} className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={goAll}
              className="flex flex-col items-center gap-2 flex-shrink-0"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#6B8F71', fontSize: '1.3rem' }}>✦</span>
              </div>
              <span style={{ color: '#1a1a1a', fontSize: '0.6rem', letterSpacing: '0.12em' }} className="uppercase">Todo</span>
            </button>
            {categories.map(cat => (
              <CategoryChip
                key={cat}
                label={cat}
                image={homeContent.categoryImages?.[cat]}
                onClick={() => goCategory(cat)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Productos destacados ── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.62rem', letterSpacing: '0.25em' }} className="uppercase mb-2">
                Destacados
              </p>
              <h2 style={{
                fontFamily: '"Cormorant Garamond", "Georgia", serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                color: '#1a1a1a', fontWeight: 300,
              }}>
                Piezas seleccionadas
              </h2>
            </div>
            <button
              onClick={goAll}
              style={{ color: '#6B8F71', fontSize: '0.62rem', letterSpacing: '0.18em', background: 'none', border: 'none', cursor: 'pointer' }}
              className="uppercase hover:opacity-60 transition-opacity flex items-center gap-1 hidden sm:flex"
            >
              Ver todo <ArrowRight size={11} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {featuredProducts.map((product, idx) => (
              <FeaturedCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={goAll}
              style={{
                border: '1px solid rgba(0,0,0,0.22)', color: '#1a1a1a',
                fontSize: '0.64rem', letterSpacing: '0.2em',
                padding: '13px 36px', backgroundColor: 'transparent', cursor: 'pointer',
              }}
              className="uppercase hover:bg-black/5 transition-colors"
            >
              Ver toda la colección
            </button>
          </div>
        </section>
      )}

      {/* ── Redes Sociales ── */}
      {hasSocial && (
        <section style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-14">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p style={{ color: '#6B8F71', fontSize: '0.62rem', letterSpacing: '0.28em' }} className="uppercase mb-3">
              Seguinos
            </p>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              color: 'white', fontWeight: 300, marginBottom: '32px',
            }}>
              Encontranos en redes
            </h2>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {socialLinks.instagram && (
                <SocialBtn href={socialLinks.instagram} label="Instagram" icon={<Instagram size={20} />} />
              )}
              {socialLinks.tiktok && (
                <SocialBtn href={socialLinks.tiktok} label="TikTok" icon={<Music2 size={20} />} />
              )}
              {socialLinks.facebook && (
                <SocialBtn href={socialLinks.facebook} label="Facebook" icon={<Facebook size={20} />} />
              )}
              {socialLinks.whatsapp && (
                <SocialBtn href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} label="WhatsApp" icon={<MessageCircle size={20} />} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer strip ── */}
      <footer style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.6rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Ubicación</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {homeContent.footerLocation.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.6rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Envíos</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {homeContent.footerShipping.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.6rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Material</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {homeContent.footerMaterial.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B8F71', fontSize: '0.6rem', letterSpacing: '0.2em' }} className="uppercase mb-2">Pedidos</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {homeContent.footerOrders.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '32px', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
              {homeContent.footerCopyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

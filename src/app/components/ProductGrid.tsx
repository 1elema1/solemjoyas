import { useState, useEffect } from 'react';
import { ShoppingBag, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, Product, CATEGORIES, getProductPrice } from '../context/StoreContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
function hasVariants(product: Product): boolean {
  return !!(product.variants && product.variants.length > 0);
}

function isSingleVariant(product: Product): boolean {
  return !hasVariants(product) ||
    (product.variants!.length === 1 && product.variants![0].label === 'Única');
}

function productImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  return [product.image];
}

// ── Mini image carousel for detail modal ─────────────────────────────────────
function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);

  if (images.length <= 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    );
  }

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '280px' }}>
      <img
        src={images[idx]}
        alt={`${alt} ${idx + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />

      {/* Prev / Next */}
      <button
        onClick={prev}
        style={{
          position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
          backgroundColor: 'rgba(245,240,232,0.85)', border: 'none', cursor: 'pointer',
          width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ChevronLeft size={16} style={{ color: '#1a1a1a' }} />
      </button>
      <button
        onClick={next}
        style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          backgroundColor: 'rgba(245,240,232,0.85)', border: 'none', cursor: 'pointer',
          width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ChevronRight size={16} style={{ color: '#1a1a1a' }} />
      </button>

      {/* Dot indicators */}
      <div
        style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}
      >
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: '6px', height: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              backgroundColor: i === idx ? '#6B8F71' : 'rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>

      {/* Thumbnails strip */}
      <div
        style={{
          position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '4px',
        }}
      >
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: '36px', height: '36px', padding: 0, border: i === idx ? '2px solid #6B8F71' : '2px solid transparent',
              cursor: 'pointer', background: 'none', overflow: 'hidden',
            }}
          >
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Variant selector ──────────────────────────────────────────────────────────
function VariantSelector({
  product,
  selected,
  onChange,
}: {
  product: Product;
  selected: string | undefined;
  onChange: (v: string) => void;
}) {
  if (!hasVariants(product)) return null;

  const variants = product.variants!;
  const isSingle = variants.length === 1 && variants[0].label === 'Única';
  if (isSingle) return null;

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Anillos') return 'Talla';
    if (cat === 'Pulseras' || cat === 'Cadenas') return 'Medida';
    if (cat === 'Argollas') return 'Diámetro';
    return 'Medida';
  };

  return (
    <div className="mb-5">
      <p style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.15em' }} className="uppercase mb-3">
        {getCategoryLabel(product.category)}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map(v => {
          const outOfStock = v.stock === 0;
          const isSelected = selected === v.label;
          const hasOwnPrice = v.price != null && v.price > 0;
          return (
            <button
              key={v.label}
              onClick={() => !outOfStock && onChange(v.label)}
              disabled={outOfStock}
              title={outOfStock ? 'Sin stock' : `Stock: ${v.stock}${hasOwnPrice ? ` · $${v.price!.toLocaleString('es-AR')}` : ''}`}
              style={{
                padding: '7px 14px',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                border: isSelected ? '1px solid #6B8F71' : '1px solid rgba(0,0,0,0.15)',
                backgroundColor: isSelected ? '#6B8F71' : 'transparent',
                color: outOfStock ? '#ccc' : isSelected ? 'white' : '#1a1a1a',
                cursor: outOfStock ? 'not-allowed' : 'pointer',
                textDecoration: outOfStock ? 'line-through' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {v.label}
              {hasOwnPrice && !outOfStock && (
                <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: '4px' }}>
                  ${v.price!.toLocaleString('es-AR')}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!selected && variants.length > 1 && (
        <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '6px' }}>
          Seleccioná una medida para continuar
        </p>
      )}
    </div>
  );
}

// ── Product detail modal ──────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, setCartOpen } = useStore();
  const noVariants = !hasVariants(product);
  const single = isSingleVariant(product);

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    single ? (product.variants?.[0]?.label) : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0].color : undefined
  );
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canAdd = noVariants || single || Boolean(selectedVariant);

  // Determine displayed images: color-specific or product images
  const colorImage = selectedColor && product.colors
    ? product.colors.find(c => c.color === selectedColor)?.image
    : undefined;
  const imgs = colorImage ? [colorImage] : productImages(product);

  // Effective price considering selected variant
  const effectivePrice = getProductPrice(product, selectedVariant);

  const totalStock = hasVariants(product)
    ? product.variants!.reduce((s, v) => s + v.stock, 0)
    : (product.generalStock ?? 0);

  const cartVariant = noVariants ? undefined : selectedVariant;

  const handleAdd = () => {
    if (!canAdd) return;
    setErrorMsg('');
    const result = addToCart(product.id, cartVariant);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      setErrorMsg(result.message || 'Error al agregar al carrito');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    setErrorMsg('');
    const result = addToCart(product.id, cartVariant);
    if (result.success) { onClose(); setCartOpen(true); }
    else {
      setErrorMsg(result.message || 'Error al agregar al carrito');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: '#F5F0E8', maxWidth: '760px', width: '100%', maxHeight: '92vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          {/* Image / carousel */}
          <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
            <ImageCarousel images={imgs} alt={product.name} />
            {totalStock <= 3 && totalStock > 0 && (
              <div
                style={{
                  position: 'absolute', top: '10px', left: '10px',
                  backgroundColor: 'rgba(245,240,232,0.9)', padding: '3px 8px',
                  fontSize: '0.6rem', letterSpacing: '0.12em', color: '#c0392b',
                }}
                className="uppercase"
              >
                Últimas unidades
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase">
                {product.category}
              </p>
              <button onClick={onClose} style={{ color: '#888' }} className="hover:opacity-60 transition-opacity -mt-1">
                <X size={18} />
              </button>
            </div>

            <h2
              style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '1.9rem', color: '#1a1a1a', fontWeight: 300, lineHeight: 1.15 }}
              className="mb-3"
            >
              {product.name}
            </h2>

            {/* Price — updates when variant with own price is selected */}
            <p style={{ color: '#6B8F71', fontSize: '1.25rem', letterSpacing: '0.03em' }} className="mb-5">
              ${effectivePrice.toLocaleString('es-AR')}
              {effectivePrice !== product.price && (
                <span style={{ color: '#aaa', fontSize: '0.75rem', marginLeft: '8px', textDecoration: 'line-through' }}>
                  ${product.price.toLocaleString('es-AR')}
                </span>
              )}
            </p>

            <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: 1.75 }} className="mb-6 flex-1">
              {product.description}
            </p>

            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <p style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.15em' }} className="uppercase mb-3">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(cv => (
                    <button
                      key={cv.color}
                      onClick={() => setSelectedColor(cv.color)}
                      style={{
                        padding: '7px 14px', fontSize: '0.78rem', letterSpacing: '0.06em',
                        border: selectedColor === cv.color ? '1px solid #6B8F71' : '1px solid rgba(0,0,0,0.15)',
                        backgroundColor: selectedColor === cv.color ? '#6B8F71' : 'transparent',
                        color: selectedColor === cv.color ? 'white' : '#1a1a1a',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {cv.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <VariantSelector product={product} selected={selectedVariant} onChange={setSelectedVariant} />

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#aaa', fontSize: '0.68rem', letterSpacing: '0.12em' }} className="uppercase">
                Material: Plata 925
              </p>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', padding: '10px 14px', marginBottom: '12px' }}>
                <p style={{ color: '#c0392b', fontSize: '0.75rem' }}>{errorMsg}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                style={{
                  backgroundColor: !canAdd ? '#e0e0e0' : added ? '#6B8F71' : '#1a1a1a',
                  color: !canAdd ? '#aaa' : '#F5F0E8',
                  fontSize: '0.68rem', letterSpacing: '0.2em', padding: '14px',
                  cursor: !canAdd ? 'not-allowed' : 'pointer', transition: 'background-color 0.3s', border: 'none',
                }}
                className="uppercase flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} />
                {added ? '✓ Agregado' : 'Agregar al carrito'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!canAdd}
                style={{
                  border: !canAdd ? '1px solid #e0e0e0' : '1px solid rgba(0,0,0,0.25)',
                  color: !canAdd ? '#ccc' : '#1a1a1a',
                  fontSize: '0.68rem', letterSpacing: '0.2em', padding: '14px',
                  backgroundColor: 'transparent', cursor: !canAdd ? 'not-allowed' : 'pointer',
                }}
                className="uppercase hover:bg-black/5 transition-colors"
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [detail, setDetail] = useState(false);
  const [hoverImg, setHoverImg] = useState(false);

  const single = isSingleVariant(product);
  const noVariants = !hasVariants(product);
  const imgs = productImages(product);
  const hasSecondImage = imgs.length > 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (noVariants) addToCart(product.id);
    else if (single) addToCart(product.id, product.variants![0].label);
    else setDetail(true);
  };

  return (
    <>
      <div className="group cursor-pointer" onClick={() => setDetail(true)}>
        <div
          className="relative overflow-hidden mb-4"
          style={{ borderRadius: '1px' }}
          onMouseEnter={() => setHoverImg(true)}
          onMouseLeave={() => setHoverImg(false)}
        >
          <img
            src={hoverImg && hasSecondImage ? imgs[1] : imgs[0]}
            alt={product.name}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', transition: 'opacity 0.35s' }}
            className="transition-transform duration-700 group-hover:scale-105"
          />

          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.3s' }}
            className="group-hover:bg-black/10"
          />

          <button
            onClick={handleQuickAdd}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{
              position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: '#1a1a1a', color: '#F5F0E8',
              fontSize: '0.62rem', letterSpacing: '0.15em', padding: '10px 22px',
              whiteSpace: 'nowrap', border: 'none',
            }}
          >
            {single || noVariants ? 'Agregar al carrito' : 'Seleccionar medida'}
          </button>
        </div>

        <div>
          <p style={{ color: '#1a1a1a', fontSize: '0.88rem' }} className="mb-1">{product.name}</p>
          <p style={{ color: '#6B8F71', fontSize: '0.88rem' }}>${product.price.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {detail && <ProductDetailModal product={product} onClose={() => setDetail(false)} />}
    </>
  );
}

// ── Main grid ─────────────────────────────────────────────────────────────────
export function ProductGrid() {
  const { clientProducts, selectedCategory, setSelectedCategory, setCurrentView, searchQuery } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory);

  useEffect(() => { setActiveCategory(selectedCategory); }, [selectedCategory]);

  const handleCategoryChange = (cat: string | null) => {
    setActiveCategory(cat);
    setSelectedCategory(cat);
  };

  let filtered = activeCategory
    ? clientProducts.filter(p => p.category === activeCategory)
    : clientProducts;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-14">

        <button
          onClick={() => setCurrentView('home')}
          style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.15em' }}
          className="uppercase flex items-center gap-2 mb-10 hover:opacity-60 transition-opacity"
        >
          <ArrowLeft size={12} /> Inicio
        </button>

        <div className="mb-12">
          <p style={{ color: '#6B8F71', fontSize: '0.68rem', letterSpacing: '0.25em' }} className="uppercase mb-3">
            {searchQuery ? 'Búsqueda' : activeCategory ? 'Categoría' : 'Tienda'}
          </p>
          <h1 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: '#1a1a1a', fontWeight: 300 }}>
            {searchQuery ? `"${searchQuery}"` : activeCategory ?? 'Toda la colección'}
          </h1>
          {searchQuery && (
            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px' }}>
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
        </div>

        {/* Category tabs */}
        <div
          style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
          className="flex overflow-x-auto gap-8 py-4 mb-12"
        >
          {[null, ...CATEGORIES].map(cat => (
            <button
              key={cat ?? 'all'}
              onClick={() => handleCategoryChange(cat ?? null)}
              style={{
                fontSize: '0.68rem', letterSpacing: '0.15em',
                color: activeCategory === (cat ?? null) ? '#6B8F71' : '#888',
                background: 'none', border: 'none',
                borderBottom: activeCategory === (cat ?? null) ? '1px solid #6B8F71' : '1px solid transparent',
                paddingBottom: '2px', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
              }}
              className="uppercase"
            >
              {cat ?? 'Todo'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p style={{ color: '#6B8F71', fontSize: '2.5rem', marginBottom: '16px' }}>✦</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>No hay productos disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#1a1a1a', padding: '32px' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            Ubicados en Córdoba Capital · Envíos mediante Uber Envíos
          </p>
        </div>
      </div>
    </div>
  );
}

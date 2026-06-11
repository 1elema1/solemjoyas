import { useState, useEffect } from 'react';
import { ShoppingBag, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, Product, CATEGORIES, getProductPrice } from '../context/StoreContext';

// ... (Mantené todas tus funciones auxiliares: hasVariants, isSingleVariant, etc. igual) ...

// ── ProductGrid (CÓDIGO MODIFICADO PARA CARGA PROGRESIVA) ──────────────────────
export function ProductGrid() {
  const { clientProducts, selectedCategory, setSelectedCategory, setCurrentView, searchQuery } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory);
  
  // NUEVO: Estado para controlar cuántos productos se muestran
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => { 
    setActiveCategory(selectedCategory); 
    setVisibleCount(16); // Resetear a 16 al cambiar de categoría
  }, [selectedCategory]);

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

  // NUEVO: Lógica para mostrar solo los productos hasta el límite actual
  const displayedProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* NUEVO: Botón de "Mostrar más" */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={() => setVisibleCount(prev => prev + 16)}
                  style={{
                    border: '1px solid #1a1a1a', padding: '12px 30px', fontSize: '0.68rem',
                    letterSpacing: '0.2em', cursor: 'pointer', backgroundColor: 'transparent'
                  }}
                  className="uppercase hover:bg-black/5 transition-colors"
                >
                  Mostrar más productos
                </button>
              </div>
            )}
          </>
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

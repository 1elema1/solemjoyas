import { ShoppingBag, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import logo from '../../imports/Photoroom_20250815_205827.PNG';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const CATEGORIES = ['Anillos', 'Cadenas', 'Pulseras', 'Dijes', 'Huggies', 'Abridores', 'Argollas', 'Conjuntos'];

export function Navbar() {
  const {
    cartCount, setCartOpen, user, adminLogout,
    setCurrentView, setSelectedCategory, currentView,
    searchQuery, setSearchQuery
  } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentView('products');
    setMenuOpen(false);
  };

  const handleLogoClick = () => {
    setCurrentView('home');
    setSelectedCategory(null);
  };

  return (
    <nav style={{ backgroundColor: '#F5F0E8', borderBottom: '1px solid rgba(0,0,0,0.08)' }} className="sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 relative">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Shop + categories dropdown + Search */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1">
            <button
              onClick={() => setCurrentView('products') || setSelectedCategory(null)}
              style={{ color: '#1a1a1a', letterSpacing: '0.12em', fontSize: '0.72rem' }}
              className="uppercase tracking-widest hover:opacity-60 transition-opacity hidden md:block"
            >
              Tienda
            </button>
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{ color: '#1a1a1a', letterSpacing: '0.12em', fontSize: '0.72rem' }}
                className="uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-1"
              >
                Categorías <ChevronDown size={12} />
              </button>
              {menuOpen && (
                <div
                  style={{ backgroundColor: '#F5F0E8', border: '1px solid rgba(0,0,0,0.08)', top: '100%', left: 0 }}
                  className="absolute mt-2 rounded shadow-lg py-2 min-w-40 z-50"
                >
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      style={{ color: '#1a1a1a', fontSize: '0.8rem', letterSpacing: '0.06em' }}
                      className="w-full text-left px-4 py-2 uppercase hover:bg-black/5 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <SearchBar
                value={searchQuery}
                onChange={(q) => {
                  setSearchQuery(q);
                  if (q) {
                    setCurrentView('products');
                    setSelectedCategory(null);
                  }
                }}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>

          {/* Center: Logo (absolutely positioned) */}
          <button
            onClick={handleLogoClick}
            className="flex flex-col items-center gap-1 flex-shrink-0"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '50%',
              marginTop: '-28px',
            }}
          >
            <img src={logo} alt="SOLEM" className="h-14 w-14 object-contain" />
          </button>

          {/* Right: User + Cart */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('admin')}
                  style={{ color: currentView === 'admin' ? '#6B8F71' : '#1a1a1a', letterSpacing: '0.12em', fontSize: '0.72rem' }}
                  className="uppercase tracking-widest hover:opacity-60 transition-opacity hidden md:flex items-center gap-1"
                >
                  <Settings size={14} /> Admin
                </button>
                <button
                  onClick={adminLogout}
                  style={{ color: '#1a1a1a' }}
                  className="hover:opacity-60 transition-opacity"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}

            <button
              onClick={() => setCartOpen(true)}
              style={{ color: '#1a1a1a' }}
              className="relative hover:opacity-60 transition-opacity"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span
                  style={{ backgroundColor: '#6B8F71', color: 'white', fontSize: '0.65rem', minWidth: '18px', height: '18px', top: '-8px', right: '-8px' }}
                  className="absolute rounded-full flex items-center justify-center px-1 font-medium"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile categories bar + search */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} className="lg:hidden">
        <div className="px-4 py-3">
          <SearchBar
            value={searchQuery}
            onChange={(q) => {
              setSearchQuery(q);
              if (q) {
                setCurrentView('products');
                setSelectedCategory(null);
              }
            }}
            onClear={() => setSearchQuery('')}
          />
        </div>
        <div className="overflow-x-auto md:hidden">
          <div className="flex px-4 pb-2 gap-4 w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                style={{ color: '#1a1a1a', fontSize: '0.7rem', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
                className="uppercase"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}

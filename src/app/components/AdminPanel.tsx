import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Minus, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { useStore, Product, Variant, ColorVariant, hasStock, CATEGORIES, getProductPrice } from '../context/StoreContext';
import { ImageUpload } from './ImageUpload';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        backgroundColor: '#1a1a1a',
        color: '#F5F0E8',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.82rem',
        letterSpacing: '0.04em',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        animation: 'fadeInUp 0.25s ease',
      }}
    >
      <CheckCircle2 size={16} style={{ color: '#6B8F71', flexShrink: 0 }} />
      {message}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function productTotalStock(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((s, v) => s + v.stock, 0);
  }
  return product.generalStock ?? 0;
}

function statusInfo(product: Product) {
  if (!product.active) return { label: 'Inactivo', color: '#aaa', bg: 'rgba(0,0,0,0.05)' };
  if (!hasStock(product)) return { label: 'Sin stock', color: '#c0392b', bg: 'rgba(192,57,43,0.08)' };
  return { label: 'Activo', color: '#6B8F71', bg: 'rgba(107,143,113,0.1)' };
}

// ── Multiple image manager inside add-product form ────────────────────────────
function MultiImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const addImage = (url: string) => {
    if (url.trim()) onChange([...images, url]);
  };
  const removeImage = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative" style={{ width: '88px' }}>
              <img
                src={url}
                alt={`foto ${i + 1}`}
                style={{ width: '88px', height: '88px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', display: 'block' }}
              />
              {i === 0 && (
                <span
                  style={{
                    position: 'absolute', top: '4px', left: '4px',
                    backgroundColor: '#6B8F71', color: 'white',
                    fontSize: '0.5rem', letterSpacing: '0.08em',
                    padding: '2px 5px',
                  }}
                  className="uppercase"
                >
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  backgroundColor: 'rgba(0,0,0,0.65)', color: 'white',
                  border: 'none', borderRadius: '50%',
                  width: '20px', height: '20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      <ImageUpload
        value=""
        onChange={addImage}
        label={images.length === 0 ? 'Foto principal *' : 'Agregar otra foto'}
      />
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function ActiveToggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
    >
      {active
        ? <ToggleRight size={26} style={{ color: '#6B8F71' }} />
        : <ToggleLeft size={26} style={{ color: '#ccc' }} />
      }
      <span style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: active ? '#6B8F71' : '#aaa' }} className="uppercase">
        {active ? 'Activo' : 'Inactivo'}
      </span>
    </button>
  );
}

// ── Admin product row ─────────────────────────────────────────────────────────
function AdminProductRow({ product, onEdit }: { product: Product; onEdit: (p: Product) => void }) {
  const { toggleActive, updateProduct, deleteProduct } = useStore();
  const [expanded, setExpanded] = useState(false);
  const productHasVariants = !!(product.variants && product.variants.length > 0);
  const [localVariants, setLocalVariants] = useState<Variant[]>(product.variants ?? []);
  const [localGeneralStock, setLocalGeneralStock] = useState<number>(product.generalStock ?? 0);
  const [saved, setSaved] = useState(false);

  const totalStock = productTotalStock(product);
  const status = statusInfo(product);

  const saveStock = async () => {
    try {
      if (productHasVariants) {
        await updateProduct(product.id, { variants: localVariants });
      } else {
        await updateProduct(product.id, { generalStock: localGeneralStock });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const thumbUrl = product.images?.[0] || product.image;

  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.07)', marginBottom: '8px' }}>
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0 overflow-hidden" style={{ width: '60px', height: '60px', borderRadius: '1px' }}>
          <img src={thumbUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p style={{ color: '#1a1a1a', fontSize: '0.88rem' }}>{product.name}</p>
            <span style={{ backgroundColor: status.bg, color: status.color, fontSize: '0.6rem', letterSpacing: '0.12em', padding: '2px 8px' }} className="uppercase flex-shrink-0">
              {status.label}
            </span>
            {product.images && product.images.length > 1 && (
              <span style={{ color: '#aaa', fontSize: '0.6rem', letterSpacing: '0.08em' }} className="uppercase">
                {product.images.length} fotos
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{ color: '#6B8F71', fontSize: '0.82rem' }}>${product.price.toLocaleString('es-AR')}</span>
            <span style={{ color: '#aaa', fontSize: '0.72rem', letterSpacing: '0.06em' }} className="uppercase">{product.category}</span>
            <span style={{ color: totalStock === 0 ? '#c0392b' : '#888', fontSize: '0.72rem' }}>Stock: {totalStock}</span>
          </div>
          {totalStock === 0 && product.active && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle size={11} style={{ color: '#c0392b' }} />
              <span style={{ color: '#c0392b', fontSize: '0.65rem' }}>Sin stock — inactivo en tienda</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <button onClick={() => onEdit(product)} style={{ color: '#6B8F71', background: 'none', border: 'none', cursor: 'pointer' }} title="Editar producto" className="hover:opacity-60 transition-opacity">
            <Edit2 size={15} />
          </button>
          <ActiveToggle active={product.active} onChange={() => toggleActive(product.id)} />
          <button onClick={() => setExpanded(v => !v)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => deleteProduct(product.id)} style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-red-400 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.015)' }}>
          {productHasVariants ? (
            <>
              <p style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.18em' }} className="uppercase mb-4">Stock por variante</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {localVariants.map(v => (
                  <div key={v.label} style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '10px 12px' }}>
                    <p style={{ color: '#555', fontSize: '0.72rem', marginBottom: '4px' }}>{v.label}</p>
                    {v.price != null && v.price > 0 && (
                      <p style={{ color: '#6B8F71', fontSize: '0.65rem', marginBottom: '6px' }}>${v.price.toLocaleString('es-AR')}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => setLocalVariants(prev => prev.map(lv => lv.label === v.label ? { ...lv, stock: Math.max(0, lv.stock - 1) } : lv))} style={{ border: '1px solid rgba(0,0,0,0.12)', padding: '3px 7px', background: 'none', cursor: 'pointer', color: '#666' }}><Minus size={10} /></button>
                      <input
                        type="number" value={v.stock} min={0}
                        onChange={e => { const n = parseInt(e.target.value); if (!isNaN(n) && n >= 0) setLocalVariants(prev => prev.map(lv => lv.label === v.label ? { ...lv, stock: n } : lv)); }}
                        style={{ width: '44px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.12)', padding: '3px 4px', fontSize: '0.82rem', color: v.stock === 0 ? '#c0392b' : '#1a1a1a', background: 'transparent', outline: 'none' }}
                      />
                      <button onClick={() => setLocalVariants(prev => prev.map(lv => lv.label === v.label ? { ...lv, stock: lv.stock + 1 } : lv))} style={{ border: '1px solid rgba(0,0,0,0.12)', padding: '3px 7px', background: 'none', cursor: 'pointer', color: '#666' }}><Plus size={10} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.18em' }} className="uppercase mb-4">Stock general</p>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setLocalGeneralStock(s => Math.max(0, s - 1))} style={{ border: '1px solid rgba(0,0,0,0.12)', padding: '5px 10px', background: 'none', cursor: 'pointer', color: '#666' }}><Minus size={12} /></button>
                <input type="number" value={localGeneralStock} min={0} onChange={e => { const n = parseInt(e.target.value); if (!isNaN(n) && n >= 0) setLocalGeneralStock(n); }} style={{ width: '70px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.12)', padding: '5px 8px', fontSize: '0.88rem', color: localGeneralStock === 0 ? '#c0392b' : '#1a1a1a', background: 'transparent', outline: 'none' }} />
                <button onClick={() => setLocalGeneralStock(s => s + 1)} style={{ border: '1px solid rgba(0,0,0,0.12)', padding: '5px 10px', background: 'none', cursor: 'pointer', color: '#666' }}><Plus size={12} /></button>
              </div>
            </>
          )}
          <button
            onClick={saveStock}
            style={{ backgroundColor: saved ? '#6B8F71' : '#1a1a1a', color: 'white', fontSize: '0.65rem', letterSpacing: '0.15em', padding: '9px 20px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
            className="uppercase"
          >
            {saved ? '✓ Guardado' : 'Guardar stock'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Variant builder with optional price ───────────────────────────────────────
function VariantBuilder({ variants, onChange }: { variants: Variant[]; onChange: (v: Variant[]) => void }) {
  const update = (i: number, patch: Partial<Variant>) => {
    const next = [...variants]; next[i] = { ...next[i], ...patch }; onChange(next);
  };
  const add = () => onChange([...variants, { label: '', stock: 0 }]);
  const remove = (i: number) => onChange(variants.filter((_, idx) => idx !== i));

  return (
    <div>
      {variants.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div className="grid grid-cols-12 gap-2 mb-1">
            <span style={{ color: '#aaa', fontSize: '0.6rem', letterSpacing: '0.1em', gridColumn: 'span 5' }} className="uppercase">Variante (ej: 40cm)</span>
            <span style={{ color: '#aaa', fontSize: '0.6rem', letterSpacing: '0.1em', gridColumn: 'span 3' }} className="uppercase">Stock</span>
            <span style={{ color: '#aaa', fontSize: '0.6rem', letterSpacing: '0.1em', gridColumn: 'span 3' }} className="uppercase">Precio (opc.)</span>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <input
                type="text"
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder="40cm"
                style={{ gridColumn: 'span 5', border: '1px solid rgba(0,0,0,0.12)', padding: '8px 10px', fontSize: '0.82rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
              <input
                type="number"
                value={v.stock}
                onChange={e => update(i, { stock: Math.max(0, parseInt(e.target.value) || 0) })}
                min={0}
                placeholder="0"
                style={{ gridColumn: 'span 3', border: '1px solid rgba(0,0,0,0.12)', padding: '8px 10px', fontSize: '0.82rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
              <input
                type="number"
                value={v.price ?? ''}
                onChange={e => {
                  const val = e.target.value;
                  update(i, { price: val === '' ? undefined : Math.max(0, parseFloat(val) || 0) });
                }}
                min={0}
                placeholder="Base"
                style={{ gridColumn: 'span 3', border: '1px solid rgba(0,0,0,0.12)', padding: '8px 10px', fontSize: '0.82rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
              <button type="button" onClick={() => remove(i)} style={{ gridColumn: 'span 1', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center' }} className="hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={add} style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#6B8F71', border: '1px dashed #6B8F71', padding: '7px 14px', background: 'none', cursor: 'pointer' }} className="uppercase hover:bg-green-50/30 transition-colors">
        + Agregar variante
      </button>
    </div>
  );
}

// ── Color builder ─────────────────────────────────────────────────────────────
function ColorBuilder({ colors, onChange }: { colors: ColorVariant[]; onChange: (c: ColorVariant[]) => void }) {
  const update = (i: number, patch: Partial<ColorVariant>) => {
    const next = [...colors]; next[i] = { ...next[i], ...patch }; onChange(next);
  };
  const add = () => onChange([...colors, { color: '', image: '' }]);
  const remove = (i: number) => onChange(colors.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex flex-col gap-4 mb-3">
        {colors.map((c, i) => (
          <div key={i} style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '12px' }}>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={c.color}
                onChange={e => update(i, { color: e.target.value })}
                placeholder="Nombre del color (ej: Plateado, Dorado)"
                style={{ flex: 1, border: '1px solid rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '0.82rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
              <button type="button" onClick={() => remove(i)} style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
            <ImageUpload value={c.image} onChange={(url) => update(i, { image: url })} label={`Foto en ${c.color || 'este color'}`} />
          </div>
        ))}
      </div>
      <button type="button" onClick={add} style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#6B8F71', border: '1px dashed #6B8F71', padding: '7px 14px', background: 'none', cursor: 'pointer' }} className="uppercase hover:bg-green-50/30 transition-colors">
        + Agregar color
      </button>
    </div>
  );
}

// ── Home content manager ──────────────────────────────────────────────────────
function HomeContentManager() {
  const { homeContent, updateHomeContent, carouselImages } = useStore();
  const [form, setForm] = useState(homeContent);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'categories' | 'footer' | 'announcements'>('hero');

  const handleSave = async () => {
    try {
      await updateHomeContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error al guardar contenido del home:', e);
    }
  };

  const updateCategoryImage = (category: string, url: string) => {
    setForm(prev => ({
      ...prev,
      categoryImages: { ...prev.categoryImages, [category]: url }
    }));
  };

  return (
    <div>
      <h3 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '1.6rem', color: '#1a1a1a', fontWeight: 300, marginBottom: '16px' }}>
        Contenido del Home
      </h3>

      {/* Section tabs */}
      <div className="flex gap-4 mb-8" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '12px' }}>
        {[
          { id: 'hero', label: 'Hero' },
          { id: 'categories', label: 'Categorías' },
          { id: 'footer', label: 'Footer' },
          { id: 'announcements', label: 'Anuncios' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as 'hero' | 'categories' | 'footer' | 'announcements')}
            style={{
              fontSize: '0.68rem', letterSpacing: '0.12em',
              color: activeSection === id ? '#6B8F71' : '#888',
              background: 'none', border: 'none',
              borderBottom: activeSection === id ? '2px solid #6B8F71' : '2px solid transparent',
              paddingBottom: '8px', cursor: 'pointer',
            }}
            className="uppercase"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {activeSection === 'hero' && (
          <div className="flex flex-col gap-6">
            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Imagen principal del hero</label>
              <ImageUpload value={form.heroImage} onChange={url => setForm(f => ({ ...f, heroImage: url }))} label="Cambiar imagen" />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Tagline (texto superior pequeño)</label>
              <input
                type="text"
                value={form.heroTagline}
                onChange={e => setForm(f => ({ ...f, heroTagline: e.target.value }))}
                placeholder="Plata 925"
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">
                Título principal
              </label>
              <p style={{ color: '#aaa', fontSize: '0.7rem', marginBottom: '8px' }}>
                Usá * para marcar palabras en itálica y cursiva. Ej: "Joyas que *brillan* con calma"
              </p>
              <textarea
                value={form.heroTitle}
                onChange={e => setForm(f => ({ ...f, heroTitle: e.target.value }))}
                placeholder="Joyas que\n*brillan*\ncon calma."
                rows={3}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Descripción</label>
              <textarea
                value={form.heroDescription}
                onChange={e => setForm(f => ({ ...f, heroDescription: e.target.value }))}
                placeholder="Piezas únicas en plata 925..."
                rows={3}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Texto botón 1</label>
                <input
                  type="text"
                  value={form.heroButton1Text}
                  onChange={e => setForm(f => ({ ...f, heroButton1Text: e.target.value }))}
                  placeholder="Explorar tienda →"
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Texto botón 2</label>
                <input
                  type="text"
                  value={form.heroButton2Text}
                  onChange={e => setForm(f => ({ ...f, heroButton2Text: e.target.value }))}
                  placeholder="Ver cadenas"
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Categoría del botón 2</label>
              <select
                value={form.heroButton2Category}
                onChange={e => setForm(f => ({ ...f, heroButton2Category: e.target.value }))}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: '#F5F0E8', color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Tag "Nueva colección"</label>
                <input
                  type="text"
                  value={form.heroNewCollectionTag}
                  onChange={e => setForm(f => ({ ...f, heroNewCollectionTag: e.target.value }))}
                  placeholder="Nueva colección"
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Texto tag</label>
                <input
                  type="text"
                  value={form.heroNewCollectionText}
                  onChange={e => setForm(f => ({ ...f, heroNewCollectionText: e.target.value }))}
                  placeholder="Joyas para siempre"
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'categories' && (
          <div className="flex flex-col gap-6">
            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Título de sección</label>
              <input
                type="text"
                value={form.categoriesTitle}
                onChange={e => setForm(f => ({ ...f, categoriesTitle: e.target.value }))}
                placeholder="Colecciones"
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Subtítulo</label>
              <input
                type="text"
                value={form.categoriesSubtitle}
                onChange={e => setForm(f => ({ ...f, categoriesSubtitle: e.target.value }))}
                placeholder="Explorá nuestras categorías"
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-3">Imágenes de portada por categoría</label>
              <div className="flex flex-col gap-4">
                {Object.keys(form.categoryImages).map(cat => (
                  <div key={cat} style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '12px' }}>
                    <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 500 }}>{cat}</p>
                    <ImageUpload
                      value={form.categoryImages[cat]}
                      onChange={url => updateCategoryImage(cat, url)}
                      label={`Cambiar imagen de ${cat}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Título carrusel</label>
              <input
                type="text"
                value={form.carouselTitle}
                onChange={e => setForm(f => ({ ...f, carouselTitle: e.target.value }))}
                placeholder="Inspiración"
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Subtítulo carrusel</label>
              <input
                type="text"
                value={form.carouselSubtitle}
                onChange={e => setForm(f => ({ ...f, carouselSubtitle: e.target.value }))}
                placeholder="Descubrí nuestras piezas"
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {activeSection === 'footer' && (
          <div className="flex flex-col gap-6">
            <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '-8px' }}>
              Usá saltos de línea para separar el texto en dos líneas
            </p>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Ubicación</label>
              <textarea
                value={form.footerLocation}
                onChange={e => setForm(f => ({ ...f, footerLocation: e.target.value }))}
                placeholder="Ubicados en&#10;Córdoba Capital"
                rows={2}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Envíos</label>
              <textarea
                value={form.footerShipping}
                onChange={e => setForm(f => ({ ...f, footerShipping: e.target.value }))}
                placeholder="Realizamos envíos&#10;mediante Uber Envíos"
                rows={2}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Material</label>
              <textarea
                value={form.footerMaterial}
                onChange={e => setForm(f => ({ ...f, footerMaterial: e.target.value }))}
                placeholder="Plata 925&#10;certificada y garantizada"
                rows={2}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Pedidos</label>
              <textarea
                value={form.footerOrders}
                onChange={e => setForm(f => ({ ...f, footerOrders: e.target.value }))}
                placeholder="Coordinados por WhatsApp&#10;Sin pagos en línea"
                rows={2}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Copyright</label>
              <input
                type="text"
                value={form.footerCopyright}
                onChange={e => setForm(f => ({ ...f, footerCopyright: e.target.value }))}
                placeholder="© 2025 SOLEM · Todos los derechos reservados"
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {activeSection === 'announcements' && (
          <div className="flex flex-col gap-6">
            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">
                Anuncios en barra superior (Marquesina infinita)
              </label>
              <p style={{ color: '#aaa', fontSize: '0.7rem', marginBottom: '14px' }}>
                Estos mensajes se mostrarán en la parte superior de la página, rotando de forma continua.
              </p>

              <div className="flex flex-col gap-3 mb-4">
                {(form.announcements || []).map((text, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => {
                        const updated = [...(form.announcements || [])];
                        updated[idx] = e.target.value;
                        setForm(f => ({ ...f, announcements: updated }));
                      }}
                      style={{ flex: 1, border: '1px solid rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (form.announcements || []).filter((_, i) => i !== idx);
                        setForm(f => ({ ...f, announcements: updated }));
                      }}
                      style={{ padding: '8px 14px', border: '1px solid rgba(0,0,0,0.12)', color: '#c0392b', background: 'transparent', cursor: 'pointer' }}
                      className="hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const updated = [...(form.announcements || []), '✨ NUEVO ANUNCIO ✨'];
                  setForm(f => ({ ...f, announcements: updated }));
                }}
                style={{
                  border: '1px solid #1a1a1a',
                  color: '#1a1a1a',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
                className="uppercase hover:bg-black/5"
              >
                + Agregar anuncio
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          style={{
            backgroundColor: saved ? '#6B8F71' : '#1a1a1a',
            color: 'white',
            fontSize: '0.68rem',
            letterSpacing: '0.15em',
            padding: '14px 28px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '24px',
            transition: 'background-color 0.3s',
          }}
          className="uppercase"
        >
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

// ── Carousel manager ──────────────────────────────────────────────────────────
function CarouselManager() {
  const { carouselImages, updateCarouselImages } = useStore();
  const [tempImages, setTempImages] = useState(carouselImages);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTempImages(carouselImages);
  }, [carouselImages]);

  const addImage = (url: string) => { if (url.trim()) setTempImages(prev => [...prev, url]); };
  const removeImage = (idx: number) => setTempImages(prev => prev.filter((_, i) => i !== idx));
  const save = async () => {
    await updateCarouselImages(tempImages);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h3 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '1.6rem', color: '#1a1a1a', fontWeight: 300, marginBottom: '16px' }}>Carrusel de Inicio</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {tempImages.map((img, idx) => (
          <div key={idx} className="relative">
            <div className="overflow-hidden" style={{ aspectRatio: '16/9', border: '1px solid rgba(0,0,0,0.1)' }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <ImageUpload value="" onChange={addImage} label="Agregar imagen al carrusel" />
      <button onClick={save} style={{ backgroundColor: saved ? '#6B8F71' : '#1a1a1a', color: 'white', fontSize: '0.68rem', letterSpacing: '0.15em', padding: '12px 24px', border: 'none', cursor: 'pointer', marginTop: '20px', transition: 'background-color 0.3s' }} className="uppercase">
        {saved ? '✓ Guardado' : 'Guardar carrusel'}
      </button>
    </div>
  );
}

// ── Bulk price manager ────────────────────────────────────────────────────────
function BulkPriceManager() {
  const { applyBulkPriceChange } = useStore();
  const [category, setCategory] = useState<string>('all');
  const [action, setAction] = useState<'increase' | 'discount'>('increase');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) {
      setError('Por favor ingresá un valor válido mayor a 0');
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres aplicar este cambio masivo de precios? Esta acción es irreversible.')) {
      return;
    }

    setLoading(true);
    try {
      await applyBulkPriceChange(category, action, type, val);
      setMessage('Precios actualizados exitosamente en la base de datos');
      setValue('');
    } catch (err) {
      setError('Ocurrió un error al intentar actualizar los precios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h3 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '1.6rem', color: '#1a1a1a', fontWeight: 300, marginBottom: '12px' }}>
        Aumentos y Descuentos Masivos
      </h3>
      <p style={{ color: '#aaa', fontSize: '0.78rem', marginBottom: '24px' }}>
        Modificá los precios de tus productos en bloque de forma segura. El cambio afectará el precio base y también el precio de las variantes.
      </p>

      <div style={{ backgroundColor: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.18)', padding: '14px 18px', marginBottom: '24px' }}>
        <p style={{ color: '#c0392b', fontSize: '0.75rem', fontWeight: 500 }} className="uppercase mb-1">⚠️ Cuidado</p>
        <p style={{ color: '#c0392b', fontSize: '0.72rem', lineHeight: 1.5 }}>
          Esta herramienta modifica directamente los precios de los productos guardados en tu base de datos de Firebase. Los cambios son instantáneos e irreversibles.
        </p>
      </div>

      <form onSubmit={handleApply} className="flex flex-col gap-5">
        <div>
          <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Categoría a modificar</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: '#F5F0E8', color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Acción</label>
            <select
              value={action}
              onChange={e => setAction(e.target.value as 'increase' | 'discount')}
              style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: '#F5F0E8', color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="increase">Aumento (Subir precios)</option>
              <option value="discount">Descuento (Bajar precios)</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Tipo de Valor</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'percentage' | 'fixed')}
              style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: '#F5F0E8', color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($ ARS)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">
            Valor a aplicar ({type === 'percentage' ? '%' : '$ ARS'})
          </label>
          <input
            type="number"
            value={value}
            min={0.1}
            step="any"
            required
            onChange={e => setValue(e.target.value)}
            placeholder={type === 'percentage' ? 'Ej: 10' : 'Ej: 500'}
            style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
          />
        </div>

        {error && <p style={{ color: '#c0392b', fontSize: '0.78rem' }}>{error}</p>}
        {message && <p style={{ color: '#6B8F71', fontSize: '0.78rem' }}>{message}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#1a1a1a',
            color: '#F5F0E8',
            fontSize: '0.68rem',
            letterSpacing: '0.2em',
            padding: '14px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: '10px'
          }}
          className="uppercase hover:bg-black/85"
        >
          {loading ? 'Aplicando cambios...' : 'Aplicar cambio masivo'}
        </button>
      </form>
    </div>
  );
}

// ── Coupons manager ───────────────────────────────────────────────────────────
function CouponsManager() {
  const { coupons, addCoupon, deleteCoupon } = useStore();
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) { setError('El código del cupón es requerido'); return; }
    
    if (coupons.some(c => c.code === cleanCode)) {
      setError('Ya existe un cupón con este código');
      return;
    }

    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) {
      setError('Ingresá un valor de descuento válido');
      return;
    }

    setLoading(true);
    try {
      await addCoupon({
        code: cleanCode,
        type,
        value: val,
        active,
      });
      setCode('');
      setValue('');
      setActive(true);
    } catch (err) {
      setError('Error al crear el cupón');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h3 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '1.6rem', color: '#1a1a1a', fontWeight: 300, marginBottom: '16px' }}>
          Crear Nuevo Cupón
        </h3>
        
        <form onSubmit={handleCreate} className="flex flex-col gap-5 max-w-sm">
          <div>
            <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Código del Cupón</label>
            <input
              type="text"
              value={code}
              required
              onChange={e => setCode(e.target.value)}
              placeholder="Ej: SOLEMFEST"
              style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none', textTransform: 'uppercase' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Tipo de Descuento</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'percentage' | 'fixed')}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: '#F5F0E8', color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Valor Descuento</label>
              <input
                type="number"
                value={value}
                required
                min={1}
                onChange={e => setValue(e.target.value)}
                placeholder={type === 'percentage' ? 'Ej: 15' : 'Ej: 1500'}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '10px 12px', fontSize: '0.85rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#6B8F71', cursor: 'pointer' }}
            />
            <label htmlFor="active" style={{ fontSize: '0.8rem', color: '#1a1a1a', cursor: 'pointer' }}>Cupón activo (disponible para uso)</label>
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: '0.78rem' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#1a1a1a',
              color: '#F5F0E8',
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              padding: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
            className="uppercase hover:bg-black/85"
          >
            {loading ? 'Creando...' : 'Crear Cupón'}
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '1.6rem', color: '#1a1a1a', fontWeight: 300, marginBottom: '16px' }}>
          Cupones Activos
        </h3>

        {coupons.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No hay cupones creados aún.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {coupons.map(coupon => (
              <div
                key={coupon.id}
                style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', padding: '12px 16px' }}
                className="flex items-center justify-between"
              >
                <div>
                  <p style={{ fontSize: '0.88rem', color: '#1a1a1a', fontWeight: 600 }} className="uppercase mb-0.5">
                    {coupon.code}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }} className="mb-0">
                    Descuento: {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`} · Estado:{' '}
                    <span style={{ color: coupon.active ? '#6B8F71' : '#c0392b', fontWeight: 500 }}>
                      {coupon.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Seguro que quieres eliminar el cupón ${coupon.code}?`)) {
                      deleteCoupon(coupon.id);
                    }
                  }}
                  style={{ padding: '6px 12px', border: '1px solid rgba(0,0,0,0.12)', color: '#c0392b', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.08em' }}
                  className="uppercase hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Constante fuera del componente para evitar recreación en cada render
const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'Anillos' as string,
  images: [] as string[],
  description: '',
  variants: [] as Variant[],
  colors: [] as ColorVariant[],
  generalStock: '10',
};

// ── Main AdminPanel ───────────────────────────────────────────────────────────
export function AdminPanel() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit' | 'carousel' | 'home' | 'prices' | 'coupons'>('list');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      images: product.images || [product.image],
      description: product.description || '',
      variants: product.variants || [],
      colors: product.colors || [],
      generalStock: (product.generalStock ?? 10).toString(),
    });
    setActiveTab('edit');
    setError('');
  };

  // Solo limpia el producto en edición, no cambia de tab
  const resetForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const cancelEdit = () => {
    resetForm();
    setActiveTab('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.price || form.images.length === 0) {
      setError('Completá nombre, precio y al menos una foto');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { setError('Precio inválido'); return; }

    const colors = form.colors.filter(c => c.color.trim() && c.image.trim());

    const baseData: Partial<Omit<Product, 'id'>> = {
      name: form.name.trim(),
      price,
      category: form.category,
      image: form.images[0],
      images: form.images,
      description: form.description.trim(),
      active: true,
      ...(colors.length > 0 ? { colors } : {}),
    };

    if (form.variants.length > 0) {
      if (form.variants.some(v => !v.label.trim())) {
        setError('Completá todas las etiquetas de variantes');
        return;
      }
      const cleanVariants = form.variants.map(v => {
        const cv: Variant = { label: v.label, stock: v.stock };
        if (v.price != null && v.price > 0) cv.price = v.price;
        return cv;
      });
      baseData.variants = cleanVariants;
    } else {
      baseData.generalStock = parseInt(form.generalStock) || 0;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, baseData);
        setToast(`"${form.name}" actualizado exitosamente`);
        cancelEdit();
      } else {
        await addProduct(baseData as Omit<Product, 'id'>);
        setToast(`"${form.name}" publicado exitosamente`);
        resetForm();
        setActiveTab('list');
      }
    } catch (err) {
      console.error(err);
      setError('Error al guardar producto. Revisá la consola.');
    }
  };

  const filtered = filterCat ? products.filter(p => p.category === filterCat) : products;
  const outOfStockCount = products.filter(p => !hasStock(p)).length;

  return (
    <>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}

      <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">

          <button
            onClick={() => navigate('/')}
            style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em', background: 'none', border: 'none', cursor: 'pointer' }}
            className="uppercase flex items-center gap-2 mb-10 hover:opacity-60 transition-opacity"
          >
            <ArrowLeft size={12} /> Volver a la tienda
          </button>

          <div className="mb-10">
            <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.25em' }} className="uppercase mb-3">Panel de administración</p>
            <h1 style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1a1a1a', fontWeight: 300 }}>
              Gestión de productos
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total productos', value: products.length },
              { label: 'Activos', value: products.filter(p => p.active && hasStock(p)).length },
              { label: 'Sin stock', value: outOfStockCount, alert: outOfStockCount > 0 },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.07)', padding: '16px 20px' }}>
                <p style={{ color: '#aaa', fontSize: '0.62rem', letterSpacing: '0.15em' }} className="uppercase mb-2">{s.label}</p>
                <p style={{ fontFamily: '"Cormorant Garamond","Georgia",serif', fontSize: '2.2rem', color: s.alert ? '#c0392b' : '#1a1a1a', fontWeight: 300, lineHeight: 1 }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }} className="flex gap-8 mb-10 overflow-x-auto whitespace-nowrap">
            {([['list', `Productos (${products.length})`], ['add', 'Agregar producto'], ['home', 'Contenido Home'], ['carousel', 'Carrusel'], ['prices', 'Precios masivos'], ['coupons', 'Cupones']] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => {
                  // Al ir a 'list' limpiamos formulario y edición.
                  // Al ir a 'add', solo reseteamos el form sin volver a list.
                  if (tab === 'list') { cancelEdit(); return; }
                  if (tab === 'add') { resetForm(); }
                  setActiveTab(tab);
                }}
                style={{
                  fontSize: '0.68rem', letterSpacing: '0.15em',
                  color: activeTab === tab ? '#6B8F71' : '#888',
                  background: 'none', border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #6B8F71' : '2px solid transparent',
                  paddingBottom: '14px', cursor: 'pointer',
                }}
                className="uppercase"
              >
                {label}
              </button>
            ))}
            {activeTab === 'edit' && (
              <div
                style={{
                  fontSize: '0.68rem', letterSpacing: '0.15em',
                  color: '#6B8F71',
                  borderBottom: '2px solid #6B8F71',
                  paddingBottom: '14px',
                }}
                className="uppercase"
              >
                Editar producto
              </div>
            )}
          </div>

          {/* ── Product list ── */}
          {activeTab === 'list' && (
            <div>
              <div className="flex flex-wrap gap-2 mb-8">
                {[null, ...CATEGORIES].map(cat => (
                  <button
                    key={cat ?? 'all'}
                    onClick={() => setFilterCat(cat ?? null)}
                    style={{
                      fontSize: '0.65rem', letterSpacing: '0.1em', padding: '6px 14px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      backgroundColor: filterCat === (cat ?? null) ? '#1a1a1a' : 'transparent',
                      color: filterCat === (cat ?? null) ? '#F5F0E8' : '#555',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    className="uppercase"
                  >
                    {cat ?? 'Todos'}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p style={{ color: '#ccc', fontSize: '2rem', marginBottom: '12px' }}>✦</p>
                  <p style={{ color: '#aaa', fontSize: '0.88rem' }}>No hay productos en esta categoría.</p>
                </div>
              ) : (
                <div>{filtered.map(p => <AdminProductRow key={p.id} product={p} onEdit={startEdit} />)}</div>
              )}
            </div>
          )}

          {/* ── Add / Edit product form ── */}
          {(activeTab === 'add' || activeTab === 'edit') && (
            <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-6">
              {activeTab === 'edit' ? (
                <div className="flex items-center justify-between mb-2">
                  <p style={{ color: '#6B8F71', fontSize: '0.85rem' }}>Editando: {editingProduct?.name}</p>
                  <button type="button" onClick={cancelEdit} style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.12em', background: 'none', border: 'none', cursor: 'pointer' }} className="uppercase hover:opacity-60">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="mb-2">
                  <p style={{ color: '#6B8F71', fontSize: '0.68rem', letterSpacing: '0.2em' }} className="uppercase">Nuevo producto</p>
                </div>
              )}

              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Nombre *</label>
                <input
                  type="text" value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Anillo Corazón Delicado"
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '11px 14px', fontSize: '0.88rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Precio base (ARS) *</label>
                  <input
                    type="number" value={form.price} min={1} required
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="4500"
                    style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '11px 14px', fontSize: '0.88rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Categoría *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '11px 14px', fontSize: '0.88rem', background: '#F5F0E8', color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-1">Fotos del producto *</label>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '10px' }}>
                  La primera foto es la imagen principal. Podés agregar fotos adicionales para el detalle del producto.
                </p>
                <MultiImageManager images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
              </div>

              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del producto…"
                  rows={3}
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '11px 14px', fontSize: '0.88rem', background: 'transparent', color: '#1a1a1a', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {form.variants.length === 0 && (
                <div>
                  <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-1">Stock general *</label>
                  <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '8px' }}>
                    Si agregás variantes abajo, el stock se gestiona por variante.
                  </p>
                  <input
                    type="number" value={form.generalStock} min={0} placeholder="10"
                    onChange={e => setForm(f => ({ ...f, generalStock: e.target.value }))}
                    style={{ width: '120px', border: '1px solid rgba(0,0,0,0.12)', padding: '11px 14px', fontSize: '0.88rem', background: 'transparent', color: '#1a1a1a', outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-1">
                  Variantes (tallas / medidas — opcional)
                </label>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '12px' }}>
                  Cada variante puede tener su propio precio. Dejá el precio en blanco para usar el precio base.
                </p>
                <VariantBuilder variants={form.variants} onChange={v => setForm(f => ({ ...f, variants: v }))} />
              </div>

              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-1">Colores disponibles (opcional)</label>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '12px' }}>
                  Para mostrar el mismo producto en diferentes colores, cada uno con su foto.
                </p>
                <ColorBuilder colors={form.colors} onChange={c => setForm(f => ({ ...f, colors: c }))} />
              </div>

              {error && <p style={{ color: '#c0392b', fontSize: '0.8rem' }}>{error}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  style={{ backgroundColor: '#1a1a1a', color: '#F5F0E8', fontSize: '0.68rem', letterSpacing: '0.2em', padding: '15px', border: 'none', cursor: 'pointer', flex: 1 }}
                  className="uppercase flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
                >
                  {activeTab === 'edit' ? (
                    <>
                      <CheckCircle2 size={13} /> Actualizar producto
                    </>
                  ) : (
                    <>
                      <Plus size={13} /> Publicar producto
                    </>
                  )}
                </button>
                {activeTab === 'edit' && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{ border: '1px solid rgba(0,0,0,0.25)', color: '#1a1a1a', fontSize: '0.68rem', letterSpacing: '0.2em', padding: '15px 24px', backgroundColor: 'transparent', cursor: 'pointer' }}
                    className="uppercase hover:bg-black/5 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'home' && <HomeContentManager />}

          {activeTab === 'carousel' && <CarouselManager />}

          {activeTab === 'prices' && <BulkPriceManager />}

          {activeTab === 'coupons' && <CouponsManager />}
        </div>
      </div>
    </>
  );
}

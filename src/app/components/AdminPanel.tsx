import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Minus, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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
function AdminProductRow({ product }: { product: Product }) {
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

// ── Carousel manager ──────────────────────────────────────────────────────────
function CarouselManager() {
  const { carouselImages, updateCarouselImages } = useStore();
  const [tempImages, setTempImages] = useState(carouselImages);
  const [saved, setSaved] = useState(false);

  const addImage = (url: string) => { if (url.trim()) setTempImages(prev => [...prev, url]); };
  const removeImage = (idx: number) => setTempImages(prev => prev.filter((_, i) => i !== idx));
  const save = () => { updateCarouselImages(tempImages); setSaved(true); setTimeout(() => setSaved(false), 2000); };

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

// ── Main AdminPanel ───────────────────────────────────────────────────────────
export function AdminPanel() {
  const navigate = useNavigate();
  const { products, addProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'carousel'>('list');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const emptyForm = {
    name: '',
    price: '',
    category: 'Anillos' as string,
    images: [] as string[],
    description: '',
    variants: [] as Variant[],
    colors: [] as ColorVariant[],
    generalStock: '10',
  };
  const [form, setForm] = useState(emptyForm);

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

    // Build base product data — always clean undefined before sending to Firestore
    const baseData: Omit<Product, 'id'> = {
      name: form.name.trim(),
      price,
      category: form.category,
      image: form.images[0],   // primary image kept for compat
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
      // strip undefined price fields
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
      await addProduct(baseData);
      setToast(`"${form.name}" publicado exitosamente`);
      setForm(emptyForm);
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      setError('Error al agregar producto. Revisá la consola.');
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
          <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }} className="flex gap-8 mb-10">
            {([['list', `Productos (${products.length})`], ['add', 'Agregar producto'], ['carousel', 'Carrusel']] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
                <div>{filtered.map(p => <AdminProductRow key={p.id} product={p} />)}</div>
              )}
            </div>
          )}

          {/* ── Add product form ── */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-6">

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

              {/* Multiple images */}
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

              {/* General stock — only when no variants */}
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

              {/* Variants with optional price */}
              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-1">
                  Variantes (tallas / medidas — opcional)
                </label>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '12px' }}>
                  Cada variante puede tener su propio precio. Dejá el precio en blanco para usar el precio base.
                </p>
                <VariantBuilder variants={form.variants} onChange={v => setForm(f => ({ ...f, variants: v }))} />
              </div>

              {/* Colors */}
              <div>
                <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-1">Colores disponibles (opcional)</label>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '12px' }}>
                  Para mostrar el mismo producto en diferentes colores, cada uno con su foto.
                </p>
                <ColorBuilder colors={form.colors} onChange={c => setForm(f => ({ ...f, colors: c }))} />
              </div>

              {error && <p style={{ color: '#c0392b', fontSize: '0.8rem' }}>{error}</p>}

              <button
                type="submit"
                style={{ backgroundColor: '#1a1a1a', color: '#F5F0E8', fontSize: '0.68rem', letterSpacing: '0.2em', padding: '15px', border: 'none', cursor: 'pointer', marginTop: '4px' }}
                className="uppercase flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
              >
                <Plus size={13} /> Publicar producto
              </button>
            </form>
          )}

          {activeTab === 'carousel' && <CarouselManager />}
        </div>
      </div>
    </>
  );
}

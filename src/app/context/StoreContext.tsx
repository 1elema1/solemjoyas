import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth } from '../config/firebase';

export interface Variant {
  label: string;
  stock: number;
  price?: number;
}

export interface ColorVariant {
  color: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  /** Primary image (first of images[], kept for backwards compat) */
  image: string;
  /** All product images */
  images?: string[];
  description: string;
  variants?: Variant[];
  generalStock?: number;
  active: boolean;
  colors?: ColorVariant[];
}

export const CATEGORIES = [
  'Anillos',
  'Cadenas',
  'Pulseras',
  'Dijes',
  'Huggies',
  'Abridores',
  'Argollas',
  'Conjuntos',
] as const;

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: string;
}

export interface User {
  email: string;
  role: 'admin';
}

export interface HomeContent {
  heroImage: string;
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  heroButton1Text: string;
  heroButton2Text: string;
  heroButton2Category: string;
  heroNewCollectionTag: string;
  heroNewCollectionText: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  categoryImages: Record<string, string>;
  carouselTitle: string;
  carouselSubtitle: string;
  footerLocation: string;
  footerShipping: string;
  footerMaterial: string;
  footerOrders: string;
  footerCopyright: string;
  carouselImages?: string[];
}

interface StoreContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  clientProducts: Product[];
  cart: CartItem[];
  addToCart: (productId: string, variant?: string) => { success: boolean; message?: string };
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, qty: number, variant?: string) => { success: boolean; message?: string };
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  currentView: 'home' | 'products' | 'admin';
  setCurrentView: (v: 'home' | 'products' | 'admin') => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  user: User | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => Promise<void>;
  generateWhatsAppLink: () => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  carouselImages: string[];
  updateCarouselImages: (images: string[]) => Promise<void>;
  getAvailableStock: (productId: string, variant?: string) => number;
  loading: boolean;
  homeContent: HomeContent;
  updateHomeContent: (content: Partial<HomeContent>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function hasStock(product: Product): boolean {
  if (product.variants && product.variants.length > 0) {
    return product.variants.some(v => v.stock > 0);
  }
  return (product.generalStock ?? 0) > 0;
}

/** Returns the price to use for this product/variant combo */
export function getProductPrice(product: Product, variantLabel?: string): number {
  if (variantLabel && product.variants) {
    const v = product.variants.find(vr => vr.label === variantLabel);
    if (v?.price != null && v.price > 0) return v.price;
  }
  return product.price;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_HOME_CONTENT: HomeContent = {
  heroImage: '',
  heroTagline: 'Plata 925',
  heroTitle: 'Joyas que brillan con calma.',
  heroDescription: 'Piezas Ãºnicas en plata 925, diseÃ±adas y creadas a mano en CÃ³rdoba. Sutiles, atemporales, hechas para acompaÃ±arte.',
  heroButton1Text: 'Explorar tienda â†’',
  heroButton2Text: 'Ver cadenas',
  heroButton2Category: 'Cadenas',
  heroNewCollectionTag: 'Nueva colecciÃ³n',
  heroNewCollectionText: 'Joyas para siempre',
  categoriesTitle: 'Colecciones',
  categoriesSubtitle: 'ExplorÃ¡ nuestras categorÃ­as',
  categoryImages: {
    Anillos: '',
    Cadenas: '',
    Pulseras: '',
    Dijes: '',
    Huggies: '',
    Abridores: '',
    Argollas: '',
    Conjuntos: '',
  },
  carouselTitle: 'Inspiración',
  carouselSubtitle: 'Descubrí nuestras piezas',
  carouselImages: [],
  footerLocation: 'Ubicados en\nCórdoba Capital',
  footerShipping: 'Realizamos envíos\nmediante Uber Envíos',
  footerMaterial: 'Plata 925\ncertificada y garantizada',
  footerOrders: 'Coordinados por WhatsApp\nSin pagos en línea',
  footerCopyright: '© 2025 SOLEM · Todos los derechos reservados',
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('solem_products_cache', []));
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('solem_cart_v2', []));
  const [user, setUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [homeContent, setHomeContent] = useState<HomeContent>(() => loadFromStorage('solem_home_cache', DEFAULT_HOME_CONTENT));
  
  // Si ya tenemos productos en cache, no bloqueamos la UI con un loading indicator (carga instantánea)
  const [loading, setLoading] = useState(() => {
    const cached = localStorage.getItem('solem_products_cache');
    try {
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser({ email: firebaseUser.email!, role: 'admin' });
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  // Timeout de seguridad: Si la conexión a Firestore tarda más de 2 segundos (ej: mala red),
  // forzamos la desactivación de loading para mostrar lo que tengamos en cache.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Real-time sync de productos desde Firestore con caché local y tolerancia a errores
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product)
      );
      setProducts(productsData);
      setLoading(false);
      localStorage.setItem('solem_products_cache', JSON.stringify(productsData));
    }, (error) => {
      console.warn("Firestore onSnapshot error (products):", error);
      setLoading(false); // Liberar carga ante fallos de conexión
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('solem_cart_v2', JSON.stringify(cart)); }, [cart]);

  // Sync homeContent desde Firestore (fuente única de verdad, incluye carouselImages)
  useEffect(() => {
    const homeDocRef = doc(db, 'settings', 'homeContent');
    const unsubscribe = onSnapshot(homeDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as HomeContent;
        setHomeContent(data);
        localStorage.setItem('solem_home_cache', JSON.stringify(data));
      }
    }, (error) => {
      console.warn("Firestore onSnapshot error (homeContent):", error);
    });
    return () => unsubscribe();
  }, []);

  // carouselImages derivado de homeContent — sin estado duplicado
  const carouselImages = useMemo(
    () => homeContent.carouselImages ?? [],
    [homeContent.carouselImages]
  );

  // Derivados memoizados para evitar recÃ¡lculo en cada render
  const clientProducts = useMemo(
    () => products.filter(p => p.active && hasStock(p)),
    [products]
  );

  const cartTotal = useMemo(() => cart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) return sum;
    return sum + getProductPrice(p, item.variant) * item.quantity;
  }, 0), [cart, products]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const clean = Object.fromEntries(
      Object.entries(product).filter(([, v]) => v !== undefined)
    );
    await addDoc(collection(db, 'products'), clean);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await updateDoc(doc(db, 'products', id), clean);
  };

  const toggleActive = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) await updateProduct(id, { active: !product.active });
  };

  const getAvailableStock = (productId: string, variant?: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      if (variant) {
        const v = product.variants.find(vr => vr.label === variant);
        return v?.stock ?? 0;
      }
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return product.generalStock ?? 0;
  };

  const addToCart = (productId: string, variant?: string): { success: boolean; message?: string } => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Producto no encontrado' };

    const availableStock = getAvailableStock(productId, variant);
    const currentQty = cart.find(i => i.productId === productId && i.variant === variant)?.quantity ?? 0;

    if (currentQty >= availableStock) {
      return {
        success: false,
        message: `No hay mÃ¡s stock disponible de este producto${variant && variant !== 'Ãšnica' ? ` (${variant})` : ''}`,
      };
    }

    setCart(prev => {
      const existing = prev.find(i => i.productId === productId && i.variant === variant);
      if (existing) {
        return prev.map(i =>
          i.productId === productId && i.variant === variant ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1, variant }];
    });

    return { success: true };
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.variant === variant)));
  };

  const updateQuantity = (productId: string, qty: number, variant?: string): { success: boolean; message?: string } => {
    if (qty <= 0) { removeFromCart(productId, variant); return { success: true }; }
    const availableStock = getAvailableStock(productId, variant);
    if (qty > availableStock) return { success: false, message: `Solo hay ${availableStock} unidades disponibles` };
    setCart(prev => prev.map(i =>
      i.productId === productId && i.variant === variant ? { ...i, quantity: qty } : i
    ));
    return { success: true };
  };

  const clearCart = () => setCart([]);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Bienvenido, Administrador' };
    } catch {
      return { success: false, message: 'Email o contraseÃ±a incorrectos' };
    }
  };

  const adminLogout = async () => {
    try { await firebaseSignOut(auth); setCurrentView('home'); }
    catch { /* silencioso */ }
  };

  const generateWhatsAppLink = () => {
    const number = '3516854262';
    const lines = cart.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return '';
      const variantText = item.variant && item.variant !== 'Ãšnica' ? ` (${item.variant})` : '';
      const price = getProductPrice(p, item.variant);
      return `â€¢ ${item.quantity}x ${p.name}${variantText} - $${(price * item.quantity).toLocaleString('es-AR')}`;
    }).filter(Boolean).join('\n');

    const message = `Â¡Hola SOLEM! Quiero hacer el siguiente pedido ðŸ›ï¸\n\n*Pedido - Plata 925:*\n\n${lines}\n\n*TOTAL: $${cartTotal.toLocaleString('es-AR')}*\n\nPor favor confirmame disponibilidad. Â¡Muchas gracias! âœ¨`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const updateCarouselImages = async (images: string[]) => {
    const validImages = images.filter(img => img && img.trim() !== '');
    await updateHomeContent({ carouselImages: validImages });
  };

  const updateHomeContent = async (updates: Partial<HomeContent>) => {
    const homeDocRef = doc(db, 'settings', 'homeContent');
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await updateDoc(homeDocRef, clean).catch(async () => {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(homeDocRef, { ...DEFAULT_HOME_CONTENT, ...clean });
    });
  };

  // useMemo en el value evita que todos los consumidores re-rendericen
  // cuando cambia un estado no relacionado (ej: cartOpen no afecta a ProductGrid)
  const value = useMemo<StoreContextType>(() => ({
    products, addProduct, deleteProduct, updateProduct, toggleActive, clientProducts,
    cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
    cartOpen, setCartOpen,
    currentView, setCurrentView, selectedCategory, setSelectedCategory,
    user, adminLogin, adminLogout, generateWhatsAppLink,
    searchQuery, setSearchQuery, carouselImages, updateCarouselImages,
    getAvailableStock,
    loading,
    homeContent, updateHomeContent,
  // Las funciones no cambian entre renders (son definidas en scope del provider)
  // Solo los valores de estado son dependencies reales
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    products, clientProducts, cart, cartTotal, cartCount,
    cartOpen, currentView, selectedCategory,
    user, searchQuery, carouselImages, loading, homeContent,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

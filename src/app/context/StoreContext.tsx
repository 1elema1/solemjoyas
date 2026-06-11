import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  price?: number; // optional per-variant price override
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
  updateCarouselImages: (images: string[]) => void;
  getAvailableStock: (productId: string, variant?: string) => number;
  getEffectivePrice: (productId: string, variant?: string) => number;
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

const DEFAULT_CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
];

const DEFAULT_HOME_CONTENT: HomeContent = {
  heroImage: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=900&q=80',
  heroTagline: 'Plata 925',
  heroTitle: 'Joyas que brillan con calma.',
  heroDescription: 'Piezas únicas en plata 925, diseñadas y creadas a mano en Córdoba. Sutiles, atemporales, hechas para acompañarte.',
  heroButton1Text: 'Explorar tienda →',
  heroButton2Text: 'Ver cadenas',
  heroButton2Category: 'Cadenas',
  heroNewCollectionTag: 'Nueva colección',
  heroNewCollectionText: 'Joyas para siempre',
  categoriesTitle: 'Colecciones',
  categoriesSubtitle: 'Explorá nuestras categorías',
  categoryImages: {
    Anillos: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=500&q=80',
    Cadenas: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=500&q=80',
    Pulseras: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&q=80',
    Dijes: 'https://images.unsplash.com/photo-1511253819057-5408d4d70465?w=500&q=80',
    Huggies: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80',
    Abridores: 'https://images.unsplash.com/photo-1693212793204-bcea856c75fe?w=500&q=80',
    Argollas: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=500&q=80',
    Conjuntos: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80',
  },
  carouselTitle: 'Inspiración',
  carouselSubtitle: 'Descubrí nuestras piezas',
  footerLocation: 'Ubicados en\nCórdoba Capital',
  footerShipping: 'Realizamos envíos\nmediante Uber Envíos',
  footerMaterial: 'Plata 925\ncertificada y garantizada',
  footerOrders: 'Coordinados por WhatsApp\nSin pagos en línea',
  footerCopyright: '© 2025 SOLEM · Todos los derechos reservados',
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('solem_cart_v2', []));
  const [user, setUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselImages, setCarouselImages] = useState<string[]>(() =>
    loadFromStorage('solem_carousel', DEFAULT_CAROUSEL_IMAGES)
  );
  const [loading, setLoading] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  
  const isFullyLoaded = !loading && homeLoaded;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser({ email: firebaseUser.email!, role: 'admin' });
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  // Real-time sync from Firestore — no local mock fallback
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData: Product[] = snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product)
        );
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al cargar productos desde Firestore:', error);
        setProducts([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('solem_cart_v2', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('solem_carousel', JSON.stringify(carouselImages)); }, [carouselImages]);

  // Sync homeContent from Firestore
  const [homeLoaded, setHomeLoaded] = useState(false);

  // Sync homeContent from Firestore
  useEffect(() => {
    const homeDocRef = doc(db, 'settings', 'homeContent');
    const unsubscribe = onSnapshot(
      homeDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setHomeContent({ ...DEFAULT_HOME_CONTENT, ...docSnap.data() } as HomeContent);
        } else {
          setHomeContent(DEFAULT_HOME_CONTENT);
        }
        setHomeLoaded(true); // <--- Agregamos esto
      },
      (error) => {
        console.error('Error al cargar contenido del home:', error);
        setHomeContent(DEFAULT_HOME_CONTENT);
      }
    );
    return () => unsubscribe();
  }, []);

 

  const clientProducts = products.filter(p => p.active && hasStock(p));

  const addProduct = async (product: Omit<Product, 'id'>) => {
    // Strip undefined fields before writing to Firestore
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

  const getEffectivePrice = (productId: string, variant?: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    return getProductPrice(product, variant);
  };

  const addToCart = (productId: string, variant?: string): { success: boolean; message?: string } => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Producto no encontrado' };

    const availableStock = getAvailableStock(productId, variant);
    const currentQty = cart.find(i => i.productId === productId && i.variant === variant)?.quantity ?? 0;

    if (currentQty >= availableStock) {
      return {
        success: false,
        message: `No hay más stock disponible de este producto${variant && variant !== 'Única' ? ` (${variant})` : ''}`,
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

  // Cart total uses per-variant price if set
  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) return sum;
    return sum + getProductPrice(p, item.variant) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Bienvenido, Administrador' };
    } catch {
      return { success: false, message: 'Email o contraseña incorrectos' };
    }
  };

  const adminLogout = async () => {
    try { await firebaseSignOut(auth); setCurrentView('home'); }
    catch (e) { console.error(e); }
  };

  const generateWhatsAppLink = () => {
    const number = '3516854262';
    const lines = cart.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return '';
      const variantText = item.variant && item.variant !== 'Única' ? ` (${item.variant})` : '';
      const price = getProductPrice(p, item.variant);
      return `• ${item.quantity}x ${p.name}${variantText} - $${(price * item.quantity).toLocaleString('es-AR')}`;
    }).filter(Boolean).join('\n');

    const message = `¡Hola SOLEM! Quiero hacer el siguiente pedido 🛍️\n\n*Pedido - Plata 925:*\n\n${lines}\n\n*TOTAL: $${cartTotal.toLocaleString('es-AR')}*\n\nPor favor confirmame disponibilidad. ¡Muchas gracias! ✨`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const updateCarouselImages = (images: string[]) => setCarouselImages(images);

  const updateHomeContent = async (updates: Partial<HomeContent>) => {
    const homeDocRef = doc(db, 'settings', 'homeContent');
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await updateDoc(homeDocRef, clean).catch(async () => {
      // If doc doesn't exist, create it with setDoc
      const { setDoc } = await import('firebase/firestore');
      await setDoc(homeDocRef, { ...DEFAULT_HOME_CONTENT, ...clean });
    });
  };

  
  return (
    <StoreContext.Provider value={{
      products, addProduct, deleteProduct, updateProduct, toggleActive, clientProducts,
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      cartOpen, setCartOpen,
      currentView, setCurrentView, selectedCategory, setSelectedCategory,
      user, adminLogin, adminLogout, generateWhatsAppLink,
      searchQuery, setSearchQuery, carouselImages, updateCarouselImages,
      getAvailableStock, getEffectivePrice,
      loading: !isFullyLoaded, 
      homeContent,
      updateHomeContent,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

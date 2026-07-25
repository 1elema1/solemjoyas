import type { Metadata } from 'next';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import { Product, HomeContent } from './context/StoreContext';
import { StoreProviderWrapper } from './components/StoreProviderWrapper';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { AnnouncementBar } from './components/AnnouncementBar';
import '../styles/theme.css';

export const metadata: Metadata = {
  title: 'SOLEM · Joyas en Plata 925 · Córdoba',
  description: 'Piezas únicas en plata 925, diseñadas y creadas a mano en Córdoba. Anillos, cadenas, pulseras, dijes y más. Pedidos por WhatsApp.',
};

async function getInitialData() {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    const initialProducts: Product[] = productsSnap.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product)
    );

    const homeSnap = await getDoc(doc(db, 'settings', 'homeContent'));
    const initialHome = homeSnap.exists()
      ? (homeSnap.data() as HomeContent)
      : null;

    return { initialProducts, initialHome };
  } catch (error) {
    console.error('Error fetching initial data on server:', error);
    return { initialProducts: [], initialHome: null };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialProducts, initialHome } = await getInitialData();

  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        <StoreProviderWrapper
          initialProducts={initialProducts}
          initialHome={initialHome}
        >
          <div
            style={{
              backgroundColor: '#F5F0E8',
              minHeight: '100vh',
              height: '100%',
              width: '100%',
              fontFamily: 'system-ui, sans-serif',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <AnnouncementBar />
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <CartDrawer />
          </div>
        </StoreProviderWrapper>
      </body>
    </html>
  );
}

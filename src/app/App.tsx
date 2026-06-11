import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#F5F0E8',
      minHeight: '100vh',
      height: '100%',
      width: '100%',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <CartDrawer />
    </div>
  );
}

function AppContent() {
  function AppContent() {
  const { currentView, loading } = useStore(); // Agregamos 'loading'

  // Si está cargando desde Firebase, mostramos un spinner o pantalla de carga
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F5F0E8' }}>
         <p style={{ color: '#6B8F71', letterSpacing: '0.2em' }} className="uppercase">Cargando SOLEM...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <MainLayout>
          {currentView === 'home' && <Hero />}
          {currentView === 'products' && <ProductGrid />}
        </MainLayout>
      } />
      {/* ... resto de tus rutas ... */}
    </Routes>
  );
}
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <AppContent />
      </Router>
    </StoreProvider>
  );
}

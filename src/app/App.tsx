import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnnouncementBar } from './components/AnnouncementBar';
import { AccessibilityWidget } from './components/AccessibilityWidget';

const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));

function MainLayout({ children, showAccessibility = true }: { children: React.ReactNode; showAccessibility?: boolean }) {
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
      <div className="hidden lg:block"><AnnouncementBar /></div>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <CartDrawer />
      {showAccessibility && <AccessibilityWidget />}
    </div>
  );
}

function AppContent() {
  const { currentView } = useStore();

  return (
    <Routes>
      <Route path="/" element={
        <MainLayout>
          <Hero />
        </MainLayout>
      } />
      <Route path="/products" element={
        <MainLayout>
          <ProductGrid />
        </MainLayout>
      } />
      <Route path="/login" element={
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
          <AdminLogin />
        </Suspense>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <MainLayout showAccessibility={false}>
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando panel...</div>}>
              <AdminPanel />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
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

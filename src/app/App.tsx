import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnnouncementBar } from './components/AnnouncementBar';

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
      <AnnouncementBar />
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <CartDrawer />
    </div>
  );
}

function AppContent() {
  const { currentView } = useStore();

  return (
    <Routes>
      <Route path="/" element={
        <MainLayout>
          {currentView === 'home' && <Hero />}
          {currentView === 'products' && <ProductGrid />}
        </MainLayout>
      } />
      <Route path="/products" element={
        <MainLayout>
          <ProductGrid />
        </MainLayout>
      } />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <MainLayout>
            <AdminPanel />
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

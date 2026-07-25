import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useStore();

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#F5F0E8',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#6B8F71', fontSize: '0.9rem' }}>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

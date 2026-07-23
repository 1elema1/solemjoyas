import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../imports/Photoroom_20250815_205827.PNG';

export function AdminLogin() {
  const { adminLogin } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await adminLogin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#F5F0E8',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,0,0,0.08)',
          maxWidth: '400px',
          width: '100%',
          padding: '40px 32px',
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="SOLEM" className="h-20 w-20 object-contain mb-4" />
          <h1
            style={{
              fontFamily: '"Cormorant Garamond","Georgia",serif',
              fontSize: '2rem',
              color: '#1a1a1a',
              fontWeight: 300,
              marginBottom: '8px',
            }}
          >
            Panel de Administración
          </h1>
          <p style={{ color: '#888', fontSize: '0.82rem' }}>Ingresá con tu cuenta de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.12em' }}
              className="uppercase block mb-2"
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid rgba(0,0,0,0.12)',
                padding: '12px 14px',
                fontSize: '0.88rem',
                background: 'transparent',
                color: '#1a1a1a',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.12em' }}
              className="uppercase block mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid rgba(0,0,0,0.12)',
                padding: '12px 14px',
                fontSize: '0.88rem',
                background: 'transparent',
                color: '#1a1a1a',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(192,57,43,0.1)',
                border: '1px solid rgba(192,57,43,0.3)',
                padding: '10px 14px',
              }}
            >
              <p style={{ color: '#c0392b', fontSize: '0.75rem' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#1a1a1a',
              color: '#F5F0E8',
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              padding: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
            className="uppercase hover:bg-black/80 transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            style={{
              color: '#6B8F71',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            className="uppercase hover:opacity-60 transition-opacity"
          >
            ← Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}

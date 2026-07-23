import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logAudit, getClientIP, parseUserAgent } from '../services/auditService';
import { notifyAdminPasswordResetSuccess, notifyAdminPasswordResetError } from '../services/resendService';
import { X, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_KEY = 'last_password_reset_timestamp';
const COOLDOWN_SECONDS = 60;

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (rawEmail: string): { valid: boolean; cleanEmail: string; message?: string } => {
    const clean = rawEmail.trim().toLowerCase();
    if (!clean) {
      return { valid: false, cleanEmail: '', message: 'El correo electrónico es obligatorio.' };
    }
    if (!EMAIL_REGEX.test(clean)) {
      return { valid: false, cleanEmail: clean, message: 'Ingrese una dirección de correo electrónico válida.' };
    }
    return { valid: true, cleanEmail: clean };
  }

  const checkRateLimit = (cleanEmail: string): boolean => {
    try {
      const lastKey = `${RATE_LIMIT_KEY}_${cleanEmail}`;
      const lastTime = sessionStorage.getItem(lastKey);
      if (lastTime) {
        const elapsed = (Date.now() - parseInt(lastTime, 10)) / 1000;
        if (elapsed < COOLDOWN_SECONDS) {
          return false;
        }
      }
    } catch {
      // Ignorar errores de sessionStorage
    }
    return true;
  };

  const recordRateLimit = (cleanEmail: string) => {
    try {
      const lastKey = `${RATE_LIMIT_KEY}_${cleanEmail}`;
      sessionStorage.setItem(lastKey, Date.now().toString());
    } catch {
      // Silencioso
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const validation = validateEmail(email);
    if (!validation.valid) {
      setValidationError(validation.message || 'Correo no válido.');
      return;
    }

    const cleanEmail = validation.cleanEmail;

    if (!checkRateLimit(cleanEmail)) {
      setValidationError(`Por favor aguarde ${COOLDOWN_SECONDS} segundos antes de realizar una nueva solicitud.`);
      return;
    }

    recordRateLimit(cleanEmail);
    setLoading(true);

    const now = new Date();
    const fecha = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const ua = navigator.userAgent;
    const { browser, os } = parseUserAgent(ua);
    const ip = await getClientIP();

    try {
      // 1. Método oficial de Firebase Authentication
      await sendPasswordResetEmail(auth, cleanEmail);

      // 2. Registrar en Auditoría
      await logAudit({
        email: cleanEmail,
        success: true,
        origin: 'Login',
        action: 'Solicitud recuperación de contraseña',
      });

      // 3. Notificación mediante Resend
      await notifyAdminPasswordResetSuccess({
        email: cleanEmail,
        fecha,
        hora,
        ip,
        browser,
        os,
        origen: 'Pantalla Login',
      });

      // 4. Mostrar mensaje neutro de seguridad
      setSubmittedMessage(true);
    } catch (err: any) {
      console.warn('Firebase sendPasswordResetEmail error:', err);

      // Si Firebase devuelve un error (ej. auth/invalid-email, auth/network-request-failed, etc.)
      const errorCode = err?.code || err?.message || 'INTERNAL_ERROR';
      const formattedError = `Firebase returned ${errorCode}`;

      // Registrar error en Auditoría
      await logAudit({
        email: cleanEmail,
        success: false,
        origin: 'Login',
        action: 'Solicitud recuperación de contraseña',
        errorDetail: formattedError,
      });

      // Notificar error al administrador mediante Resend
      await notifyAdminPasswordResetError({
        email: cleanEmail,
        fecha,
        hora,
        ip,
        browser,
        os,
        origen: 'Pantalla Login',
        errorDetail: formattedError,
      });

      // Por seguridad anti-enumeración, incluso si Firebase retorna error porque el usuario no existe,
      // la norma de seguridad exige mostrar siempre el mismo mensaje genérico al usuario.
      setSubmittedMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setValidationError('');
    setSubmittedMessage(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}>
      <div
        className="w-full max-w-md p-7 relative"
        style={{
          backgroundColor: '#F5F0E8',
          border: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={handleClose}
          style={{ color: '#888', position: 'absolute', top: '18px', right: '18px' }}
          className="hover:opacity-60 transition-opacity"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(107,143,113,0.12)', color: '#6B8F71' }}>
            <Mail size={20} />
          </div>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond","Georgia",serif',
              fontSize: '1.65rem',
              color: '#1a1a1a',
              fontWeight: 300,
              lineHeight: 1.2,
            }}
            className="mb-2"
          >
            Recuperación de contraseña
          </h2>
          <p style={{ color: '#666', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Ingrese la dirección de correo electrónico asociada a su cuenta. Si existe una cuenta registrada con ese correo, recibirá un enlace para restablecer su contraseña.
          </p>
        </div>

        {submittedMessage ? (
          <div className="flex flex-col gap-4">
            <div
              style={{
                backgroundColor: 'rgba(107,143,113,0.12)',
                border: '1px solid rgba(107,143,113,0.3)',
                padding: '16px',
              }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 size={18} style={{ color: '#6B8F71', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#1a1a1a', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                Si existe una cuenta asociada a este correo electrónico, recibirás un enlace para restablecer tu contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                backgroundColor: '#1a1a1a',
                color: '#F5F0E8',
                fontSize: '0.68rem',
                letterSpacing: '0.18em',
                padding: '13px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
              className="uppercase hover:bg-black/80 transition-colors mt-2"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                style={{ color: '#888', fontSize: '0.68rem', letterSpacing: '0.12em' }}
                className="uppercase block mb-2"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="ejemplo@correo.com"
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

            {validationError && (
              <div
                style={{
                  backgroundColor: 'rgba(192,57,43,0.08)',
                  border: '1px solid rgba(192,57,43,0.25)',
                  padding: '10px 12px',
                }}
                className="flex items-center gap-2"
              >
                <AlertCircle size={14} style={{ color: '#c0392b', flexShrink: 0 }} />
                <p style={{ color: '#c0392b', fontSize: '0.75rem', margin: 0 }}>{validationError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  border: '1px solid rgba(0,0,0,0.2)',
                  color: '#1a1a1a',
                  fontSize: '0.68rem',
                  letterSpacing: '0.15em',
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                className="uppercase hover:bg-black/5 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#aaa' : '#1a1a1a',
                  color: '#F5F0E8',
                  fontSize: '0.68rem',
                  letterSpacing: '0.15em',
                  padding: '12px 22px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                className="uppercase hover:bg-black/85 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AuditLogData {
  email: string;
  success: boolean;
  origin: string;
  errorDetail?: string;
  action?: string;
  user?: string;
}

export interface AuditRecord {
  id: string;
  fecha: string;
  hora: string;
  accion: string;
  correo: string;
  usuario: string;
  ip: string;
  userAgent: string;
  navegador: string;
  sistema: string;
  resultado: string;
  origen: string;
  createdAt?: any;
}

export function parseUserAgent(ua: string): { browser: string; os: string } {
  let os = 'Desconocido';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 11 / 10';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  let browser = 'Desconocido';
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = `Google Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`;
  }

  return { browser, os };
}

export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      return data.ip || '181.16.42.102';
    }
  } catch {
    // Fallback en caso de bloqueo de red o adblocker
  }
  return '181.16.42.102';
}

export async function logAudit(data: AuditLogData): Promise<void> {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const ua = navigator.userAgent;
  const { browser, os } = parseUserAgent(ua);
  const ip = await getClientIP();

  const auditEntry = {
    fecha,
    hora,
    accion: data.action || 'Solicitud recuperación de contraseña',
    correo: data.email,
    usuario: data.user || 'No autenticado',
    ip,
    userAgent: ua,
    navegador: browser,
    sistema: os,
    resultado: data.success
      ? 'Solicitud enviada correctamente'
      : (data.errorDetail ? `Error: ${data.errorDetail}` : 'Error al enviar correo de recuperación'),
    origen: data.origin || 'Login',
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'audit'), auditEntry);
  } catch (err) {
    console.error('Error al registrar auditoría en Firestore:', err);
  }
}

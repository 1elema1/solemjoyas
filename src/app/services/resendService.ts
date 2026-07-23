export interface ResendNotificationParams {
  email: string;
  fecha: string;
  hora: string;
  ip: string;
  browser: string;
  os: string;
  origen?: string;
  errorDetail?: string;
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendResendEmail(subject: string, htmlContent: string): Promise<boolean> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'ferreyraemanuel19@gmail.com';
  const sender = import.meta.env.VITE_RESEND_FROM || 'Sistema <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('VITE_RESEND_API_KEY no configurada. La notificación por correo se simuló correctamente.');
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [adminEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error al enviar correo mediante Resend API:', errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Excepción al conectar con Resend:', error);
    return false;
  }
}

export async function notifyAdminPasswordResetSuccess(params: ResendNotificationParams): Promise<boolean> {
  const cleanEmail = escapeHtml(params.email);
  const cleanFecha = escapeHtml(params.fecha);
  const cleanHora = escapeHtml(params.hora);
  const cleanIp = escapeHtml(params.ip);
  const cleanBrowser = escapeHtml(params.browser);
  const cleanOs = escapeHtml(params.os);
  const cleanOrigen = escapeHtml(params.origen || 'Pantalla Login');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f0e8; margin: 0; padding: 24px; color: #1a1a1a; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #1a1a1a; color: #F5F0E8; padding: 24px; text-align: center; }
        .header h2 { margin: 0; font-size: 1.25rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; }
        .content { padding: 28px; }
        .badge { display: inline-block; background-color: rgba(107,143,113,0.15); color: #6B8F71; border: 1px solid rgba(107,143,113,0.3); padding: 4px 10px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.88rem; }
        .info-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
        .info-table td.label { font-weight: 600; color: #666; width: 38%; }
        .info-table td.value { color: #1a1a1a; word-break: break-all; }
        .footer { background-color: #fafafa; padding: 16px 28px; border-top: 1px solid #eee; text-align: center; font-size: 0.75rem; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Recuperación de Contraseña</h2>
        </div>
        <div class="content">
          <span class="badge">Solicitud Registrada</span>
          <p style="font-size: 0.95rem; margin-top: 0; color: #333; line-height: 1.5;">
            Se registró una nueva solicitud de restablecimiento de contraseña en el sistema.
          </p>
          <table class="info-table">
            <tr>
              <td class="label">Correo ingresado:</td>
              <td class="value"><strong>${cleanEmail}</strong></td>
            </tr>
            <tr>
              <td class="label">Fecha:</td>
              <td class="value">${cleanFecha}</td>
            </tr>
            <tr>
              <td class="label">Hora:</td>
              <td class="value">${cleanHora}</td>
            </tr>
            <tr>
              <td class="label">Dirección IP:</td>
              <td class="value">${cleanIp}</td>
            </tr>
            <tr>
              <td class="label">Navegador:</td>
              <td class="value">${cleanBrowser}</td>
            </tr>
            <tr>
              <td class="label">Sistema Operativo:</td>
              <td class="value">${cleanOs}</td>
            </tr>
            <tr>
              <td class="label">Origen:</td>
              <td class="value">${cleanOrigen}</td>
            </tr>
            <tr>
              <td class="label">Estado:</td>
              <td class="value" style="color: #27ae60; font-weight: 600;">Solicitud enviada a Firebase correctamente.</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          Notificación automática de auditoría del sistema. Por favor no responder a este correo.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendResendEmail('Solicitud de recuperación de contraseña', html);
}

export async function notifyAdminPasswordResetError(params: ResendNotificationParams): Promise<boolean> {
  const cleanEmail = escapeHtml(params.email);
  const cleanFecha = escapeHtml(params.fecha);
  const cleanHora = escapeHtml(params.hora);
  const cleanIp = escapeHtml(params.ip);
  const cleanBrowser = escapeHtml(params.browser);
  const cleanOs = escapeHtml(params.os);
  const cleanOrigen = escapeHtml(params.origen || 'Pantalla Login');
  const cleanError = escapeHtml(params.errorDetail || 'Firebase returned INTERNAL_ERROR.');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f0e8; margin: 0; padding: 24px; color: #1a1a1a; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(192,57,43,0.2); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #c0392b; color: #ffffff; padding: 24px; text-align: center; }
        .header h2 { margin: 0; font-size: 1.25rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; }
        .content { padding: 28px; }
        .badge { display: inline-block; background-color: rgba(192,57,43,0.15); color: #c0392b; border: 1px solid rgba(192,57,43,0.3); padding: 4px 10px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.88rem; }
        .info-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
        .info-table td.label { font-weight: 600; color: #666; width: 38%; }
        .info-table td.value { color: #1a1a1a; word-break: break-all; }
        .error-box { background-color: rgba(192,57,43,0.05); border: 1px solid rgba(192,57,43,0.2); padding: 12px; font-family: monospace; font-size: 0.8rem; color: #c0392b; margin-top: 12px; border-radius: 4px; }
        .footer { background-color: #fafafa; padding: 16px 28px; border-top: 1px solid #eee; text-align: center; font-size: 0.75rem; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Error en Recuperación de Contraseña</h2>
        </div>
        <div class="content">
          <span class="badge">Fallo Detectado</span>
          <p style="font-size: 0.95rem; margin-top: 0; color: #333; line-height: 1.5;">
            No fue posible enviar el correo de recuperación de contraseña solicitado.
          </p>
          <table class="info-table">
            <tr>
              <td class="label">Correo solicitado:</td>
              <td class="value"><strong>${cleanEmail}</strong></td>
            </tr>
            <tr>
              <td class="label">Fecha y Hora:</td>
              <td class="value">${cleanFecha} - ${cleanHora}</td>
            </tr>
            <tr>
              <td class="label">IP / Origen:</td>
              <td class="value">${cleanIp} (${cleanOrigen})</td>
            </tr>
            <tr>
              <td class="label">Entorno:</td>
              <td class="value">${cleanBrowser} / ${cleanOs}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <strong style="font-size: 0.85rem; color: #555;">Detalle del error:</strong>
            <div class="error-box">
              ${cleanError}
            </div>
          </div>
        </div>
        <div class="footer">
          Notificación de error del sistema de seguridad.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendResendEmail('Error en recuperación de contraseña', html);
}

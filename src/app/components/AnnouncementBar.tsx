import { useStore } from '../context/StoreContext';

export function AnnouncementBar() {
  const { homeContent } = useStore();
  
  // Limpiamos los anuncios para quitar textos vacíos y asegurar que tengamos al menos un anuncio válido
  const rawAnnouncements = homeContent.announcements || [];
  const validAnnouncements = rawAnnouncements.filter(txt => txt && txt.trim() !== '');

  const announcements = validAnnouncements.length > 0
    ? validAnnouncements
    : [
        "✨ 3 CUOTAS SIN INTERÉS EN TODA LA TIENDA ✨",
        "🚚 ENVÍOS GRATIS EN CÓRDOBA SUPERANDO $50.000 🚚",
        "💖 JOYAS ÚNICAS EN PLATA 925 HECHAS A MANO 💖"
      ];

  // Triplicamos la lista para garantizar un loop infinito sin saltos ni espacios vacíos
  const repeatedAnnouncements = [...announcements, ...announcements, ...announcements];

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        color: '#F5F0E8',
        height: '34px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        zIndex: 60,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="marquee-container">
        {repeatedAnnouncements.map((text, idx) => (
          <div key={idx} className="marquee-item">
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

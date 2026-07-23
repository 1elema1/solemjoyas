import { useStore } from '../context/StoreContext';

export function AnnouncementBar() {
  const { homeContent } = useStore();
  const announcements = homeContent.announcements && homeContent.announcements.length > 0
    ? homeContent.announcements
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
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .marquee-container {
          display: flex;
          white-space: nowrap;
          animation: marquee 30s linear infinite;
        }
        .marquee-item {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          padding: 0 3rem;
          text-transform: uppercase;
          display: flex;
          align-items: center;
        }
      `}</style>
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

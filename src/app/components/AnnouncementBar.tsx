import { useStore } from '../context/StoreContext';

export function AnnouncementBar() {
  const { homeContent } = useStore();
  const announcements = (homeContent.announcements || [])
    .map(text => text.trim())
    .filter(Boolean);
  const messages = announcements.length > 0
    ? announcements
    : [
        '✨ 3 CUOTAS SIN INTERÉS EN TODA LA TIENDA ✨',
        '🚚 ENVÍOS GRATIS EN CÓRDOBA SUPERANDO $50.000 🚚',
        '💖 JOYAS ÚNICAS EN PLATA 925 HECHAS A MANO 💖',
      ];

  return (
    <div
      role="region"
      aria-label="Anuncios de la tienda"
      className="announcement-marquee"
    >
      <div className="announcement-marquee-track">
        {[0, 1].map(copy => (
          <div
            className="announcement-marquee-group"
            key={copy}
            aria-hidden={copy === 1}
          >
            {messages.map((message, index) => (
              <span className="announcement-marquee-item" key={`${index}-${message}`}>
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

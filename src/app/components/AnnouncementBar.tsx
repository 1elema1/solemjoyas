import { useEffect, useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [messages.join('|')]);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      aria-label="Anuncios de la tienda"
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
      <div
        className="announcement-carousel-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {messages.map((message, index) => (
          <div className="announcement-carousel-slide" key={`${index}-${message}`}>
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
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
  const marqueeRef = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const [groupsPerCycle, setGroupsPerCycle] = useState(2);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const firstGroup = firstGroupRef.current;
    if (!marquee || !firstGroup) return;

    const fitGroups = () => {
      const groupWidth = firstGroup.getBoundingClientRect().width;
      if (!groupWidth) return;
      const requiredGroups = Math.ceil(marquee.clientWidth / groupWidth) + 1;
      setGroupsPerCycle(Math.max(2, requiredGroups));
    };

    fitGroups();
    const observer = new ResizeObserver(fitGroups);
    observer.observe(marquee);
    observer.observe(firstGroup);
    return () => observer.disconnect();
  }, [messages.join('|'), homeContent.announcementFontSize, homeContent.announcementFontFamily]);

  const textColor = homeContent.announcementTextColor || '#F5F0E8';
  const backgroundColor = homeContent.announcementBgColor || '#1a1a1a';
  const fontSize = Math.min(24, Math.max(10, Number(homeContent.announcementFontSize) || 11));
  const speed = Math.min(60, Math.max(8, Number(homeContent.announcementSpeed) || 24));
  const fontFamily = homeContent.announcementFontFamily || 'system-ui, sans-serif';
  const separatorType = homeContent.announcementSeparatorType || 'symbol';
  const separator = homeContent.announcementSeparator || '✦';
  const separatorImage = homeContent.announcementSeparatorImage || '';
  const copies = Array.from({ length: groupsPerCycle * 2 }, (_, index) => index);

  return (
    <div
      ref={marqueeRef}
      role="region"
      aria-label="Anuncios de la tienda"
      className="announcement-marquee"
      style={{ backgroundColor, color: textColor, fontFamily, fontSize: fontSize + 'px' }}
    >
      <div className="announcement-marquee-track" style={{ animationDuration: speed + 's' }}>
        {copies.map(copy => (
          <div
            className="announcement-marquee-group"
            key={copy}
            aria-hidden={copy > 0}
            ref={copy === 0 ? firstGroupRef : undefined}
          >
            {messages.map((message, index) => (
              <span className="announcement-marquee-item" key={String(index) + '-' + message}>
                <span>{message}</span>
                {separatorType === 'image' && separatorImage ? (
                  <img className="announcement-marquee-separator-image" src={separatorImage} alt="" aria-hidden="true" />
                ) : (
                  <span className="announcement-marquee-separator" aria-hidden="true">{separator}</span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

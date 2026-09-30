import { useEffect, useState } from 'react';

type AccessibilitySettings = {
  textScale: number;
  spaciousText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
};

const STORAGE_KEY = 'solemjoyas-accessibility-settings';
const DEFAULT_SETTINGS: AccessibilitySettings = {
  textScale: 100,
  spaciousText: false,
  highContrast: false,
  reduceMotion: false,
};

function readSettings(): AccessibilitySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(saved);
    const scale = Number(parsed.textScale);
    return {
      textScale: [100, 110, 120, 130, 140].includes(scale) ? scale : 100,
      spaciousText: Boolean(parsed.spaciousText),
      highContrast: Boolean(parsed.highContrast),
      reduceMotion: Boolean(parsed.reduceMotion),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-size', `${16 * settings.textScale / 100}px`);
    root.classList.toggle('a11y-spacious-text', settings.spaciousText);
    root.classList.toggle('a11y-high-contrast', settings.highContrast);
    root.classList.toggle('a11y-reduced-motion', settings.reduceMotion);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The controls still work for this session if storage is unavailable.
    }
  }, [settings]);

  const update = (key: keyof AccessibilitySettings, value: number | boolean) => {
    setSettings(current => ({ ...current, [key]: value }));
  };

  const reset = () => setSettings(DEFAULT_SETTINGS);

  return (
    <div className="accessibility-widget">
      {open && (
        <section className="accessibility-panel" id="accessibility-panel" aria-label="Opciones de accesibilidad">
          <div className="accessibility-panel-heading">
            <div>
              <span className="accessibility-eyebrow">Personalizá tu experiencia</span>
              <h2>Accesibilidad</h2>
            </div>
            <button type="button" className="accessibility-close" aria-label="Cerrar opciones" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="accessibility-font-control">
            <span className="accessibility-control-label">Tamaño del texto</span>
            <div className="accessibility-stepper">
              <button type="button" aria-label="Reducir tamaño del texto" disabled={settings.textScale <= 100} onClick={() => update('textScale', settings.textScale - 10)}>A−</button>
              <span aria-live="polite">{settings.textScale}%</span>
              <button type="button" aria-label="Aumentar tamaño del texto" disabled={settings.textScale >= 140} onClick={() => update('textScale', settings.textScale + 10)}>A+</button>
            </div>
          </div>

          <label className="accessibility-option">
            <span><strong>Más espaciado</strong><small>Facilita la lectura de textos</small></span>
            <input type="checkbox" checked={settings.spaciousText} onChange={event => update('spaciousText', event.target.checked)} />
          </label>
          <label className="accessibility-option">
            <span><strong>Alto contraste</strong><small>Resalta textos y elementos</small></span>
            <input type="checkbox" checked={settings.highContrast} onChange={event => update('highContrast', event.target.checked)} />
          </label>
          <label className="accessibility-option">
            <span><strong>Reducir movimiento</strong><small>Minimiza animaciones</small></span>
            <input type="checkbox" checked={settings.reduceMotion} onChange={event => update('reduceMotion', event.target.checked)} />
          </label>

          <button type="button" className="accessibility-reset" onClick={reset}>Restablecer preferencias</button>
        </section>
      )}

      <button
        type="button"
        className="accessibility-trigger"
        aria-label={open ? 'Cerrar opciones de accesibilidad' : 'Abrir opciones de accesibilidad'}
        aria-expanded={open}
        aria-controls="accessibility-panel"
        onClick={() => setOpen(value => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4.5" r="2" />
          <path d="M4 8.5h16M12 8.5v11m0-7-5 7m5-7 5 7" />
        </svg>
      </button>
    </div>
  );
}

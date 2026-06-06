import { Upload, X, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

async function compressAndUpload(file: File): Promise<string> {
  // Step 1: compress with Canvas (max 800px, JPEG 0.7 quality)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Step 2: dataURL → Blob → upload to Firebase Storage
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const filename = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export function ImageUpload({ value, onChange, label = 'Imagen' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccioná una imagen válida');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setUploading(true);
    setError('');
    try {
      const url = await compressAndUpload(file);
      onChange(url);
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError('Error al subir la imagen. Revisá tu conexión o las reglas de Storage.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <label style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase block mb-2">
        {label}
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://… o subí una imagen"
            style={{
              flex: 1,
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '11px 14px',
              fontSize: '0.82rem',
              background: 'transparent',
              color: '#1a1a1a',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '11px 16px',
              background: 'transparent',
              cursor: uploading ? 'not-allowed' : 'pointer',
              color: uploading ? '#aaa' : '#6B8F71',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              opacity: uploading ? 0.7 : 1,
            }}
            className="uppercase hover:bg-black/5 transition-colors"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Subiendo…' : 'Subir'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {error && (
          <div style={{ backgroundColor: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', padding: '10px 14px' }}>
            <p style={{ color: '#c0392b', fontSize: '0.75rem' }}>{error}</p>
          </div>
        )}

        {value && !uploading && (
          <div className="relative inline-block" style={{ maxWidth: '200px' }}>
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: 'auto', display: 'block', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute', top: '6px', right: '6px',
                backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', border: 'none',
                borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}
              className="hover:bg-black transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

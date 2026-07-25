import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="relative flex items-center"
      style={{
        borderBottom: isFocused ? '1px solid #6B8F71' : '1px solid rgba(0,0,0,0.12)',
        transition: 'border-color 0.2s',
      }}
    >
      <Search size={14} style={{ color: isFocused ? '#6B8F71' : '#aaa', marginRight: '8px' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Buscar productos..."
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#1a1a1a',
          fontSize: '0.72rem',
          letterSpacing: '0.06em',
          padding: '6px 0',
          width: '100%',
          minWidth: '160px',
          maxWidth: '180px',
        }}
        className="lg:max-w-[180px]"
      />
      {value && (
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#aaa',
            padding: '0',
            marginLeft: '4px'
          }}
          className="hover:opacity-60 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

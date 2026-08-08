import React from 'react';

export default function Logo({ size = 'medium', className = '' }) {
  const iconSizes = {
    small: 36,
    medium: 52,
    large: 68
  };

  const textSizes = {
    small: '1.25rem',
    medium: '1.65rem',
    large: '2.1rem'
  };

  const dimension = iconSizes[size] || 52;
  const fontStyle = { fontSize: textSizes[size] || '1.65rem' };

  return (
    <div className={`viva-logo-container ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div className="viva-logo-icon" style={{ width: dimension, height: dimension, filter: 'drop-shadow(0px 4px 12px rgba(124, 58, 237, 0.2))' }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="heartPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="greenLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="purpleAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>

          {/* Leaves at the top */}
          <path d="M 46,24 C 38,10 24,14 34,26 C 42,32 46,24 46,24 Z" fill="url(#greenLeafGrad)" />
          <path d="M 54,20 C 62,4 82,10 68,26 C 58,34 54,20 54,20 Z" fill="url(#greenLeafGrad)" />

          {/* Heart/Apple Body */}
          <path d="M 50,92 C 34,80 12,62 12,42 C 12,28 24,20 36,24 C 44,27 48,32 50,35 C 52,32 56,27 64,24 C 76,20 88,28 88,42 C 88,62 66,80 50,92 Z" fill="url(#heartPinkGrad)" />
          
          {/* Inner Orange Swoosh / Active Figure */}
          <path d="M 50,38 C 38,38 30,48 30,60 C 30,74 44,82 50,86 C 54,83 66,76 68,64 C 64,68 58,72 50,72 C 42,72 38,66 38,58 C 38,48 46,42 50,38 Z" fill="url(#orangeGrad)" />
          
          {/* Green Dynamic Leaf Overlay */}
          <path d="M 40,78 C 54,66 76,46 86,20 C 80,34 60,68 36,84 C 38,82 39,80 40,78 Z" fill="url(#greenLeafGrad)" />

          {/* Figure head dot */}
          <circle cx="52" cy="40" r="4.5" fill="#FFFFFF" />
        </svg>
      </div>
      <div className="viva-logo-text" style={{ ...fontStyle, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        <span style={{ color: 'var(--primary-purple)' }}>VIVA</span>
        <span style={{ color: 'var(--primary-orange)', marginLeft: '4px' }}>NUTRI</span>
      </div>
    </div>
  );
}

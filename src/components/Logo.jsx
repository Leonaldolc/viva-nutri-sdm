import React from 'react';

export default function Logo({ 
  size = 'medium', 
  variant = 'vertical', 
  showTagline = false,
  className = '' 
}) {
  const iconSizes = {
    xs: 28,
    small: 36,
    medium: 52,
    large: 68,
    xl: 84
  };

  const textSizes = {
    xs: { main: '1rem', sub: '0.55rem', gap: '6px' },
    small: { main: '1.25rem', sub: '0.62rem', gap: '8px' },
    medium: { main: '1.65rem', sub: '0.72rem', gap: '10px' },
    large: { main: '2.1rem', sub: '0.82rem', gap: '12px' },
    xl: { main: '2.6rem', sub: '0.95rem', gap: '14px' }
  };

  const dimension = iconSizes[size] || 52;
  const fontConfig = textSizes[size] || textSizes.medium;

  const isHorizontal = variant === 'horizontal';

  return (
    <div 
      className={`viva-logo-container ${isHorizontal ? 'viva-logo-horizontal' : 'viva-logo-vertical'} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        gap: fontConfig.gap,
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Dynamic Emblem */}
      <div 
        className="viva-logo-icon-wrapper"
        style={{
          width: dimension,
          height: dimension,
          minWidth: dimension,
          minHeight: dimension,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease'
        }}
      >
        <svg 
          viewBox="0 0 120 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            {/* Violet/Purple Gradient */}
            <linearGradient id="vnPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="60%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>

            {/* Vibrant Emerald Leaf Gradient */}
            <linearGradient id="vnEmeraldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Glowing Sunset Orange Gradient */}
            <linearGradient id="vnOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Warm Solar Spark Gradient */}
            <linearGradient id="vnSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            {/* Soft Ambient Shadow Filter */}
            <filter id="vnDropGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7C3AED" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Soft Glow Aura */}
          <g filter="url(#vnDropGlow)">
            {/* Left Botanical Leaf Wing */}
            <path 
              d="M 60,16 C 36,16 16,36 16,62 C 16,84 36,100 58,104 C 44,92 36,76 38,58 C 40,40 48,26 60,16 Z" 
              fill="url(#vnEmeraldGrad)" 
            />

            {/* Right Health Care Heart Arc */}
            <path 
              d="M 60,16 C 72,26 80,40 82,58 C 84,76 76,92 62,104 C 84,100 104,84 104,62 C 104,36 84,16 60,16 Z" 
              fill="url(#vnPurpleGrad)" 
            />

            {/* Central Nourishing Vitality Flame / Seed */}
            <path 
              d="M 60,40 C 50,50 46,62 48,74 C 50,86 58,94 60,98 C 62,94 70,86 72,74 C 74,62 70,50 60,40 Z" 
              fill="url(#vnOrangeGrad)" 
            />

            {/* Delicate Light Reflection Curves */}
            <path 
              d="M 28,42 C 22,54 22,68 28,80" 
              stroke="rgba(255, 255, 255, 0.45)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            
            <path 
              d="M 92,42 C 98,54 98,68 92,80" 
              stroke="rgba(255, 255, 255, 0.35)" 
              strokeWidth="3" 
              strokeLinecap="round" 
            />

            {/* Golden Vitality Spark Node */}
            <circle cx="60" cy="28" r="5" fill="url(#vnSparkGrad)" />
            <circle cx="60" cy="28" r="2" fill="#FFFFFF" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Typography Brand Block */}
      <div 
        className="viva-logo-text-group" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: isHorizontal ? 'flex-start' : 'center',
          lineHeight: 1
        }}
      >
        <div 
          className="viva-logo-brand" 
          style={{ 
            fontSize: fontConfig.main, 
            fontWeight: 900, 
            letterSpacing: '-0.04em', 
            lineHeight: 1.05,
            display: 'flex',
            alignItems: 'baseline'
          }}
        >
          <span 
            style={{ 
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(124, 58, 237, 0.15)'
            }}
          >
            VIVA
          </span>
          <span 
            style={{ 
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginLeft: '4px',
              textShadow: '0 2px 10px rgba(249, 115, 22, 0.15)'
            }}
          >
            NUTRI
          </span>
        </div>

        {showTagline && (
          <span 
            className="viva-logo-tagline"
            style={{
              fontSize: fontConfig.sub,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #64748B)',
              marginTop: '4px'
            }}
          >
            Nutrição & Saúde
          </span>
        )}
      </div>
    </div>
  );
}

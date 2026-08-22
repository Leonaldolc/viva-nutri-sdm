import React from 'react';

export default function WatermarkBackground() {
  return (
    <div className="watermark-bg-layer" aria-hidden="true">
      {/* SVG Repeating Watermark Tile Pattern */}
      <svg className="watermark-pattern-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="viva-watermark-grid"
            width="140"
            height="140"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-18 70 70)"
          >
            {/* Primary Mini Emblem */}
            <g transform="translate(18, 18) scale(0.32)" className="watermark-symbol">
              {/* Left Green Leaf */}
              <path
                d="M 60,16 C 36,16 16,36 16,62 C 16,84 36,100 58,104 C 44,92 36,76 38,58 C 40,40 48,26 60,16 Z"
                fill="currentColor"
                className="watermark-leaf"
              />
              {/* Right Purple Heart Arc */}
              <path
                d="M 60,16 C 72,26 80,40 82,58 C 84,76 76,92 62,104 C 84,100 104,84 104,62 C 104,36 84,16 60,16 Z"
                fill="currentColor"
                className="watermark-heart"
              />
              {/* Central Flame / Seed */}
              <path
                d="M 60,40 C 50,50 46,62 48,74 C 50,86 58,94 60,98 C 62,94 70,86 72,74 C 74,62 70,50 60,40 Z"
                fill="currentColor"
                className="watermark-seed"
              />
              {/* Top Golden Spark Node */}
              <circle cx="60" cy="28" r="4.5" fill="currentColor" className="watermark-spark" />
            </g>

            {/* Staggered Secondary Mini Emblem for Diamond Grid Texture */}
            <g transform="translate(88, 88) scale(0.32)" className="watermark-symbol">
              {/* Left Green Leaf */}
              <path
                d="M 60,16 C 36,16 16,36 16,62 C 16,84 36,100 58,104 C 44,92 36,76 38,58 C 40,40 48,26 60,16 Z"
                fill="currentColor"
                className="watermark-leaf"
              />
              {/* Right Purple Heart Arc */}
              <path
                d="M 60,16 C 72,26 80,40 82,58 C 84,76 76,92 62,104 C 84,100 104,84 104,62 C 104,36 84,16 60,16 Z"
                fill="currentColor"
                className="watermark-heart"
              />
              {/* Central Flame / Seed */}
              <path
                d="M 60,40 C 50,50 46,62 48,74 C 50,86 58,94 60,98 C 62,94 70,86 72,74 C 74,62 70,50 60,40 Z"
                fill="currentColor"
                className="watermark-seed"
              />
              {/* Top Golden Spark Node */}
              <circle cx="60" cy="28" r="4.5" fill="currentColor" className="watermark-spark" />
            </g>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#viva-watermark-grid)" />
      </svg>

      {/* Atmospheric Floating Watermark Emblems */}
      <div className="floating-watermark-item watermark-float-1">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 60,16 C 36,16 16,36 16,62 C 16,84 36,100 58,104 C 44,92 36,76 38,58 C 40,40 48,26 60,16 Z" fill="#10B981" />
          <path d="M 60,16 C 72,26 80,40 82,58 C 84,76 76,92 62,104 C 84,100 104,84 104,62 C 104,36 84,16 60,16 Z" fill="#8B5CF6" />
          <path d="M 60,40 C 50,50 46,62 48,74 C 50,86 58,94 60,98 C 62,94 70,86 72,74 C 74,62 70,50 60,40 Z" fill="#F97316" />
          <circle cx="60" cy="28" r="5" fill="#FBBF24" />
        </svg>
      </div>

      <div className="floating-watermark-item watermark-float-2">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 60,16 C 36,16 16,36 16,62 C 16,84 36,100 58,104 C 44,92 36,76 38,58 C 40,40 48,26 60,16 Z" fill="#10B981" />
          <path d="M 60,16 C 72,26 80,40 82,58 C 84,76 76,92 62,104 C 84,100 104,84 104,62 C 104,36 84,16 60,16 Z" fill="#8B5CF6" />
          <path d="M 60,40 C 50,50 46,62 48,74 C 50,86 58,94 60,98 C 62,94 70,86 72,74 C 74,62 70,50 60,40 Z" fill="#F97316" />
          <circle cx="60" cy="28" r="5" fill="#FBBF24" />
        </svg>
      </div>

      <div className="floating-watermark-item watermark-float-3">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 60,16 C 36,16 16,36 16,62 C 16,84 36,100 58,104 C 44,92 36,76 38,58 C 40,40 48,26 60,16 Z" fill="#10B981" />
          <path d="M 60,16 C 72,26 80,40 82,58 C 84,76 76,92 62,104 C 84,100 104,84 104,62 C 104,36 84,16 60,16 Z" fill="#8B5CF6" />
          <path d="M 60,40 C 50,50 46,62 48,74 C 50,86 58,94 60,98 C 62,94 70,86 72,74 C 74,62 70,50 60,40 Z" fill="#F97316" />
          <circle cx="60" cy="28" r="5" fill="#FBBF24" />
        </svg>
      </div>
    </div>
  );
}

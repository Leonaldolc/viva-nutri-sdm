import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle, variant = 'floating', className = '' }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle-btn theme-toggle-${variant} ${className}`}
      onClick={onToggle}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${isDark ? 'thumb-dark' : 'thumb-light'}`}>
          {isDark ? (
            <Moon size={15} className="theme-icon moon-icon" />
          ) : (
            <Sun size={15} className="theme-icon sun-icon" />
          )}
        </div>
      </div>
      <span className="theme-toggle-text">
        {isDark ? 'Modo Escuro' : 'Modo Claro'}
      </span>
    </button>
  );
}

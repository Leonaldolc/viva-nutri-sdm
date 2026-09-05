import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import { getCurrentSession, logoutUser } from './services/neonAuth';

const THEME_STORAGE_KEY = 'viva_nutri_theme';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'register' | 'dashboard'
  const [initializing, setInitializing] = useState(true);
  
  // Tema padrão 'dark' com suporte a persistência
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Atualiza atributo no HTML e salva no localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn('Erro ao salvar tema:', err);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Verifica se há sessão ativa ao inicializar o aplicativo
  useEffect(() => {
    const session = getCurrentSession();
    if (session?.user) {
      setCurrentUser(session.user);
      setView('dashboard');
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setView('login');
  };

  if (initializing) {
    return (
      <div className="auth-bg-wrapper">
        <div className="spinner" style={{ width: '36px', height: '36px', borderColor: 'rgba(124, 58, 237, 0.2)', borderTopColor: 'var(--primary-purple)' }}></div>
      </div>
    );
  }

  const [registerRole, setRegisterRole] = useState('nutricionista');

  return (
    <>
      {currentUser || view === 'dashboard' ? (
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : view === 'register' ? (
        <Register
          initialAccountType={registerRole}
          onSwitchToLogin={() => setView('login')}
          onRegisterSuccess={handleRegisterSuccess}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <Login
          onSwitchToRegister={(role = 'nutricionista') => {
            setRegisterRole(role);
            setView('register');
          }}
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Prompt de Instalação PWA Inteligente */}
      <InstallPwaPrompt />
    </>
  );
}


import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { getCurrentSession, logoutUser } from './services/neonAuth';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'register' | 'dashboard'
  const [initializing, setInitializing] = useState(true);

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

  // Se já está logado, força a exibição do dashboard (Regra 25)
  if (currentUser || view === 'dashboard') {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setView('login')}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <Login
      onSwitchToRegister={() => setView('register')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

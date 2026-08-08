import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { loginUser } from '../services/neonAuth';

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Preencha os campos de e-mail e senha.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      if (result?.success) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Falha ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-wrapper">
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="large" />
            <h1 className="auth-title">Acesse sua conta</h1>
            <p className="auth-subtitle">Gestão nutricional inteligente e simplificada</p>
          </div>

          {errorMessage && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">E-mail profissional</label>
              <div className="input-wrapper">
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="seu.email@nutri.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Senha</label>
              <div className="input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="input-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Não tem conta?</span>
            <button type="button" className="auth-link" onClick={onSwitchToRegister}>
              Cadastre-se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { registerUser } from '../services/neonAuth';

export default function Register({ onSwitchToLogin, onRegisterSuccess, theme, onToggleTheme }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve conter no mínimo 9 caracteres para sua segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Por favor, verifique.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({ name, email, password });
      if (result?.success) {
        onRegisterSuccess(result.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValidLength = password.length >= 9;
  const isPasswordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="auth-bg-wrapper">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="floating" />

      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-blob auth-blob-3"></div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="large" variant="vertical" />
            <h1 className="auth-title">Crie sua conta</h1>
            <p className="auth-subtitle">Comece a gerenciar seus pacientes com excelência</p>
          </div>

          {errorMessage && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Nome completo</label>
              <div className="input-wrapper">
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="Dra. Mariana Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
                <User className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">E-mail profissional</label>
              <div className="input-wrapper">
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="form-label">Senha (mínimo 9 caracteres)</label>
              <div className="input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
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
              {password.length > 0 && (
                <div className="input-hint" style={{ color: isPasswordValidLength ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} style={{ opacity: isPasswordValidLength ? 1 : 0.4 }} />
                  {isPasswordValidLength ? 'Mínimo de 9 caracteres atendido' : `${password.length}/9 caracteres mínimo`}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password" className="form-label">Confirmar senha</label>
              <div className="input-wrapper">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="•••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="input-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="input-hint" style={{ color: isPasswordsMatch ? 'var(--accent-green)' : 'var(--error-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isPasswordsMatch ? (
                    <>
                      <CheckCircle2 size={13} />
                      Senhas coincidem
                    </>
                  ) : (
                    'Senhas não coincidem'
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Já tem conta?</span>
            <button type="button" className="auth-link" onClick={onSwitchToLogin}>
              Faça login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

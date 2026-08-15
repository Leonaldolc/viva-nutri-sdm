import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { loginUser, requestPasswordReset } from '../services/neonAuth';

const STORAGE_KEY_REMEMBER = 'viva_nutri_remember_me';
const STORAGE_KEY_SAVED_EMAIL = 'viva_nutri_saved_email';

export default function Login({ onSwitchToRegister, onLoginSuccess, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Inicializa o e-mail lembrado se a opção estiver ativa
  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true';
      if (isRemembered) {
        setRememberMe(true);
        const savedEmail = localStorage.getItem(STORAGE_KEY_SAVED_EMAIL);
        if (savedEmail) {
          setEmail(savedEmail);
        }
      }
    } catch (err) {
      console.warn('Não foi possível ler as preferências salvas:', err);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Informe seu e-mail profissional.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Informe um endereço de e-mail válido.';
    }

    if (!password) {
      errors.password = 'Informe sua senha de acesso.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      if (result?.success) {
        // Gerencia preferência de "Lembrar de mim" (apenas o e-mail, sem armazenar senhas)
        try {
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
            localStorage.setItem(STORAGE_KEY_SAVED_EMAIL, email.trim().toLowerCase());
          } else {
            localStorage.removeItem(STORAGE_KEY_REMEMBER);
            localStorage.removeItem(STORAGE_KEY_SAVED_EMAIL);
          }
        } catch (storageErr) {
          console.warn('Erro ao salvar preferência local:', storageErr);
        }

        onLoginSuccess(result.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, preencha seu e-mail no campo acima para receber as instruções de recuperação.');
      setFieldErrors((prev) => ({ ...prev, email: 'Preencha o e-mail para recuperar a senha.' }));
      document.getElementById('login-email')?.focus();
      return;
    }

    setResetLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setSuccessMessage(res?.message || 'Instruções para redefinir sua senha foram enviadas ao seu e-mail.');
    } catch (err) {
      setErrorMessage(err.message || 'Não foi possível solicitar a recuperação. Verifique o e-mail informado.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-bg-wrapper">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="floating" />

      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-blob auth-blob-3"></div>

      <div className="auth-container">
        <div className="auth-card">
          <header className="auth-header">
            <Logo size="large" variant="vertical" />
            <h1 className="auth-title">Acesse sua conta</h1>
            <p className="auth-subtitle">Gestão nutricional inteligente e simplificada</p>
          </header>

          {errorMessage && (
            <div className="alert alert-error" role="alert" aria-live="polite" style={{ marginBottom: '18px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" role="status" aria-live="polite" style={{ marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Campo E-mail */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                E-mail profissional
              </label>
              <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="seu.email@nutri.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  disabled={loading || resetLoading}
                  required
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                />
                <Mail className="input-icon" size={18} aria-hidden="true" />
              </div>
              {fieldErrors.email && (
                <span id="login-email-error" className="field-error-msg">
                  <AlertCircle size={14} aria-hidden="true" />
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Campo Senha */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Senha
              </label>
              <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  disabled={loading || resetLoading}
                  required
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                />
                <Lock className="input-icon" size={18} aria-hidden="true" />
                <button
                  type="button"
                  className="input-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="login-password-error" className="field-error-msg">
                  <AlertCircle size={14} aria-hidden="true" />
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Linha de Opções: Lembrar de mim & Esqueci minha senha */}
            <div className="auth-options-row">
              <label htmlFor="login-remember-me" className="auth-checkbox-label">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading || resetLoading}
                />
                <span>Lembrar de mim</span>
              </label>

              <button
                type="button"
                className="btn-forgot-password"
                onClick={handleForgotPassword}
                disabled={loading || resetLoading}
                title="Recuperar senha de acesso"
              >
                {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
              </button>
            </div>

            {/* Botão de Envio / Entrar */}
            <button 
              id="btn-login-submit"
              type="submit" 
              className="btn-primary" 
              disabled={loading || resetLoading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" aria-hidden="true"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Rodapé com link para cadastro */}
          <footer className="auth-footer">
            <span>Não tem conta?</span>
            <button 
              id="btn-switch-register"
              type="button" 
              className="auth-link" 
              onClick={onSwitchToRegister}
            >
              Cadastre-se
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

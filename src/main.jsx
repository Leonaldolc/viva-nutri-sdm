import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Registra o Service Worker do PWA com atualização automática imediata
registerSW({ immediate: true })

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro global capturado:', error, errorInfo);
  }

  handleRecover = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#090D16',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            padding: '32px',
            borderRadius: '20px',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', color: '#F87171' }}>Ops! Ocorreu uma instabilidade</h2>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '14px' }}>
              Clique no botão abaixo para restaurar o sistema VIVA NUTRI.
            </p>

            {this.state.error && (
              <div style={{
                textAlign: 'left',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#FCA5A5',
                fontFamily: 'monospace',
                marginBottom: '20px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleRecover}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
              }}
            >
              Recarregar Sistema
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)

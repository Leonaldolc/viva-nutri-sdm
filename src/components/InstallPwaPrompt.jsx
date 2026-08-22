import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se já foi dispensado nesta sessão
    if (sessionStorage.getItem('viva_pwa_dismissed')) {
      setDismissed(true);
    }

    // Verificar se é iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
    }

    // Capturar evento padrão do navegador Chromium (Android / Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Evento disparado quando o app é instalado com sucesso
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('VIVA NUTRI PWA instalado com sucesso!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('viva_pwa_dismissed', 'true');
  };

  if (dismissed || (!isInstallable && !isIos)) {
    return null;
  }

  return (
    <>
      <div className="pwa-install-banner" role="complementary" aria-label="Instalar Aplicativo">
        <div className="pwa-banner-icon">
          <Smartphone size={20} />
        </div>
        <div className="pwa-banner-text">
          <strong>Instalar VIVA NUTRI</strong>
          <span>Acesse direto da sua tela inicial em tela cheia e offline.</span>
        </div>
        <div className="pwa-banner-actions">
          <button 
            type="button" 
            className="btn-pwa-install"
            onClick={handleInstallClick}
          >
            <Download size={14} />
            <span>Instalar</span>
          </button>
          <button 
            type="button" 
            className="btn-pwa-dismiss"
            onClick={handleDismiss}
            aria-label="Dispensar aviso"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Modal Guia de Instalação para iPhone / iOS Safari */}
      {showIosGuide && (
        <div className="modal-backdrop" onClick={() => setShowIosGuide(false)}>
          <div className="modal-card ios-pwa-guide-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <div className="modal-header-icon modal-icon-purple">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="modal-title">Instalar no iPhone / iPad</h3>
                <p className="modal-subtitle">Adicione o VIVA NUTRI à sua tela de início em 2 passos rápidos:</p>
              </div>
              <button className="btn-modal-close" onClick={() => setShowIosGuide(false)}>
                <X size={20} />
              </button>
            </header>

            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="ios-steps-list">
                <div className="ios-step-item">
                  <div className="ios-step-num">1</div>
                  <div className="ios-step-content">
                    <p>Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari:</p>
                    <div className="ios-icon-example">
                      <Share size={20} color="#7C3AED" />
                      <span>Ícone de Compartilhar</span>
                    </div>
                  </div>
                </div>

                <div className="ios-step-item">
                  <div className="ios-step-num">2</div>
                  <div className="ios-step-content">
                    <p>Role para baixo e selecione:</p>
                    <div className="ios-icon-example">
                      <PlusSquare size={20} color="#7C3AED" />
                      <strong>"Adicionar à Tela de Início"</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => setShowIosGuide(false)}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

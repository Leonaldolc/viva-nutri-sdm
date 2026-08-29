import React, { useState } from 'react';
import { 
  X, 
  PartyPopper, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  MessageCircle, 
  Sparkles, 
  Heart, 
  Gift, 
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function BirthdayModal({ 
  paciente, 
  idadeNova, 
  onClose,
  nutriNome = 'Dra. Nutricionista'
}) {
  const [copiado, setCopiado] = useState(false);
  const [canal, setCanal] = useState('email'); // 'email' | 'whatsapp'
  
  const [assuntoEmail, setAssuntoEmail] = useState(
    `🎉 Parabéns pelo seu Aniversário, ${paciente?.nome?.split(' ')[0]}! Um abraço especial da sua Nutri 🎈`
  );

  const [mensagem, setMensagem] = useState(
`Olá, ${paciente?.nome?.split(' ')[0]}! 🎂✨

Hoje é o seu dia especial e não poderia deixar de passar para te desejar um Feliz Aniversário! 🎉🎈

Que este novo ciclo traga muita saúde, vitalidade, equilíbrio, realizações e momentos felizes. É uma alegria imensa fazer parte da sua jornada de cuidado e bem-estar!

Aproveite muito o seu dia ao lado de quem você ama! 💖

Com muito carinho,
${nutriNome} 🥗✨`
  );

  if (!paciente) return null;

  const pacientePrimeiroNome = paciente.nome?.split(' ')[0] || 'Paciente';

  // Gerar link mailto:
  const mailtoLink = `mailto:${paciente.email || ''}?subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(mensagem)}`;

  // Gerar link WhatsApp
  const cleanPhone = (paciente.whatsapp || paciente.telefone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const whatsappLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(mensagem)}`;

  const handleCopiarMensagem = () => {
    navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card birthday-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        
        {/* Header Festivo */}
        <div className="birthday-modal-header">
          <div className="bday-celebration-badge">
            <PartyPopper size={20} className="icon-pop" />
            <span>Parabenizar Paciente</span>
          </div>
          
          <button className="btn-modal-close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="birthday-modal-body">
          {/* Card Destaque do Aniversariante */}
          <div className="bday-hero-box">
            <div className="bday-avatar-ring">
              <span className="bday-avatar-letter">
                {paciente.nome?.charAt(0).toUpperCase()}
              </span>
              <span className="bday-cake-icon">🎂</span>
            </div>

            <div className="bday-hero-info">
              <h3 className="bday-hero-name">{paciente.nome}</h3>
              <p className="bday-hero-sub">
                Completando {idadeNova ? `${idadeNova} anos` : 'mais um ano de vida'} • {paciente.email || 'Sem e-mail'}
              </p>
            </div>
          </div>

          {/* Seleção do Canal (E-mail ou WhatsApp) */}
          <div className="channel-tabs-selector">
            <button 
              type="button" 
              className={`channel-tab-btn ${canal === 'email' ? 'channel-active-email' : ''}`}
              onClick={() => setCanal('email')}
            >
              <Mail size={16} />
              <span>Enviar por E-mail</span>
            </button>
            <button 
              type="button" 
              className={`channel-tab-btn ${canal === 'whatsapp' ? 'channel-active-wa' : ''}`}
              onClick={() => setCanal('whatsapp')}
            >
              <MessageCircle size={16} />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>

          {canal === 'email' && (
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Assunto do E-mail</label>
              <input 
                type="text" 
                className="form-input" 
                value={assuntoEmail}
                onChange={(e) => setAssuntoEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group" style={{ marginTop: '12px' }}>
            <div className="label-with-action">
              <label className="form-label">Mensagem Personalizada</label>
              <button 
                type="button" 
                className="btn-text-copy"
                onClick={handleCopiarMensagem}
              >
                {copiado ? <Check size={14} className="icon-green" /> : <Copy size={14} />}
                <span>{copiado ? 'Mensagem copiada!' : 'Copiar texto'}</span>
              </button>
            </div>

            <textarea 
              className="form-input bday-message-area"
              rows={8}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>

          <div className="bday-tips-notice">
            <Sparkles size={16} className="icon-purple" />
            <span>
              Ao clicar no botão abaixo, seu aplicativo de <strong>{canal === 'email' ? 'e-mail' : 'WhatsApp'}</strong> será aberto automaticamente com o destinatário, assunto e texto prontos para envio.
            </span>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="modal-footer bday-modal-footer">
          <button type="button" className="btn-cancel-flat" onClick={onClose}>
            Fechar
          </button>

          {canal === 'email' ? (
            <a 
              href={mailtoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-send-bday btn-send-email"
              onClick={onClose}
            >
              <Mail size={16} />
              <span>Abrir no E-mail (Disparar)</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-send-bday btn-send-whatsapp"
              onClick={onClose}
            >
              <MessageCircle size={16} />
              <span>Abrir no WhatsApp</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

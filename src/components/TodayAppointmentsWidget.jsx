import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  LineChart, 
  MessageCircle, 
  ChevronRight, 
  Sparkles, 
  CalendarPlus, 
  Check, 
  AlertCircle,
  ExternalLink,
  Activity,
  CalendarDays,
  Video,
  MapPin,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { atualizarStatusConsulta, alternarConfirmacaoConsulta } from '../services/dashboardService';

export default function TodayAppointmentsWidget({ 
  consultasHoje = [], 
  onSelectPatient,
  onQuickSchedule,
  nutricionistaId,
  onStatusUpdated
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleMarcarRealizada = async (consulta, e) => {
    e.stopPropagation();
    setUpdatingId(consulta.id);
    try {
      const novoStatus = consulta.status === 'realizada' ? 'confirmada' : 'realizada';
      await atualizarStatusConsulta(consulta.id, novoStatus, nutricionistaId);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleConfirmacao = async (consulta, e) => {
    e.stopPropagation();
    setUpdatingId(consulta.id);
    try {
      await alternarConfirmacaoConsulta(consulta.id, nutricionistaId);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatHora = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatHojeData = () => {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  // Encontrar próxima consulta não concluída
  const now = new Date();
  const proxima = consultasHoje.find(c => new Date(c.data_consulta) >= now && c.status !== 'realizada') || consultasHoje[0];

  const totalHoje = consultasHoje.length;
  const concluidasHoje = consultasHoje.filter(c => c.status === 'realizada').length;
  const confirmadasHoje = consultasHoje.filter(c => c.confirmacao === 'confirmado').length;

  return (
    <div className="today-agenda-card-container">
      {/* Header do Widget */}
      <div className="today-agenda-header">
        <div className="today-title-group">
          <div className="today-badge-icon">
            <CalendarDays size={20} className="icon-purple" />
          </div>
          <div>
            <div className="today-title-row">
              <h3 className="today-widget-title">Consultas de Hoje</h3>
              <span className="today-date-tag">{formatHojeData()}</span>
            </div>
            <p className="today-widget-subtitle">
              {totalHoje > 0 
                ? `${totalHoje} consulta(s) • ${confirmadasHoje} confirmada(s) • ${concluidasHoje} realizada(s)`
                : 'Nenhuma consulta programada para o dia de hoje.'}
            </p>
          </div>
        </div>

        {totalHoje > 0 && (
          <div className="today-progress-pill">
            <span className="progress-number">{concluidasHoje}/{totalHoje}</span>
            <span className="progress-label">Concluídas</span>
          </div>
        )}
      </div>

      {/* Destaque da Próxima Consulta */}
      {proxima && proxima.status !== 'realizada' && (
        <div className="next-appointment-banner">
          <div className="next-banner-left">
            <div className="next-time-box">
              <Clock size={16} />
              <span className="next-time-val">{formatHora(proxima.data_consulta)}</span>
            </div>
            <div className="next-info-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="next-label-tag">PRÓXIMA CONSULTA</span>
                <span className={`badge-modalidade-pill ${proxima.modalidade === 'online' ? 'pill-online' : 'pill-presencial'}`}>
                  {proxima.modalidade === 'online' ? <><Video size={11} /> Online (Teleconsulta)</> : <><MapPin size={11} /> Presencial (Consultório)</>}
                </span>
                <span className={`badge-conf-pill ${proxima.confirmacao === 'confirmado' ? 'pill-conf-ok' : 'pill-conf-pending'}`}>
                  {proxima.confirmacao === 'confirmado' ? '✓ Presença Confirmada' : '⏱️ Aguardando Confirmação'}
                </span>
              </div>
              <h4 className="next-patient-name">{proxima.paciente_nome}</h4>
              <span className="next-type-text">{proxima.tipo || 'Consulta de Retorno'}</span>
            </div>
          </div>

          <div className="next-banner-actions">
            {proxima.modalidade === 'online' && proxima.linkTeleconsulta && (
              <a 
                href={proxima.linkTeleconsulta}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-today-video"
                title="Abrir sala de teleconsulta"
              >
                <Video size={14} />
                <span>Entrar na Sala</span>
              </a>
            )}

            {proxima.paciente_telefone && (
              <a 
                href={`https://wa.me/55${proxima.paciente_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${proxima.paciente_nome.split(' ')[0]}! Tudo bem? Passando para confirmar sua consulta nutricional hoje às ${formatHora(proxima.data_consulta)} (${proxima.modalidade === 'online' ? 'Online por Vídeo' : 'Presencial no Consultório'}) no VIVA NUTRI. Poderia confirmar respondendo 'CONFIRMO'? 🥗✨`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-today-wa"
                title="Enviar confirmação de consulta no WhatsApp"
              >
                <MessageCircle size={14} />
                <span>Pedir Confirmação</span>
              </a>
            )}

            <button 
              type="button" 
              className="btn-today-chart"
              onClick={() => onSelectPatient && onSelectPatient({ id: proxima.paciente_id, nome: proxima.paciente_nome })}
            >
              <LineChart size={14} />
              <span>Prontuário</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista / Timeline do Dia */}
      {consultasHoje.length > 0 ? (
        <div className="today-timeline-grid">
          {consultasHoje.map((c) => {
            const isRealizada = c.status === 'realizada';
            const isConfirmado = c.confirmacao === 'confirmado';
            const isOnline = c.modalidade === 'online';
            const hora = formatHora(c.data_consulta);
            const initial = c.paciente_nome ? c.paciente_nome.charAt(0).toUpperCase() : '?';

            return (
              <div 
                key={c.id} 
                className={`today-slot-item ${isRealizada ? 'slot-completed' : ''}`}
                onClick={() => onSelectPatient && onSelectPatient({ id: c.paciente_id, nome: c.paciente_nome })}
                role="button"
                tabIndex={0}
              >
                {/* Horário */}
                <div className="slot-time-col">
                  <span className="slot-time-digit">{hora}</span>
                  <span className={`slot-dot-status status-${c.status || 'agendada'}`} />
                </div>

                {/* Info do Paciente */}
                <div className="slot-patient-col">
                  <div className="slot-avatar">{initial}</div>
                  <div className="slot-patient-text">
                    <h5 className="slot-patient-title">{c.paciente_nome}</h5>
                    <div className="slot-meta-row">
                      <span className="slot-type-sub">{c.tipo || 'Consulta de Retorno'}</span>
                      <span className="slot-meta-divider">•</span>
                      <span className={`slot-modalidade-tag ${isOnline ? 'tag-online' : 'tag-presencial'}`}>
                        {isOnline ? <><Video size={11} /> Online</> : <><MapPin size={11} /> Presencial</>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status de Confirmação do Paciente */}
                <div className="slot-status-col" onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button"
                    className={`btn-toggle-conf ${isConfirmado ? 'conf-ok' : 'conf-pending'}`}
                    onClick={(e) => handleToggleConfirmacao(c, e)}
                    disabled={updatingId === c.id}
                    title={isConfirmado ? 'Paciente confirmou presença. Clique para alterar para pendente.' : 'Aguardando confirmação do paciente. Clique para marcar como confirmado.'}
                  >
                    {isConfirmado ? (
                      <><UserCheck size={13} /> Confirmado</>
                    ) : (
                      <><HelpCircle size={13} /> Pendente</>
                    )}
                  </button>
                </div>

                {/* Ações Rápidas */}
                <div className="slot-actions-col" onClick={(e) => e.stopPropagation()}>
                  {isOnline && c.linkTeleconsulta && (
                    <a 
                      href={c.linkTeleconsulta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-slot-icon-action btn-slot-meet"
                      title="Abrir sala de Teleconsulta"
                    >
                      <Video size={14} />
                    </a>
                  )}

                  {c.paciente_telefone && (
                    <a 
                      href={`https://wa.me/55${c.paciente_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${c.paciente_nome.split(' ')[0]}! Confirmando sua consulta nutricional hoje às ${hora} (${isOnline ? 'Online por Vídeo' : 'Presencial no Consultório'}) 🥗`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-slot-icon-action btn-slot-wa"
                      title="Enviar confirmação no WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  )}

                  <button 
                    type="button" 
                    className="btn-slot-icon-action btn-slot-chart"
                    onClick={() => onSelectPatient && onSelectPatient({ id: c.paciente_id, nome: c.paciente_nome })}
                    title="Ver prontuário do paciente"
                  >
                    <LineChart size={14} />
                  </button>

                  <button 
                    type="button" 
                    className={`btn-slot-check ${isRealizada ? 'btn-checked' : ''}`}
                    onClick={(e) => handleMarcarRealizada(c, e)}
                    disabled={updatingId === c.id}
                    title={isRealizada ? 'Marcar como não realizada' : 'Marcar consulta como realizada'}
                  >
                    <Check size={14} />
                    <span>{isRealizada ? 'Concluída' : 'Concluir'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-today-agenda">
          <Calendar size={36} className="empty-cal-icon" />
          <h4>Agenda Livre Hoje</h4>
          <p>Você não possui atendimentos marcados para hoje. Aproveite para planejar cardápios ou resgatar pacientes pendentes.</p>
        </div>
      )}
    </div>
  );
}


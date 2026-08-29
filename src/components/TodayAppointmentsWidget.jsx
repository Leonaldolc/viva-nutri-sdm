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
  CalendarDays
} from 'lucide-react';
import { atualizarStatusConsulta } from '../services/dashboardService';

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

  const handleMudarStatus = async (consulta, status, e) => {
    e.stopPropagation();
    setUpdatingId(consulta.id);
    try {
      await atualizarStatusConsulta(consulta.id, status, nutricionistaId);
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
                ? `${totalHoje} consulta(s) programada(s) para hoje • ${concluidasHoje} realizada(s)`
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
              <span className="next-label-tag">PRÓXIMA CONSULTA</span>
              <h4 className="next-patient-name">{proxima.paciente_nome}</h4>
              <span className="next-type-text">{proxima.tipo || 'Consulta de Retorno'}</span>
            </div>
          </div>

          <div className="next-banner-actions">
            {proxima.paciente_telefone && (
              <a 
                href={`https://wa.me/55${proxima.paciente_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${proxima.paciente_nome.split(' ')[0]}! Tudo bem? Passando para confirmar nossa consulta nutricional hoje às ${formatHora(proxima.data_consulta)} no VIVA NUTRI 🥗✨`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-today-wa"
                title="Enviar lembrete de consulta no WhatsApp"
              >
                <MessageCircle size={14} />
                <span>Lembrar no WhatsApp</span>
              </a>
            )}

            <button 
              type="button" 
              className="btn-today-chart"
              onClick={() => onSelectPatient && onSelectPatient({ id: proxima.paciente_id, nome: proxima.paciente_nome })}
            >
              <LineChart size={14} />
              <span>Abrir Prontuário</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista / Timeline do Dia */}
      {consultasHoje.length > 0 ? (
        <div className="today-timeline-grid">
          {consultasHoje.map((c) => {
            const isRealizada = c.status === 'realizada';
            const isEmAtendimento = c.status === 'em_atendimento';
            const hora = formatHora(c.data_consulta);
            const initial = c.paciente_nome ? c.paciente_nome.charAt(0).toUpperCase() : '?';

            return (
              <div 
                key={c.id} 
                className={`today-slot-item ${isRealizada ? 'slot-completed' : ''} ${isEmAtendimento ? 'slot-in-progress' : ''}`}
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
                    <span className="slot-type-sub">{c.tipo || 'Consulta de Retorno'}</span>
                  </div>
                </div>

                {/* Status da Consulta */}
                <div className="slot-status-col">
                  <span className={`badge-consulta-status status-badge-${c.status || 'agendada'}`}>
                    {isRealizada ? '✓ Realizada' : isEmAtendimento ? '⏱️ Em Atendimento' : c.status === 'confirmada' ? '🟢 Confirmada' : '🟡 Agendada'}
                  </span>
                </div>

                {/* Ações Rápidas */}
                <div className="slot-actions-col" onClick={(e) => e.stopPropagation()}>
                  {c.paciente_telefone && (
                    <a 
                      href={`https://wa.me/55${c.paciente_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${c.paciente_nome.split(' ')[0]}! Confirmando sua consulta nutricional hoje às ${hora} 🥗`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-slot-icon-action btn-slot-wa"
                      title="Enviar WhatsApp"
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

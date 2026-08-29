import React from 'react';
import { 
  PartyPopper, 
  Cake, 
  Gift, 
  Mail, 
  MessageCircle, 
  ChevronRight, 
  Sparkles,
  Calendar,
  Heart
} from 'lucide-react';

export default function BirthdayAlertsCard({ 
  aniversariantesData, 
  onParabenizar 
}) {
  if (!aniversariantesData || aniversariantesData.totalAniversariantes === 0) {
    return null;
  }

  const { aniversariantesHoje, aniversariantesSemana, aniversariantesMes, todos } = aniversariantesData;
  const temHoje = aniversariantesHoje.length > 0;

  return (
    <div className={`birthday-widget-container ${temHoje ? 'widget-has-today' : ''}`}>
      <div className="bday-widget-header">
        <div className="bday-title-group">
          <div className="bday-glow-icon">
            {temHoje ? <PartyPopper size={20} className="icon-gold animate-bounce" /> : <Cake size={20} className="icon-purple" />}
          </div>
          <div>
            <h3 className="bday-widget-title">
              {temHoje ? '🎉 Aniversariante(s) de Hoje!' : '🎂 Próximos Aniversários de Pacientes'}
            </h3>
            <p className="bday-widget-subtitle">
              {temHoje 
                ? `${aniversariantesHoje.length} paciente(s) fazendo aniversário hoje. Envie seus parabéns com 1 clique!`
                : `${todos.length} paciente(s) comemoram aniversário nos próximos dias.`}
            </p>
          </div>
        </div>

        <span className="bday-count-badge">
          {todos.length} aniversariante(s)
        </span>
      </div>

      <div className="bday-cards-list">
        {todos.slice(0, 4).map((item) => {
          const { paciente, diffDays, isToday, isThisWeek, idadeNova, birthDay, birthMonth } = item;
          const formattedDate = `${String(birthDay).padStart(2, '0')}/${String(birthMonth).padStart(2, '0')}`;

          return (
            <div 
              key={paciente.id} 
              className={`bday-patient-pill-card ${isToday ? 'pill-card-today' : ''}`}
            >
              <div className="bday-pill-left">
                <div className="bday-mini-avatar">
                  {paciente.nome?.charAt(0).toUpperCase()}
                  {isToday && <span className="avatar-cake-badge">🎂</span>}
                </div>

                <div className="bday-pill-info">
                  <div className="bday-name-row">
                    <h4 className="bday-patient-name">{paciente.nome}</h4>
                    {isToday ? (
                      <span className="bday-tag-today">🎈 HOJE!</span>
                    ) : isThisWeek ? (
                      <span className="bday-tag-soon">Em {diffDays} dias ({formattedDate})</span>
                    ) : (
                      <span className="bday-tag-month">{formattedDate}</span>
                    )}
                  </div>
                  <span className="bday-age-text">
                    Completando <strong>{idadeNova} anos</strong> • {paciente.objetivo || 'Saúde geral'}
                  </span>
                </div>
              </div>

              <div className="bday-pill-actions">
                <button 
                  type="button" 
                  className={`btn-congratulate-quick ${isToday ? 'btn-congratulate-highlight' : ''}`}
                  onClick={() => onParabenizar(paciente, idadeNova)}
                  title={`Enviar mensagem de parabéns para ${paciente.nome}`}
                >
                  <Mail size={14} />
                  <span>{isToday ? 'Parabenizar Agora 🎉' : 'Parabenizar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

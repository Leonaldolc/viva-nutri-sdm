import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  CalendarDays, 
  CalendarRange, 
  Filter, 
  MessageCircle, 
  LineChart, 
  Trash2, 
  Check, 
  AlertTriangle,
  Sparkles,
  CalendarPlus,
  TrendingUp,
  Activity,
  Layers,
  X,
  Video,
  MapPin,
  UserCheck,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import TodayAppointmentsWidget from './TodayAppointmentsWidget';
import { 
  getTodasConsultas, 
  atualizarStatusConsulta, 
  alternarConfirmacaoConsulta,
  desmarcarConsulta, 
  agendarConsulta 
} from '../services/dashboardService';

export default function ClinicalCalendarView({ 
  pacientes = [], 
  onSelectPatient, 
  nutricionistaId,
  onRefreshParent
}) {
  const [viewMode, setViewMode] = useState('semana'); // 'hoje' | 'semana' | 'mes'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'confirmado' | 'pendente' | 'presencial' | 'online' | 'realizada'
  
  // Modal de Agendamento Rápido
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDayForSchedule, setSelectedDayForSchedule] = useState('');
  const [modalPatientId, setModalPatientId] = useState('');
  const [modalHora, setModalHora] = useState('10:00');
  const [modalData, setModalData] = useState(new Date().toISOString().split('T')[0]);
  const [modalTipo, setModalTipo] = useState('Consulta de Retorno');
  const [modalModalidade, setModalModalidade] = useState('presencial'); // 'presencial' | 'online'
  const [modalLinkTeleconsulta, setModalLinkTeleconsulta] = useState('');
  const [modalConfirmacao, setModalConfirmacao] = useState('confirmado'); // 'confirmado' | 'pendente'
  const [submitting, setSubmitting] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null); // Dia clicado na visão de mês
  const [scheduleError, setScheduleError] = useState(null);

  // Verificação em TEMPO REAL de Conflito de Horário
  const conflictAppointment = useMemo(() => {
    if (!showScheduleModal || !modalData || !modalHora) return null;
    try {
      const [h, m] = modalHora.split(':');
      const selectedDate = new Date(modalData);
      selectedDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      const selectedTime = selectedDate.getTime();
      const DURATION_MS = 40 * 60 * 1000; // janela de 40 minutos

      return consultas.find(c => {
        if (c.status === 'cancelada') return false;
        const cTime = new Date(c.data_consulta).getTime();
        return Math.abs(selectedTime - cTime) < DURATION_MS;
      }) || null;
    } catch {
      return null;
    }
  }, [showScheduleModal, modalData, modalHora, consultas]);

  const loadConsultas = async () => {
    try {
      const data = await getTodasConsultas(nutricionistaId);
      setConsultas(data);
    } catch (err) {
      console.error('Erro ao carregar consultas da agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultas();
  }, [nutricionistaId]);

  // Navegação de datas
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtragem de Consultas
  const filteredConsultas = useMemo(() => {
    if (statusFilter === 'todos') return consultas;
    if (statusFilter === 'confirmado') return consultas.filter(c => c.confirmacao === 'confirmado');
    if (statusFilter === 'pendente') return consultas.filter(c => c.confirmacao === 'pendente');
    if (statusFilter === 'presencial') return consultas.filter(c => c.modalidade === 'presencial');
    if (statusFilter === 'online') return consultas.filter(c => c.modalidade === 'online');
    if (statusFilter === 'realizada') return consultas.filter(c => c.status === 'realizada');
    return consultas;
  }, [consultas, statusFilter]);

  // Consultas de Hoje
  const consultasHoje = useMemo(() => {
    const now = new Date();
    return consultas.filter(c => {
      const d = new Date(c.data_consulta);
      return d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate() &&
             c.status !== 'cancelada';
    }).sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));
  }, [consultas]);



  // ----------------------------------------------------
  // CÁLCULO DA VISÃO SEMANAL (Segunda a Domingo)
  // ----------------------------------------------------
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const dayIsoDate = dayDate.toISOString().split('T')[0];
      const dayAppointments = filteredConsultas.filter(c => {
        const cDate = new Date(c.data_consulta).toISOString().split('T')[0];
        return cDate === dayIsoDate;
      }).sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));

      const isToday = dayDate.toDateString() === new Date().toDateString();

      days.push({
        date: dayDate,
        isoDate: dayIsoDate,
        dayName: dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNumber: dayDate.getDate(),
        monthName: dayDate.toLocaleDateString('pt-BR', { month: 'short' }),
        isToday,
        appointments: dayAppointments
      });
    }
    return days;
  }, [currentDate, filteredConsultas]);

  // ----------------------------------------------------
  // CÁLCULO DA VISÃO MENSAL (Grade de 35 a 42 dias)
  // ----------------------------------------------------
  const monthCalendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajustar para começar na segunda-feira
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const grid = [];

    // Dias do mês anterior para preencher a primeira semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const iso = prevDate.toISOString().split('T')[0];
      grid.push({
        date: prevDate,
        isoDate: iso,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: prevDate.toDateString() === new Date().toDateString(),
        appointments: filteredConsultas.filter(c => new Date(c.data_consulta).toISOString().split('T')[0] === iso)
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currDate = new Date(year, month, day);
      const iso = currDate.toISOString().split('T')[0];
      grid.push({
        date: currDate,
        isoDate: iso,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: currDate.toDateString() === new Date().toDateString(),
        appointments: filteredConsultas.filter(c => new Date(c.data_consulta).toISOString().split('T')[0] === iso)
      });
    }

    // Preencher final do mês até completar semanas (múltiplo de 7)
    const remainingDays = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const iso = nextDate.toISOString().split('T')[0];
      grid.push({
        date: nextDate,
        isoDate: iso,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: nextDate.toDateString() === new Date().toDateString(),
        appointments: filteredConsultas.filter(c => new Date(c.data_consulta).toISOString().split('T')[0] === iso)
      });
    }

    return grid;
  }, [currentDate, filteredConsultas]);

  // Formatação de Horários
  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  // Salvar Novo Agendamento
  const handleAgendarSubmit = async (e) => {

    e.preventDefault();
    if (!modalPatientId || !modalData || !modalHora) return;

    if (conflictAppointment) {
      setScheduleError(`Conflito de Horário: Já existe uma consulta para ${conflictAppointment.paciente_nome} às ${formatTime(conflictAppointment.data_consulta)}.`);
      return;
    }

    setSubmitting(true);
    setScheduleError(null);
    try {
      const paciente = pacientes.find(p => p.id === modalPatientId);
      const [h, m] = modalHora.split(':');
      const dataFull = new Date(modalData);
      dataFull.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

      await agendarConsulta({
        pacienteId: modalPatientId,
        pacienteNome: paciente?.nome || 'Paciente',
        dataConsulta: dataFull.toISOString(),
        tipo: modalTipo,
        modalidade: modalModalidade,
        linkTeleconsulta: modalLinkTeleconsulta,
        confirmacao: modalConfirmacao
      }, nutricionistaId);

      setShowScheduleModal(false);
      setScheduleError(null);
      await loadConsultas();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error(err);
      setScheduleError(err.message || 'Erro ao agendar consulta. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenScheduleForDate = (isoDate) => {
    setModalData(isoDate || new Date().toISOString().split('T')[0]);
    setScheduleError(null);
    setModalModalidade('presencial');
    setModalLinkTeleconsulta('');
    setModalConfirmacao('confirmado');
    if (pacientes.length > 0 && !modalPatientId) {
      setModalPatientId(pacientes[0].id);
    }
    setShowScheduleModal(true);
  };

  const handleToggleConfirmacao = async (consultaId, e) => {
    e.stopPropagation();
    try {
      await alternarConfirmacaoConsulta(consultaId, nutricionistaId);
      loadConsultas();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleConcluida = async (consultaId, currentStatus, e) => {
    e.stopPropagation();
    try {
      const nextStatus = currentStatus === 'realizada' ? 'confirmada' : 'realizada';
      await atualizarStatusConsulta(consultaId, nextStatus, nutricionistaId);
      loadConsultas();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExcluirConsulta = async (consultaId, e) => {
    e.stopPropagation();
    if (!window.confirm('Deseja desmarcar esta consulta da agenda?')) return;
    try {
      await desmarcarConsulta(consultaId, nutricionistaId);
      loadConsultas();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error(err);
    }
  };

  // Título do cabeçalho da visualização
  const getHeaderPeriodTitle = () => {
    if (viewMode === 'hoje') {
      return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (viewMode === 'semana') {
      const start = weekDays[0]?.date;
      const end = weekDays[6]?.date;
      if (!start || !end) return '';
      return `${start.getDate()} de ${start.toLocaleDateString('pt-BR', { month: 'short' })} - ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Contagens para o mês atual
  const consultasNoMes = useMemo(() => {
    const m = currentDate.getMonth();
    const y = currentDate.getFullYear();
    return consultas.filter(c => {
      const d = new Date(c.data_consulta);
      return d.getMonth() === m && d.getFullYear() === y && c.status !== 'cancelada';
    });
  }, [consultas, currentDate]);

  const concluidasMes = consultasNoMes.filter(c => c.status === 'realizada').length;

  return (
    <div className="clinical-calendar-container animated-fade-in">
      
      {/* Topo da Agenda com Estatísticas e Controles */}
      <div className="calendar-top-bar">
        <div className="calendar-title-wrap">
          <div className="badge-calendar-pill">
            <CalendarIcon size={16} />
            <span>Agenda Clínica Profissional</span>
          </div>
          <h1 className="calendar-main-title">Planejamento de Atendimentos</h1>
          <p className="calendar-subtitle">
            Gerencie seus horários por dia, semana e mês com confirmação de presença e modalidade presencial/online.
          </p>
        </div>

        <div className="calendar-actions-right">
          <button 
            type="button" 
            className="btn-new-appointment-action"
            onClick={() => handleOpenScheduleForDate(new Date().toISOString().split('T')[0])}
          >
            <CalendarPlus size={18} />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Faixa de Métricas Rápidas da Agenda */}
      <div className="calendar-stats-ribbon">
        <div className="cal-stat-card">
          <div className="cal-stat-icon icon-purple"><CalendarDays size={18} /></div>
          <div>
            <span className="cal-stat-val">{consultasHoje.length}</span>
            <span className="cal-stat-lbl">Consultas Hoje</span>
          </div>
        </div>

        <div className="cal-stat-card">
          <div className="cal-stat-icon icon-orange"><CalendarRange size={18} /></div>
          <div>
            <span className="cal-stat-val">{weekDays.reduce((acc, d) => acc + d.appointments.length, 0)}</span>
            <span className="cal-stat-lbl">Nesta Semana</span>
          </div>
        </div>

        <div className="cal-stat-card">
          <div className="cal-stat-icon icon-green"><CheckCircle2 size={18} /></div>
          <div>
            <span className="cal-stat-val">{concluidasMes}/{consultasNoMes.length}</span>
            <span className="cal-stat-lbl">Atendimentos no Mês</span>
          </div>
        </div>

        <div className="cal-stat-card">
          <div className="cal-stat-icon icon-blue"><TrendingUp size={18} /></div>
          <div>
            <span className="cal-stat-val">
              {consultasNoMes.length > 0 ? `${Math.round((concluidasMes / consultasNoMes.length) * 100)}%` : '100%'}
            </span>
            <span className="cal-stat-lbl">Taxa de Conclusão</span>
          </div>
        </div>
      </div>

      {/* Barra de Navegação e Seletor de Modo (Hoje, Semana, Mês) */}
      <div className="calendar-controls-toolbar">
        <div className="navigation-date-group">
          <button type="button" className="btn-nav-arrow" onClick={handlePrev} title="Anterior">
            <ChevronLeft size={20} />
          </button>
          
          <button type="button" className="btn-nav-today" onClick={handleToday}>
            Hoje
          </button>
          
          <button type="button" className="btn-nav-arrow" onClick={handleNext} title="Próximo">
            <ChevronRight size={20} />
          </button>

          <h2 className="current-period-heading">
            {getHeaderPeriodTitle()}
          </h2>
        </div>

        <div className="view-mode-and-filter">
          {/* Filtro por Status e Modalidade */}
          <div className="filter-select-wrapper">
            <select 
              className="calendar-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Agendamentos</option>
              <option value="confirmado">🟢 Presença Confirmada</option>
              <option value="pendente">🟡 Aguardando Confirmação</option>
              <option value="presencial">📍 Somente Presencial</option>
              <option value="online">💻 Somente Online (Teleconsulta)</option>
              <option value="realizada">✓ Realizadas</option>
            </select>
          </div>

          {/* Seletor de Abas de Visão */}
          <div className="calendar-view-mode-tabs">
            <button 
              type="button" 
              className={`view-tab-btn ${viewMode === 'hoje' ? 'view-tab-active' : ''}`}
              onClick={() => setViewMode('hoje')}
            >
              <Clock size={16} />
              <span>Dia</span>
            </button>

            <button 
              type="button" 
              className={`view-tab-btn ${viewMode === 'semana' ? 'view-tab-active' : ''}`}
              onClick={() => setViewMode('semana')}
            >
              <CalendarRange size={16} />
              <span>Semana</span>
            </button>

            <button 
              type="button" 
              className={`view-tab-btn ${viewMode === 'mes' ? 'view-tab-active' : ''}`}
              onClick={() => setViewMode('mes')}
            >
              <CalendarDays size={16} />
              <span>Mês</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. VISÃO DE HOJE / DIA
          ========================================================================= */}
      {viewMode === 'hoje' && (
        <div className="view-today-container">
          <TodayAppointmentsWidget 
            consultasHoje={consultasHoje}
            onSelectPatient={onSelectPatient}
            onStatusUpdated={loadConsultas}
            nutricionistaId={nutricionistaId}
          />
        </div>
      )}

      {/* =========================================================================
          2. VISÃO SEMANAL (GRADE DE 7 DIAS)
          ========================================================================= */}
      {viewMode === 'semana' && (
        <div className="weekly-calendar-grid">
          {weekDays.map((day) => (
            <div 
              key={day.isoDate} 
              className={`week-day-column ${day.isToday ? 'day-column-today' : ''}`}
            >
              {/* Cabeçalho do Dia */}
              <div className="day-column-header">
                <span className="day-name-label">{day.dayName}</span>
                <div className="day-number-circle">
                  <span>{day.dayNumber}</span>
                </div>
                {day.isToday && <span className="today-micro-badge">Hoje</span>}
                <button 
                  type="button" 
                  className="btn-add-day-slot"
                  onClick={() => handleOpenScheduleForDate(day.isoDate)}
                  title={`Agendar consulta para ${day.dayNumber}/${day.monthName}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Lista de Consultas do Dia */}
              <div className="day-appointments-list">
                {day.appointments.length > 0 ? (
                  day.appointments.map((appt) => {
                    const isRealizada = appt.status === 'realizada';
                    const isConfirmado = appt.confirmacao === 'confirmado';
                    const isOnline = appt.modalidade === 'online';

                    return (
                      <div 
                        key={appt.id} 
                        className={`week-appointment-card ${isRealizada ? 'appt-realizada' : ''} ${isConfirmado ? 'appt-confirmed-card' : 'appt-pending-card'}`}
                        onClick={() => {
                          const p = pacientes.find(item => item.id === appt.paciente_id) || { id: appt.paciente_id, nome: appt.paciente_nome };
                          if (onSelectPatient) onSelectPatient(p);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="appt-card-top">
                          <span className="appt-time-badge">
                            <Clock size={11} /> {formatTime(appt.data_consulta)}
                          </span>
                          
                          {/* Badge de Modalidade (Presencial vs Online) */}
                          <span className={`badge-card-modalidade ${isOnline ? 'mod-online' : 'mod-presencial'}`} title={isOnline ? 'Teleconsulta Online por Vídeo' : 'Atendimento Presencial no Consultório'}>
                            {isOnline ? <><Video size={10} /> Online</> : <><MapPin size={10} /> Presencial</>}
                          </span>
                        </div>

                        <h4 className="appt-patient-name" title={appt.paciente_nome}>
                          {appt.paciente_nome}
                        </h4>
                        
                        <span className="appt-type-desc" title={appt.tipo}>
                          {appt.tipo || 'Consulta'}
                        </span>

                        {/* Status de Confirmação do Paciente */}
                        <div className="appt-confirmation-row" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button" 
                            className={`btn-pill-confirm ${isConfirmado ? 'pill-conf-yes' : 'pill-conf-no'}`}
                            onClick={(e) => handleToggleConfirmacao(appt.id, e)}
                            title={isConfirmado ? 'Presença confirmada pelo paciente. Clique para mudar.' : 'Aguardando confirmação do paciente. Clique para confirmar.'}
                          >
                            {isConfirmado ? (
                              <><UserCheck size={11} /> Confirmado</>
                            ) : (
                              <><HelpCircle size={11} /> Aguardando</>
                            )}
                          </button>
                        </div>

                        <div className="appt-card-actions" onClick={(e) => e.stopPropagation()}>
                          {isOnline && appt.linkTeleconsulta && (
                            <a 
                              href={appt.linkTeleconsulta}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-mini-action btn-mini-video"
                              title="Abrir sala de Teleconsulta"
                            >
                              <Video size={12} />
                            </a>
                          )}

                          {appt.paciente_telefone && (
                            <a 
                              href={`https://wa.me/55${appt.paciente_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${appt.paciente_nome.split(' ')[0]}! Tudo bem? Passando para confirmar sua consulta nutricional no dia ${day.dayNumber}/${day.monthName} às ${formatTime(appt.data_consulta)} (${isOnline ? 'Online por Vídeo' : 'Presencial no Consultório'}). Poderia confirmar sua presença respondendo 'CONFIRMO'? 🥗✨`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-mini-action btn-mini-wa"
                              title="Pedir confirmação no WhatsApp"
                            >
                              <MessageCircle size={12} />
                            </a>
                          )}

                          <button 
                            type="button" 
                            className={`btn-mini-action ${isRealizada ? 'btn-mini-checked' : 'btn-mini-check'}`}
                            onClick={(e) => handleToggleConcluida(appt.id, appt.status, e)}
                            title={isRealizada ? 'Marcar como pendente' : 'Concluir consulta'}
                          >
                            <Check size={12} />
                          </button>

                          <button 
                            type="button" 
                            className="btn-mini-action btn-mini-del"
                            onClick={(e) => handleExcluirConsulta(appt.id, e)}
                            title="Desmarcar consulta"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div 
                    className="empty-day-slot"
                    onClick={() => handleOpenScheduleForDate(day.isoDate)}
                    role="button"
                    tabIndex={0}
                  >
                    <span>Livre</span>
                    <Plus size={14} className="slot-plus-icon" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          3. VISÃO MENSAL (CALENDÁRIO DE 35/42 DIAS)
          ========================================================================= */}
      {viewMode === 'mes' && (
        <div className="monthly-calendar-container">
          
          {/* Cabeçalho dos Dias da Semana */}
          <div className="month-weekdays-header">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Grade de Células de Dias */}
          <div className="month-grid-cells">
            {monthCalendarGrid.map((cell, idx) => {
              const hasAppointments = cell.appointments.length > 0;
              const hasTodayAppts = cell.isToday && hasAppointments;

              return (
                <div 
                  key={idx}
                  className={`month-cell ${!cell.isCurrentMonth ? 'cell-outside-month' : ''} ${cell.isToday ? 'cell-today' : ''} ${hasAppointments ? 'cell-has-appts' : ''}`}
                  onClick={() => setSelectedDayDetails(cell)}
                >
                  <div className="cell-top-header">
                    <span className="cell-day-num">{cell.dayNumber}</span>
                    {hasAppointments && (
                      <span className="cell-appts-count" title={`${cell.appointments.length} consultas`}>
                        {cell.appointments.length}
                      </span>
                    )}
                  </div>

                  {/* Badges de Atendimentos no Dia */}
                  <div className="cell-appts-preview-list">
                    {cell.appointments.slice(0, 2).map((a) => (
                      <div 
                        key={a.id} 
                        className={`mini-month-appt-tag tag-${a.confirmacao === 'confirmado' ? 'confirmada' : 'agendada'}`}
                        title={`${formatTime(a.data_consulta)} - ${a.paciente_nome} (${a.modalidade === 'online' ? 'Online' : 'Presencial'}) [${a.confirmacao === 'confirmado' ? 'Confirmado' : 'Aguardando'}]`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const p = pacientes.find(item => item.id === a.paciente_id) || { id: a.paciente_id, nome: a.paciente_nome };
                          if (onSelectPatient) onSelectPatient(p);
                        }}
                      >
                        <span className="mini-tag-time">{formatTime(a.data_consulta)}</span>
                        <span className="mini-tag-name">
                          {a.modalidade === 'online' ? '💻 ' : '📍 '}
                          {a.paciente_nome.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                    {cell.appointments.length > 2 && (
                      <span className="more-appts-pill">
                        +{cell.appointments.length - 2} mais
                      </span>
                    )}
                  </div>

                  {/* Botão sutil de adicionar ao passar o mouse */}
                  <button 
                    type="button" 
                    className="cell-quick-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleForDate(cell.isoDate);
                    }}
                    title={`Agendar em ${cell.dayNumber}`}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Dia Selecionado no Calendário Mensal */}
      {selectedDayDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedDayDetails(null)}>
          <div className="modal-card day-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="modal-icon-badge icon-purple"><CalendarDays size={20} /></div>
                <div>
                  <h3 className="modal-title">
                    {selectedDayDetails.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <p className="modal-subtitle">
                    {selectedDayDetails.appointments.length} atendimento(s) agendado(s) para esta data
                  </p>
                </div>
              </div>
              <button className="btn-modal-close" onClick={() => setSelectedDayDetails(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {selectedDayDetails.appointments.length > 0 ? (
                <div className="day-modal-appts-list">
                  {selectedDayDetails.appointments.map(a => (
                    <div key={a.id} className="day-modal-appt-item">
                      <div className="day-modal-time">
                        <Clock size={16} />
                        <strong>{formatTime(a.data_consulta)}</strong>
                      </div>
                      <div className="day-modal-patient">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4>{a.paciente_nome}</h4>
                          <span className={`badge-card-modalidade ${a.modalidade === 'online' ? 'mod-online' : 'mod-presencial'}`}>
                            {a.modalidade === 'online' ? '💻 Online' : '📍 Presencial'}
                          </span>
                        </div>
                        <span>{a.tipo || 'Consulta de Retorno'}</span>
                      </div>
                      <div className="day-modal-actions">
                        <button 
                          type="button" 
                          className={`btn-pill-confirm ${a.confirmacao === 'confirmado' ? 'pill-conf-yes' : 'pill-conf-no'}`}
                          onClick={(e) => handleToggleConfirmacao(a.id, e)}
                        >
                          {a.confirmacao === 'confirmado' ? '✓ Confirmado' : '⏱️ Pendente'}
                        </button>

                        <button 
                          type="button"
                          className="btn-primary-action btn-sm"
                          onClick={() => {
                            setSelectedDayDetails(null);
                            const p = pacientes.find(item => item.id === a.paciente_id) || { id: a.paciente_id, nome: a.paciente_nome };
                            if (onSelectPatient) onSelectPatient(p);
                          }}
                        >
                          <LineChart size={14} /> Prontuário
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-day-modal">
                  <Calendar size={36} className="icon-purple" />
                  <h4>Nenhum atendimento marcado neste dia</h4>
                  <p>Clique abaixo para agendar um novo retorno para esta data.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => {
                  const iso = selectedDayDetails.isoDate;
                  setSelectedDayDetails(null);
                  handleOpenScheduleForDate(iso);
                }}
              >
                <Plus size={16} /> Agendar Consulta Neste Dia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Agendamento */}
      {showScheduleModal && (
        <div className="modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="modal-icon-badge icon-purple"><CalendarPlus size={20} /></div>
                <div>
                  <h3 className="modal-title">Agendar Nova Consulta</h3>
                  <p className="modal-subtitle">Defina o paciente, horário, modalidade e confirmação.</p>
                </div>
              </div>
              <button className="btn-modal-close" onClick={() => setShowScheduleModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAgendarSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Selecionar Paciente *</label>
                <select 
                  className="form-input"
                  value={modalPatientId}
                  onChange={(e) => setModalPatientId(e.target.value)}
                  required
                >
                  <option value="">Selecione um paciente cadastrado...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.objetivo || 'Geral'})</option>
                  ))}
                </select>
              </div>

              <div className="form-row grid-2">
                <div className="form-group">
                  <label className="form-label">Data da Consulta *</label>
                  <input 
                    type="date"
                    className={`form-input ${conflictAppointment ? 'input-error-border' : ''}`}
                    value={modalData}
                    onChange={(e) => {
                      setModalData(e.target.value);
                      setScheduleError(null);
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input 
                    type="time"
                    className={`form-input ${conflictAppointment ? 'input-error-border' : ''}`}
                    value={modalHora}
                    onChange={(e) => {
                      setModalHora(e.target.value);
                      setScheduleError(null);
                    }}
                    required
                  />
                </div>
              </div>

              {/* ALERTA VISUAL DE CONFLITO EM TEMPO REAL */}
              {conflictAppointment && (
                <div className="alert-schedule-conflict animated-fade-in" role="alert">
                  <div className="conflict-icon-wrap">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="conflict-text-wrap">
                    <h5 className="conflict-heading">⚠️ Horário Indisponível (Conflito de Agenda)</h5>
                    <p className="conflict-desc">
                      O paciente <strong>{conflictAppointment.paciente_nome}</strong> já está agendado para esta data às <strong>{formatTime(conflictAppointment.data_consulta)}</strong> ({conflictAppointment.tipo || 'Consulta'}).
                    </p>
                    <div className="conflict-suggestions">
                      <span className="suggestion-lbl">Sugestão de horários livres:</span>
                      <div className="suggestion-buttons-row">
                        <button 
                          type="button" 
                          className="btn-suggestion-time"
                          onClick={() => setModalHora('11:00')}
                        >
                          11:00
                        </button>
                        <button 
                          type="button" 
                          className="btn-suggestion-time"
                          onClick={() => setModalHora('14:00')}
                        >
                          14:00
                        </button>
                        <button 
                          type="button" 
                          className="btn-suggestion-time"
                          onClick={() => setModalHora('15:30')}
                        >
                          15:30
                        </button>
                        <button 
                          type="button" 
                          className="btn-suggestion-time"
                          onClick={() => setModalHora('17:00')}
                        >
                          17:00
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scheduleError && !conflictAppointment && (
                <div className="alert alert-danger" style={{ margin: '10px 0' }}>
                  <AlertTriangle size={16} />
                  <span>{scheduleError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tipo de Atendimento</label>
                <select 
                  className="form-input"
                  value={modalTipo}
                  onChange={(e) => setModalTipo(e.target.value)}
                >
                  <option value="Consulta de Retorno">Consulta de Retorno</option>
                  <option value="Primeira Consulta & Anamnese">Primeira Consulta & Anamnese</option>
                  <option value="Bioimpedância & Antropometria">Bioimpedância & Antropometria</option>
                  <option value="Ajuste de Cardápio / Plano">Ajuste de Cardápio / Plano</option>
                  <option value="Avaliação de Exames Laboratoriais">Avaliação de Exames Laboratoriais</option>
                </select>
              </div>

              {/* SELEÇÃO DE MODALIDADE: PRESENCIAL VS ONLINE */}
              <div className="form-group">
                <label className="form-label">Modalidade de Atendimento *</label>
                <div className="modality-segmented-control">
                  <button 
                    type="button"
                    className={`btn-modality-opt ${modalModalidade === 'presencial' ? 'mod-opt-active' : ''}`}
                    onClick={() => setModalModalidade('presencial')}
                  >
                    <MapPin size={16} />
                    <span>Presencial (Consultório)</span>
                  </button>

                  <button 
                    type="button"
                    className={`btn-modality-opt ${modalModalidade === 'online' ? 'mod-opt-active' : ''}`}
                    onClick={() => setModalModalidade('online')}
                  >
                    <Video size={16} />
                    <span>Online (Teleconsulta)</span>
                  </button>
                </div>
              </div>

              {/* CAMPO DE LINK PARA TELECONSULTA */}
              {modalModalidade === 'online' && (
                <div className="form-group animated-fade-in">
                  <label className="form-label">Link da Sala de Vídeo (Google Meet / Zoom / WhatsApp)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="url"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      value={modalLinkTeleconsulta}
                      onChange={(e) => setModalLinkTeleconsulta(e.target.value)}
                    />
                    <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              )}

              {/* STATUS DE CONFIRMAÇÃO DO PACIENTE */}
              <div className="form-group">
                <label className="form-label">Status Inicial de Confirmação</label>
                <div className="confirmation-segmented-control">
                  <button 
                    type="button"
                    className={`btn-conf-opt ${modalConfirmacao === 'confirmado' ? 'conf-opt-yes' : ''}`}
                    onClick={() => setModalConfirmacao('confirmado')}
                  >
                    <UserCheck size={16} />
                    <span>Já Confirmado pelo Paciente</span>
                  </button>

                  <button 
                    type="button"
                    className={`btn-conf-opt ${modalConfirmacao === 'pendente' ? 'conf-opt-pending' : ''}`}
                    onClick={() => setModalConfirmacao('pendente')}
                  >
                    <HelpCircle size={16} />
                    <span>Aguardando Confirmação</span>
                  </button>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: '1px solid var(--card-border)' }}>
                <button 
                  type="button" 
                  className="btn-cancel-flat"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduleError(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`btn-primary ${conflictAppointment ? 'btn-disabled-conflict' : ''}`}
                  disabled={submitting || !modalPatientId || Boolean(conflictAppointment)}
                  title={conflictAppointment ? 'Selecione um horário livre para continuar' : 'Confirmar agendamento'}
                >
                  {conflictAppointment 
                    ? 'Horário Ocupado ⚠️' 
                    : (submitting ? 'Agendando...' : 'Confirmar Agendamento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}

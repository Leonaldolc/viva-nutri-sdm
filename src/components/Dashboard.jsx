import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut, 
  UserPlus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  CalendarCheck2, 
  ArrowUpRight, 
  Sparkles, 
  Phone, 
  RefreshCw, 
  ChevronRight, 
  Menu, 
  X,
  ShieldCheck,
  CalendarPlus,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Percent,
  Search,
  Filter,
  ArrowDownRight,
  ExternalLink,
  LineChart,
  MessageCircle
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import PatientProfileModal from './PatientProfileModal';
import NewPatientModal from './NewPatientModal';
import PatientsList from './PatientsList';
import PatientRegisterPage from './PatientRegisterPage';
import BirthdayModal from './BirthdayModal';
import BirthdayAlertsCard from './BirthdayAlertsCard';
import TodayAppointmentsWidget from './TodayAppointmentsWidget';
import ClinicalCalendarView from './ClinicalCalendarView';
import { 
  getDashboardMetrics, 
  subscribeDashboardUpdates, 
  agendarRetornoRapido,
  getAniversariantesInfo
} from '../services/dashboardService';



export default function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard' | 'pacientes' | 'novo-paciente' | 'agenda'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('30d'); // '7d' | '30d' | '90d' | '1y'
  const [tableFilter, setTableFilter] = useState('sem-retorno'); // 'todos' | 'sem-retorno' | 'critico' | 'medio' | 'em-dia'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bdayCongratulateTarget, setBdayCongratulateTarget] = useState(null);


  const [metrics, setMetrics] = useState({
    totalPacientes: 0,
    consultasSemana: 0,
    consultasSemanaLista: [],
    pacientesSemRetorno: [],
    totalSemRetorno: 0,
    criticosCount: 0,
    mediosCount: 0,
    pacientesAnaliticos: [],
    retentionRate: 88.5,
    occupancyRate: 78.5,
    avgCycleDays: 27,
    churnRate: 4.2,
    objectiveDistribution: [],
    monthlyTrends: [],
    weekdayOccupancy: []
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [quickActionNotice, setQuickActionNotice] = useState('');

  const nutricionistaId = user?.id || 'nutri_default';
  const userName = user?.name || user?.email?.split('@')[0] || 'Nutricionista';
  const userInitial = userName.charAt(0).toUpperCase();

  const aniversariantesData = useMemo(() => {
    return getAniversariantesInfo(metrics.pacientesAnaliticos || []);
  }, [metrics.pacientesAnaliticos]);

  const loadData = async (isManualRefresh = false) => {

    if (isManualRefresh) setRefreshing(true);
    try {
      const data = await getDashboardMetrics(nutricionistaId, timeframe);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dados analíticos:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeDashboardUpdates(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [nutricionistaId, timeframe]);

  const handleQuickSchedule = async (paciente, e) => {
    e.stopPropagation();
    try {
      await agendarRetornoRapido(paciente, nutricionistaId);
      setQuickActionNotice(`Retorno agendado com sucesso para ${paciente.nome}! Risco recalculado.`);
      setTimeout(() => setQuickActionNotice(''), 4000);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtragem analítica dinâmica da tabela
  const filteredPatients = useMemo(() => {
    let list = metrics.pacientesAnaliticos || [];

    if (tableFilter === 'sem-retorno') {
      list = list.filter(p => !p.hasFuture && p.diasSemConsulta >= 30);
    } else if (tableFilter === 'critico') {
      list = list.filter(p => p.riskLevel === 'critico');
    } else if (tableFilter === 'medio') {
      list = list.filter(p => p.riskLevel === 'medio');
    } else if (tableFilter === 'em-dia') {
      list = list.filter(p => p.hasFuture || p.diasSemConsulta < 30);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.nome.toLowerCase().includes(query) ||
        p.objetivo.toLowerCase().includes(query) ||
        (p.email && p.email.toLowerCase().includes(query))
      );
    }

    return list;
  }, [metrics.pacientesAnaliticos, tableFilter, searchQuery]);

  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="viva-app-layout">
      {mobileMenuOpen && (
        <div className="sidebar-mobile-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* 1. Sidebar (Menu Lateral Sticky) */}
      <aside className={`viva-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo-wrapper" onClick={() => setActiveNav('dashboard')} style={{ cursor: 'pointer' }}>
            <Logo size="small" variant="horizontal" />
          </div>
          <button 
            className="btn-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeNav === 'dashboard' ? 'nav-item-active' : ''}`}
            onClick={() => { setActiveNav('dashboard'); setMobileMenuOpen(false); }}
          >
            <LayoutDashboard size={20} className="nav-icon" />
            <span className="nav-label">Analytics BI</span>
            {activeNav === 'dashboard' && <span className="nav-active-pill" />}
          </button>

          <button 
            className={`nav-item ${activeNav === 'pacientes' || activeNav === 'novo-paciente' ? 'nav-item-active' : ''}`}
            onClick={() => { setActiveNav('pacientes'); setMobileMenuOpen(false); }}
          >
            <Users size={20} className="nav-icon" />
            <span className="nav-label">Base de Pacientes</span>
            <span className="nav-counter-badge">{metrics.totalPacientes}</span>
            {(activeNav === 'pacientes' || activeNav === 'novo-paciente') && <span className="nav-active-pill" />}
          </button>

          <button 
            className={`nav-item ${activeNav === 'agenda' ? 'nav-item-active' : ''}`}
            onClick={() => { setActiveNav('agenda'); setMobileMenuOpen(false); }}
          >
            <Calendar size={20} className="nav-icon" />
            <span className="nav-label">Agenda Clínica</span>
            {metrics.consultasHojeCount > 0 ? (
              <span className="nav-counter-badge nav-badge-today" title={`${metrics.consultasHojeCount} hoje`}>
                {metrics.consultasHojeCount} Hoje
              </span>
            ) : (
              <span className="nav-counter-badge">{metrics.consultasSemana}</span>
            )}
            {activeNav === 'agenda' && <span className="nav-active-pill" />}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-theme-wrapper">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="compact" />
          </div>

          <div className="sidebar-user-card">
            <div className="user-avatar-small">{userInitial}</div>
            <div className="user-text-info">
              <span className="user-display-name" title={userName}>{userName}</span>
              <span className="user-display-email" title={user?.email}>{user?.email}</span>
            </div>
            <button className="btn-sidebar-logout" onClick={onLogout} title="Sair do sistema">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Área Principal de Conteúdo */}
      <main className="viva-main-content">
        
        {/* =========================================================================
            1. TELA DE LISTAGEM DE PACIENTES
            ========================================================================= */}
        {activeNav === 'pacientes' && (
          <PatientsList
            pacientes={metrics.pacientesAnaliticos || []}
            onSelectPatient={(p) => setSelectedPatient(p)}
            onOpenNewPatientForm={() => setActiveNav('novo-paciente')}
            loading={loading}
            onRefresh={() => loadData(true)}
            onParabenizar={(p, idade) => setBdayCongratulateTarget({ paciente: p, idadeNova: idade })}
          />
        )}

        {/* =========================================================================
            2. FORMULÁRIO DE CADASTRO DE NOVO PACIENTE (3 ABAS)
            ========================================================================= */}
        {activeNav === 'novo-paciente' && (
          <PatientRegisterPage
            nutricionistaId={nutricionistaId}
            onCancel={() => setActiveNav('pacientes')}
            onPatientCreated={(novoPaciente) => {
              loadData();
              setSelectedPatient(novoPaciente);
              setActiveNav('pacientes');
            }}
          />
        )}

        {/* =========================================================================
            3. AGENDA CLÍNICA & CALENDÁRIO (DIA, SEMANA, MÊS)
            ========================================================================= */}
        {activeNav === 'agenda' && (
          <ClinicalCalendarView
            pacientes={metrics.pacientesAnaliticos}
            onSelectPatient={(p) => {
              const fullP = metrics.pacientesAnaliticos.find(item => item.id === p.id) || p;
              setSelectedPatient(fullP);
            }}
            nutricionistaId={nutricionistaId}
            onRefreshParent={() => loadData()}
          />
        )}


        {/* =========================================================================
            4. TELA ANALYTICS BI (DASHBOARD)
            ========================================================================= */}
        {activeNav === 'dashboard' && (
          <>
            {/* Topbar com Controles Analíticos e Filtro de Período */}
            <header className="main-topbar">
              <div className="topbar-left">
                <button 
                  className="btn-mobile-hamburger" 
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Abrir menu"
                >
                  <Menu size={22} />
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h1 className="welcome-heading">Clinical Intelligence Dashboard</h1>
                    <span className="bi-badge">DATA ANALYST VIEW</span>
                  </div>
                  <p className="welcome-subheading">
                    {currentDateFormatted.charAt(0).toUpperCase() + currentDateFormatted.slice(1)} • <span className="realtime-pill"><ShieldCheck size={13} /> Sincronização em Tempo Real (RLS)</span>
                  </p>
                </div>
              </div>

              <div className="topbar-right-actions">
                {/* Seletor de Período Analítico */}
                <div className="timeframe-selector">
                  <button 
                    className={`timeframe-btn ${timeframe === '7d' ? 'timeframe-active' : ''}`}
                    onClick={() => setTimeframe('7d')}
                  >
                    7D
                  </button>
                  <button 
                    className={`timeframe-btn ${timeframe === '30d' ? 'timeframe-active' : ''}`}
                    onClick={() => setTimeframe('30d')}
                  >
                    30D
                  </button>
                  <button 
                    className={`timeframe-btn ${timeframe === '90d' ? 'timeframe-active' : ''}`}
                    onClick={() => setTimeframe('90d')}
                  >
                    Trimestre
                  </button>
                  <button 
                    className={`timeframe-btn ${timeframe === '1y' ? 'timeframe-active' : ''}`}
                    onClick={() => setTimeframe('1y')}
                  >
                    Ano
                  </button>
                </div>

                <button 
                  className="btn-refresh" 
                  onClick={() => loadData(true)} 
                  disabled={refreshing}
                  title="Atualizar dados analíticos"
                >
                  <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
                  <span className="hide-mobile">Atualizar</span>
                </button>

                <button 
                  className="btn-primary-action"
                  onClick={() => setActiveNav('novo-paciente')}
                >
                  <UserPlus size={16} />
                  <span>Novo Paciente</span>
                </button>
              </div>
            </header>

            {quickActionNotice && (
              <div className="alert alert-success toast-notice" role="status">
                <CheckCircle2 size={18} />
                <span>{quickActionNotice}</span>
              </div>
            )}

            {/* FAIXA DE INDICADORES EXECUTIVOS DE BI */}
            <section className="bi-ribbon-grid">
              <div className="bi-metric-card">
                <div className="bi-metric-icon icon-emerald"><Target size={18} /></div>
                <div>
                  <div className="bi-metric-label">Taxa de Retenção</div>
                  <div className="bi-metric-val">{metrics.retentionRate}%</div>
                </div>
                <span className="bi-trend-positive"><TrendingUp size={12} /> +2.4%</span>
              </div>

              <div className="bi-metric-card">
                <div className="bi-metric-icon icon-purple"><Activity size={18} /></div>
                <div>
                  <div className="bi-metric-label">Ocupação da Agenda</div>
                  <div className="bi-metric-val">{metrics.occupancyRate}%</div>
                </div>
                <span className="bi-meta-info">Capacidade Ótima</span>
              </div>

              <div className="bi-metric-card">
                <div className="bi-metric-icon icon-orange"><Clock size={18} /></div>
                <div>
                  <div className="bi-metric-label">Ciclo Médio Retorno</div>
                  <div className="bi-metric-val">{metrics.avgCycleDays} dias</div>
                </div>
                <span className="bi-meta-info">Meta: 30d</span>
              </div>

              <div className="bi-metric-card">
                <div className="bi-metric-icon icon-amber"><AlertTriangle size={18} /></div>
                <div>
                  <div className="bi-metric-label">Risco de Churn</div>
                  <div className="bi-metric-val">{metrics.totalSemRetorno} pacientes</div>
                </div>
                <span className="bi-trend-alert">{metrics.criticosCount} críticos</span>
              </div>
            </section>

            {/* PAINEL DE CONSULTAS DE HOJE NO DASHBOARD */}
            <section style={{ marginBottom: '24px' }}>
              <TodayAppointmentsWidget 
                consultasHoje={metrics.consultasHojeLista || []}
                onSelectPatient={(p) => {
                  const fullP = metrics.pacientesAnaliticos.find(item => item.id === p.id) || p;
                  setSelectedPatient(fullP);
                }}
                onStatusUpdated={() => loadData()}
                nutricionistaId={nutricionistaId}
              />
            </section>

            {/* WIDGET DE ANIVERSARIANTES NO DASHBOARD */}
            {aniversariantesData.totalAniversariantes > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <BirthdayAlertsCard 
                  aniversariantesData={aniversariantesData}
                  onParabenizar={(p, idade) => setBdayCongratulateTarget({ paciente: p, idadeNova: idade })}
                />
              </section>
            )}


            {/* GRID DE KPIS PRINCIPAIS */}
            <section className="kpi-grid">
              <article className="kpi-card kpi-card-purple">
                <div className="kpi-card-header">
                  <div className="kpi-icon-badge kpi-badge-purple"><Users size={22} /></div>
                  <span className="kpi-tag kpi-tag-purple"><TrendingUp size={13} /> +12.5% YoY</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-number">{loading ? '--' : metrics.totalPacientes}</div>
                  <h3 className="kpi-title">Total de Pacientes Ativos</h3>
                  <p className="kpi-desc">Base de acompanhamento contínuo cadastrada no sistema.</p>
                </div>
              </article>

              <article className="kpi-card kpi-card-orange">
                <div className="kpi-card-header">
                  <div className="kpi-icon-badge kpi-badge-orange"><Calendar size={22} /></div>
                  <span className="kpi-tag kpi-tag-orange"><CalendarCheck2 size={13} /> Ocupação: {metrics.occupancyRate}%</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-number">{loading ? '--' : metrics.consultasSemana}</div>
                  <h3 className="kpi-title">Consultas da Semana</h3>
                  <p className="kpi-desc">Agendamentos confirmados e retornos para esta semana.</p>
                </div>
              </article>

              <article className="kpi-card kpi-card-alert">
                <div className="kpi-card-header">
                  <div className="kpi-icon-badge kpi-badge-alert"><AlertTriangle size={22} /></div>
                  <span className="kpi-tag kpi-tag-alert">{metrics.criticosCount} em Risco Crítico</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-number text-alert-num">{loading ? '--' : metrics.totalSemRetorno}</div>
                  <h3 className="kpi-title">Pacientes sem Retorno</h3>
                  <p className="kpi-desc">&gt;30 dias sem consulta e sem agendamento futuro.</p>
                </div>
              </article>
            </section>

            {/* SEÇÃO ANALÍTICA: DONUT E DISTRIBUIÇÃO */}
            <section className="analytics-split-grid">
              <div className="analytics-card">
                <div className="analytics-card-header">
                  <div>
                    <h3 className="analytics-title"><PieChart size={18} /> Segmentação por Objetivo Nutricional</h3>
                    <p className="analytics-subtitle">Distribuição percentual da carteira clínica</p>
                  </div>
                </div>
                <div className="donut-chart-container">
                  <div className="donut-svg-wrapper">
                    <svg viewBox="0 0 160 160" className="donut-svg">
                      {metrics.objectiveDistribution.map((item, idx) => (
                        <circle
                          key={idx}
                          cx="80"
                          cy="80"
                          r="55"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="20"
                          strokeDasharray={item.strokeDasharray}
                          strokeDashoffset={item.strokeDashoffset}
                          className="donut-segment"
                        />
                      ))}
                    </svg>
                    <div className="donut-center-text">
                      <span className="donut-center-val">{metrics.totalPacientes}</span>
                      <span className="donut-center-sub">Pacientes</span>
                    </div>
                  </div>

                  <div className="donut-legend-list">
                    {metrics.objectiveDistribution.map((item, idx) => (
                      <div key={idx} className="donut-legend-row">
                        <div className="legend-left">
                          <span className="legend-bullet" style={{ backgroundColor: item.color }} />
                          <span className="legend-name">{item.categoria}</span>
                        </div>
                        <div className="legend-right">
                          <span className="legend-count">{item.count}</span>
                          <span className="legend-percent">({item.percent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SÉRIE TEMPORAL */}
              <div className="analytics-card">
                <div className="analytics-card-header">
                  <div>
                    <h3 className="analytics-title"><LineChart size={18} /> Retenção e Volume de Consultas</h3>
                    <p className="analytics-subtitle">Média móvel dos últimos 6 meses</p>
                  </div>
                </div>
                <div className="barchart-container">
                  {metrics.monthlyTrends.map((m, idx) => {
                    const maxVal = Math.max(...metrics.monthlyTrends.map(t => t.consultas), 40);
                    const heightPercent = Math.round((m.consultas / maxVal) * 100);
                    return (
                      <div key={idx} className="barchart-col">
                        <span className="barchart-val">{m.consultas}</span>
                        <div className="barchart-bar-wrapper">
                          <div 
                            className="barchart-bar" 
                            style={{ height: `${heightPercent}%` }}
                            title={`${m.mes}: ${m.consultas} consultas (${m.taxaRetencao}% retenção)`}
                          />
                        </div>
                        <span className="barchart-label">{m.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* TABELA DE PACIENTES CRÍTICOS */}
            <section className="table-section-card">
              <div className="table-header-controls">
                <div>
                  <h2 className="table-section-title">Matriz de Pacientes e Score de Evasão</h2>
                  <p className="table-section-subtitle">Acompanhe pacientes inativos e priorize o reengajamento clínico</p>
                </div>
                <div className="table-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="table-search-input"
                    placeholder="Filtrar por nome, objetivo ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-tabs-bar">
                <button 
                  className={`filter-tab ${tableFilter === 'sem-retorno' ? 'filter-tab-active' : ''}`}
                  onClick={() => setTableFilter('sem-retorno')}
                >
                  Sem Retorno (&gt;30d) ({metrics.totalSemRetorno})
                </button>
                <button 
                  className={`filter-tab tab-critico ${tableFilter === 'critico' ? 'filter-tab-active' : ''}`}
                  onClick={() => setTableFilter('critico')}
                >
                  🔴 Risco Crítico ({metrics.criticosCount})
                </button>
                <button 
                  className={`filter-tab tab-medio ${tableFilter === 'medio' ? 'filter-tab-active' : ''}`}
                  onClick={() => setTableFilter('medio')}
                >
                  🟡 Risco Médio ({metrics.mediosCount})
                </button>
                <button 
                  className={`filter-tab ${tableFilter === 'todos' ? 'filter-tab-active' : ''}`}
                  onClick={() => setTableFilter('todos')}
                >
                  Todos os Pacientes ({metrics.totalPacientes})
                </button>
              </div>

              {filteredPatients.length > 0 ? (
                <div className="analytics-table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Objetivo Clínico</th>
                        <th>Última Consulta</th>
                        <th>Inatividade</th>
                        <th>Score de Risco</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((paciente) => (
                        <tr 
                          key={paciente.id} 
                          className="table-data-row"
                          onClick={() => setSelectedPatient(paciente)}
                        >
                          <td>
                            <div className="table-patient-cell">
                              <div className="table-avatar">{paciente.nome ? paciente.nome.charAt(0).toUpperCase() : '?'}</div>
                              <div>
                                <div className="table-patient-name">
                                  {paciente.nome}
                                  <ArrowUpRight size={13} className="table-arrow-icon" />
                                </div>
                                <div className="table-patient-email">{paciente.email || paciente.telefone}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="table-cat-badge">{paciente.objetivo}</span></td>
                          <td>
                            <span className="table-date-text">
                              {paciente.ultima_consulta 
                                ? new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                                : 'Sem registro'}
                            </span>
                          </td>
                          <td>
                            <span className={`table-days-pill pill-${paciente.riskLevel}`}>
                              <Clock size={12} />
                              {paciente.diasSemConsulta} dias
                            </span>
                          </td>
                          <td>
                            <div className="risk-score-wrapper">
                              <div className="score-number-row">
                                <span className="score-val">{paciente.scoreRisco}%</span>
                                <span className={`score-badge badge-${paciente.riskLevel}`}>
                                  {paciente.riskLevel === 'critico' ? 'Crítico' : paciente.riskLevel === 'medio' ? 'Médio' : 'Baixo'}
                                </span>
                              </div>
                              <div className="risk-progress-bar">
                                <div 
                                  className={`risk-progress-fill fill-${paciente.riskLevel}`} 
                                  style={{ width: `${paciente.scoreRisco}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            {paciente.hasFuture ? (
                              <span className="status-badge-scheduled">📅 Retorno Agendado</span>
                            ) : paciente.diasSemConsulta >= 30 ? (
                              <span className="status-badge-pending">⚠️ Pendente Retorno</span>
                            ) : (
                              <span className="status-badge-ok">✓ Em Dia</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-group" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="btn-action-evolution"
                                onClick={() => setSelectedPatient(paciente)}
                                title="Consultar evolução e prontuário"
                              >
                                <LineChart size={14} />
                                <span className="hide-mobile">Prontuário</span>
                              </button>
                              <button 
                                className="btn-action-schedule"
                                onClick={(e) => handleQuickSchedule(paciente, e)}
                                title="Agendar retorno em 1 clique"
                              >
                                <CalendarPlus size={14} />
                                <span className="hide-mobile">Agendar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state-card">
                  <CheckCircle2 size={40} className="empty-icon-success" />
                  <h3 className="empty-state-title">Nenhum paciente neste critério</h3>
                  <p className="empty-state-text">Todos os pacientes filtrados estão com o ciclo clínico em dia.</p>
                </div>
              )}
            </section>
          </>
        )}

      </main>

      {/* Modal de Perfil e Prontuário do Paciente */}
      {selectedPatient && (
        <PatientProfileModal
          paciente={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onActionSuccess={() => loadData()}
          nutricionistaId={nutricionistaId}
        />
      )}

      {/* Modal de Cadastro de Novo Paciente Rápido (se invocado) */}
      {showNewPatientModal && (
        <NewPatientModal
          onClose={() => setShowNewPatientModal(false)}
          onCreated={() => loadData()}
          nutricionistaId={nutricionistaId}
        />
      )}

      {/* Modal de Parabenização de Aniversário */}
      {bdayCongratulateTarget && (
        <BirthdayModal
          paciente={bdayCongratulateTarget.paciente}
          idadeNova={bdayCongratulateTarget.idadeNova}
          nutriNome={userName}
          onClose={() => setBdayCongratulateTarget(null)}
        />
      )}
    </div>
  );
}

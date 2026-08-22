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
import { 
  getDashboardMetrics, 
  subscribeDashboardUpdates, 
  agendarRetornoRapido 
} from '../services/dashboardService';

export default function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('30d'); // '7d' | '30d' | '90d' | '1y'
  const [tableFilter, setTableFilter] = useState('sem-retorno'); // 'todos' | 'sem-retorno' | 'critico' | 'medio' | 'em-dia'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

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
          <div className="sidebar-logo-wrapper">
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
            className={`nav-item ${activeNav === 'pacientes' ? 'nav-item-active' : ''}`}
            onClick={() => { setActiveNav('pacientes'); setMobileMenuOpen(false); }}
          >
            <Users size={20} className="nav-icon" />
            <span className="nav-label">Base de Pacientes</span>
            <span className="nav-counter-badge">{metrics.totalPacientes}</span>
          </button>

          <button 
            className={`nav-item ${activeNav === 'agenda' ? 'nav-item-active' : ''}`}
            onClick={() => { setActiveNav('agenda'); setMobileMenuOpen(false); }}
          >
            <Calendar size={20} className="nav-icon" />
            <span className="nav-label">Agenda Clínica</span>
            <span className="nav-counter-badge nav-counter-orange">{metrics.consultasSemana}</span>
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

      {/* 2. Área Principal de Conteúdo Analítico */}
      <main className="viva-main-content">
        
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
              onClick={() => setShowNewPatientModal(true)}
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

        {/* =========================================================================
            FAIXA DE INDICADORES EXECUTIVOS DE BI (High-level Clinical Metrics)
            ========================================================================= */}
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

        {/* =========================================================================
            GRID DE KPIS PRINCIPAIS COM SPARKLINES E MICRO-GRÁFICOS
            ========================================================================= */}
        <section className="kpi-grid">
          
          {/* CARD 1 — Total de Pacientes com Sparkline */}
          <article className="kpi-card kpi-card-purple">
            <div className="kpi-card-header">
              <div className="kpi-icon-badge kpi-badge-purple">
                <Users size={22} />
              </div>
              <span className="kpi-tag kpi-tag-purple">
                <TrendingUp size={13} /> +12.5% YoY
              </span>
            </div>

            <div className="kpi-card-body">
              <h3 className="kpi-card-title">Base Total de Pacientes</h3>
              {loading ? (
                <div className="skeleton skeleton-number"></div>
              ) : (
                <div className="kpi-value-row">
                  <span className="kpi-main-number">{metrics.totalPacientes}</span>
                  <span className="kpi-sub-text">ativos vinculados ao RLS</span>
                </div>
              )}
            </div>

            {/* Sparkline Visual SVG */}
            <div className="sparkline-container">
              <svg viewBox="0 0 200 40" className="sparkline-svg">
                <defs>
                  <linearGradient id="sparkGradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0,35 Q 30,30 60,25 T 120,18 T 160,10 T 200,6 L 200,40 L 0,40 Z" fill="url(#sparkGradPurple)" />
                <path d="M 0,35 Q 30,30 60,25 T 120,18 T 160,10 T 200,6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                <circle cx="200" cy="6" r="3.5" fill="#7C3AED" />
              </svg>
            </div>

            <div className="kpi-card-footer">
              <button className="kpi-action-link" onClick={() => setActiveNav('pacientes')}>
                <span>Explorar base cadastral</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </article>

          {/* CARD 2 — Consultas da Semana com Distribuição Diária */}
          <article className="kpi-card kpi-card-orange">
            <div className="kpi-card-header">
              <div className="kpi-icon-badge kpi-badge-orange">
                <CalendarCheck2 size={22} />
              </div>
              <span className="kpi-tag kpi-tag-orange">
                Semana Vigente
              </span>
            </div>

            <div className="kpi-card-body">
              <h3 className="kpi-card-title">Consultas da Semana</h3>
              {loading ? (
                <div className="skeleton skeleton-number"></div>
              ) : (
                <div className="kpi-value-row">
                  <span className="kpi-main-number">{metrics.consultasSemana}</span>
                  <span className="kpi-sub-text">atendimentos (Seg - Dom)</span>
                </div>
              )}
            </div>

            {/* Mini Barras de Distribuição Seg a Sex */}
            <div className="mini-barchart-row">
              {metrics.weekdayOccupancy.map((item, idx) => (
                <div key={idx} className="barchart-col" title={`${item.label}: ${item.count} consultas`}>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${Math.max(15, (item.count / item.capacity) * 100)}%` }}
                    />
                  </div>
                  <span className="bar-label">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="kpi-card-footer">
              <button className="kpi-action-link" onClick={() => setActiveNav('agenda')}>
                <span>Ver cronograma semanal</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </article>

          {/* CARD 3 — Matriz de Pacientes Sem Retorno & Risco de Churn */}
          <article className="kpi-card kpi-card-attention">
            <div className="kpi-card-header">
              <div className="kpi-icon-badge kpi-badge-amber">
                <AlertTriangle size={22} />
              </div>
              <span className={`kpi-tag ${metrics.totalSemRetorno > 0 ? 'kpi-tag-alert' : 'kpi-tag-green'}`}>
                {metrics.totalSemRetorno > 0 ? `${metrics.criticosCount} em risco crítico` : 'Sem pendências'}
              </span>
            </div>

            <div className="kpi-card-body">
              <h3 className="kpi-card-title">Pacientes Sem Retorno</h3>
              {loading ? (
                <div className="skeleton skeleton-number"></div>
              ) : (
                <div className="kpi-value-row">
                  <span className="kpi-main-number">{metrics.totalSemRetorno}</span>
                  <span className="kpi-sub-text">&gt; 30 dias sem consulta</span>
                </div>
              )}
            </div>

            {/* Divisão Analítica de Severidade */}
            <div className="risk-severity-meter">
              <div className="severity-bar-track">
                <div 
                  className="severity-segment segment-critico" 
                  style={{ width: `${(metrics.criticosCount / Math.max(1, metrics.totalSemRetorno)) * 100}%` }}
                  title={`${metrics.criticosCount} Pacientes em Risco Crítico (>45 dias)`}
                />
                <div 
                  className="severity-segment segment-medio" 
                  style={{ width: `${(metrics.mediosCount / Math.max(1, metrics.totalSemRetorno)) * 100}%` }}
                  title={`${metrics.mediosCount} Pacientes em Risco Médio (30-45 dias)`}
                />
              </div>
              <div className="severity-legend">
                <span>🔴 {metrics.criticosCount} Críticos</span>
                <span>🟡 {metrics.mediosCount} Médios</span>
              </div>
            </div>

            <div className="kpi-card-footer">
              <button 
                className="kpi-action-link" 
                onClick={() => setTableFilter('critico')}
              >
                <span>Filtrar na tabela abaixo</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </article>

        </section>

        {/* =========================================================================
            PAINÉIS DE GRÁFICOS ANALÍTICOS (Analytics Visualizations)
            ========================================================================= */}
        <section className="analytics-charts-grid">
          
          {/* GRÁFICO 1: Evolução Temporal de Atendimentos & Metas (Area Chart) */}
          <div className="chart-panel-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Evolução Mensal de Atendimentos Clínicos</h3>
                <p className="chart-subtitle">Histórico de consultas realizadas vs meta estipulada de atendimentos</p>
              </div>
              <div className="chart-legend-row">
                <span className="legend-item"><span className="legend-dot color-purple" /> Realizado</span>
                <span className="legend-item"><span className="legend-dot color-dashed" /> Meta Clínica</span>
              </div>
            </div>

            <div className="area-chart-container">
              <svg viewBox="0 0 500 180" className="area-chart-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(226, 232, 240, 0.4)" strokeDasharray="3 3" />
                <line x1="40" y1="75" x2="480" y2="75" stroke="rgba(226, 232, 240, 0.4)" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(226, 232, 240, 0.4)" strokeDasharray="3 3" />

                {/* Meta Line (Dashed) */}
                <path 
                  d="M 50,110 L 130,95 L 210,80 L 290,75 L 370,65 L 450,50" 
                  fill="none" 
                  stroke="#F97316" 
                  strokeWidth="2" 
                  strokeDasharray="5 4" 
                />

                {/* Area Fill */}
                <path 
                  d="M 50,105 Q 130,80 210,90 T 290,65 T 370,45 T 450,35 L 450,150 L 50,150 Z" 
                  fill="url(#areaGradient)" 
                />

                {/* Main Curve */}
                <path 
                  d="M 50,105 Q 130,80 210,90 T 290,65 T 370,45 T 450,35" 
                  fill="none" 
                  stroke="#7C3AED" 
                  strokeWidth="3" 
                />

                {/* Data Points */}
                {[
                  { cx: 50, cy: 105, val: 34, label: 'Mar' },
                  { cx: 130, cy: 80, val: 42, label: 'Abr' },
                  { cx: 210, cy: 90, val: 38, label: 'Mai' },
                  { cx: 290, cy: 65, val: 48, label: 'Jun' },
                  { cx: 370, cy: 45, val: 55, label: 'Jul' },
                  { cx: 450, cy: 35, val: 58, label: 'Ago' }
                ].map((pt, idx) => (
                  <g key={idx} className="chart-data-node">
                    <circle cx={pt.cx} cy={pt.cy} r="5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2.5" />
                    <text x={pt.cx} y="165" textAnchor="middle" className="chart-axis-text">{pt.label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* GRÁFICO 2: Distribuição por Objetivo Clínico (Donut Chart Analytics) */}
          <div className="chart-panel-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Distribuição por Perfil Clínico</h3>
                <p className="chart-subtitle">Proporção dos principais focos nutricionais</p>
              </div>
            </div>

            <div className="donut-analytics-layout">
              <div className="donut-svg-wrapper">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#7C3AED" strokeWidth="14" strokeDasharray="95 145" strokeDashoffset="25" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="14" strokeDasharray="60 180" strokeDashoffset="-70" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" strokeWidth="14" strokeDasharray="45 195" strokeDashoffset="-130" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="14" strokeDasharray="40 200" strokeDashoffset="-175" />
                </svg>
                <div className="donut-center-stat">
                  <span className="center-stat-number">{metrics.totalPacientes}</span>
                  <span className="center-stat-label">Total</span>
                </div>
              </div>

              <div className="donut-legend-list">
                {metrics.objectiveDistribution.map((item, idx) => (
                  <div key={idx} className="donut-legend-row">
                    <div className="donut-row-left">
                      <span className="donut-legend-color" style={{ backgroundColor: item.color }} />
                      <span className="donut-cat-name">{item.name}</span>
                    </div>
                    <div className="donut-row-right">
                      <span className="donut-cat-count">{item.count} pac.</span>
                      <span className="donut-cat-pct">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* =========================================================================
            DATA GRID ANALÍTICO COMPLETO DE PACIENTES & MATRIZ DE RISCO
            ========================================================================= */}
        <section className="dashboard-section-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title-group">
                <div className="panel-dot-indicator" style={{ backgroundColor: tableFilter === 'critico' ? '#EF4444' : '#7C3AED' }}></div>
                <h2 className="panel-title">Matriz Analítica de Acompanhamento & Risco</h2>
              </div>
              <p className="panel-subtitle">
                Visão detalhada de frequência de consultas, scores de risco de evasão e ações de reativação clínica.
              </p>
            </div>

            {/* Controles de Filtros e Busca Rápida */}
            <div className="table-controls-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Buscar paciente, objetivo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
                )}
              </div>
            </div>
          </div>

          {/* Abas de Filtragem Analítica */}
          <div className="table-filter-tabs">
            <button 
              className={`filter-tab ${tableFilter === 'sem-retorno' ? 'filter-tab-active' : ''}`}
              onClick={() => setTableFilter('sem-retorno')}
            >
              ⚠️ Sem Retorno ({metrics.totalSemRetorno})
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

          {/* Tabela de Dados (Data Table) */}
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton skeleton-row"></div>
              <div className="skeleton skeleton-row"></div>
              <div className="skeleton skeleton-row"></div>
            </div>
          ) : filteredPatients.length > 0 ? (
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
                      {/* Coluna 1: Paciente */}
                      <td>
                        <div className="table-patient-cell">
                          <div className="table-avatar">{paciente.nome.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="table-patient-name">
                              {paciente.nome}
                              <ArrowUpRight size={13} className="table-arrow-icon" />
                            </div>
                            <div className="table-patient-email">{paciente.email || paciente.telefone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Objetivo */}
                      <td>
                        <span className="table-cat-badge">{paciente.objetivo}</span>
                      </td>

                      {/* Coluna 3: Última Consulta */}
                      <td>
                        <span className="table-date-text">
                          {paciente.ultima_consulta 
                            ? new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'Sem registro'}
                        </span>
                      </td>

                      {/* Coluna 4: Inatividade */}
                      <td>
                        <span className={`table-days-pill pill-${paciente.riskLevel}`}>
                          <Clock size={12} />
                          {paciente.diasSemConsulta} dias
                        </span>
                      </td>

                      {/* Coluna 5: Score de Risco */}
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

                      {/* Coluna 6: Status */}
                      <td>
                        {paciente.hasFuture ? (
                          <span className="status-badge-scheduled">📅 Retorno Agendado</span>
                        ) : paciente.diasSemConsulta >= 30 ? (
                          <span className="status-badge-pending">⚠️ Pendente Retorno</span>
                        ) : (
                          <span className="status-badge-ok">✓ Em Dia</span>
                        )}
                      </td>

                      {/* Coluna 7: Ações */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-group" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="btn-action-evolution"
                            onClick={() => setSelectedPatient(paciente)}
                            title="Consultar evolução individual e bioimpedância"
                          >
                            <LineChart size={14} />
                            <span className="hide-mobile">Evolução</span>
                          </button>

                          {paciente.telefone && (
                            <a 
                              href={`https://wa.me/55${paciente.telefone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(paciente.nome)},%20aqui%20é%20da%20clínica%20VIVA%20NUTRI.%20Como%20está%20o%20seu%20plano%20alimentar?`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-icon btn-whatsapp"
                              title="Enviar WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}

                          <button 
                            className="btn-action-schedule"
                            onClick={(e) => handleQuickSchedule(paciente, e)}
                            title="Agendar retorno automático em 1 clique"
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
              <div className="empty-state-icon-wrapper">
                <CheckCircle2 size={40} className="empty-icon-success" />
                <Sparkles size={20} className="empty-icon-sparkle" />
              </div>
              <h3 className="empty-state-title">Nenhum paciente neste critério</h3>
              <p className="empty-state-text">
                Todos os pacientes filtrados estão com o ciclo clínico em dia ou não correspondem ao termo de busca informado.
              </p>
            </div>
          )}
        </section>

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

      {/* Modal de Cadastro de Novo Paciente */}
      {showNewPatientModal && (
        <NewPatientModal
          onClose={() => setShowNewPatientModal(false)}
          onCreated={() => loadData()}
          nutricionistaId={nutricionistaId}
        />
      )}
    </div>
  );
}

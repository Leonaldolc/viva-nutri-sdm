import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  FileText,
  TrendingDown,
  TrendingUp,
  Activity,
  Scale,
  Percent,
  Flame,
  LineChart,
  CalendarPlus,
  PlusCircle,
  Sparkles,
  Edit3,
  Save,
  Trash2,
  Coffee,
  Droplet,
  HeartPulse,
  Check
} from 'lucide-react';
import { 
  agendarConsulta, 
  adicionarMedicaoEvolucao, 
  atualizarPaciente, 
  excluirPaciente 
} from '../services/dashboardService';

export default function PatientProfileModal({ 
  paciente, 
  onClose, 
  onActionSuccess, 
  nutricionistaId 
}) {
  const [activeTab, setActiveTab] = useState('evolucao'); // 'evolucao' | 'prontuario' | 'nova-medicao' | 'agendar'
  const [selectedMetric, setSelectedMetric] = useState('peso'); // 'peso' | 'gordura' | 'massaMagra' | 'cintura' | 'adesao'

  // Estado para agendamento
  const [dataConsulta, setDataConsulta] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('Consulta de Retorno');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estado para nova medição
  const [novoPeso, setNovoPeso] = useState(paciente?.pesoAtual || '');
  const [novaGordura, setNovaGordura] = useState(paciente?.gorduraAtual || '');
  const [novaMassaMagra, setNovaMassaMagra] = useState(paciente?.massaMagraAtual || '');
  const [novaCintura, setNovaCintura] = useState(paciente?.cinturaAtual || '');
  const [novaAdesao, setNovaAdesao] = useState(paciente?.adesaoPlano || 85);
  const [novasNotas, setNovasNotas] = useState('');

  // ----------------------------------------------------
  // ESTADO PARA EDIÇÃO DIRETA DO PRONTUÁRIO (CRUD)
  // ----------------------------------------------------
  const [isEditingProntuario, setIsEditingProntuario] = useState(false);
  const [editNome, setEditNome] = useState(paciente?.nome || '');
  const [editDataNasc, setEditDataNasc] = useState(paciente?.dataNascimento || '');
  const [editSexo, setEditSexo] = useState(paciente?.sexo || 'Feminino');
  const [editTelefone, setEditTelefone] = useState(paciente?.telefone || '');
  const [editWhatsapp, setEditWhatsapp] = useState(paciente?.whatsapp || paciente?.telefone || '');
  const [editEmail, setEditEmail] = useState(paciente?.email || '');
  
  const [editPeso, setEditPeso] = useState(paciente?.pesoAtual || '');
  const [editAltura, setEditAltura] = useState(paciente?.altura || 170);
  const [editObjetivo, setEditObjetivo] = useState(paciente?.objetivo || '');
  const [editNivelAtiv, setEditNivelAtiv] = useState(paciente?.nivelAtividade || 'Sedentário');
  const [editPatologias, setEditPatologias] = useState(
    Array.isArray(paciente?.patologias) ? paciente.patologias.join(', ') : ''
  );
  const [editRestricoes, setEditRestricoes] = useState(
    Array.isArray(paciente?.restricoesAlimentares) ? paciente.restricoesAlimentares.join(', ') : ''
  );
  const [editAlergias, setEditAlergias] = useState(
    Array.isArray(paciente?.alergiasAlimentares) ? paciente.alergiasAlimentares.join(', ') : ''
  );
  const [editMedicamentos, setEditMedicamentos] = useState(paciente?.medicamentosContinuos || '');
  const [editSuplementos, setEditSuplementos] = useState(paciente?.suplementos || '');

  const [editRefeicoes, setEditRefeicoes] = useState(paciente?.refeicoesPorDia || 4);
  const [editAcorda, setEditAcorda] = useState(paciente?.horarioAcorda || '07:00');
  const [editDorme, setEditDorme] = useState(paciente?.horarioDorme || '23:00');
  const [editAgua, setEditAgua] = useState(paciente?.aguaPorDia || 2);
  const [editAtividadeFisica, setEditAtividadeFisica] = useState(Boolean(paciente?.praticaAtividadeFisica));
  const [editAtividadeDetalhes, setEditAtividadeDetalhes] = useState(paciente?.atividadeFisicaDetalhes || '');
  const [editObs, setEditObs] = useState(paciente?.observacoesGerais || '');

  if (!paciente) return null;

  const historico = paciente.historicoEvolucao && paciente.historicoEvolucao.length > 0 
    ? paciente.historicoEvolucao 
    : [
        { data: paciente.created_at || new Date().toISOString(), peso: paciente.pesoInicial || 75, gordura: paciente.gorduraInicial || 25, massaMagra: 30, cintura: 85, adesao: 80, notas: 'Consulta Inicial' },
        { data: paciente.ultima_consulta || new Date().toISOString(), peso: paciente.pesoAtual || 72, gordura: paciente.gorduraAtual || 22, massaMagra: 31, cintura: 80, adesao: 90, notas: 'Acompanhamento' }
      ];

  // Agendamento
  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!dataConsulta) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      await agendarConsulta({
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        dataConsulta: new Date(dataConsulta).toISOString(),
        tipo: tipoConsulta
      }, nutricionistaId);

      setSuccessMsg('Consulta de retorno agendada com sucesso!');
      setTimeout(() => {
        if (onActionSuccess) onActionSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao agendar consulta');
    } finally {
      setSubmitting(false);
    }
  };

  // Salvar Nova Medição
  const handleSalvarMedicao = async (e) => {
    e.preventDefault();
    if (!novoPeso) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      await adicionarMedicaoEvolucao(paciente.id, {
        peso: novoPeso,
        gordura: novaGordura,
        massaMagra: novaMassaMagra,
        cintura: novaCintura,
        adesao: novaAdesao,
        notas: novasNotas || 'Avaliação antropométrica e bioimpedância'
      }, nutricionistaId);

      setSuccessMsg('Nova medição de evolução registrada com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('evolucao');
        if (onActionSuccess) onActionSuccess();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao registrar medição');
    } finally {
      setSubmitting(false);
    }
  };

  // Salvar Edição do Prontuário (CRUD)
  const handleSalvarProntuario = async (e) => {
    e.preventDefault();
    if (!editNome.trim()) {
      setErrorMsg('O nome do paciente é obrigatório.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const patologiasArr = editPatologias ? editPatologias.split(',').map(s => s.trim()).filter(Boolean) : [];
      const restricoesArr = editRestricoes ? editRestricoes.split(',').map(s => s.trim()).filter(Boolean) : [];
      const alergiasArr = editAlergias ? editAlergias.split(',').map(s => s.trim()).filter(Boolean) : [];

      await atualizarPaciente(paciente.id, {
        nome: editNome.trim(),
        dataNascimento: editDataNasc,
        sexo: editSexo,
        telefone: editTelefone,
        whatsapp: editWhatsapp,
        email: editEmail,
        pesoAtual: editPeso ? Number(editPeso) : paciente.pesoAtual,
        altura: editAltura ? Number(editAltura) : paciente.altura,
        objetivo: editObjetivo.trim() || 'Saúde geral',
        nivelAtividade: editNivelAtiv,
        patologias: patologiasArr,
        restricoesAlimentares: restricoesArr,
        alergiasAlimentares: alergiasArr,
        medicamentosContinuos: editMedicamentos.trim(),
        suplementos: editSuplementos.trim(),
        refeicoesPorDia: Number(editRefeicoes) || 4,
        horarioAcorda: editAcorda,
        horarioDorme: editDorme,
        aguaPorDia: Number(editAgua) || 2,
        praticaAtividadeFisica: editAtividadeFisica,
        atividadeFisicaDetalhes: editAtividadeDetalhes.trim(),
        observacoesGerais: editObs.trim()
      }, nutricionistaId);

      setSuccessMsg('Dados do prontuário atualizados com sucesso!');
      setIsEditingProntuario(false);
      setTimeout(() => {
        setSuccessMsg('');
        if (onActionSuccess) onActionSuccess();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao atualizar paciente');
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir Paciente
  const handleExcluirPaciente = async () => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o prontuário de ${paciente.nome}? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setSubmitting(true);
    try {
      await excluirPaciente(paciente.id, nutricionistaId);
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao excluir paciente');
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos de Delta (Evolução)
  const pesoInicial = paciente.pesoInicial || historico[0]?.peso || 75;
  const pesoAtual = paciente.pesoAtual || historico[historico.length - 1]?.peso || 72;
  const deltaPeso = Math.round((pesoAtual - pesoInicial) * 10) / 10;

  const gorduraInicial = paciente.gorduraInicial || historico[0]?.gordura || 28;
  const gorduraAtual = paciente.gorduraAtual || historico[historico.length - 1]?.gordura || 24;
  const deltaGordura = Math.round((gorduraAtual - gorduraInicial) * 10) / 10;

  const massaInicial = paciente.massaMagraInicial || historico[0]?.massaMagra || 28;
  const massaAtual = paciente.massaMagraAtual || historico[historico.length - 1]?.massaMagra || 30;
  const deltaMassa = Math.round((massaAtual - massaInicial) * 10) / 10;

  const cinturaInicial = paciente.cinturaInicial || historico[0]?.cintura || 90;
  const cinturaAtual = paciente.cinturaAtual || historico[historico.length - 1]?.cintura || 84;
  const deltaCintura = Math.round((cinturaAtual - cinturaInicial) * 10) / 10;

  // Preparação de pontos do gráfico SVG dinâmico por métrica selecionada
  const metricConfig = {
    peso: { label: 'Peso Corporal', unit: 'kg', color: '#10B981', meta: paciente.pesoMeta || 70 },
    gordura: { label: 'Gordura Corporal', unit: '%', color: '#EF4444', meta: 20 },
    massaMagra: { label: 'Massa Magra', unit: 'kg', color: '#7C3AED', meta: 35 },
    cintura: { label: 'Circunferência Abdominal', unit: 'cm', color: '#F97316', meta: 80 },
    adesao: { label: 'Adesão ao Plano', unit: '%', color: '#3B82F6', meta: 90 }
  };

  const currentCfg = metricConfig[selectedMetric] || metricConfig.peso;
  const chartValues = historico.map(h => Number(h[selectedMetric] || 0));
  const minVal = Math.min(...chartValues, currentCfg.meta) * 0.92;
  const maxVal = Math.max(...chartValues, currentCfg.meta) * 1.08;
  const range = (maxVal - minVal) || 1;

  // Mapeamento de coordenadas SVG (viewBox 0 0 500 160)
  const svgPoints = historico.map((h, i) => {
    const x = historico.length > 1 ? 40 + (i / (historico.length - 1)) * 420 : 250;
    const val = Number(h[selectedMetric] || 0);
    const y = 140 - ((val - minVal) / range) * 110;
    return {
      x,
      y,
      val,
      data: new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    };
  });

  const pathD = svgPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = svgPoints.length > 0 
    ? `${pathD} L ${svgPoints[svgPoints.length - 1].x},150 L ${svgPoints[0].x},150 Z` 
    : '';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card patient-evolution-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        
        {/* Header do Paciente */}
        <header className="modal-header">
          <div className="patient-avatar-large">
            {paciente.nome ? paciente.nome.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="patient-header-info">
            <div className="patient-badge-row">
              <span className="badge-status-active">Paciente Ativo</span>
              <span className="badge-cat-pill">{paciente.objetivo}</span>
              {paciente.imc && (
                <span className="badge-imc-pill">IMC {paciente.imc}</span>
              )}
              {paciente.diasSemConsulta >= 30 && (
                <span className="badge-status-alert">
                  <AlertTriangle size={12} /> Sem retorno há {paciente.diasSemConsulta}d
                </span>
              )}
            </div>
            <h2 className="modal-title">{paciente.nome}</h2>
            <p className="modal-subtitle">
              {paciente.email || paciente.telefone || 'Sem contato'} • {paciente.consultasTotais || historico.length} consultas registradas
            </p>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </header>

        {/* Abas de Navegação Interna do Modal */}
        <div className="modal-tab-bar">
          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'evolucao' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('evolucao')}
          >
            <LineChart size={16} />
            <span>Evolução & Métricas</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'prontuario' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('prontuario')}
          >
            <FileText size={16} />
            <span>Prontuário Completo (CRUD)</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'nova-medicao' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('nova-medicao')}
          >
            <PlusCircle size={16} />
            <span>Lançar Medição</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'agendar' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('agendar')}
          >
            <CalendarPlus size={16} />
            <span>Agendar Retorno</span>
          </button>
        </div>

        <div className="modal-body">
          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================================
              ABA 1: EVOLUÇÃO INDIVIDUAL DO PACIENTE (ANALYTICS & BI)
              ========================================================================= */}
          {activeTab === 'evolucao' && (
            <div className="evolution-view-content">
              
              {/* Cards de Resumo Antropométrico e Deltas */}
              <div className="evolution-metrics-grid">
                <div className="evo-card">
                  <div className="evo-card-top">
                    <Scale size={16} className="evo-icon icon-purple" />
                    <span className="evo-label">Peso Corporal</span>
                  </div>
                  <div className="evo-val-row">
                    <span className="evo-val">{pesoAtual} <small>kg</small></span>
                    <span className={`evo-delta ${deltaPeso <= 0 ? 'delta-good' : 'delta-warn'}`}>
                      {deltaPeso <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      {deltaPeso > 0 ? `+${deltaPeso}` : deltaPeso} kg
                    </span>
                  </div>
                  <div className="evo-sub">Inicial: {pesoInicial}kg • Meta: {paciente.pesoMeta || 70}kg</div>
                </div>

                <div className="evo-card">
                  <div className="evo-card-top">
                    <Percent size={16} className="evo-icon icon-red" />
                    <span className="evo-label">% Gordura (BF)</span>
                  </div>
                  <div className="evo-val-row">
                    <span className="evo-val">{gorduraAtual} <small>%</small></span>
                    <span className={`evo-delta ${deltaGordura <= 0 ? 'delta-good' : 'delta-warn'}`}>
                      {deltaGordura <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      {deltaGordura > 0 ? `+${deltaGordura}` : deltaGordura}%
                    </span>
                  </div>
                  <div className="evo-sub">Inicial: {gorduraInicial}% • Bioimpedância</div>
                </div>

                <div className="evo-card">
                  <div className="evo-card-top">
                    <Activity size={16} className="evo-icon icon-green" />
                    <span className="evo-label">Massa Muscular</span>
                  </div>
                  <div className="evo-val-row">
                    <span className="evo-val">{massaAtual} <small>kg</small></span>
                    <span className={`evo-delta ${deltaMassa >= 0 ? 'delta-good' : 'delta-warn'}`}>
                      {deltaMassa >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {deltaMassa > 0 ? `+${deltaMassa}` : deltaMassa} kg
                    </span>
                  </div>
                  <div className="evo-sub">Inicial: {massaInicial}kg • Ganho magro</div>
                </div>

                <div className="evo-card">
                  <div className="evo-card-top">
                    <Flame size={16} className="evo-icon icon-orange" />
                    <span className="evo-label">Cintura / Abdômen</span>
                  </div>
                  <div className="evo-val-row">
                    <span className="evo-val">{cinturaAtual} <small>cm</small></span>
                    <span className={`evo-delta ${deltaCintura <= 0 ? 'delta-good' : 'delta-warn'}`}>
                      {deltaCintura <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      {deltaCintura > 0 ? `+${deltaCintura}` : deltaCintura} cm
                    </span>
                  </div>
                  <div className="evo-sub">Inicial: {cinturaInicial}cm • Medida</div>
                </div>
              </div>

              {/* Seletor de Métrica do Gráfico */}
              <div className="chart-metric-selector">
                <span className="selector-title">Visualizar Curva de Progresso:</span>
                <div className="metric-pills">
                  <button 
                    type="button"
                    className={`metric-pill ${selectedMetric === 'peso' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('peso')}
                  >
                    ⚖️ Peso (kg)
                  </button>
                  <button 
                    type="button"
                    className={`metric-pill ${selectedMetric === 'gordura' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('gordura')}
                  >
                    📉 Gordura (%)
                  </button>
                  <button 
                    type="button"
                    className={`metric-pill ${selectedMetric === 'massaMagra' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('massaMagra')}
                  >
                    💪 Massa Magra (kg)
                  </button>
                  <button 
                    type="button"
                    className={`metric-pill ${selectedMetric === 'cintura' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('cintura')}
                  >
                    📏 Cintura (cm)
                  </button>
                </div>
              </div>

              {/* SVG Gráfico de Tendência */}
              <div className="chart-svg-card">
                <div className="chart-svg-header">
                  <span className="chart-svg-title">{currentCfg.label} ao Longo das Consultas</span>
                  <span className="chart-meta-badge">Meta: {currentCfg.meta} {currentCfg.unit}</span>
                </div>

                <div className="svg-wrapper">
                  <svg viewBox="0 0 500 160" className="trend-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={currentCfg.color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={currentCfg.color} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="40" y1="30" x2="460" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                    <line x1="40" y1="85" x2="460" y2="85" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                    <line x1="40" y1="140" x2="460" y2="140" stroke="rgba(255,255,255,0.08)" />

                    {/* Area Fill */}
                    {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                    {/* Line Stroke */}
                    {pathD && (
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke={currentCfg.color} 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    )}

                    {/* Data Points */}
                    {svgPoints.map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke={currentCfg.color} strokeWidth="3" />
                        <text x={pt.x} y={pt.y - 10} fill="var(--text-main)" fontSize="11" fontWeight="700" textAnchor="middle">
                          {pt.val}{currentCfg.unit}
                        </text>
                        <text x={pt.x} y={154} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                          {pt.data}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              ABA 2: PRONTUÁRIO COMPLETO & EDIÇÃO DIRETA (CRUD)
              ========================================================================= */}
          {activeTab === 'prontuario' && (
            <div className="prontuario-crud-tab animated-fade-in">
              <div className="crud-toolbar">
                <div>
                  <h3 className="crud-section-title">Prontuário Cadastral do Paciente</h3>
                  <p className="crud-section-desc">Visualize e atualize diretamente todos os dados clínicos e hábitos.</p>
                </div>
                <div className="crud-actions-buttons">
                  {!isEditingProntuario ? (
                    <button 
                      type="button" 
                      className="btn-edit-mode"
                      onClick={() => setIsEditingProntuario(true)}
                    >
                      <Edit3 size={15} />
                      <span>Editar Dados</span>
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn-cancel-edit"
                      onClick={() => setIsEditingProntuario(false)}
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="btn-delete-patient"
                    onClick={handleExcluirPaciente}
                    title="Excluir paciente permanentemente"
                  >
                    <Trash2 size={15} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              {isEditingProntuario ? (
                /* Formulário de Edição Completo */
                <form onSubmit={handleSalvarProntuario} className="crud-edit-form">
                  <div className="crud-category-box">
                    <h4 className="crud-cat-title"><User size={16} /> 1. Dados Pessoais</h4>
                    <div className="form-row grid-2">
                      <div className="form-group">
                        <label className="form-label">Nome Completo *</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editNome} 
                          onChange={(e) => setEditNome(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Data de Nascimento</label>
                        <input 
                          type="date" 
                          className="form-input"
                          value={editDataNasc} 
                          onChange={(e) => setEditDataNasc(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Telefone</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editTelefone} 
                          onChange={(e) => setEditTelefone(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">WhatsApp</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editWhatsapp} 
                          onChange={(e) => setEditWhatsapp(e.target.value)} 
                        />
                      </div>
                      <div className="form-group full-grid-width">
                        <label className="form-label">E-mail</label>
                        <input 
                          type="email" 
                          className="form-input"
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="crud-category-box">
                    <h4 className="crud-cat-title"><Activity size={16} /> 2. Dados Clínicos & Antropometria</h4>
                    <div className="form-row grid-2">
                      <div className="form-group">
                        <label className="form-label">Peso Atual (kg)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          className="form-input"
                          value={editPeso} 
                          onChange={(e) => setEditPeso(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Altura (cm)</label>
                        <input 
                          type="number" 
                          className="form-input"
                          value={editAltura} 
                          onChange={(e) => setEditAltura(e.target.value)} 
                        />
                      </div>
                      <div className="form-group full-grid-width">
                        <label className="form-label">Objetivo Nutricional</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editObjetivo} 
                          onChange={(e) => setEditObjetivo(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Patologias (separadas por vírgula)</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editPatologias} 
                          onChange={(e) => setEditPatologias(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Restrições Alimentares</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editRestricoes} 
                          onChange={(e) => setEditRestricoes(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Alergias</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editAlergias} 
                          onChange={(e) => setEditAlergias(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Medicamentos Contínuos</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editMedicamentos} 
                          onChange={(e) => setEditMedicamentos(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="crud-category-box">
                    <h4 className="crud-cat-title"><Coffee size={16} /> 3. Hábitos & Rotina</h4>
                    <div className="form-row grid-2">
                      <div className="form-group">
                        <label className="form-label">Refeições por dia</label>
                        <input 
                          type="number" 
                          className="form-input"
                          value={editRefeicoes} 
                          onChange={(e) => setEditRefeicoes(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Água por dia (litros)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          className="form-input"
                          value={editAgua} 
                          onChange={(e) => setEditAgua(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Horário que Acorda</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editAcorda} 
                          onChange={(e) => setEditAcorda(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Horário que Dorme</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editDorme} 
                          onChange={(e) => setEditDorme(e.target.value)} 
                        />
                      </div>
                      <div className="form-group full-grid-width">
                        <label className="form-label">Observações Gerais</label>
                        <textarea 
                          className="form-input" 
                          rows="3"
                          value={editObs} 
                          onChange={(e) => setEditObs(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-submit-row">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setIsEditingProntuario(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      <Save size={16} />
                      <span>{submitting ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Visualização Detalhada de Leitura do Prontuário */
                <div className="crud-view-details">
                  <div className="detail-cards-grid">
                    {/* Card Pessoal */}
                    <div className="detail-info-block">
                      <div className="block-header">
                        <User size={16} /> <span>1. Informações Pessoais</span>
                      </div>
                      <div className="block-rows">
                        <div className="info-item"><span className="lbl">Nome:</span> <strong>{paciente.nome}</strong></div>
                        <div className="info-item"><span className="lbl">Data de Nasc.:</span> <span>{paciente.dataNascimento || 'Não informado'} {paciente.idade ? `(${paciente.idade} anos)` : ''}</span></div>
                        <div className="info-item"><span className="lbl">Sexo:</span> <span>{paciente.sexo || 'Não informado'}</span></div>
                        <div className="info-item"><span className="lbl">Telefone:</span> <span>{paciente.telefone || 'Não informado'}</span></div>
                        <div className="info-item"><span className="lbl">WhatsApp:</span> <span>{paciente.whatsapp || paciente.telefone || 'Não informado'}</span></div>
                        <div className="info-item"><span className="lbl">E-mail:</span> <span>{paciente.email || 'Não informado'}</span></div>
                      </div>
                    </div>

                    {/* Card Clínico */}
                    <div className="detail-info-block">
                      <div className="block-header">
                        <Activity size={16} /> <span>2. Perfil Clínico & Antropometria</span>
                      </div>
                      <div className="block-rows">
                        <div className="info-item"><span className="lbl">Peso Atual:</span> <strong>{paciente.pesoAtual || '--'} kg</strong></div>
                        <div className="info-item"><span className="lbl">Altura:</span> <span>{paciente.altura ? `${paciente.altura} cm` : 'Não informado'}</span></div>
                        <div className="info-item"><span className="lbl">IMC:</span> <span className="highlight-pill">{paciente.imc || '--'}</span></div>
                        <div className="info-item"><span className="lbl">Objetivo:</span> <span>{paciente.objetivo || 'Saúde geral'}</span></div>
                        <div className="info-item"><span className="lbl">Nível de Atividade:</span> <span>{paciente.nivelAtividade || 'Sedentário'}</span></div>
                        <div className="info-item"><span className="lbl">Patologias:</span> <span>{Array.isArray(paciente.patologias) && paciente.patologias.length > 0 ? paciente.patologias.join(', ') : 'Nenhuma relatada'}</span></div>
                        <div className="info-item"><span className="lbl">Restrições:</span> <span>{Array.isArray(paciente.restricoesAlimentares) && paciente.restricoesAlimentares.length > 0 ? paciente.restricoesAlimentares.join(', ') : 'Nenhuma'}</span></div>
                        <div className="info-item"><span className="lbl">Alergias:</span> <span>{Array.isArray(paciente.alergiasAlimentares) && paciente.alergiasAlimentares.length > 0 ? paciente.alergiasAlimentares.join(', ') : 'Nenhuma'}</span></div>
                      </div>
                    </div>

                    {/* Card Hábitos */}
                    <div className="detail-info-block full-width-block">
                      <div className="block-header">
                        <Coffee size={16} /> <span>3. Hábitos de Vida & Rotina</span>
                      </div>
                      <div className="block-rows triple-grid">
                        <div className="info-item"><span className="lbl">Refeições/dia:</span> <strong>{paciente.refeicoesPorDia || 4}</strong></div>
                        <div className="info-item"><span className="lbl">Ingestão Hídrica:</span> <strong>{paciente.aguaPorDia || 2} litros</strong></div>
                        <div className="info-item"><span className="lbl">Acorda / Dorme:</span> <span>{paciente.horarioAcorda || '07:00'} → {paciente.horarioDorme || '23:00'}</span></div>
                        <div className="info-item"><span className="lbl">Atividade Física:</span> <span>{paciente.praticaAtividadeFisica ? `Sim (${paciente.atividadeFisicaDetalhes || 'Regular'})` : 'Não pratica'}</span></div>
                        <div className="info-item"><span className="lbl">Medicamentos:</span> <span>{paciente.medicamentosContinuos || 'Nenhum'}</span></div>
                        <div className="info-item"><span className="lbl">Suplementos:</span> <span>{paciente.suplementos || 'Nenhum'}</span></div>
                      </div>
                      {paciente.observacoesGerais && (
                        <div className="obs-block" style={{ marginTop: '10px' }}>
                          <span className="lbl">Observações:</span>
                          <p className="obs-text">{paciente.observacoesGerais}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              ABA 3: LANÇAR NOVA MEDIÇÃO
              ========================================================================= */}
          {activeTab === 'nova-medicao' && (
            <form onSubmit={handleSalvarMedicao} className="modal-new-metric-tab">
              <div className="metric-input-grid">
                <div className="form-group">
                  <label className="form-label">Peso Atual (kg) *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="Ex: 78.4" 
                    value={novoPeso} 
                    onChange={(e) => setNovoPeso(e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">% Gordura Corporal (BF)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="Ex: 22.5" 
                    value={novaGordura} 
                    onChange={(e) => setNovaGordura(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Massa Muscular (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="Ex: 31.2" 
                    value={novaMassaMagra} 
                    onChange={(e) => setNovaMassaMagra(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Circunferência Abdominal (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-input" 
                    placeholder="Ex: 84.0" 
                    value={novaCintura} 
                    onChange={(e) => setNovaCintura(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Anotações Clínicas / Conduta Nutricional</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Ex: Paciente relatou melhora na disposição. Reduzido aporte de sódio e aumentado proteínas pré-treino." 
                  value={novasNotas} 
                  onChange={(e) => setNovasNotas(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setActiveTab('evolucao')}
                >
                  Voltar para o Gráfico
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting || !novoPeso}
                >
                  {submitting ? 'Salvando...' : 'Salvar e Atualizar Gráfico'}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              ABA 4: AGENDAR RETORNO
              ========================================================================= */}
          {activeTab === 'agendar' && (
            <form onSubmit={handleSchedule} className="modal-schedule-tab">
              <div className="schedule-prompt" style={{ marginBottom: '16px' }}>
                <div>
                  <h4>Marcar Próxima Consulta de Retorno</h4>
                  <p>Garanta o acompanhamento contínuo para evitar que o paciente entre na faixa de risco de evasão.</p>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Data e Horário do Retorno *</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={dataConsulta} 
                    onChange={(e) => setDataConsulta(e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tipo da Consulta</label>
                  <select 
                    className="form-input" 
                    value={tipoConsulta}
                    onChange={(e) => setTipoConsulta(e.target.value)}
                  >
                    <option value="Consulta de Retorno">Consulta de Retorno</option>
                    <option value="Bioimpedância e Medidas">Bioimpedância e Medidas</option>
                    <option value="Ajuste de Cardápio">Ajuste de Cardápio</option>
                    <option value="Avaliação Nutricional Completa">Avaliação Nutricional Completa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setActiveTab('evolucao')}
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting || !dataConsulta}
                >
                  {submitting ? 'Agendando...' : 'Confirmar Agendamento de Retorno'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

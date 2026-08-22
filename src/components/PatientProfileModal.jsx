import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { agendarConsulta, adicionarMedicaoEvolucao } from '../services/dashboardService';

export default function PatientProfileModal({ paciente, onClose, onActionSuccess, nutricionistaId }) {
  const [activeTab, setActiveTab] = useState('evolucao'); // 'evolucao' | 'nova-medicao' | 'agendar'
  const [selectedMetric, setSelectedMetric] = useState('peso'); // 'peso' | 'gordura' | 'massaMagra' | 'cintura' | 'adesao'

  // Estado para agendamento
  const [dataConsulta, setDataConsulta] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('Consulta de Retorno');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Estado para nova medição
  const [novoPeso, setNovoPeso] = useState(paciente?.pesoAtual || '');
  const [novaGordura, setNovaGordura] = useState(paciente?.gorduraAtual || '');
  const [novaMassaMagra, setNovaMassaMagra] = useState(paciente?.massaMagraAtual || '');
  const [novaCintura, setNovaCintura] = useState(paciente?.cinturaAtual || '');
  const [novaAdesao, setNovaAdesao] = useState(paciente?.adesaoPlano || 85);
  const [novasNotas, setNovasNotas] = useState('');

  if (!paciente) return null;

  const historico = paciente.historicoEvolucao && paciente.historicoEvolucao.length > 0 
    ? paciente.historicoEvolucao 
    : [
        { data: paciente.created_at || new Date().toISOString(), peso: paciente.pesoInicial || 75, gordura: paciente.gorduraInicial || 25, massaMagra: 30, cintura: 85, adesao: 80, notas: 'Consulta Inicial' },
        { data: paciente.ultima_consulta || new Date().toISOString(), peso: paciente.pesoAtual || 72, gordura: paciente.gorduraAtual || 22, massaMagra: 31, cintura: 80, adesao: 90, notas: 'Acompanhamento' }
      ];

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!dataConsulta) return;

    setSubmitting(true);
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
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSalvarMedicao = async (e) => {
    e.preventDefault();
    if (!novoPeso) return;

    setSubmitting(true);
    try {
      const updated = await adicionarMedicaoEvolucao(paciente.id, {
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
      console.error(err);
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
    peso: { label: 'Peso Corporal', unit: 'kg', color: '#7C3AED', meta: paciente.pesoMeta || 70 },
    gordura: { label: 'Gordura Corporal', unit: '%', color: '#EF4444', meta: 20 },
    massaMagra: { label: 'Massa Magra', unit: 'kg', color: '#10B981', meta: 35 },
    cintura: { label: 'Circunferência Abdominal', unit: 'cm', color: '#F97316', meta: 80 },
    adesao: { label: 'Adesão ao Plano', unit: '%', color: '#6366F1', meta: 90 }
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
            {paciente.nome.charAt(0).toUpperCase()}
          </div>
          <div className="patient-header-info">
            <div className="patient-badge-row">
              <span className="badge-status-active">Paciente Ativo</span>
              <span className="badge-cat-pill">{paciente.objetivo}</span>
              {paciente.diasSemConsulta >= 30 && (
                <span className="badge-status-alert">
                  <AlertTriangle size={12} /> Sem retorno há {paciente.diasSemConsulta}d
                </span>
              )}
            </div>
            <h2 className="modal-title">{paciente.nome}</h2>
            <p className="modal-subtitle">
              {paciente.email || paciente.telefone} • {paciente.consultasTotais || historico.length} consultas registradas
            </p>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </header>

        {/* Abas de Navegação Interna do Modal */}
        <div className="modal-tab-bar">
          <button 
            className={`modal-tab-btn ${activeTab === 'evolucao' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('evolucao')}
          >
            <LineChart size={16} />
            <span>Evolução & Métricas</span>
          </button>

          <button 
            className={`modal-tab-btn ${activeTab === 'nova-medicao' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('nova-medicao')}
          >
            <PlusCircle size={16} />
            <span>Lançar Nova Medição</span>
          </button>

          <button 
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
                    className={`metric-pill ${selectedMetric === 'peso' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('peso')}
                  >
                    ⚖️ Peso (kg)
                  </button>
                  <button 
                    className={`metric-pill ${selectedMetric === 'gordura' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('gordura')}
                  >
                    📉 % Gordura
                  </button>
                  <button 
                    className={`metric-pill ${selectedMetric === 'massaMagra' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('massaMagra')}
                  >
                    💪 Massa Magra
                  </button>
                  <button 
                    className={`metric-pill ${selectedMetric === 'cintura' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('cintura')}
                  >
                    📏 Cintura (cm)
                  </button>
                  <button 
                    className={`metric-pill ${selectedMetric === 'adesao' ? 'metric-pill-active' : ''}`}
                    onClick={() => setSelectedMetric('adesao')}
                  >
                    🥗 Adesão (%)
                  </button>
                </div>
              </div>

              {/* Gráfico Dinâmico de Linha em SVG */}
              <div className="individual-chart-card">
                <div className="chart-info-bar">
                  <span className="chart-current-label">
                    <strong>{currentCfg.label}</strong> ao longo das avaliações
                  </span>
                  <span className="chart-meta-badge">
                    Meta Estipulada: {currentCfg.meta} {currentCfg.unit}
                  </span>
                </div>

                <div className="individual-svg-wrapper">
                  <svg viewBox="0 0 500 170" className="individual-chart-svg">
                    <defs>
                      <linearGradient id="indivGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentCfg.color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={currentCfg.color} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Linha de Grade de Fundo */}
                    <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(226, 232, 240, 0.4)" strokeDasharray="3 3" />
                    <line x1="30" y1="80" x2="470" y2="80" stroke="rgba(226, 232, 240, 0.4)" strokeDasharray="3 3" />
                    <line x1="30" y1="130" x2="470" y2="130" stroke="rgba(226, 232, 240, 0.4)" strokeDasharray="3 3" />

                    {/* Área Preenchida */}
                    {areaD && <path d={areaD} fill="url(#indivGrad)" />}

                    {/* Curva de Tendência */}
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

                    {/* Pontos de Dados com Valores */}
                    {svgPoints.map((pt, idx) => (
                      <g key={idx} className="chart-node-group">
                        <circle cx={pt.x} cy={pt.y} r="5.5" fill="#FFFFFF" stroke={currentCfg.color} strokeWidth="3" />
                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="chart-val-bubble">
                          {pt.val} {currentCfg.unit}
                        </text>
                        <text x={pt.x} y="162" textAnchor="middle" className="chart-date-label">
                          {pt.data}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Tabela de Linha do Tempo das Avaliações */}
              <div className="evolution-timeline-section">
                <h4 className="timeline-heading">Linha do Tempo das Consultas & Antropometria</h4>
                <div className="timeline-table-wrapper">
                  <table className="timeline-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Peso</th>
                        <th>% Gordura</th>
                        <th>Massa Magra</th>
                        <th>Cintura</th>
                        <th>Adesão</th>
                        <th>Conduta / Anotações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.slice().reverse().map((reg, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>
                            {new Date(reg.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td><strong>{reg.peso} kg</strong></td>
                          <td>{reg.gordura}%</td>
                          <td>{reg.massaMagra} kg</td>
                          <td>{reg.cintura} cm</td>
                          <td>
                            <span className="badge-status-active">{reg.adesao}%</span>
                          </td>
                          <td className="timeline-notes-cell">{reg.notas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              ABA 2: LANÇAR NOVA MEDIÇÃO / AVALIAÇÃO DE EVOLUÇÃO
              ========================================================================= */}
          {activeTab === 'nova-medicao' && (
            <form onSubmit={handleSalvarMedicao} className="new-measurement-form">
              <div className="form-info-banner">
                <Sparkles size={18} />
                <span>Registre os novos dados da pesagem e bioimpedância de hoje para plotar na curva de evolução.</span>
              </div>

              <div className="form-grid-2x2">
                <div className="form-group">
                  <label className="form-label">Peso Atual (kg) *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="Ex: 78.5" 
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
                    placeholder="Ex: 24.2" 
                    value={novaGordura} 
                    onChange={(e) => setNovaGordura(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Massa Muscular / Magra (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="Ex: 32.5" 
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
                    placeholder="Ex: 86.0" 
                    value={novaCintura} 
                    onChange={(e) => setNovaCintura(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Taxa Estimada de Adesão ao Plano ({novaAdesao}%)</label>
                <input 
                  type="range" 
                  min="30" 
                  max="100" 
                  className="form-range" 
                  value={novaAdesao} 
                  onChange={(e) => setNovaAdesao(e.target.value)} 
                />
              </div>

              <div className="form-group">
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
              ABA 3: AGENDAR RETORNO
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

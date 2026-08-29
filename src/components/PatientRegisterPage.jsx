import React, { useState, useMemo } from 'react';
import { 
  User, 
  Activity, 
  Coffee, 
  Calendar, 
  Phone, 
  Mail, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Clock, 
  Droplet, 
  Sparkles,
  HeartPulse,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react';
import { cadastrarPaciente } from '../services/dashboardService';

export default function PatientRegisterPage({ 
  nutricionistaId, 
  onCancel, 
  onPatientCreated 
}) {
  const [activeTab, setActiveTab] = useState('pessoal'); // 'pessoal' | 'clinico' | 'habitos'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // ----------------------------------------------------
  // ABA 1 — PESSOAL
  // ----------------------------------------------------
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState(''); // 'Feminino' | 'Masculino' | 'Outro'
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // ----------------------------------------------------
  // ABA 2 — CLÍNICO
  // ----------------------------------------------------
  const [pesoAtual, setPesoAtual] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivos, setObjetivos] = useState([]);
  const [objetivoDetalhes, setObjetivoDetalhes] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('Sedentário');
  
  // Patologias
  const [patologias, setPatologias] = useState([]);
  const [customPatologia, setCustomPatologia] = useState('');
  
  // Restrições
  const [restricoes, setRestricoes] = useState([]);
  const [customRestricao, setCustomRestricao] = useState('');
  
  // Alergias
  const [alergias, setAlergias] = useState([]);
  const [customAlergia, setCustomAlergia] = useState('');
  
  const [medicamentosContinuos, setMedicamentosContinuos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // ----------------------------------------------------
  // ABA 3 — HÁBITOS
  // ----------------------------------------------------
  const [refeicoesPorDia, setRefeicoesPorDia] = useState(4);
  const [horarioAcordaInput, setHorarioAcordaInput] = useState('07:00');
  const [horarioDormeInput, setHorarioDormeInput] = useState('23:00');
  const [aguaPorDia, setAguaPorDia] = useState('2.5');
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState(false);
  const [atividadeFisicaDetalhes, setAtividadeFisicaDetalhes] = useState('');
  const [observacoesGerais, setObservacoesGerais] = useState('');

  // ====================================================
  // HELPERS & CÁLCULOS AUTOMÁTICOS
  // ====================================================

  // 1. Cálculo automático da idade a partir da data de nascimento
  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return null;
    const nasc = new Date(dataNascimento);
    if (isNaN(nasc.getTime())) return null;
    const hoje = new Date();
    let anos = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      anos--;
    }
    return anos >= 0 ? anos : null;
  }, [dataNascimento]);

  // 2. Cálculo automático do IMC a partir de peso e altura
  const { imcCalculado, imcStatus, imcColor } = useMemo(() => {
    const p = parseFloat(pesoAtual);
    const a = parseFloat(altura);
    if (!p || !a || a <= 0 || p <= 0) {
      return { imcCalculado: null, imcStatus: 'Aguardando peso e altura', imcColor: 'muted' };
    }
    const alturaMetros = a / 100;
    const imc = p / (alturaMetros * alturaMetros);
    const imcFormatado = Number(imc.toFixed(1));

    let status = 'Normal';
    let color = 'green';

    if (imcFormatado < 18.5) {
      status = 'Abaixo do peso';
      color = 'blue';
    } else if (imcFormatado >= 18.5 && imcFormatado <= 24.9) {
      status = 'Peso saudável (Eutrofia)';
      color = 'green';
    } else if (imcFormatado >= 25 && imcFormatado <= 29.9) {
      status = 'Sobrepeso';
      color = 'orange';
    } else if (imcFormatado >= 30 && imcFormatado <= 34.9) {
      status = 'Obesidade Grau I';
      color = 'red';
    } else if (imcFormatado >= 35 && imcFormatado <= 39.9) {
      status = 'Obesidade Grau II';
      color = 'red';
    } else {
      status = 'Obesidade Grau III (Mórbida)';
      color = 'red';
    }

    return { imcCalculado: imcFormatado, imcStatus: status, imcColor: color };
  }, [pesoAtual, altura]);

  // 3. Formatador de telefone/celular: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const formatPhoneNumber = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleTelefoneChange = (e) => {
    setTelefone(formatPhoneNumber(e.target.value));
  };

  const handleWhatsappChange = (e) => {
    setWhatsapp(formatPhoneNumber(e.target.value));
  };

  const copiarTelefoneParaWhatsapp = () => {
    if (telefone) setWhatsapp(telefone);
  };

  // 4. Conversor inteligente de número para hora (ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00)
  const formatSmartTime = (raw) => {
    if (!raw) return '';
    const clean = raw.toString().trim().replace(':', '');
    if (!clean) return '';

    if (clean.length === 1 || clean.length === 2) {
      let h = parseInt(clean, 10);
      if (isNaN(h)) return raw;
      if (h < 0) h = 0;
      if (h > 23) h = 23;
      return `${h.toString().padStart(2, '0')}:00`;
    }

    if (clean.length === 3) {
      // ex: 630 -> 06:30
      let h = parseInt(clean.slice(0, 1), 10);
      let m = parseInt(clean.slice(1, 3), 10);
      if (isNaN(h) || isNaN(m)) return raw;
      if (m > 59) m = 59;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    if (clean.length >= 4) {
      // ex: 2230 -> 22:30
      let h = parseInt(clean.slice(0, 2), 10);
      let m = parseInt(clean.slice(2, 4), 10);
      if (isNaN(h) || isNaN(m)) return raw;
      if (h > 23) h = 23;
      if (m > 59) m = 59;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    return raw;
  };

  // 5. Gerenciadores de Chips Múltipla Escolha com opção "Nenhum"
  const toggleChipWithNone = (list, setList, item) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    let next = list.filter(i => i !== 'Nenhum');
    if (next.includes(item)) {
      next = next.filter(i => i !== item);
    } else {
      next.push(item);
    }
    setList(next);
  };

  const addCustomItem = (list, setList, customVal, setCustomVal) => {
    const val = customVal.trim();
    if (!val) return;
    let next = list.filter(i => i !== 'Nenhum');
    if (!next.includes(val)) {
      next.push(val);
    }
    setList(next);
    setCustomVal('');
  };

  const removeChip = (list, setList, itemToRemove) => {
    setList(list.filter(i => i !== itemToRemove));
  };

  const toggleObjective = (obj) => {
    if (objetivos.includes(obj)) {
      setObjetivos(objetivos.filter(o => o !== obj));
    } else {
      setObjetivos([...objetivos, obj]);
    }
  };

  // ====================================================
  // SUBMISSÃO DO FORMULÁRIO
  // ====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validação de regra: O único campo obrigatório é o nome completo
    if (!nome.trim()) {
      setActiveTab('pessoal');
      setError('O campo Nome Completo é obrigatório para cadastrar o paciente.');
      return;
    }

    setLoading(true);

    try {
      const pacientePayload = {
        // Pessoal
        nome: nome.trim(),
        dataNascimento,
        idade: idadeCalculada,
        sexo,
        telefone,
        whatsapp: whatsapp || telefone,
        email: email.trim(),

        // Clínico
        pesoAtual: pesoAtual ? parseFloat(pesoAtual) : null,
        altura: altura ? parseFloat(altura) : null,
        imc: imcCalculado,
        objetivos: objetivos.length > 0 ? objetivos : ['Saúde geral'],
        objetivoDetalhes: objetivoDetalhes.trim(),
        nivelAtividade,
        patologias,
        restricoesAlimentares: restricoes,
        alergiasAlimentares: alergias,
        medicamentosContinuos: medicamentosContinuos.trim(),
        suplementos: suplementos.trim(),

        // Hábitos
        refeicoesPorDia: parseInt(refeicoesPorDia, 10) || 4,
        horarioAcorda: formatSmartTime(horarioAcordaInput) || '07:00',
        horarioDorme: formatSmartTime(horarioDormeInput) || '23:00',
        aguaPorDia: parseFloat(aguaPorDia) || 2,
        praticaAtividadeFisica,
        atividadeFisicaDetalhes: praticaAtividadeFisica ? atividadeFisicaDetalhes.trim() : '',
        observacoesGerais: observacoesGerais.trim()
      };

      const novoPaciente = await cadastrarPaciente(pacientePayload, nutricionistaId);
      
      setSuccessToast(`Paciente ${novoPaciente.nome} cadastrado com sucesso!`);

      // Após salvar, redireciona para o perfil do paciente recém cadastrado
      setTimeout(() => {
        if (onPatientCreated) {
          onPatientCreated(novoPaciente);
        }
      }, 1200);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao realizar o cadastro do paciente.');
    } finally {
      setLoading(false);
    }
  };

  // Opções padrão
  const defaultObjetivos = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar'
  ];

  const defaultPatologias = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto'
  ];

  const defaultRestricoes = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar'
  ];

  const defaultAlergias = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar'
  ];

  const niveisAtividade = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Extremamente ativo'
  ];

  return (
    <div className="patient-register-container">
      {/* Toast Notification */}
      {successToast && (
        <div className="alert alert-success toast-notice" role="status">
          <CheckCircle2 size={20} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header com Botão Voltar */}
      <div className="register-header-panel">
        <div className="header-nav-left">
          <button 
            type="button" 
            className="btn-back-link" 
            onClick={onCancel}
            title="Voltar para a lista de pacientes"
          >
            <ArrowLeft size={18} />
            <span>Voltar para Lista</span>
          </button>
          <div>
            <h1 className="register-title">Novo Paciente</h1>
            <p className="register-subtitle">
              Preencha os dados pessoais, clínicos e hábitos para criar o prontuário nutricional.
            </p>
          </div>
        </div>

        <div className="header-save-actions">
          <button 
            type="button" 
            className="btn-cancel-flat" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-save-primary" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            <Save size={18} />
            <span>{loading ? 'Salvando Prontuário...' : 'Salvar Paciente'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error register-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Navegação de Abas do Formulário */}
      <div className="register-tabs-nav">
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'pessoal' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('pessoal')}
        >
          <User size={18} className="tab-icon" />
          <span className="tab-text">1. Dados Pessoais</span>
          {nome.trim() && <span className="tab-status-dot" title="Nome preenchido" />}
        </button>

        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'clinico' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('clinico')}
        >
          <Activity size={18} className="tab-icon" />
          <span className="tab-text">2. Perfil Clínico & Antropometria</span>
          {imcCalculado && <span className="tab-status-dot" title="IMC calculado" />}
        </button>

        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'habitos' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('habitos')}
        >
          <Coffee size={18} className="tab-icon" />
          <span className="tab-text">3. Hábitos & Rotina</span>
        </button>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="register-form-body">
        
        {/* ========================================================
            ABA 1: DADOS PESSOAIS
            ======================================================== */}
        {activeTab === 'pessoal' && (
          <section className="form-tab-section animated-fade-in">
            <div className="section-intro">
              <h2 className="section-title">Informações de Contato e Identificação</h2>
              <p className="section-desc">Identificação do paciente e canais para lembretes e agendamentos.</p>
            </div>

            <div className="form-fields-grid">
              {/* Nome Completo (Obrigatório) */}
              <div className="field-group full-width">
                <label className="field-label">
                  Nome Completo <span className="field-required">*</span>
                </label>
                <input 
                  type="text"
                  className="field-input"
                  placeholder="Ex: Larissa Fernandes Monteiro"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoFocus
                  required
                />
                <span className="field-hint">O nome completo é o único campo obrigatório do cadastro.</span>
              </div>

              {/* Data de Nascimento + Cálculo de Idade */}
              <div className="field-group">
                <label className="field-label">Data de Nascimento</label>
                <div className="input-with-pill-wrapper">
                  <input 
                    type="date"
                    className="field-input"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />
                  {idadeCalculada !== null && (
                    <span className="auto-calc-badge" title="Idade calculada automaticamente">
                      ✨ {idadeCalculada} anos
                    </span>
                  )}
                </div>
              </div>

              {/* Sexo */}
              <div className="field-group">
                <label className="field-label">Sexo</label>
                <div className="segmented-selector">
                  {['Feminino', 'Masculino', 'Outro'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`seg-btn ${sexo === item ? 'seg-btn-active' : ''}`}
                      onClick={() => setSexo(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telefone */}
              <div className="field-group">
                <label className="field-label">Telefone</label>
                <div className="input-icon-wrapper">
                  <Phone size={16} className="input-lead-icon" />
                  <input 
                    type="tel"
                    className="field-input with-lead-icon"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={handleTelefoneChange}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="field-group">
                <div className="field-label-row">
                  <label className="field-label">WhatsApp</label>
                  {telefone && (
                    <button 
                      type="button" 
                      className="btn-link-action"
                      onClick={copiarTelefoneParaWhatsapp}
                    >
                      Mesmo do telefone
                    </button>
                  )}
                </div>
                <div className="input-icon-wrapper">
                  <Phone size={16} className="input-lead-icon icon-green" />
                  <input 
                    type="tel"
                    className="field-input with-lead-icon"
                    placeholder="(11) 99999-9999"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="field-group full-width">
                <label className="field-label">E-mail</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-lead-icon" />
                  <input 
                    type="email"
                    className="field-input with-lead-icon"
                    placeholder="paciente@exemplo.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="tab-footer-nav">
              <button 
                type="button" 
                className="btn-next-tab"
                onClick={() => setActiveTab('clinico')}
              >
                <span>Avançar para Perfil Clínico ➔</span>
              </button>
            </div>
          </section>
        )}

        {/* ========================================================
            ABA 2: CLÍNICO & ANTROPOMETRIA
            ======================================================== */}
        {activeTab === 'clinico' && (
          <section className="form-tab-section animated-fade-in">
            <div className="section-intro">
              <h2 className="section-title">Dados Clínicos, IMC e Antropometria</h2>
              <p className="section-desc">Avaliação inicial para traçar metas nutricionais personalizadas.</p>
            </div>

            {/* Caixa de Peso, Altura e IMC Automático */}
            <div className="imc-calc-container">
              <div className="imc-inputs-row">
                <div className="field-group">
                  <label className="field-label">Peso Atual</label>
                  <div className="unit-input-wrapper">
                    <input 
                      type="number"
                      step="0.1"
                      className="field-input unit-input"
                      placeholder="Ex: 72.5"
                      value={pesoAtual}
                      onChange={(e) => setPesoAtual(e.target.value)}
                    />
                    <span className="unit-suffix">kg</span>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Altura</label>
                  <div className="unit-input-wrapper">
                    <input 
                      type="number"
                      step="1"
                      className="field-input unit-input"
                      placeholder="Ex: 175"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                    />
                    <span className="unit-suffix">cm</span>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">IMC (Cálculo Automático)</label>
                  <div className={`imc-result-box imc-status-${imcColor}`}>
                    <div className="imc-number">
                      {imcCalculado !== null ? imcCalculado : '--'}
                    </div>
                    <div className="imc-text-info">
                      <span className="imc-status-name">{imcStatus}</span>
                      <span className="imc-formula-hint">Peso (kg) ÷ Altura (m)²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-divider" />

            {/* Objetivos Nutricionais (Múltipla Escolha + Campo Livre) */}
            <div className="field-group full-width">
              <label className="field-label">Objetivo Nutricional (Selecione um ou mais)</label>
              <div className="chips-multi-select-grid">
                {defaultObjetivos.map((obj) => {
                  const isSelected = objetivos.includes(obj);
                  return (
                    <button
                      key={obj}
                      type="button"
                      className={`chip-select-btn ${isSelected ? 'chip-selected' : ''}`}
                      onClick={() => toggleObjective(obj)}
                    >
                      <span className="chip-check-icon">{isSelected ? '✓' : '+'}</span>
                      <span>{obj}</span>
                    </button>
                  );
                })}
              </div>

              <div className="additional-text-wrapper" style={{ marginTop: '10px' }}>
                <input 
                  type="text"
                  className="field-input"
                  placeholder="Detalhes adicionais do objetivo (ex: perder 6kg antes do verão, preparar para maratona...)"
                  value={objetivoDetalhes}
                  onChange={(e) => setObjetivoDetalhes(e.target.value)}
                />
              </div>
            </div>

            {/* Nível de Atividade Física (Seleção Única) */}
            <div className="field-group full-width">
              <label className="field-label">Nível de Atividade Física</label>
              <div className="activity-level-grid">
                {niveisAtividade.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`activity-card-btn ${nivelAtividade === lvl ? 'activity-card-active' : ''}`}
                    onClick={() => setNivelAtividade(lvl)}
                  >
                    <Flame size={16} className="activity-flame-icon" />
                    <span className="activity-name">{lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-divider" />

            {/* Patologias ou Condições de Saúde */}
            <div className="field-group full-width">
              <label className="field-label">Patologias ou Condições de Saúde</label>
              <div className="chips-multi-select-grid">
                <button
                  type="button"
                  className={`chip-select-btn chip-none-option ${patologias.includes('Nenhum') ? 'chip-selected-none' : ''}`}
                  onClick={() => toggleChipWithNone(patologias, setPatologias, 'Nenhum')}
                >
                  <span>Nenhum</span>
                </button>

                {defaultPatologias.map((pat) => {
                  const isSelected = patologias.includes(pat);
                  return (
                    <button
                      key={pat}
                      type="button"
                      className={`chip-select-btn ${isSelected ? 'chip-selected' : ''}`}
                      onClick={() => toggleChipWithNone(patologias, setPatologias, pat)}
                    >
                      <span className="chip-check-icon">{isSelected ? '✓' : '+'}</span>
                      <span>{pat}</span>
                    </button>
                  );
                })}

                {/* Exibe patologias personalizadas */}
                {patologias
                  .filter(p => !defaultPatologias.includes(p) && p !== 'Nenhum')
                  .map(custom => (
                    <span key={custom} className="chip-select-btn chip-selected chip-custom">
                      <span>{custom}</span>
                      <button 
                        type="button" 
                        className="chip-remove-btn" 
                        onClick={() => removeChip(patologias, setPatologias, custom)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>

              {/* Campo para adicionar patologia livremente */}
              <div className="add-custom-tag-row">
                <input 
                  type="text"
                  className="field-input input-tag-inline"
                  placeholder="Adicionar outra patologia ou condição..."
                  value={customPatologia}
                  onChange={(e) => setCustomPatologia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomItem(patologias, setPatologias, customPatologia, setCustomPatologia);
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-add-tag"
                  onClick={() => addCustomItem(patologias, setPatologias, customPatologia, setCustomPatologia)}
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            {/* Restrições Alimentares */}
            <div className="field-group full-width">
              <label className="field-label">Restrições Alimentares</label>
              <div className="chips-multi-select-grid">
                <button
                  type="button"
                  className={`chip-select-btn chip-none-option ${restricoes.includes('Nenhum') ? 'chip-selected-none' : ''}`}
                  onClick={() => toggleChipWithNone(restricoes, setRestricoes, 'Nenhum')}
                >
                  <span>Nenhum</span>
                </button>

                {defaultRestricoes.map((rest) => {
                  const isSelected = restricoes.includes(rest);
                  return (
                    <button
                      key={rest}
                      type="button"
                      className={`chip-select-btn ${isSelected ? 'chip-selected' : ''}`}
                      onClick={() => toggleChipWithNone(restricoes, setRestricoes, rest)}
                    >
                      <span className="chip-check-icon">{isSelected ? '✓' : '+'}</span>
                      <span>{rest}</span>
                    </button>
                  );
                })}

                {restricoes
                  .filter(r => !defaultRestricoes.includes(r) && r !== 'Nenhum')
                  .map(custom => (
                    <span key={custom} className="chip-select-btn chip-selected chip-custom">
                      <span>{custom}</span>
                      <button 
                        type="button" 
                        className="chip-remove-btn" 
                        onClick={() => removeChip(restricoes, setRestricoes, custom)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="add-custom-tag-row">
                <input 
                  type="text"
                  className="field-input input-tag-inline"
                  placeholder="Adicionar outra restrição alimentar..."
                  value={customRestricao}
                  onChange={(e) => setCustomRestricao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomItem(restricoes, setRestricoes, customRestricao, setCustomRestricao);
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-add-tag"
                  onClick={() => addCustomItem(restricoes, setRestricoes, customRestricao, setCustomRestricao)}
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            {/* Alergias Alimentares */}
            <div className="field-group full-width">
              <label className="field-label">Alergias Alimentares</label>
              <div className="chips-multi-select-grid">
                <button
                  type="button"
                  className={`chip-select-btn chip-none-option ${alergias.includes('Nenhum') ? 'chip-selected-none' : ''}`}
                  onClick={() => toggleChipWithNone(alergias, setAlergias, 'Nenhum')}
                >
                  <span>Nenhum</span>
                </button>

                {defaultAlergias.map((alerg) => {
                  const isSelected = alergias.includes(alerg);
                  return (
                    <button
                      key={alerg}
                      type="button"
                      className={`chip-select-btn ${isSelected ? 'chip-selected' : ''}`}
                      onClick={() => toggleChipWithNone(alergias, setAlergias, alerg)}
                    >
                      <span className="chip-check-icon">{isSelected ? '✓' : '+'}</span>
                      <span>{alerg}</span>
                    </button>
                  );
                })}

                {alergias
                  .filter(a => !defaultAlergias.includes(a) && a !== 'Nenhum')
                  .map(custom => (
                    <span key={custom} className="chip-select-btn chip-selected chip-custom">
                      <span>{custom}</span>
                      <button 
                        type="button" 
                        className="chip-remove-btn" 
                        onClick={() => removeChip(alergias, setAlergias, custom)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="add-custom-tag-row">
                <input 
                  type="text"
                  className="field-input input-tag-inline"
                  placeholder="Adicionar outra alergia alimentar..."
                  value={customAlergia}
                  onChange={(e) => setCustomAlergia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomItem(alergias, setAlergias, customAlergia, setCustomAlergia);
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-add-tag"
                  onClick={() => addCustomItem(alergias, setAlergias, customAlergia, setCustomAlergia)}
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            {/* Medicamentos & Suplementos (Texto Livre) */}
            <div className="form-fields-grid">
              <div className="field-group">
                <label className="field-label">Medicamentos Contínuos</label>
                <textarea 
                  className="field-textarea"
                  rows="3"
                  placeholder="Ex: Levotiroxina 50mcg em jejum, Losartana 50mg..."
                  value={medicamentosContinuos}
                  onChange={(e) => setMedicamentosContinuos(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Suplementos em Uso</label>
                <textarea 
                  className="field-textarea"
                  rows="3"
                  placeholder="Ex: Whey Protein Isolado, Creatina 5g, Vitamina D3 2000UI, Ômega 3..."
                  value={suplementos}
                  onChange={(e) => setSuplementos(e.target.value)}
                />
              </div>
            </div>

            <div className="tab-footer-nav dual-nav">
              <button 
                type="button" 
                className="btn-prev-tab"
                onClick={() => setActiveTab('pessoal')}
              >
                <span>⬅ Voltar para Dados Pessoais</span>
              </button>
              <button 
                type="button" 
                className="btn-next-tab"
                onClick={() => setActiveTab('habitos')}
              >
                <span>Avançar para Hábitos & Rotina ➔</span>
              </button>
            </div>
          </section>
        )}

        {/* ========================================================
            ABA 3: HÁBITOS & ROTINA
            ======================================================== */}
        {activeTab === 'habitos' && (
          <section className="form-tab-section animated-fade-in">
            <div className="section-intro">
              <h2 className="section-title">Estilo de Vida, Hábitos e Rotina Diária</h2>
              <p className="section-desc">Entenda o ciclo circadiano, hidratação e histórico comportamental.</p>
            </div>

            <div className="form-fields-grid">
              {/* Refeições por Dia */}
              <div className="field-group">
                <label className="field-label">Quantas Refeições Faz por Dia?</label>
                <div className="number-stepper-wrapper">
                  {[2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`stepper-btn ${Number(refeicoesPorDia) === num ? 'stepper-btn-active' : ''}`}
                      onClick={() => setRefeicoesPorDia(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantidade de Água */}
              <div className="field-group">
                <label className="field-label">Quantidade de Água por Dia</label>
                <div className="unit-input-wrapper">
                  <Droplet size={16} className="input-lead-icon icon-blue" />
                  <input 
                    type="number"
                    step="0.1"
                    className="field-input unit-input with-lead-icon"
                    placeholder="Ex: 2.5"
                    value={aguaPorDia}
                    onChange={(e) => setAguaPorDia(e.target.value)}
                  />
                  <span className="unit-suffix">litros</span>
                </div>
              </div>

              {/* Horário que Acorda */}
              <div className="field-group">
                <label className="field-label">Horário que Acorda</label>
                <div className="input-icon-wrapper">
                  <Clock size={16} className="input-lead-icon icon-orange" />
                  <input 
                    type="text"
                    className="field-input with-lead-icon"
                    placeholder="Ex: 6 (06:00) ou 630 (06:30)"
                    value={horarioAcordaInput}
                    onChange={(e) => setHorarioAcordaInput(e.target.value)}
                    onBlur={() => setHorarioAcordaInput(formatSmartTime(horarioAcordaInput))}
                  />
                </div>
                <span className="field-hint">Converte números em horas automaticamente (ex: 630 → 06:30).</span>
              </div>

              {/* Horário que Dorme */}
              <div className="field-group">
                <label className="field-label">Horário que Dorme</label>
                <div className="input-icon-wrapper">
                  <Clock size={16} className="input-lead-icon icon-purple" />
                  <input 
                    type="text"
                    className="field-input with-lead-icon"
                    placeholder="Ex: 23 (23:00) ou 2230 (22:30)"
                    value={horarioDormeInput}
                    onChange={(e) => setHorarioDormeInput(e.target.value)}
                    onBlur={() => setHorarioDormeInput(formatSmartTime(horarioDormeInput))}
                  />
                </div>
                <span className="field-hint">Converte números em horas automaticamente (ex: 2230 → 22:30).</span>
              </div>

              {/* Pratica Atividade Física */}
              <div className="field-group full-width">
                <label className="field-label">Pratica Atividade Física?</label>
                <div className="segmented-selector binary-selector">
                  <button
                    type="button"
                    className={`seg-btn ${!praticaAtividadeFisica ? 'seg-btn-active' : ''}`}
                    onClick={() => setPraticaAtividadeFisica(false)}
                  >
                    Não pratica
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${praticaAtividadeFisica ? 'seg-btn-active' : ''}`}
                    onClick={() => setPraticaAtividadeFisica(true)}
                  >
                    Sim, pratica
                  </button>
                </div>

                {/* Se sim, abre campo para especificar atividade e frequência */}
                {praticaAtividadeFisica && (
                  <div className="conditional-expand-box animated-fade-in" style={{ marginTop: '12px' }}>
                    <label className="field-label">Qual atividade e qual a frequência semanal?</label>
                    <input 
                      type="text"
                      className="field-input"
                      placeholder="Ex: Musculação 4x na semana e corrida aos sábados"
                      value={atividadeFisicaDetalhes}
                      onChange={(e) => setAtividadeFisicaDetalhes(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Observações Gerais */}
              <div className="field-group full-width">
                <label className="field-label">Observações Gerais</label>
                <textarea 
                  className="field-textarea"
                  rows="4"
                  placeholder="Anotações comportamentais, preferências alimentares, histórico familiar, objetivos de longo prazo..."
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                />
              </div>
            </div>

            <div className="tab-footer-nav dual-nav">
              <button 
                type="button" 
                className="btn-prev-tab"
                onClick={() => setActiveTab('clinico')}
              >
                <span>⬅ Voltar para Perfil Clínico</span>
              </button>
              
              <button 
                type="button" 
                className="btn-save-primary" 
                onClick={handleSubmit} 
                disabled={loading}
              >
                <Save size={18} />
                <span>{loading ? 'Salvando Prontuário...' : 'Finalizar Cadastro do Paciente'}</span>
              </button>
            </div>
          </section>
        )}

      </form>
    </div>
  );
}

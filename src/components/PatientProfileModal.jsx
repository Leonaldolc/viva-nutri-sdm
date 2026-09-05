import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Check,
  Paperclip,
  UploadCloud,
  File,
  FileSpreadsheet,
  Download,
  Eye,
  Image as ImageIcon,
  FileArchive,
  ExternalLink,
  ShieldCheck,
  Video,
  MapPin,
  UserCheck,
  HelpCircle,
  Calculator,
  Utensils,
  UtensilsCrossed,
  BookOpen,
  ChevronRight,
  MessageCircle,
  Copy,
  RotateCcw,
  CalendarDays,
  Link as LinkIcon
} from 'lucide-react';
import {
  agendarConsulta,
  adicionarMedicaoEvolucao,
  atualizarPaciente,
  excluirPaciente,
  anexarArquivoPaciente,
  removerArquivoPaciente,
  getConsultasDoPaciente,
  atualizarConsulta,
  alternarConfirmacaoConsulta,
  desmarcarConsulta,
  verificarConflitoHorario,
  atualizarStatusConsulta,
  getPlanosAlimentares,
  salvarPlanoAlimentar,
  removerPlanoAlimentar,
  registrarConsultaCompleta
} from '../services/dashboardService';
import PlanoAlimentarModal from './PlanoAlimentarModal';

export default function PatientProfileModal({
  paciente,
  onClose,
  onActionSuccess,
  nutricionistaId
}) {
  const [activeTab, setActiveTab] = useState('evolucao'); // 'evolucao' | 'prontuario' | 'anexos' | 'consultas' | 'calculadora' | 'nova-medicao'
  const [selectedMetric, setSelectedMetric] = useState('peso'); // 'peso' | 'gordura' | 'massaMagra' | 'cintura' | 'adesao'

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ----------------------------------------------------
  // ESTADO PARA CONSULTAS & AGENDAMENTOS DO PACIENTE
  // ----------------------------------------------------
  const [consultasPaciente, setConsultasPaciente] = useState([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  // Edição de consulta existente
  const [editingConsultaId, setEditingConsultaId] = useState(null);
  const [editConsultaData, setEditConsultaData] = useState('');
  const [editConsultaHora, setEditConsultaHora] = useState('');
  const [editConsultaTipo, setEditConsultaTipo] = useState('Consulta de Retorno');
  const [editConsultaModalidade, setEditConsultaModalidade] = useState('presencial');
  const [editConsultaLink, setEditConsultaLink] = useState('');
  const [editConsultaConfirmacao, setEditConsultaConfirmacao] = useState('confirmado');
  const [editConflict, setEditConflict] = useState(null);

  // Novo agendamento de retorno
  const [novoData, setNovoData] = useState(new Date().toISOString().split('T')[0]);
  const [novoHora, setNovoHora] = useState('10:00');
  const [novoTipo, setNovoTipo] = useState('Consulta de Retorno');
  const [novoModalidade, setNovoModalidade] = useState('presencial');
  const [novoLink, setNovoLink] = useState('');
  const [novoConfirmacao, setNovoConfirmacao] = useState('confirmado');
  const [novoConflict, setNovoConflict] = useState(null);

  // ----------------------------------------------------
  // ESTADO PARA CALCULADORA NUTRICIONAL & METAS (TMB/GET)
  // ----------------------------------------------------
  const [calcFatorAtividade, setCalcFatorAtividade] = useState('1.375'); // 1.2, 1.375, 1.55, 1.725, 1.9
  const [calcEstrategia, setCalcEstrategia] = useState('deficit_moderado'); // 'deficit_leve', 'deficit_moderado', 'manutencao', 'superavit_leve', 'superavit_moderado'
  const [calcProteinaGKg, setCalcProteinaGKg] = useState(1.8);
  const [calcGorduraPerc, setCalcGorduraPerc] = useState(25);
  const [calcFormula, setCalcFormula] = useState('mifflin'); // 'mifflin' | 'harris'
  const [calcCopied, setCalcCopied] = useState(false);

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

  // ----------------------------------------------------
  // ESTADO PARA ANEXOS & ARQUIVOS DE EXAMES
  // ----------------------------------------------------
  const [anexosList, setAnexosList] = useState(paciente?.anexos || []);
  const [selectedCategoria, setSelectedCategoria] = useState('Exame Laboratorial');
  const [anexoObservacao, setAnexoObservacao] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewingAnexo, setPreviewingAnexo] = useState(null);
  const fileInputRef = useRef(null);

  // ----------------------------------------------------
  // ESTADO PARA PLANOS ALIMENTARES (PROMPT 5)
  // ----------------------------------------------------
  const [planosList, setPlanosList] = useState(paciente?.planosAlimentares || []);
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [showGerarPlanoModal, setShowGerarPlanoModal] = useState(false);
  const [novoPlanoTitulo, setNovoPlanoTitulo] = useState('Plano Nutricional Individualizado');
  const [novoPlanoCalorias, setNovoPlanoCalorias] = useState(1800);
  const [novoPlanoProt, setNovoPlanoProt] = useState('130g');
  const [novoPlanoGord, setNovoPlanoGord] = useState('50g');
  const [novoPlanoCarb, setNovoPlanoCarb] = useState('190g');
  const [novoPlanoObs, setNovoPlanoObs] = useState('Ingerir no mínimo 2.5L de água por dia. Evitar ultraprocessados.');

  // ----------------------------------------------------
  // ESTADO PARA NOVA CONSULTA (PROMPT 5 MODAL/FORM)
  // ----------------------------------------------------
  const [showNovaConsultaModal, setShowNovaConsultaModal] = useState(false);
  const [ncData, setNcData] = useState(new Date().toISOString().split('T')[0]);
  const [ncPeso, setNcPeso] = useState(paciente?.pesoAtual || '');
  const [ncCintura, setNcCintura] = useState(paciente?.cinturaAtual || '');
  const [ncQuadril, setNcQuadril] = useState(paciente?.quadrilAtual || '');
  const [ncGordura, setNcGordura] = useState(paciente?.gorduraAtual || '');
  const [ncObs, setNcObs] = useState('');
  const [ncRetorno, setNcRetorno] = useState('');

  // Carregar consultas e planos do paciente
  const carregarConsultasPaciente = async () => {
    if (!paciente?.id) return;
    setLoadingConsultas(true);
    try {
      const data = await getConsultasDoPaciente(paciente.id, nutricionistaId);
      setConsultasPaciente(data);
      const planos = await getPlanosAlimentares(paciente.id, nutricionistaId);
      if (planos && planos.length > 0) setPlanosList(planos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConsultas(false);
    }
  };

  useEffect(() => {
    carregarConsultasPaciente();
  }, [paciente?.id, nutricionistaId]);

  // Checagem de Conflito em tempo real para NOVO agendamento
  useEffect(() => {
    if (!novoData || !novoHora) return;
    const check = async () => {
      try {
        const [h, m] = novoHora.split(':');
        const d = new Date(novoData);
        d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        const conflito = await verificarConflitoHorario(d.toISOString(), nutricionistaId);
        setNovoConflict(conflito);
      } catch {
        setNovoConflict(null);
      }
    };
    check();
  }, [novoData, novoHora, nutricionistaId]);

  // Checagem de Conflito em tempo real para EDIÇÃO de agendamento
  useEffect(() => {
    if (!editingConsultaId || !editConsultaData || !editConsultaHora) return;
    const check = async () => {
      try {
        const [h, m] = editConsultaHora.split(':');
        const d = new Date(editConsultaData);
        d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        const conflito = await verificarConflitoHorario(d.toISOString(), nutricionistaId, editingConsultaId);
        setEditConflict(conflito);
      } catch {
        setEditConflict(null);
      }
    };
    check();
  }, [editingConsultaId, editConsultaData, editConsultaHora, nutricionistaId]);

  const historico = useMemo(() => {
    if (paciente?.historicoEvolucao && Array.isArray(paciente.historicoEvolucao) && paciente.historicoEvolucao.length > 0) {
      return paciente.historicoEvolucao;
    }
    return [
      { data: paciente?.created_at || new Date().toISOString(), peso: Number(paciente?.pesoInicial) || Number(paciente?.pesoAtual) || 75, gordura: Number(paciente?.gorduraInicial) || Number(paciente?.gorduraAtual) || 25, massaMagra: 30, cintura: 85, adesao: 80, notas: 'Consulta Inicial' },
      { data: paciente?.ultima_consulta || new Date().toISOString(), peso: Number(paciente?.pesoAtual) || 72, gordura: Number(paciente?.gorduraAtual) || 22, massaMagra: 31, cintura: 80, adesao: 90, notas: 'Acompanhamento' }
    ];
  }, [paciente?.historicoEvolucao, paciente?.created_at, paciente?.pesoInicial, paciente?.pesoAtual, paciente?.gorduraInicial, paciente?.gorduraAtual, paciente?.ultima_consulta]);

  const historicoConsultasDesc = useMemo(() => {
    const list = Array.isArray(paciente?.historicoEvolucao) && paciente.historicoEvolucao.length > 0
      ? [...paciente.historicoEvolucao]
      : (Array.isArray(consultasPaciente) && consultasPaciente.length > 0
          ? consultasPaciente.map(c => ({
              id: c.id,
              data: c.data_consulta || c.data || new Date().toISOString(),
              peso: Number(c.peso) || Number(paciente?.pesoAtual) || 70,
              gordura: c.gordura ? Number(c.gordura) : paciente?.gorduraAtual,
              massaMagra: c.massaMagra,
              cintura: c.cintura ? Number(c.cintura) : paciente?.cinturaAtual,
              quadril: c.quadril ? Number(c.quadril) : paciente?.quadrilAtual,
              notas: c.observacoes || c.tipo || 'Consulta de Retorno',
              proximoRetorno: c.proximoRetorno
            }))
          : [...historico]
        );
    return list.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [paciente?.historicoEvolucao, paciente?.pesoAtual, paciente?.gorduraAtual, paciente?.cinturaAtual, paciente?.quadrilAtual, consultasPaciente, historico]);

  // Iniciar edição de uma consulta
  const handleStartEditConsulta = (consulta) => {
    setEditingConsultaId(consulta.id);
    const d = new Date(consulta.data_consulta);
    const isoDate = d.toISOString().split('T')[0];
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setEditConsultaData(isoDate);
    setEditConsultaHora(hora);
    setEditConsultaTipo(consulta.tipo || 'Consulta de Retorno');
    setEditConsultaModalidade(consulta.modalidade || 'presencial');
    setEditConsultaLink(consulta.linkTeleconsulta || '');
    setEditConsultaConfirmacao(consulta.confirmacao || 'confirmado');
    setEditConflict(null);
  };

  const handleCancelEditConsulta = () => {
    setEditingConsultaId(null);
    setEditConflict(null);
  };

  // Salvar Edição de Consulta
  const handleSalvarEdicaoConsulta = async (e) => {
    e.preventDefault();
    if (!editingConsultaId || !editConsultaData || !editConsultaHora) return;

    if (editConflict) {
      setErrorMsg(`Horário Ocupado: O paciente "${editConflict.paciente_nome}" já está agendado neste horário.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const [h, m] = editConsultaHora.split(':');
      const d = new Date(editConsultaData);
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

      await atualizarConsulta(editingConsultaId, {
        data_consulta: d.toISOString(),
        tipo: editConsultaTipo,
        modalidade: editConsultaModalidade,
        linkTeleconsulta: editConsultaLink,
        confirmacao: editConsultaConfirmacao
      }, nutricionistaId);

      setSuccessMsg('Consulta atualizada com sucesso!');
      setEditingConsultaId(null);
      await carregarConsultasPaciente();
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao atualizar consulta.');
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar Confirmação (1 clique)
  const handleToggleConfirmacao = async (consultaId) => {
    try {
      await alternarConfirmacaoConsulta(consultaId, nutricionistaId);
      await carregarConsultasPaciente();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  // Alternar Status Realizada / Pendente
  const handleToggleStatus = async (consulta) => {
    try {
      const proximoStatus = consulta.status === 'realizada' ? 'confirmada' : 'realizada';
      await atualizarStatusConsulta(consulta.id, proximoStatus, nutricionistaId);
      await carregarConsultasPaciente();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  // Desmarcar / Cancelar Consulta
  const handleDesmarcar = async (consultaId) => {
    if (!window.confirm('Deseja realmente desmarcar esta consulta da agenda do paciente?')) return;
    try {
      await desmarcarConsulta(consultaId, nutricionistaId);
      await carregarConsultasPaciente();
      if (onActionSuccess) onActionSuccess();
      setSuccessMsg('Consulta desmarcada com sucesso!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg('Erro ao desmarcar consulta.');
    }
  };

  // Agendar Novo Retorno
  const handleAgendarNovoRetorno = async (e) => {
    e.preventDefault();
    if (!novoData || !novoHora) return;

    if (novoConflict) {
      setErrorMsg(`Horário Ocupado: O paciente "${novoConflict.paciente_nome}" já está agendado neste horário.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const [h, m] = novoHora.split(':');
      const d = new Date(novoData);
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

      await agendarConsulta({
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        dataConsulta: d.toISOString(),
        tipo: novoTipo,
        modalidade: novoModalidade,
        linkTeleconsulta: novoLink,
        confirmacao: novoConfirmacao
      }, nutricionistaId);

      setSuccessMsg('Nova consulta agendada com sucesso!');
      await carregarConsultasPaciente();
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao agendar consulta.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // SALVAR NOVA CONSULTA CLÍNICA COMPLETA (PROMPT 5)
  // ----------------------------------------------------
  const handleSalvarNovaConsulta = async (e) => {
    e.preventDefault();
    if (!ncPeso) {
      setErrorMsg('O peso do paciente é obrigatório.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await registrarConsultaCompleta(paciente.id, {
        data: ncData,
        peso: Number(ncPeso),
        cintura: ncCintura ? Number(ncCintura) : null,
        quadril: ncQuadril ? Number(ncQuadril) : null,
        gordura: ncGordura ? Number(ncGordura) : null,
        observacoes: ncObs.trim(),
        proximoRetorno: ncRetorno || null
      }, nutricionistaId);

      setSuccessMsg('Consulta clínica e evolução salvas com sucesso!');
      setShowNovaConsultaModal(false);
      setNcObs('');
      setNcRetorno('');
      if (onActionSuccess) onActionSuccess();
      await carregarConsultasPaciente();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao registrar consulta.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // GERAR / SALVAR NOVO PLANO ALIMENTAR (PROMPT 5)
  // ----------------------------------------------------
  const handleSalvarNovoPlano = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { novoPlano } = await salvarPlanoAlimentar(paciente.id, {
        titulo: novoPlanoTitulo.trim() || 'Plano Nutricional Individualizado',
        caloriasTotais: Number(novoPlanoCalorias) || 1800,
        macros: {
          proteina: novoPlanoProt,
          gordura: novoPlanoGord,
          carboidrato: novoPlanoCarb
        },
        orientacoesGerais: novoPlanoObs.trim()
      }, nutricionistaId);

      setPlanosList(prev => [novoPlano, ...prev]);
      setSuccessMsg('Plano alimentar salvo no histórico com sucesso!');
      setShowGerarPlanoModal(false);
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao salvar plano alimentar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoverPlano = async (planoId, e) => {
    e.stopPropagation();
    const conf = window.confirm('Deseja realmente remover este plano alimentar do histórico?');
    if (!conf) return;

    try {
      await removerPlanoAlimentar(paciente.id, planoId, nutricionistaId);
      setPlanosList(prev => prev.filter(p => p.id !== planoId));
      setSuccessMsg('Plano alimentar removido.');
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('Erro ao remover plano alimentar.');
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

  // ----------------------------------------------------
  // MANIPULAÇÃO DE ANEXOS E UPLOAD DE ARQUIVOS/IMAGENS
  // ----------------------------------------------------
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingFile(true);
    setErrorMsg('');

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileDataUrl = reader.result;
          const { novoAnexo } = await anexarArquivoPaciente(paciente.id, {
            nome: file.name,
            tipo: file.type || 'application/octet-stream',
            tamanho: file.size,
            categoria: selectedCategoria,
            observacao: anexoObservacao.trim(),
            dataUrl: fileDataUrl
          }, nutricionistaId);

          setAnexosList(prev => [novoAnexo, ...prev]);
          setSuccessMsg(`Arquivo "${file.name}" anexado com sucesso!`);
          setAnexoObservacao('');
          if (onActionSuccess) onActionSuccess();
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          setErrorMsg('Erro ao anexar o arquivo.');
        } finally {
          setUploadingFile(false);
        }
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoverAnexo = async (anexoId, e) => {
    e.stopPropagation();
    const confirmRemove = window.confirm('Deseja realmente remover este anexo do prontuário?');
    if (!confirmRemove) return;

    try {
      await removerArquivoPaciente(paciente.id, anexoId, nutricionistaId);
      setAnexosList(prev => prev.filter(a => a.id !== anexoId));
      setSuccessMsg('Arquivo removido com sucesso!');
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('Erro ao remover anexo.');
    }
  };

  // Helpers de proteção
  const cleanPhone = (tel) => String(tel || '').replace(/\D/g, '');
  const firstName = (name) => String(name || 'Paciente').trim().split(' ')[0] || 'Paciente';

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType, fileName) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon size={20} className="icon-orange" />;
    if (mimeType?.includes('pdf')) return <FileText size={20} className="icon-red" />;
    if (mimeType?.includes('sheet') || mimeType?.includes('excel') || fileName?.endsWith('.xls') || fileName?.endsWith('.xlsx')) {
      return <FileSpreadsheet size={20} className="icon-green" />;
    }
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <FileArchive size={20} className="icon-purple" />;
    return <File size={20} className="icon-blue" />;
  };

  // ----------------------------------------------------
  // CÁLCULOS NUTRICIONAIS & ENERGÉTICOS (TMB / GET / VET / MACROS)
  // ----------------------------------------------------
  const idadeCalc = useMemo(() => {
    if (paciente?.dataNascimento) {
      const birth = new Date(paciente.dataNascimento);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970) || paciente?.idade || 30;
    }
    return paciente?.idade || 30;
  }, [paciente?.dataNascimento, paciente?.idade]);

  const pesoCalc = Number(paciente?.pesoAtual) || 70;
  const alturaCalc = Number(paciente?.altura) || 170;
  const sexoCalc = paciente?.sexo || 'Feminino';

  // 1. TMB - Mifflin-St Jeor
  const tmbMifflin = useMemo(() => {
    if (sexoCalc === 'Masculino') {
      return Math.round((10 * pesoCalc) + (6.25 * alturaCalc) - (5 * idadeCalc) + 5);
    }
    return Math.round((10 * pesoCalc) + (6.25 * alturaCalc) - (5 * idadeCalc) - 161);
  }, [pesoCalc, alturaCalc, idadeCalc, sexoCalc]);

  // 2. TMB - Harris-Benedict
  const tmbHarris = useMemo(() => {
    if (sexoCalc === 'Masculino') {
      return Math.round(66.5 + (13.75 * pesoCalc) + (5.003 * alturaCalc) - (6.75 * idadeCalc));
    }
    return Math.round(655.1 + (9.563 * pesoCalc) + (1.850 * alturaCalc) - (4.676 * idadeCalc));
  }, [pesoCalc, alturaCalc, idadeCalc, sexoCalc]);

  const tmbEscolhida = calcFormula === 'mifflin' ? tmbMifflin : tmbHarris;

  // 3. GET (Gasto Energético Total)
  const getCalculado = useMemo(() => {
    return Math.round(tmbEscolhida * parseFloat(calcFatorAtividade || '1.375'));
  }, [tmbEscolhida, calcFatorAtividade]);

  // 4. VET (Valor Energético Total / Meta Diária)
  const vetCalculado = useMemo(() => {
    switch (calcEstrategia) {
      case 'deficit_leve': return Math.round(getCalculado - 350);
      case 'deficit_moderado': return Math.round(getCalculado - 550);
      case 'deficit_agressivo': return Math.round(getCalculado - 750);
      case 'superavit_leve': return Math.round(getCalculado + 300);
      case 'superavit_moderado': return Math.round(getCalculado + 500);
      case 'manutencao':
      default: return getCalculado;
    }
  }, [getCalculado, calcEstrategia]);

  // 5. Macronutrientes
  const macrosCalculados = useMemo(() => {
    const protGramas = Math.round(pesoCalc * (calcProteinaGKg || 1.8));
    const protKcal = protGramas * 4;
    const protPerc = Math.round((protKcal / (vetCalculado || 1)) * 100);

    const gordKcal = Math.round((vetCalculado || 2000) * ((calcGorduraPerc || 25) / 100));
    const gordGramas = Math.round(gordKcal / 9);
    const gordGKg = (gordGramas / (pesoCalc || 1)).toFixed(1);

    const carbKcal = Math.max(0, (vetCalculado || 2000) - protKcal - gordKcal);
    const carbGramas = Math.round(carbKcal / 4);
    const carbPerc = Math.round((carbKcal / (vetCalculado || 1)) * 100);
    const carbGKg = (carbGramas / (pesoCalc || 1)).toFixed(1);

    return {
      proteina: { g: protGramas, kcal: protKcal, perc: protPerc, gkg: calcProteinaGKg || 1.8 },
      gordura: { g: gordGramas, kcal: gordKcal, perc: calcGorduraPerc || 25, gkg: gordGKg },
      carboidrato: { g: carbGramas, kcal: carbKcal, perc: carbPerc, gkg: carbGKg }
    };
  }, [pesoCalc, calcProteinaGKg, calcGorduraPerc, vetCalculado]);

  // Copiar Prescrição Nutricional
  const handleCopiarPrescricao = () => {
    const texto = `📋 *PRESCRIÇÃO NUTRICIONAL & METAS ENERGÉTICAS*
👤 *Paciente:* ${paciente?.nome || 'Paciente'}
⚖️ *Peso Atual:* ${pesoCalc} kg | *Altura:* ${alturaCalc} cm | *Idade:* ${idadeCalc} anos

🔥 *Taxa Metabólica Basal (TMB):* ${tmbEscolhida} kcal/dia
⚡ *Gasto Energético Total (GET):* ${getCalculado} kcal/dia
🎯 *Meta Calórica Prescrita (VET):* ${vetCalculado} kcal/dia

🥩 *Proteínas:* ${macrosCalculados.proteina.g}g (${macrosCalculados.proteina.gkg} g/kg) • ${macrosCalculados.proteina.kcal} kcal (${macrosCalculados.proteina.perc}%)
🥑 *Gorduras:* ${macrosCalculados.gordura.g}g (${macrosCalculados.gordura.gkg} g/kg) • ${macrosCalculados.gordura.kcal} kcal (${macrosCalculados.gordura.perc}%)
🍚 *Carboidratos:* ${macrosCalculados.carboidrato.g}g (${macrosCalculados.carboidrato.gkg} g/kg) • ${macrosCalculados.carboidrato.kcal} kcal (${macrosCalculados.carboidrato.perc}%)

🥗 *VIVA NUTRI — Nutrição de Alta Precisão*`;

    navigator.clipboard.writeText(texto);
    setCalcCopied(true);
    setTimeout(() => setCalcCopied(false), 2500);
  };

  // Cálculos de Delta (Evolução)
  const pesoInicial = Number(paciente?.pesoInicial) || Number(historico[0]?.peso) || 75;
  const pesoAtual = Number(paciente?.pesoAtual) || Number(historico[historico.length - 1]?.peso) || 72;
  const deltaPeso = Math.round((pesoAtual - pesoInicial) * 10) / 10;

  const gorduraInicial = Number(paciente?.gorduraInicial) || Number(historico[0]?.gordura) || 28;
  const gorduraAtual = Number(paciente?.gorduraAtual) || Number(historico[historico.length - 1]?.gordura) || 24;
  const deltaGordura = Math.round((gorduraAtual - gorduraInicial) * 10) / 10;

  const massaInicial = Number(paciente?.massaMagraInicial) || Number(historico[0]?.massaMagra) || 28;
  const massaAtual = Number(paciente?.massaMagraAtual) || Number(historico[historico.length - 1]?.massaMagra) || 30;
  const deltaMassa = Math.round((massaAtual - massaInicial) * 10) / 10;

  const cinturaInicial = Number(paciente?.cinturaInicial) || Number(historico[0]?.cintura) || 90;
  const cinturaAtual = Number(paciente?.cinturaAtual) || Number(historico[historico.length - 1]?.cintura) || 84;
  const deltaCintura = Math.round((cinturaAtual - cinturaInicial) * 10) / 10;

  // Config de Gráfico
  const metricConfig = {
    peso: { label: 'Peso Corporal', unit: 'kg', color: '#7C3AED', meta: Number(paciente?.pesoMeta) || 70 },
    gordura: { label: 'Gordura Corporal', unit: '%', color: '#EF4444', meta: 20 },
    massaMagra: { label: 'Massa Magra', unit: 'kg', color: '#10B981', meta: 35 },
    cintura: { label: 'Circunferência Abdominal', unit: 'cm', color: '#F97316', meta: 80 },
    adesao: { label: 'Adesão ao Plano', unit: '%', color: '#3B82F6', meta: 90 }
  };

  const currentCfg = metricConfig[selectedMetric] || metricConfig.peso;
  const chartValues = (historico || []).map(h => Number(h[selectedMetric]) || 0);
  const minVal = chartValues.length > 0 ? (Math.min(...chartValues, currentCfg.meta) * 0.92) : 0;
  const maxVal = chartValues.length > 0 ? (Math.max(...chartValues, currentCfg.meta) * 1.08) : 100;
  const range = (maxVal - minVal) || 1;

  const svgPoints = useMemo(() => {
    if (!historico || historico.length === 0) return [];
    return historico.map((h, i) => {
      const x = historico.length > 1 ? 40 + (i / (historico.length - 1)) * 420 : 250;
      const val = Number(h[selectedMetric]) || 0;
      const y = range > 0 ? (140 - ((val - minVal) / range) * 110) : 85;
      const d = h.data ? new Date(h.data) : new Date();
      const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Consulta';
      return {
        x: isNaN(x) ? 250 : x,
        y: isNaN(y) ? 85 : y,
        val,
        data: dateStr
      };
    });
  }, [historico, selectedMetric, range, minVal]);

  const pathD = useMemo(() => {
    if (!svgPoints || svgPoints.length === 0) return '';
    return svgPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [svgPoints]);

  const areaD = useMemo(() => {
    if (!svgPoints || svgPoints.length === 0 || !pathD) return '';
    return `${pathD} L ${svgPoints[svgPoints.length - 1].x},150 L ${svgPoints[0].x},150 Z`;
  }, [svgPoints, pathD]);

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
              {anexosList.length > 0 && (
                <span className="badge-files-pill">
                  <Paperclip size={12} /> {anexosList.length} arquivo(s)
                </span>
              )}
              {consultasPaciente.length > 0 && (
                <span className="badge-files-pill" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  <CalendarDays size={12} /> {consultasPaciente.length} consulta(s)
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
            <span>Consultas & Evolução</span>
            {historicoConsultasDesc.length > 0 && (
              <span className="tab-counter-badge">{historicoConsultasDesc.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'prontuario' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('prontuario')}
          >
            <FileText size={16} />
            <span>Dados do Paciente</span>
          </button>

          {/* NOVA ABA: PLANOS ALIMENTARES (PROMPT 5) */}
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'planos' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('planos')}
          >
            <UtensilsCrossed size={16} />
            <span>Planos Alimentares</span>
            {planosList.length > 0 && (
              <span className="tab-counter-badge" style={{ background: '#10B981' }}>{planosList.length}</span>
            )}
          </button>

          {/* ABA: ANEXOS & EXAMES */}
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'anexos' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('anexos')}
          >
            <Paperclip size={16} />
            <span>Anexos & Exames</span>
            {anexosList.length > 0 && (
              <span className="tab-counter-badge">{anexosList.length}</span>
            )}
          </button>

          {/* ABA: CALCULADORA & METAS (TMB/GET/MACROS) */}
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'calculadora' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('calculadora')}
          >
            <Calculator size={16} />
            <span>Calculadora & Metas</span>
          </button>

          {/* ABA: AGENDA & REAGENDAMENTO */}
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'consultas' ? 'modal-tab-active' : ''}`}
            onClick={() => setActiveTab('consultas')}
          >
            <CalendarPlus size={16} />
            <span>Agenda & Retornos</span>
            {consultasPaciente.length > 0 && (
              <span className="tab-counter-badge" style={{ background: 'var(--primary-purple)' }}>{consultasPaciente.length}</span>
            )}
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

                    <line x1="40" y1="30" x2="460" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                    <line x1="40" y1="85" x2="460" y2="85" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                    <line x1="40" y1="140" x2="460" y2="140" stroke="rgba(255,255,255,0.08)" />

                    {areaD && <path d={areaD} fill="url(#areaGradient)" />}

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

              {/* SEÇÃO DE CONSULTAS CLÍNICAS (HISTÓRICO DECRESCENTE + BOTÃO NOVA CONSULTA - PROMPT 5) */}
              <div className="patient-consultas-history-card" style={{ marginTop: '16px' }}>
                <div className="consultas-history-header">
                  <div>
                    <h3 className="consultas-history-title">
                      <Clock size={18} className="icon-purple" /> Histórico de Consultas & Avaliações ({historicoConsultasDesc.length})
                    </h3>
                    <p className="consultas-history-sub">
                      Consultas clínicas registradas em ordem cronológica decrescente com bioimpedância e condutas.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setNcData(new Date().toISOString().split('T')[0]);
                      setNcPeso(paciente?.pesoAtual || '');
                      setNcCintura(paciente?.cinturaAtual || '');
                      setNcQuadril(paciente?.quadrilAtual || '');
                      setNcGordura(paciente?.gorduraAtual || '');
                      setNcObs('');
                      setNcRetorno('');
                      setShowNovaConsultaModal(true);
                    }}
                  >
                    <PlusCircle size={16} /> Nova Consulta
                  </button>
                </div>

                {historicoConsultasDesc.length > 0 ? (
                  <div className="consultas-history-list">
                    {historicoConsultasDesc.map((c, idx) => {
                      const d = new Date(c.data);
                      const dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                      return (
                        <div key={c.id || idx} className="consulta-history-item animated-fade-in">
                          <div className="consulta-item-top">
                            <div className="consulta-date-wrap">
                              <Calendar size={15} className="icon-purple" />
                              <strong>{dataFormatada}</strong>
                              {idx === 0 && <span className="badge-latest-pill">Mais Recente</span>}
                            </div>
                            {c.proximoRetorno && (
                              <div className="consulta-next-return-badge">
                                <Clock size={12} />
                                <span>Próximo Retorno: {new Date(c.proximoRetorno).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>

                          <div className="consulta-metrics-chips">
                            <div className="metric-chip">
                              <span className="chip-lbl">Peso:</span>
                              <strong className="chip-val">{c.peso} kg</strong>
                            </div>
                            {c.gordura && (
                              <div className="metric-chip">
                                <span className="chip-lbl">% Gordura:</span>
                                <strong className="chip-val">{c.gordura}%</strong>
                              </div>
                            )}
                            {c.massaMagra && (
                              <div className="metric-chip">
                                <span className="chip-lbl">Massa Magra:</span>
                                <strong className="chip-val">{c.massaMagra} kg</strong>
                              </div>
                            )}
                            {c.cintura && (
                              <div className="metric-chip">
                                <span className="chip-lbl">Cintura:</span>
                                <strong className="chip-val">{c.cintura} cm</strong>
                              </div>
                            )}
                            {c.quadril && (
                              <div className="metric-chip">
                                <span className="chip-lbl">Quadril:</span>
                                <strong className="chip-val">{c.quadril} cm</strong>
                              </div>
                            )}
                          </div>

                          {c.notas && (
                            <div className="consulta-notes-box">
                              <span className="notes-lbl">Conduta Nutricional / Observações:</span>
                              <p className="notes-txt">"{c.notas}"</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-consultas-state">
                    <Calendar size={32} className="empty-icon-purple" />
                    <h4>Nenhuma consulta registrada ainda</h4>
                    <p>Clique no botão <strong>"Nova Consulta"</strong> acima para registrar a primeira consulta e iniciar o gráfico de evolução.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              ABA 2: PRONTUÁRIO COMPLETO & EDIÇÃO DIRETA (CRUD) - DADOS DO PACIENTE
              ========================================================================= */}
          {activeTab === 'prontuario' && (
            <div className="prontuario-crud-tab animated-fade-in">
              <div className="crud-toolbar">
                <div>
                  <h3 className="crud-section-title">Dados do Paciente</h3>
                  <p className="crud-section-desc">Visualize e atualize diretamente todos os dados pessoais, clínicos e hábitos.</p>
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
                        <label className="form-label">Horário que acorda</label>
                        <input
                          type="time"
                          className="form-input"
                          value={editAcorda}
                          onChange={(e) => setEditAcorda(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Horário que dorme</label>
                        <input
                          type="time"
                          className="form-input"
                          value={editDorme}
                          onChange={(e) => setEditDorme(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Água por dia (Litros)</label>
                        <input
                          type="number"
                          step="0.5"
                          className="form-input"
                          value={editAgua}
                          onChange={(e) => setEditAgua(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsEditingProntuario(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      <Save size={16} /> Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                /* MODO VISUALIZAÇÃO DOS DADOS DO PRONTUÁRIO */
                <div className="crud-view-grid">
                  <div className="crud-view-card">
                    <h4 className="crud-cat-title"><User size={16} /> 1. Dados Pessoais</h4>
                    <div className="info-kv-list">
                      <div className="info-kv"><span className="kv-k">Nome:</span><strong className="kv-v">{paciente.nome}</strong></div>
                      <div className="info-kv"><span className="kv-k">Nascimento:</span><span className="kv-v">{paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}</span></div>
                      <div className="info-kv"><span className="kv-k">Telefone:</span><span className="kv-v">{paciente.telefone || 'Não informado'}</span></div>
                      <div className="info-kv"><span className="kv-k">WhatsApp:</span><span className="kv-v">{paciente.whatsapp || paciente.telefone || 'Não informado'}</span></div>
                      <div className="info-kv"><span className="kv-k">E-mail:</span><span className="kv-v">{paciente.email || 'Não informado'}</span></div>
                    </div>
                  </div>

                  <div className="crud-view-card">
                    <h4 className="crud-cat-title"><Activity size={16} /> 2. Dados Clínicos & Antropometria</h4>
                    <div className="info-kv-list">
                      <div className="info-kv"><span className="kv-k">Peso Atual:</span><strong className="kv-v">{paciente.pesoAtual} kg</strong></div>
                      <div className="info-kv"><span className="kv-k">Altura:</span><span className="kv-v">{paciente.altura} cm</span></div>
                      <div className="info-kv"><span className="kv-k">Objetivo:</span><span className="kv-v badge-obj-pill">{paciente.objetivo}</span></div>
                      <div className="info-kv"><span className="kv-k">Patologias:</span><span className="kv-v">{Array.isArray(paciente.patologias) && paciente.patologias.length > 0 ? paciente.patologias.join(', ') : 'Nenhuma'}</span></div>
                      <div className="info-kv"><span className="kv-k">Restrições:</span><span className="kv-v">{Array.isArray(paciente.restricoesAlimentares) && paciente.restricoesAlimentares.length > 0 ? paciente.restricoesAlimentares.join(', ') : 'Nenhuma'}</span></div>
                      <div className="info-kv"><span className="kv-k">Alergias:</span><span className="kv-v">{Array.isArray(paciente.alergiasAlimentares) && paciente.alergiasAlimentares.length > 0 ? paciente.alergiasAlimentares.join(', ') : 'Nenhuma'}</span></div>
                    </div>
                  </div>

                  <div className="crud-view-card full-span-card">
                    <h4 className="crud-cat-title"><Coffee size={16} /> 3. Hábitos & Rotina Diária</h4>
                    <div className="info-kv-grid">
                      <div className="info-kv"><span className="kv-k">Refeições/dia:</span><strong className="kv-v">{paciente.refeicoesPorDia || 4}</strong></div>
                      <div className="info-kv"><span className="kv-k">Rotina Sono:</span><span className="kv-v">{paciente.horarioAcorda || '07:00'} às {paciente.horarioDorme || '23:00'}</span></div>
                      <div className="info-kv"><span className="kv-k">Ingestão Hídrica:</span><span className="kv-v">{paciente.aguaPorDia || 2} Litros/dia</span></div>
                      <div className="info-kv"><span className="kv-k">Atividade Física:</span><span className="kv-v">{paciente.praticaAtividadeFisica ? 'Sim • ' + (paciente.atividadeFisicaDetalhes || 'Regular') : 'Sedentário'}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              ABA 3: PLANOS ALIMENTARES (SEÇÃO 3 - PROMPT 5)
              ========================================================================= */}
          {activeTab === 'planos' && (
            <div className="patient-planos-tab-content animated-fade-in">

              <div className="planos-toolbar-card">
                <div>
                  <h3 className="planos-tab-title">
                    <UtensilsCrossed size={18} className="icon-green" /> Planos Alimentares Prescritos
                  </h3>
                  <p className="planos-tab-subtitle">
                    Histórico de condutas dietéticas, cardápios semanais e prescrições de {paciente.nome}.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary btn-generate-plan"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                    boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    setSelectedPlano(null);
                    setShowGerarPlanoModal(true);
                  }}
                >
                  <Sparkles size={16} /> ✨ Gerar Plano com IA
                </button>
              </div>

              {planosList.length > 0 ? (
                <div className="planos-history-grid">
                  {planosList.map((plano) => {
                    const d = new Date(plano.dataGeracao || plano.created_at);
                    const dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

                    return (
                      <div key={plano.id} className="plano-card-item animated-fade-in" onClick={() => setSelectedPlano(plano)}>
                        <div className="plano-card-header">
                          <div className="plano-badge-title-wrap">
                            <span
                              className="plano-tag-badge"
                              style={{
                                backgroundColor: plano.tipo === 'IA' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                                color: plano.tipo === 'IA' ? '#C4B5FD' : '#6EE7B7',
                                border: `1px solid ${plano.tipo === 'IA' ? 'rgba(124, 58, 237, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`
                              }}
                            >
                              {plano.tipo === 'IA' ? '✨ IA Gemini' : '✍️ Prescrição Nutricional'}
                            </span>
                            <h4 className="plano-title">{plano.titulo}</h4>
                          </div>
                          <span className="plano-date-pill">
                            <Calendar size={13} /> {dataFormatada}
                          </span>
                        </div>

                        <div className="plano-card-body">
                          <div className="plano-stat-box">
                            <span className="stat-lbl">Valor Energético (VET)</span>
                            <strong className="stat-val">{plano.caloriasTotais} <small>kcal/dia</small></strong>
                          </div>

                          {plano.macros && (
                            <div className="plano-macros-row">
                              <span className="macro-badge-pill badge-p">P: {plano.macros.proteina}</span>
                              <span className="macro-badge-pill badge-g">G: {plano.macros.gordura}</span>
                              <span className="macro-badge-pill badge-c">C: {plano.macros.carboidrato}</span>
                            </div>
                          )}
                        </div>

                        <div className="plano-card-footer">
                          <span className="btn-view-plano-link">
                            <BookOpen size={14} /> Ver Cardápio Completo <ChevronRight size={14} />
                          </span>

                          <div className="plano-actions-mini" onClick={(e) => e.stopPropagation()}>
                            {paciente?.telefone && (
                              <a
                                href={`https://wa.me/55${cleanPhone(paciente.telefone)}?text=${encodeURIComponent(`Olá, ${firstName(paciente.nome)}! 🥗 Seu plano alimentar '${plano.titulo}' (${plano.caloriasTotais} kcal/dia) foi atualizado no sistema VIVA NUTRI. Confira seu cardápio completo! ✨`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-mini-wa"
                                title="Enviar aviso no WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn-mini-del"
                              onClick={(e) => handleRemoverPlano(plano.id, e)}
                              title="Excluir este plano"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-planos-card">
                  <UtensilsCrossed size={40} className="empty-icon-green" />
                  <h4>Nenhum plano alimentar gerado ainda</h4>
                  <p>Clique no botão <strong>"✨ Gerar Plano com IA"</strong> acima para criar o cardápio personalizado com inteligência artificial.</p>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      marginTop: '12px',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                      border: 'none',
                      boxShadow: '0 6px 18px rgba(124, 58, 237, 0.3)'
                    }}
                    onClick={() => {
                      setSelectedPlano(null);
                      setShowGerarPlanoModal(true);
                    }}
                  >
                    <Sparkles size={16} /> ✨ Gerar Primeiro Plano com IA
                  </button>
                </div>
              )}

            </div>
          )}

      {/* =========================================================================
              ABA 3: ANEXOS & EXAMES (NOVO — UPLOAD DE ARQUIVOS E IMAGENS)
              ========================================================================= */}
      {activeTab === 'anexos' && (
        <div className="attachments-tab-content animated-fade-in">

          {/* Painel de Upload Drag & Drop / Selecionar */}
          <div className="attachment-upload-card">
            <div className="upload-header-row">
              <div>
                <h3 className="upload-card-title">
                  <Paperclip size={18} className="icon-purple" /> Anexar Exame ou Documento
                </h3>
                <p className="upload-card-desc">
                  Anexe qualquer tipo de arquivo (PDF, imagens de exames, bioimpedância, fotos de refeições, laudos médicos, planilhas, etc.).
                </p>
              </div>
            </div>

            <div className="upload-controls-grid">
              <div className="form-group">
                <label className="form-label">Categoria do Documento</label>
                <select
                  className="form-input select-category-input"
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                >
                  <option value="Exame Laboratorial / Sangue">🩸 Exame Laboratorial / Sangue</option>
                  <option value="Bioimpedância & Composição Corporal">⚖️ Bioimpedância & Composição Corporal</option>
                  <option value="Laudo & Encaminhamento Médico">🩺 Laudo & Encaminhamento Médico</option>
                  <option value="Foto de Prato & Diário Alimentar">📸 Foto de Prato & Diário Alimentar</option>
                  <option value="Exame de Imagem (Ultrassom / Raio-X)">🩻 Exame de Imagem</option>
                  <option value="Outros Arquivos">📁 Outros Arquivos</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observações / Notas do Arquivo (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Hemograma completo e lipidograma - Laboratório Fleury"
                  value={anexoObservacao}
                  onChange={(e) => setAnexoObservacao(e.target.value)}
                />
              </div>
            </div>

            {/* Input File Escondido */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
            />

            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            >
              <div className="dropzone-icon-circle">
                <UploadCloud size={32} />
              </div>
              <div className="dropzone-text-group">
                <h4 className="dropzone-title">
                  {uploadingFile ? 'Processando arquivo...' : 'Clique para selecionar arquivos ou imagens'}
                </h4>
                <p className="dropzone-subtitle">
                  Suporta PDF, JPG, PNG, WEBP, DOCX, XLSX, TXT, DICOM e qualquer formato (sem limite rígido)
                </p>
              </div>
              <button
                type="button"
                className="btn-select-files"
                disabled={uploadingFile}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <Plus size={16} />
                <span>Selecionar do Computador</span>
              </button>
            </div>
          </div>

          {/* Lista de Arquivos Anexados */}
          <div className="attached-files-section">
            <div className="attached-section-header">
              <h4 className="attached-title">
                Arquivos Salvos no Prontuário ({anexosList.length})
              </h4>
              <span className="security-notice-pill">
                <ShieldCheck size={13} /> Armazenamento Seguro e Criptografado
              </span>
            </div>

            {anexosList.length > 0 ? (
              <div className="attachments-grid">
                {anexosList.map((anexo) => {
                  const isImage = anexo.tipo?.startsWith('image/');
                  return (
                    <div key={anexo.id} className="attachment-file-card">

                      {/* Preview visual se for imagem */}
                      {isImage && anexo.dataUrl ? (
                        <div className="attachment-image-thumb" onClick={() => setPreviewingAnexo(anexo)}>
                          <img src={anexo.dataUrl} alt={anexo.nome} />
                          <div className="thumb-hover-overlay">
                            <Eye size={18} />
                            <span>Visualizar Imagem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="attachment-doc-thumb">
                          {getFileIcon(anexo.tipo, anexo.nome)}
                        </div>
                      )}

                      <div className="attachment-meta-info">
                        <span className="attachment-cat-badge">{anexo.categoria || 'Documento'}</span>
                        <h5 className="attachment-filename" title={anexo.nome}>{anexo.nome}</h5>

                        <div className="attachment-sub-details">
                          <span>{formatFileSize(anexo.tamanho)}</span>
                          <span>•</span>
                          <span>{new Date(anexo.created_at || Date.now()).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {anexo.observacao && (
                          <p className="attachment-note-text" title={anexo.observacao}>
                            "{anexo.observacao}"
                          </p>
                        )}
                      </div>

                      <div className="attachment-actions-row">
                        {anexo.dataUrl && (
                          <>
                            <button
                              type="button"
                              className="btn-file-action"
                              onClick={() => setPreviewingAnexo(anexo)}
                              title="Visualizar arquivo"
                            >
                              <Eye size={14} />
                              <span>Abrir</span>
                            </button>

                            <a
                              href={anexo.dataUrl}
                              download={anexo.nome}
                              className="btn-file-action btn-download"
                              title="Baixar arquivo no computador"
                            >
                              <Download size={14} />
                              <span>Baixar</span>
                            </a>
                          </>
                        )}

                        <button
                          type="button"
                          className="btn-file-action btn-file-delete"
                          onClick={(e) => handleRemoverAnexo(anexo.id, e)}
                          title="Remover anexo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-attachments-box">
                <Paperclip size={36} className="empty-paperclip-icon" />
                <h4>Nenhum arquivo ou exame anexado</h4>
                <p>Faça upload de exames laboratoriais, fotos de bioimpedância ou receitas médicas acima para manter o histórico completo.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
              ABA 4: LANÇAR NOVA MEDIÇÃO
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
              ABA 5: CONSULTAS & AGENDAMENTO (HISTÓRICO, REAGENDAMENTO, MODALIDADE, CONFIRMAÇÃO)
              ========================================================================= */}
      {activeTab === 'consultas' && (
        <div className="patient-consultas-tab-content animated-fade-in">

          {/* FORMULÁRIO DE EDIÇÃO / REAGENDAMENTO (INLINE SE ATIVO) */}
          {editingConsultaId ? (
            <form onSubmit={handleSalvarEdicaoConsulta} className="edit-consulta-box-card animated-fade-in">
              <div className="edit-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} className="icon-purple" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Alterar / Reagendar Consulta</h4>
                </div>
                <button type="button" className="btn-cancel-flat btn-sm" onClick={handleCancelEditConsulta}>
                  <X size={16} /> Cancelar Edição
                </button>
              </div>

              <div className="form-row grid-2" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data da Consulta *</label>
                  <input
                    type="date"
                    className={`form-input ${editConflict ? 'input-error-border' : ''}`}
                    value={editConsultaData}
                    onChange={(e) => setEditConsultaData(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input
                    type="time"
                    className={`form-input ${editConflict ? 'input-error-border' : ''}`}
                    value={editConsultaHora}
                    onChange={(e) => setEditConsultaHora(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Alerta de Conflito de Horário */}
              {editConflict && (
                <div className="alert-schedule-conflict animated-fade-in" style={{ margin: '8px 0' }}>
                  <div className="conflict-icon-wrap"><AlertTriangle size={18} /></div>
                  <div className="conflict-text-wrap">
                    <h5 className="conflict-heading">⚠️ Horário Ocupado</h5>
                    <p className="conflict-desc">
                      O paciente <strong>{editConflict.paciente_nome}</strong> já está agendado para este horário.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tipo de Atendimento</label>
                <select
                  className="form-input"
                  value={editConsultaTipo}
                  onChange={(e) => setEditConsultaTipo(e.target.value)}
                >
                  <option value="Consulta de Retorno">Consulta de Retorno</option>
                  <option value="Bioimpedância e Antropometria">Bioimpedância e Antropometria</option>
                  <option value="Ajuste de Cardápio / Plano">Ajuste de Cardápio / Plano</option>
                  <option value="Avaliação Nutricional Completa">Avaliação Nutricional Completa</option>
                  <option value="Avaliação de Exames Laboratoriais">Avaliação de Exames Laboratoriais</option>
                </select>
              </div>

              {/* Modalidade (Presencial / Online) */}
              <div className="form-group">
                <label className="form-label">Modalidade da Consulta</label>
                <div className="modality-segmented-control">
                  <button
                    type="button"
                    className={`btn-modality-opt ${editConsultaModalidade === 'presencial' ? 'mod-opt-active' : ''}`}
                    onClick={() => setEditConsultaModalidade('presencial')}
                  >
                    <MapPin size={15} /> Presencial (Consultório)
                  </button>
                  <button
                    type="button"
                    className={`btn-modality-opt ${editConsultaModalidade === 'online' ? 'mod-opt-active' : ''}`}
                    onClick={() => setEditConsultaModalidade('online')}
                  >
                    <Video size={15} /> Online (Teleconsulta)
                  </button>
                </div>
              </div>

              {/* Link se for Online */}
              {editConsultaModalidade === 'online' && (
                <div className="form-group animated-fade-in">
                  <label className="form-label">Link da Sala (Google Meet / Zoom / WhatsApp)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      className="form-input"
                      style={{ paddingLeft: '34px' }}
                      placeholder="https://meet.google.com/..."
                      value={editConsultaLink}
                      onChange={(e) => setEditConsultaLink(e.target.value)}
                    />
                    <LinkIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              )}

              {/* Confirmação de Presença */}
              <div className="form-group">
                <label className="form-label">Status de Confirmação do Paciente</label>
                <div className="confirmation-segmented-control">
                  <button
                    type="button"
                    className={`btn-conf-opt ${editConsultaConfirmacao === 'confirmado' ? 'conf-opt-yes' : ''}`}
                    onClick={() => setEditConsultaConfirmacao('confirmado')}
                  >
                    <UserCheck size={15} /> Confirmado pelo Paciente
                  </button>
                  <button
                    type="button"
                    className={`btn-conf-opt ${editConsultaConfirmacao === 'pendente' ? 'conf-opt-pending' : ''}`}
                    onClick={() => setEditConsultaConfirmacao('pendente')}
                  >
                    <HelpCircle size={15} /> Aguardando Confirmação
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={handleCancelEditConsulta}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`btn-primary ${editConflict ? 'btn-disabled-conflict' : ''}`}
                  disabled={submitting || Boolean(editConflict)}
                >
                  <Save size={14} /> Salvar Alterações
                </button>
              </div>
            </form>
          ) : null}

          {/* LISTA DE CONSULTAS AGENDADAS & HISTÓRICO */}
          <div className="patient-appts-list-card">
            <div className="appts-list-header">
              <div>
                <h4 className="appts-list-title">
                  <CalendarDays size={18} className="icon-purple" /> Consultas de {paciente.nome} ({consultasPaciente.length})
                </h4>
                <p className="appts-list-subtitle">
                  Visualize, altere horários, edite confirmação e inicie teleconsultas em 1 clique.
                </p>
              </div>
            </div>

            {consultasPaciente.length > 0 ? (
              <div className="patient-appts-grid">
                {consultasPaciente.map((c) => {
                  const d = new Date(c.data_consulta);
                  const isRealizada = c.status === 'realizada';
                  const isConfirmado = c.confirmacao === 'confirmado';
                  const isOnline = c.modalidade === 'online';
                  const dataFormatada = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                  const horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={c.id} className={`patient-appt-item ${isRealizada ? 'item-completed' : ''} ${isConfirmado ? 'item-confirmed' : 'item-pending'}`}>
                      <div className="item-left-info">
                        <div className="item-datetime-pill">
                          <Clock size={13} />
                          <span>{dataFormatada} às {horaFormatada}</span>
                        </div>

                        <h5 className="item-type-title">{c.tipo || 'Consulta de Retorno'}</h5>

                        <div className="item-badges-row">
                          {/* Modalidade */}
                          <span className={`badge-modalidade-pill ${isOnline ? 'pill-online' : 'pill-presencial'}`}>
                            {isOnline ? <><Video size={11} /> Online (Teleconsulta)</> : <><MapPin size={11} /> Presencial</>}
                          </span>

                          {/* Confirmação (Botão interativo) */}
                          <button
                            type="button"
                            className={`btn-toggle-conf ${isConfirmado ? 'conf-ok' : 'conf-pending'}`}
                            onClick={() => handleToggleConfirmacao(c.id)}
                            title={isConfirmado ? 'Presença confirmada. Clique para alterar para pendente.' : 'Pendente de confirmação. Clique para confirmar presença.'}
                          >
                            {isConfirmado ? <><UserCheck size={12} /> Confirmado</> : <><HelpCircle size={12} /> Aguardando</>}
                          </button>

                          {/* Status Realizada */}
                          {isRealizada && (
                            <span className="badge-conf-pill pill-conf-ok">✓ Realizada</span>
                          )}
                        </div>
                      </div>

                      <div className="item-actions-col">
                        {/* Se for online e tiver link */}
                        {isOnline && c.linkTeleconsulta && (
                          <a
                            href={c.linkTeleconsulta}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-item-action btn-item-video"
                            title="Abrir sala de Teleconsulta"
                          >
                            <Video size={14} /> <span>Abrir Sala</span>
                          </a>
                        )}

                        {/* WhatsApp de confirmação */}
                        {paciente.telefone && (
                          <a
                            href={`https://wa.me/55${paciente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${paciente.nome.split(' ')[0]}! Tudo bem? Passando para confirmar sua consulta nutricional no dia ${d.toLocaleDateString('pt-BR')} às ${horaFormatada} (${isOnline ? 'Online por Vídeo' : 'Presencial no Consultório'}). Poderia confirmar sua presença respondendo 'CONFIRMO'? 🥗✨`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-item-action btn-item-wa"
                            title="Pedir confirmação no WhatsApp"
                          >
                            <MessageCircle size={14} /> <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Botão de Alterar / Reagendar */}
                        <button
                          type="button"
                          className="btn-item-action btn-item-edit"
                          onClick={() => handleStartEditConsulta(c)}
                          title="Alterar data, horário, modalidade ou confirmação"
                        >
                          <Edit3 size={14} /> <span>Alterar</span>
                        </button>

                        {/* Concluir / Desmarcar */}
                        <button
                          type="button"
                          className={`btn-item-action ${isRealizada ? 'btn-item-check-done' : 'btn-item-check'}`}
                          onClick={() => handleToggleStatus(c)}
                          title={isRealizada ? 'Marcar como não realizada' : 'Marcar consulta como concluída'}
                        >
                          <Check size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-item-action btn-item-del"
                          onClick={() => handleDesmarcar(c.id)}
                          title="Desmarcar esta consulta"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-patient-appts">
                <Calendar size={32} className="icon-purple" />
                <h4>Nenhum agendamento registrado</h4>
                <p>Agende uma nova consulta de retorno logo abaixo para garantir a adesão do paciente.</p>
              </div>
            )}
          </div>

          {/* SEÇÃO: AGENDAR NOVA CONSULTA / RETORNO */}
          {!editingConsultaId && (
            <form onSubmit={handleAgendarNovoRetorno} className="new-appointment-subcard">
              <div className="subcard-header">
                <CalendarPlus size={18} className="icon-purple" />
                <h4>Agendar Nova Consulta para {paciente.nome}</h4>
              </div>

              <div className="form-row grid-2">
                <div className="form-group">
                  <label className="form-label">Data *</label>
                  <input
                    type="date"
                    className={`form-input ${novoConflict ? 'input-error-border' : ''}`}
                    value={novoData}
                    onChange={(e) => setNovoData(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input
                    type="time"
                    className={`form-input ${novoConflict ? 'input-error-border' : ''}`}
                    value={novoHora}
                    onChange={(e) => setNovoHora(e.target.value)}
                    required
                  />
                </div>
              </div>

              {novoConflict && (
                <div className="alert-schedule-conflict animated-fade-in" style={{ margin: '8px 0' }}>
                  <div className="conflict-icon-wrap"><AlertTriangle size={18} /></div>
                  <div className="conflict-text-wrap">
                    <h5 className="conflict-heading">⚠️ Horário Ocupado</h5>
                    <p className="conflict-desc">
                      O paciente <strong>{novoConflict.paciente_nome}</strong> já está agendado neste horário.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tipo de Consulta</label>
                <select
                  className="form-input"
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                >
                  <option value="Consulta de Retorno">Consulta de Retorno</option>
                  <option value="Bioimpedância e Antropometria">Bioimpedância e Antropometria</option>
                  <option value="Ajuste de Cardápio / Plano">Ajuste de Cardápio / Plano</option>
                  <option value="Avaliação Nutricional Completa">Avaliação Nutricional Completa</option>
                  <option value="Avaliação de Exames Laboratoriais">Avaliação de Exames Laboratoriais</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Modalidade de Atendimento</label>
                <div className="modality-segmented-control">
                  <button
                    type="button"
                    className={`btn-modality-opt ${novoModalidade === 'presencial' ? 'mod-opt-active' : ''}`}
                    onClick={() => setNovoModalidade('presencial')}
                  >
                    <MapPin size={15} /> Presencial (Consultório)
                  </button>
                  <button
                    type="button"
                    className={`btn-modality-opt ${novoModalidade === 'online' ? 'mod-opt-active' : ''}`}
                    onClick={() => setNovoModalidade('online')}
                  >
                    <Video size={15} /> Online (Teleconsulta)
                  </button>
                </div>
              </div>

              {novoModalidade === 'online' && (
                <div className="form-group animated-fade-in">
                  <label className="form-label">Link da Sala (Google Meet / Zoom / WhatsApp)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      className="form-input"
                      style={{ paddingLeft: '34px' }}
                      placeholder="https://meet.google.com/..."
                      value={novoLink}
                      onChange={(e) => setNovoLink(e.target.value)}
                    />
                    <LinkIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Status Inicial de Confirmação</label>
                <div className="confirmation-segmented-control">
                  <button
                    type="button"
                    className={`btn-conf-opt ${novoConfirmacao === 'confirmado' ? 'conf-opt-yes' : ''}`}
                    onClick={() => setNovoConfirmacao('confirmado')}
                  >
                    <UserCheck size={15} /> Já Confirmado pelo Paciente
                  </button>
                  <button
                    type="button"
                    className={`btn-conf-opt ${novoConfirmacao === 'pendente' ? 'conf-opt-pending' : ''}`}
                    onClick={() => setNovoConfirmacao('pendente')}
                  >
                    <HelpCircle size={15} /> Aguardando Confirmação
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  type="submit"
                  className={`btn-primary ${novoConflict ? 'btn-disabled-conflict' : ''}`}
                  disabled={submitting || !novoData || Boolean(novoConflict)}
                >
                  <CalendarPlus size={16} /> Confirmar Novo Agendamento
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* =========================================================================
              ABA 6: CALCULADORA NUTRICIONAL & METAS ENERGÉTICAS (TMB / GET / VET / MACROS)
              ========================================================================= */}
      {activeTab === 'calculadora' && (
        <div className="patient-calculator-tab-content animated-fade-in">

          {/* Banner de Dados Biométricos Base */}
          <div className="calc-summary-ribbon">
            <div className="calc-bio-item">
              <span className="bio-lbl">Paciente:</span>
              <strong>{paciente.nome}</strong>
            </div>
            <div className="calc-bio-item">
              <span className="bio-lbl">Sexo / Idade:</span>
              <strong>{sexoCalc} • {idadeCalc} anos</strong>
            </div>
            <div className="calc-bio-item">
              <span className="bio-lbl">Peso / Altura:</span>
              <strong>{pesoCalc} kg • {alturaCalc} cm</strong>
            </div>
            <div className="calc-bio-item">
              <span className="bio-lbl">IMC:</span>
              <span className="highlight-pill">{paciente.imc || (pesoCalc / ((alturaCalc / 100) ** 2)).toFixed(1)}</span>
            </div>
          </div>

          {/* Grid 2 Colunas: Configurações & Resultados */}
          <div className="calc-main-grid">

            {/* Coluna 1: Parâmetros e Estratégia */}
            <div className="calc-params-card">
              <h4 className="calc-card-title">
                <Flame size={18} className="icon-orange" /> 1. Parâmetros Energéticos
              </h4>

              <div className="form-group">
                <label className="form-label">Fórmula da Taxa Metabólica Basal (TMB)</label>
                <div className="modality-segmented-control">
                  <button
                    type="button"
                    className={`btn-modality-opt ${calcFormula === 'mifflin' ? 'mod-opt-active' : ''}`}
                    onClick={() => setCalcFormula('mifflin')}
                  >
                    Mifflin-St Jeor (Padrão)
                  </button>
                  <button
                    type="button"
                    className={`btn-modality-opt ${calcFormula === 'harris' ? 'mod-opt-active' : ''}`}
                    onClick={() => setCalcFormula('harris')}
                  >
                    Harris-Benedict
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nível de Atividade Física (Fator Atividade - FA)</label>
                <select
                  className="form-input"
                  value={calcFatorAtividade}
                  onChange={(e) => setCalcFatorAtividade(e.target.value)}
                >
                  <option value="1.2">Sedentário (Pouco ou nenhum exercício) • 1.2</option>
                  <option value="1.375">Levemente Ativo (Exercício 1-3 dias/semana) • 1.375</option>
                  <option value="1.55">Moderadamente Ativo (Exercício 3-5 dias/semana) • 1.55</option>
                  <option value="1.725">Muito Ativo (Exercício intenso 6-7 dias/semana) • 1.725</option>
                  <option value="1.9">Extremamente Ativo (Atleta / Trabalho pesado) • 1.9</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estratégia Nutricional / Meta Calórica</label>
                <select
                  className="form-input"
                  value={calcEstrategia}
                  onChange={(e) => setCalcEstrategia(e.target.value)}
                >
                  <option value="deficit_moderado">📉 Emagrecimento (Déficit de -550 kcal/dia)</option>
                  <option value="deficit_leve">📉 Emagrecimento Suave (Déficit de -350 kcal/dia)</option>
                  <option value="deficit_agressivo">⚡ Emagrecimento Rápido (Déficit de -750 kcal/dia)</option>
                  <option value="manutencao">⚖️ Manutenção de Peso (0 kcal)</option>
                  <option value="superavit_leve">📈 Hipertrofia Moderada (+300 kcal/dia)</option>
                  <option value="superavit_moderado">💪 Hipertrofia Alta (+500 kcal/dia)</option>
                </select>
              </div>

              <h4 className="calc-card-title" style={{ marginTop: '16px' }}>
                <Utensils size={18} className="icon-green" /> 2. Distribuição de Macronutrientes
              </h4>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Proteínas (g por kg de peso corporal)</label>
                  <strong style={{ color: 'var(--primary-purple-light)' }}>{calcProteinaGKg} g/kg</strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  className="calc-range-slider"
                  value={calcProteinaGKg}
                  onChange={(e) => setCalcProteinaGKg(parseFloat(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>1.0 g/kg (Básico)</span>
                  <span>2.0 g/kg (Atleta)</span>
                  <span>3.0 g/kg (Cutting)</span>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Lipídios / Gorduras (% do VET)</label>
                  <strong style={{ color: '#F59E0B' }}>{calcGorduraPerc}%</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  className="calc-range-slider slider-orange"
                  value={calcGorduraPerc}
                  onChange={(e) => setCalcGorduraPerc(parseInt(e.target.value, 10))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>15% (Low Fat)</span>
                  <span>25% (Equilibrado)</span>
                  <span>40% (Keto/Low Carb)</span>
                </div>
              </div>
            </div>

            {/* Coluna 2: Resultados e Resumo de Prescrição */}
            <div className="calc-results-card">
              <h4 className="calc-card-title">
                <Activity size={18} className="icon-purple" /> Prescrição Energética Calculada
              </h4>

              <div className="calc-result-bubbles">
                <div className="calc-bubble">
                  <span className="bubble-lbl">TMB Basal</span>
                  <strong className="bubble-val">{tmbEscolhida}</strong>
                  <span className="bubble-unit">kcal/dia</span>
                </div>

                <div className="calc-bubble">
                  <span className="bubble-lbl">GET Total</span>
                  <strong className="bubble-val">{getCalculado}</strong>
                  <span className="bubble-unit">kcal/dia</span>
                </div>

                <div className="calc-bubble bubble-highlight">
                  <span className="bubble-lbl">VET Prescrito</span>
                  <strong className="bubble-val" style={{ color: '#10B981' }}>{vetCalculado}</strong>
                  <span className="bubble-unit">kcal/dia</span>
                </div>
              </div>

              {/* Tabela de Macronutrientes */}
              <div className="calc-macros-table">
                <div className="macro-row macro-prot">
                  <div className="macro-info">
                    <span className="macro-dot dot-prot" />
                    <div>
                      <strong>Proteínas ({macrosCalculados.proteina.gkg} g/kg)</strong>
                      <span className="macro-sub">{macrosCalculados.proteina.perc}% do valor diário</span>
                    </div>
                  </div>
                  <div className="macro-val-group">
                    <span className="macro-g">{macrosCalculados.proteina.g}g</span>
                    <span className="macro-kcal">{macrosCalculados.proteina.kcal} kcal</span>
                  </div>
                </div>

                <div className="macro-row macro-fat">
                  <div className="macro-info">
                    <span className="macro-dot dot-fat" />
                    <div>
                      <strong>Gorduras ({macrosCalculados.gordura.gkg} g/kg)</strong>
                      <span className="macro-sub">{macrosCalculados.gordura.perc}% do valor diário</span>
                    </div>
                  </div>
                  <div className="macro-val-group">
                    <span className="macro-g">{macrosCalculados.gordura.g}g</span>
                    <span className="macro-kcal">{macrosCalculados.gordura.kcal} kcal</span>
                  </div>
                </div>

                <div className="macro-row macro-carb">
                  <div className="macro-info">
                    <span className="macro-dot dot-carb" />
                    <div>
                      <strong>Carboidratos ({macrosCalculados.carboidrato.gkg} g/kg)</strong>
                      <span className="macro-sub">{macrosCalculados.carboidrato.perc}% do valor diário</span>
                    </div>
                  </div>
                  <div className="macro-val-group">
                    <span className="macro-g">{macrosCalculados.carboidrato.g}g</span>
                    <span className="macro-kcal">{macrosCalculados.carboidrato.kcal} kcal</span>
                  </div>
                </div>
              </div>

              {/* Barra Visual de Distribuição de Macros */}
              <div className="macro-bar-container">
                <div className="macro-bar-segment seg-prot" style={{ width: `${macrosCalculados.proteina.perc}%` }} title={`Proteínas ${macrosCalculados.proteina.perc}%`} />
                <div className="macro-bar-segment seg-fat" style={{ width: `${macrosCalculados.gordura.perc}%` }} title={`Gorduras ${macrosCalculados.gordura.perc}%`} />
                <div className="macro-bar-segment seg-carb" style={{ width: `${macrosCalculados.carboidrato.perc}%` }} title={`Carboidratos ${macrosCalculados.carboidrato.perc}%`} />
              </div>

              {/* Ações de Compartilhamento / Cópia */}
              <div className="calc-actions-row">
                <button
                  type="button"
                  className={`btn-calc-action ${calcCopied ? 'btn-copied' : ''}`}
                  onClick={handleCopiarPrescricao}
                >
                  {calcCopied ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar Prescrição</>}
                </button>

                {paciente?.telefone && (
                  <a
                    href={`https://wa.me/55${cleanPhone(paciente.telefone)}?text=${encodeURIComponent(`Olá, ${firstName(paciente.nome)}! 🥗 Segue sua nova meta calórica e distribuição de macronutrientes calculada:\n\n🎯 *Meta Diária (VET):* ${vetCalculado} kcal\n🥩 *Proteínas:* ${macrosCalculados.proteina.g}g (${macrosCalculados.proteina.gkg}g/kg)\n🥑 *Gorduras:* ${macrosCalculados.gordura.g}g\n🍚 *Carboidratos:* ${macrosCalculados.carboidrato.g}g\n\nFoco no seu objetivo! 💪✨`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-calc-action btn-calc-wa"
                  >
                    <MessageCircle size={16} /> Enviar no WhatsApp
                  </a>
                )}
              </div>

            </div>

          </div>

        </div>
      )}


    </div>

        {/* Modal de Nova Consulta Clínica (Prompt 5) */ }
  {
    showNovaConsultaModal && (
      <div className="file-preview-modal-backdrop" onClick={() => setShowNovaConsultaModal(false)}>
        <div className="modal-card-sub popup-form-card animated-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="submodal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} className="icon-purple" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Registrar Nova Consulta Clínica</h3>
            </div>
            <button type="button" className="btn-modal-close" onClick={() => setShowNovaConsultaModal(false)}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSalvarNovaConsulta} className="submodal-form">
            <p className="submodal-desc">
              Registre a avaliação de retorno de <strong>{paciente.nome}</strong> com atualização automática da curva de evolução.
            </p>

            <div className="form-row grid-2">
              <div className="form-group">
                <label className="form-label">Data da Consulta *</label>
                <input
                  type="date"
                  className="form-input"
                  value={ncData}
                  onChange={(e) => setNcData(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Peso Atual (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Ex: 78.5"
                  value={ncPeso}
                  onChange={(e) => setNcPeso(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-row grid-3">
              <div className="form-group">
                <label className="form-label">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="Ex: 88"
                  value={ncCintura}
                  onChange={(e) => setNcCintura(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quadril (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="Ex: 102"
                  value={ncQuadril}
                  onChange={(e) => setNcQuadril(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">% de Gordura (BF)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Ex: 24.5"
                  value={ncGordura}
                  onChange={(e) => setNcGordura(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observações Clínicas & Conduta</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Ex: Paciente relatou melhora na adesão. Aumentada proteína no pós-treino e prescrito novo plano alimentar."
                value={ncObs}
                onChange={(e) => setNcObs(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Próximo Retorno (Opcional - Agenda Automaticamente)</label>
              <input
                type="date"
                className="form-input"
                value={ncRetorno}
                onChange={(e) => setNcRetorno(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowNovaConsultaModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={submitting || !ncPeso}>
                <CheckCircle size={16} /> Salvar Consulta
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  {/* Modal de Geração, Edição e Visualização Completa de Plano Alimentar com IA (Prompt 6) */}
  {(showGerarPlanoModal || !!selectedPlano) && (
    <PlanoAlimentarModal
      isOpen={showGerarPlanoModal || !!selectedPlano}
      onClose={() => {
        setShowGerarPlanoModal(false);
        setSelectedPlano(null);
      }}
      paciente={paciente}
      planoParaVisualizar={selectedPlano}
      onSalvarPlano={async (dadosPlano) => {
        const { novoPlano } = await salvarPlanoAlimentar(paciente.id, dadosPlano, nutricionistaId);
        setPlanosList(prev => [novoPlano, ...prev.filter(p => p.id !== novoPlano.id)]);
        setSuccessMsg('Plano alimentar salvo no histórico com sucesso!');
        setShowGerarPlanoModal(false);
        setSelectedPlano(null);
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => setSuccessMsg(''), 2500);
      }}
    />
  )}

  {/* Modal de Pré-Visualização de Anexo (Imagem ou PDF/Doc) */ }
  {
    previewingAnexo && (
      <div className="file-preview-modal-backdrop" onClick={() => setPreviewingAnexo(null)}>
        <div className="file-preview-card" onClick={(e) => e.stopPropagation()}>
          <div className="preview-header">
            <div className="preview-title-wrap">
              {getFileIcon(previewingAnexo.tipo, previewingAnexo.nome)}
              <div>
                <h4 className="preview-name">{previewingAnexo.nome}</h4>
                <span className="preview-sub">{previewingAnexo.categoria} • {formatFileSize(previewingAnexo.tamanho)}</span>
              </div>
            </div>
            <div className="preview-actions">
              {previewingAnexo.dataUrl && (
                <a
                  href={previewingAnexo.dataUrl}
                  download={previewingAnexo.nome}
                  className="btn-download-preview"
                >
                  <Download size={16} /> Baixar
                </a>
              )}
              <button
                type="button"
                className="btn-close-preview"
                onClick={() => setPreviewingAnexo(null)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="preview-body">
            {previewingAnexo.tipo?.startsWith('image/') ? (
              <img src={previewingAnexo.dataUrl} alt={previewingAnexo.nome} className="preview-full-image" />
            ) : previewingAnexo.tipo?.includes('pdf') ? (
              <iframe src={previewingAnexo.dataUrl} title={previewingAnexo.nome} className="preview-pdf-frame" />
            ) : (
              <div className="preview-unsupported">
                <File size={48} className="icon-purple" />
                <h4>Pré-visualização direta não disponível para este formato</h4>
                <p>O arquivo está íntegro e salvo com segurança. Você pode baixá-lo no seu computador.</p>
                <a href={previewingAnexo.dataUrl} download={previewingAnexo.nome} className="btn-primary" style={{ marginTop: '12px' }}>
                  <Download size={16} /> Baixar {previewingAnexo.nome}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

      </div >
    </div >
  );
}

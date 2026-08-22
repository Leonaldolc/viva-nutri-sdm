// Serviço de Dados e Business Intelligence do Dashboard VIVA NUTRI
// Cálculos Analíticos, Métricas de Retenção, Churn, Séries Temporais e RLS

const STORAGE_KEY_PACIENTES = 'viva_nutri_pacientes_db';
const STORAGE_KEY_CONSULTAS = 'viva_nutri_consultas_db';

// Base analítica inicial de pacientes com dados clínicos profundos
function getInitialPatients(nutricionistaId) {
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'pac_1',
      nutricionista_id: nutricionistaId,
      nome: 'Mariana Silveira',
      email: 'mariana.silveira@email.com',
      telefone: '(11) 98765-4321',
      objetivo: 'Emagrecimento',
      categoria: 'Emagrecimento',
      status: 'ativo',
      adesaoPlano: 68,
      consultasTotais: 3,
      pesoInicial: 84.5,
      pesoAtual: 79.2,
      pesoMeta: 70.0,
      gorduraInicial: 34.2,
      gorduraAtual: 29.5,
      massaMagraInicial: 28.5,
      massaMagraAtual: 29.8,
      cinturaInicial: 96,
      cinturaAtual: 89,
      historicoEvolucao: [
        { data: daysAgo(120), peso: 84.5, gordura: 34.2, massaMagra: 28.5, cintura: 96, adesao: 65, notas: 'Início do plano hipocalórico e reeducação' },
        { data: daysAgo(85), peso: 81.8, gordura: 31.8, massaMagra: 29.1, cintura: 92, adesao: 72, notas: 'Boa adaptação alimentar, redução de retenção' },
        { data: daysAgo(52), peso: 79.2, gordura: 29.5, massaMagra: 29.8, cintura: 89, adesao: 68, notas: 'Ajuste de proteínas e treino resistido' }
      ],
      ultima_consulta: daysAgo(52),
      created_at: daysAgo(120)
    },
    {
      id: 'pac_2',
      nutricionista_id: nutricionistaId,
      nome: 'Carlos Eduardo Mendes',
      email: 'carlos.mendes@email.com',
      telefone: '(11) 97123-8899',
      objetivo: 'Controle de Diabetes Tipo 2',
      categoria: 'Doenças Crônicas',
      status: 'ativo',
      adesaoPlano: 72,
      consultasTotais: 4,
      pesoInicial: 92.0,
      pesoAtual: 86.4,
      pesoMeta: 80.0,
      gorduraInicial: 31.5,
      gorduraAtual: 26.8,
      massaMagraInicial: 33.0,
      massaMagraAtual: 34.2,
      cinturaInicial: 104,
      cinturaAtual: 96,
      historicoEvolucao: [
        { data: daysAgo(150), peso: 92.0, gordura: 31.5, massaMagra: 33.0, cintura: 104, adesao: 70, notas: 'Glicemia de jejum elevada (142 mg/dL)' },
        { data: daysAgo(110), peso: 89.5, gordura: 29.2, massaMagra: 33.5, cintura: 101, adesao: 75, notas: 'Redução do índice glicêmico da dieta' },
        { data: daysAgo(75), peso: 87.8, gordura: 27.9, massaMagra: 33.9, cintura: 98, adesao: 70, notas: 'Melhora no perfil lipídico e HbA1c' },
        { data: daysAgo(38), peso: 86.4, gordura: 26.8, massaMagra: 34.2, cintura: 96, adesao: 72, notas: 'Estabilidade glicêmica atingida' }
      ],
      ultima_consulta: daysAgo(38),
      created_at: daysAgo(150)
    },
    {
      id: 'pac_3',
      nutricionista_id: nutricionistaId,
      nome: 'Beatriz Almeida',
      email: 'beatriz.almeida@email.com',
      telefone: '(21) 99456-1122',
      objetivo: 'Reeducação Alimentar',
      categoria: 'Reeducação Alimentar',
      status: 'ativo',
      adesaoPlano: 85,
      consultasTotais: 2,
      pesoInicial: 68.0,
      pesoAtual: 64.8,
      pesoMeta: 60.0,
      gorduraInicial: 28.0,
      gorduraAtual: 24.5,
      massaMagraInicial: 24.0,
      massaMagraAtual: 24.6,
      cinturaInicial: 82,
      cinturaAtual: 77,
      historicoEvolucao: [
        { data: daysAgo(180), peso: 68.0, gordura: 28.0, massaMagra: 24.0, cintura: 82, adesao: 80, notas: 'Avaliação inicial de hábitos e rotina' },
        { data: daysAgo(46), peso: 64.8, gordura: 24.5, massaMagra: 24.6, cintura: 77, adesao: 85, notas: 'Aumento da ingestão hídrica e fibras' }
      ],
      ultima_consulta: daysAgo(46),
      created_at: daysAgo(180)
    },
    {
      id: 'pac_4',
      nutricionista_id: nutricionistaId,
      nome: 'Lucas Fontes',
      email: 'lucas.fontes@email.com',
      telefone: '(19) 98112-3344',
      objetivo: 'Hipertrofia & Nutrição Esportiva',
      categoria: 'Hipertrofia',
      status: 'ativo',
      adesaoPlano: 94,
      consultasTotais: 7,
      pesoInicial: 74.0,
      pesoAtual: 79.8,
      pesoMeta: 82.0,
      gorduraInicial: 16.5,
      gorduraAtual: 12.8,
      massaMagraInicial: 35.0,
      massaMagraAtual: 38.6,
      cinturaInicial: 84,
      cinturaAtual: 81,
      historicoEvolucao: [
        { data: daysAgo(90), peso: 74.0, gordura: 16.5, massaMagra: 35.0, cintura: 84, adesao: 90, notas: 'Início de superávit calórico limpo' },
        { data: daysAgo(60), peso: 76.2, gordura: 15.0, massaMagra: 36.4, cintura: 83, adesao: 95, notas: 'Suplementação de creatina e whey' },
        { data: daysAgo(35), peso: 78.1, gordura: 13.8, massaMagra: 37.5, cintura: 82, adesao: 92, notas: 'Ganho consistente de força e massa magra' },
        { data: daysAgo(12), peso: 79.8, gordura: 12.8, massaMagra: 38.6, cintura: 81, adesao: 94, notas: 'Fase final pré-competição esportiva' }
      ],
      ultima_consulta: daysAgo(12),
      created_at: daysAgo(90)
    },
    {
      id: 'pac_5',
      nutricionista_id: nutricionistaId,
      nome: 'Fernanda Rocha',
      email: 'fernanda.rocha@email.com',
      telefone: '(31) 98877-6655',
      objetivo: 'Saúde Intestinal e FODMAP',
      categoria: 'Saúde Intestinal',
      status: 'ativo',
      adesaoPlano: 88,
      consultasTotais: 5,
      pesoInicial: 62.0,
      pesoAtual: 58.5,
      pesoMeta: 57.0,
      gorduraInicial: 26.0,
      gorduraAtual: 22.0,
      massaMagraInicial: 23.0,
      massaMagraAtual: 23.8,
      cinturaInicial: 79,
      cinturaAtual: 72,
      historicoEvolucao: [
        { data: daysAgo(60), peso: 62.0, gordura: 26.0, massaMagra: 23.0, cintura: 79, adesao: 85, notas: 'Eliminação inicial de alimentos FODMAP' },
        { data: daysAgo(30), peso: 60.1, gordura: 23.8, massaMagra: 23.4, cintura: 75, adesao: 90, notas: 'Redução total de distensão abdominal' },
        { data: daysAgo(8), peso: 58.5, gordura: 22.0, massaMagra: 23.8, cintura: 72, adesao: 88, notas: 'Fase de reintrodução gradual de alimentos' }
      ],
      ultima_consulta: daysAgo(8),
      created_at: daysAgo(60)
    },
    {
      id: 'pac_6',
      nutricionista_id: nutricionistaId,
      nome: 'Rodrigo Guimarães',
      email: 'rodrigo.g@email.com',
      telefone: '(41) 99234-5566',
      objetivo: 'Ganho de Massa Magra',
      categoria: 'Hipertrofia',
      status: 'ativo',
      adesaoPlano: 91,
      consultasTotais: 6,
      pesoInicial: 70.0,
      pesoAtual: 76.5,
      pesoMeta: 78.0,
      gorduraInicial: 15.0,
      gorduraAtual: 13.2,
      massaMagraInicial: 33.5,
      massaMagraAtual: 36.8,
      cinturaInicial: 80,
      cinturaAtual: 79,
      historicoEvolucao: [
        { data: daysAgo(45), peso: 70.0, gordura: 15.0, massaMagra: 33.5, cintura: 80, adesao: 90, notas: 'Início do acompanhamento' },
        { data: daysAgo(20), peso: 73.8, gordura: 14.1, massaMagra: 35.2, cintura: 79, adesao: 92, notas: 'Excelente resposta hipertrófica' },
        { data: daysAgo(4), peso: 76.5, gordura: 13.2, massaMagra: 36.8, cintura: 79, adesao: 91, notas: 'Consistência no treino e dieta' }
      ],
      ultima_consulta: daysAgo(4),
      created_at: daysAgo(45)
    },
    {
      id: 'pac_7',
      nutricionista_id: nutricionistaId,
      nome: 'Camila Vasconcelos',
      email: 'camila.vasc@email.com',
      telefone: '(11) 97788-9900',
      objetivo: 'Emagrecimento Pós-Parto',
      categoria: 'Emagrecimento',
      status: 'ativo',
      adesaoPlano: 78,
      consultasTotais: 3,
      pesoInicial: 76.0,
      pesoAtual: 71.4,
      pesoMeta: 64.0,
      gorduraInicial: 32.0,
      gorduraAtual: 28.1,
      massaMagraInicial: 26.0,
      massaMagraAtual: 26.8,
      cinturaInicial: 91,
      cinturaAtual: 84,
      historicoEvolucao: [
        { data: daysAgo(80), peso: 76.0, gordura: 32.0, massaMagra: 26.0, cintura: 91, adesao: 75, notas: 'Plano com foco em micronutrientes e amamentação' },
        { data: daysAgo(33), peso: 71.4, gordura: 28.1, massaMagra: 26.8, cintura: 84, adesao: 78, notas: 'Perda saudável sem impactar lactação' }
      ],
      ultima_consulta: daysAgo(33),
      created_at: daysAgo(80)
    },
    {
      id: 'pac_8',
      nutricionista_id: nutricionistaId,
      nome: 'Juliana Paes Costa',
      email: 'juliana.costa@email.com',
      telefone: '(11) 96655-4433',
      objetivo: 'Controle de Colesterol & Dislipidemia',
      categoria: 'Doenças Crônicas',
      status: 'ativo',
      adesaoPlano: 92,
      consultasTotais: 4,
      pesoInicial: 67.0,
      pesoAtual: 63.2,
      pesoMeta: 60.0,
      gorduraInicial: 29.0,
      gorduraAtual: 24.8,
      massaMagraInicial: 24.5,
      massaMagraAtual: 25.1,
      cinturaInicial: 85,
      cinturaAtual: 78,
      historicoEvolucao: [
        { data: daysAgo(75), peso: 67.0, gordura: 29.0, massaMagra: 24.5, cintura: 85, adesao: 90, notas: 'Foco em fitoesteróis e gorduras insaturadas' },
        { data: daysAgo(45), peso: 65.0, gordura: 26.5, massaMagra: 24.9, cintura: 81, adesao: 94, notas: 'Redução significativa de LDL-c' },
        { data: daysAgo(15), peso: 63.2, gordura: 24.8, massaMagra: 25.1, cintura: 78, adesao: 92, notas: 'Exames laboratoriais normalizados' }
      ],
      ultima_consulta: daysAgo(15),
      created_at: daysAgo(75)
    }
  ];
}

function getInitialAppointments(nutricionistaId) {
  const now = new Date();
  
  const dayOfWeek = now.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(9, 0, 0, 0);

  const getDayInCurrentWeek = (offsetDays, hour = 10) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'cons_1',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_4',
      paciente_nome: 'Lucas Fontes',
      data_consulta: getDayInCurrentWeek(0, 10), // Segunda
      diaSemana: 'Seg',
      status: 'confirmada',
      tipo: 'Bioimpedância & Ajuste'
    },
    {
      id: 'cons_2',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_5',
      paciente_nome: 'Fernanda Rocha',
      data_consulta: getDayInCurrentWeek(1, 14), // Terça
      diaSemana: 'Ter',
      status: 'confirmada',
      tipo: 'Acompanhamento FODMAP'
    },
    {
      id: 'cons_3',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_6',
      paciente_nome: 'Rodrigo Guimarães',
      data_consulta: getDayInCurrentWeek(2, 16), // Quarta
      diaSemana: 'Qua',
      status: 'confirmada',
      tipo: 'Revisão Calórica'
    },
    {
      id: 'cons_4',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_8',
      paciente_nome: 'Juliana Paes Costa',
      data_consulta: getDayInCurrentWeek(3, 11), // Quinta
      diaSemana: 'Qui',
      status: 'agendada',
      tipo: 'Avaliação Exames'
    },
    {
      id: 'cons_5',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_4',
      paciente_nome: 'Lucas Fontes',
      data_consulta: getDayInCurrentWeek(4, 15), // Sexta
      diaSemana: 'Sex',
      status: 'agendada',
      tipo: 'Planejamento de Carga'
    }
  ];
}

function loadDatabase(nutricionistaId) {
  try {
    let pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY_PACIENTES) || 'null');
    let consultas = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || 'null');

    if (!pacientes || !Array.isArray(pacientes)) {
      pacientes = getInitialPatients(nutricionistaId);
      localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(pacientes));
    }

    if (!consultas || !Array.isArray(consultas)) {
      consultas = getInitialAppointments(nutricionistaId);
      localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(consultas));
    }

    return {
      pacientes: pacientes.filter(p => p.nutricionista_id === nutricionistaId || !p.nutricionista_id),
      consultas: consultas.filter(c => c.nutricionista_id === nutricionistaId || !c.nutricionista_id)
    };
  } catch (err) {
    console.error('Erro ao ler base de dados:', err);
    return {
      pacientes: getInitialPatients(nutricionistaId),
      consultas: getInitialAppointments(nutricionistaId)
    };
  }
}

const listeners = new Set();

export function notifyDatabaseChange() {
  listeners.forEach(cb => {
    try { cb(); } catch (e) { console.error('Erro no listener:', e); }
  });
}

export function subscribeDashboardUpdates(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Motor Analítico e BI do VIVA NUTRI
 */
export async function getDashboardMetrics(nutricionistaId, timeframe = '30d') {
  await new Promise(resolve => setTimeout(resolve, 250));

  const { pacientes, consultas } = loadDatabase(nutricionistaId);
  const now = new Date();

  // 1. Total e Classificação de Pacientes
  const totalPacientes = pacientes.filter(p => p.status === 'ativo').length;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 2. Consultas da Semana Vigente (Segunda a Domingo)
  const currentDayOfWeek = now.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const consultasSemanaLista = consultas.filter(c => {
    const dataC = new Date(c.data_consulta);
    return dataC >= startOfWeek && dataC <= endOfWeek && c.status !== 'cancelada';
  });

  const consultasSemana = consultasSemanaLista.length;

  // 3. Matriz de Risco e Pacientes Sem Retorno
  const futureAppointments = consultas.filter(c => {
    const dataC = new Date(c.data_consulta);
    return dataC > now && c.status !== 'cancelada';
  });
  const futurePatientIds = new Set(futureAppointments.map(c => c.paciente_id));

  // Todos os pacientes enriquecidos com métricas analíticas de risco
  const pacientesAnaliticos = pacientes.map(p => {
    const lastDate = p.ultima_consulta ? new Date(p.ultima_consulta) : null;
    const diasSemConsulta = lastDate 
      ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : 75;

    const hasFuture = futurePatientIds.has(p.id);

    let riskLevel = 'baixo'; // 'critico' | 'medio' | 'baixo'
    let scoreRisco = 15; // 0 - 100

    if (!hasFuture && diasSemConsulta >= 45) {
      riskLevel = 'critico';
      scoreRisco = Math.min(95, Math.round(diasSemConsulta * 1.6));
    } else if (!hasFuture && diasSemConsulta >= 30) {
      riskLevel = 'medio';
      scoreRisco = Math.min(68, Math.round(diasSemConsulta * 1.3));
    } else if (hasFuture) {
      riskLevel = 'baixo';
      scoreRisco = 10;
    }

    return {
      ...p,
      diasSemConsulta,
      hasFuture,
      riskLevel,
      scoreRisco
    };
  });

  // Filtro estrito do Card 3: >30 dias sem consulta e sem agendamento futuro
  const pacientesSemRetorno = pacientesAnaliticos
    .filter(p => !p.hasFuture && p.diasSemConsulta >= 30)
    .sort((a, b) => b.scoreRisco - a.scoreRisco);

  const totalSemRetorno = pacientesSemRetorno.length;
  const criticosCount = pacientesSemRetorno.filter(p => p.riskLevel === 'critico').length;
  const mediosCount = pacientesSemRetorno.filter(p => p.riskLevel === 'medio').length;

  // 4. Métricas Globais de BI (Business Intelligence)
  const retentionRate = totalPacientes > 0 
    ? Math.round(((totalPacientes - totalSemRetorno) / totalPacientes) * 100 * 10) / 10
    : 100;

  const occupancyRate = 78.5; // Taxa de ocupação da agenda semanal
  const avgCycleDays = 27; // Ciclo médio de dias entre retornos
  const churnRate = 4.2; // Taxa de evasão

  // 5. Distribuição por Objetivo Clínico (Donut Chart Analytics)
  const categoryCount = {};
  pacientes.forEach(p => {
    const cat = p.categoria || p.objetivo || 'Geral';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const colorPalette = {
    'Emagrecimento': '#7C3AED',
    'Hipertrofia': '#F97316',
    'Doenças Crônicas': '#EF4444',
    'Saúde Intestinal': '#10B981',
    'Reeducação Alimentar': '#6366F1',
    'Geral': '#8B5CF6'
  };

  const totalParaPorcentagem = Object.values(categoryCount).reduce((a, b) => a + b, 0) || 1;
  const objectiveDistribution = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalParaPorcentagem) * 100),
    color: colorPalette[name] || '#8B5CF6'
  })).sort((a, b) => b.count - a.count);

  // 6. Série Temporal Histórica de Consultas (Area Chart)
  const monthlyTrends = [
    { label: 'Mar', atendimentos: 34, meta: 30, retencao: 82 },
    { label: 'Abr', atendimentos: 42, meta: 35, retencao: 85 },
    { label: 'Mai', atendimentos: 38, meta: 40, retencao: 84 },
    { label: 'Jun', atendimentos: 48, meta: 42, retencao: 87 },
    { label: 'Jul', atendimentos: 55, meta: 45, retencao: 89 },
    { label: 'Ago', atendimentos: 58, meta: 50, retencao: 91 }
  ];

  // 7. Ocupação da Semana Atual por Dia (Seg a Sex)
  const weekdayOccupancy = [
    { day: 'Seg', count: 1, capacity: 4, label: 'Segunda' },
    { day: 'Ter', count: 1, capacity: 4, label: 'Terça' },
    { day: 'Qua', count: 1, capacity: 4, label: 'Quarta' },
    { day: 'Qui', count: 1, capacity: 4, label: 'Quinta' },
    { day: 'Sex', count: 1, capacity: 4, label: 'Sexta' },
    { day: 'Sáb', count: 0, capacity: 2, label: 'Sábado' }
  ];

  return {
    totalPacientes,
    consultasSemana,
    consultasSemanaLista,
    pacientesSemRetorno,
    totalSemRetorno,
    criticosCount,
    mediosCount,
    pacientesAnaliticos,
    retentionRate,
    occupancyRate,
    avgCycleDays,
    churnRate,
    objectiveDistribution,
    monthlyTrends,
    weekdayOccupancy,
    timeframe,
    timestamp: new Date().toISOString()
  };
}

export async function cadastrarPaciente(pacienteData, nutricionistaId) {
  const { pacientes } = loadDatabase(nutricionistaId);
  
  const novoPaciente = {
    id: `pac_${Date.now()}`,
    nutricionista_id: nutricionistaId,
    nome: pacienteData.nome.trim(),
    email: pacienteData.email?.trim() || '',
    telefone: pacienteData.telefone?.trim() || '',
    objetivo: pacienteData.objetivo?.trim() || 'Acompanhamento Geral',
    categoria: pacienteData.objetivo?.trim() || 'Emagrecimento',
    status: 'ativo',
    adesaoPlano: 85,
    consultasTotais: 1,
    ultima_consulta: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const updatedPacientes = [novoPaciente, ...pacientes];
  localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(updatedPacientes));
  notifyDatabaseChange();
  return novoPaciente;
}

export async function agendarConsulta({ pacienteId, pacienteNome, dataConsulta, tipo }, nutricionistaId) {
  const { consultas } = loadDatabase(nutricionistaId);

  const novaConsulta = {
    id: `cons_${Date.now()}`,
    nutricionista_id: nutricionistaId,
    paciente_id: pacienteId,
    paciente_nome: pacienteNome,
    data_consulta: dataConsulta,
    status: 'agendada',
    tipo: tipo || 'Consulta de Retorno'
  };

  const updatedConsultas = [novaConsulta, ...consultas];
  localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updatedConsultas));
  notifyDatabaseChange();
  return novaConsulta;
}

export async function agendarRetornoRapido(paciente, nutricionistaId) {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 3);
  nextWeek.setHours(14, 0, 0, 0);

  return agendarConsulta({
    pacienteId: paciente.id,
    pacienteNome: paciente.nome,
    dataConsulta: nextWeek.toISOString(),
    tipo: 'Retorno Agendado (Automático)'
  }, nutricionistaId);
}

/**
 * Adiciona um novo registro de evolução clínica e bioimpedância ao paciente
 */
export async function adicionarMedicaoEvolucao(pacienteId, medicao, nutricionistaId) {
  const { pacientes } = loadDatabase(nutricionistaId);
  const now = new Date().toISOString();

  const updated = pacientes.map(p => {
    if (p.id !== pacienteId) return p;

    const novoHistorico = [
      ...(p.historicoEvolucao || []),
      {
        data: now,
        peso: Number(medicao.peso),
        gordura: Number(medicao.gordura || p.gorduraAtual || 20),
        massaMagra: Number(medicao.massaMagra || p.massaMagraAtual || 30),
        cintura: Number(medicao.cintura || p.cinturaAtual || 80),
        adesao: Number(medicao.adesao || 90),
        notas: medicao.notas || 'Nova avaliação de retorno registrada'
      }
    ];

    return {
      ...p,
      pesoAtual: Number(medicao.peso),
      gorduraAtual: medicao.gordura ? Number(medicao.gordura) : p.gorduraAtual,
      massaMagraAtual: medicao.massaMagra ? Number(medicao.massaMagra) : p.massaMagraAtual,
      cinturaAtual: medicao.cintura ? Number(medicao.cintura) : p.cinturaAtual,
      adesaoPlano: medicao.adesao ? Number(medicao.adesao) : p.adesaoPlano,
      ultima_consulta: now,
      consultasTotais: (p.consultasTotais || 0) + 1,
      historicoEvolucao: novoHistorico
    };
  });

  localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(updated));
  notifyDatabaseChange();
  return updated.find(p => p.id === pacienteId);
}


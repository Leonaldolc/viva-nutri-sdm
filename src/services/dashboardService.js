// Serviço de Dados e Business Intelligence do Dashboard VIVA NUTRI
// Agora com integração Neon PostgreSQL via API serverless + cache localStorage

const STORAGE_KEY_PACIENTES = 'viva_nutri_pacientes_db';
const STORAGE_KEY_CONSULTAS = 'viva_nutri_consultas_db';

// ============================================================================
// CAMADA DE API — Comunicação com o backend Neon PostgreSQL
// ============================================================================

/**
 * Chama uma API route do backend com fallback para localStorage
 */
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(endpoint, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Erro HTTP ${response.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API] Falha em ${method} ${endpoint}:`, err.message);
    return null; // Fallback para localStorage
  }
}

// ============================================================================
// BASE DE DADOS COM API + CACHE LOCAL
// ============================================================================

/**
 * Carrega pacientes do banco (API) com fallback para cache local
 */
async function loadPacientesFromApi(nutricionistaId) {
  const result = await apiCall(`/api/pacientes?nutricionista_id=${nutricionistaId}`);
  if (result && result.success && Array.isArray(result.pacientes)) {
    // Atualizar cache local
    localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(result.pacientes));
    return result.pacientes;
  }
  // Fallback: ler do cache local
  return loadPacientesFromCache(nutricionistaId);
}

/**
 * Carrega consultas do banco (API) com fallback para cache local
 */
async function loadConsultasFromApi(nutricionistaId) {
  const result = await apiCall(`/api/consultas?nutricionista_id=${nutricionistaId}`);
  if (result && result.success && Array.isArray(result.consultas)) {
    localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(result.consultas));
    return result.consultas;
  }
  return loadConsultasFromCache(nutricionistaId);
}

/**
 * Carrega pacientes do cache localStorage (fallback)
 */
function loadPacientesFromCache(nutricionistaId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PACIENTES);
    if (raw) {
      const pacientes = JSON.parse(raw);
      if (Array.isArray(pacientes)) {
        return pacientes.filter(p => p.nutricionista_id === nutricionistaId || !p.nutricionista_id);
      }
    }
  } catch (err) {
    console.error('Erro ao ler pacientes do cache:', err);
  }
  return getInitialPatients(nutricionistaId);
}

/**
 * Carrega consultas do cache localStorage (fallback)
 */
function loadConsultasFromCache(nutricionistaId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSULTAS);
    if (raw) {
      const consultas = JSON.parse(raw);
      if (Array.isArray(consultas)) {
        return consultas.filter(c => c.nutricionista_id === nutricionistaId || !c.nutricionista_id);
      }
    }
  } catch (err) {
    console.error('Erro ao ler consultas do cache:', err);
  }
  return getInitialAppointments(nutricionistaId);
}


// Base analítica inicial de pacientes com dados clínicos profundos (mock/demo)
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
      dataNascimento: '1996-08-29',
      idade: 30,
      sexo: 'Feminino',
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
      dataNascimento: '1985-08-31',
      idade: 41,
      sexo: 'Masculino',
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
      dataNascimento: '1999-09-02',
      idade: 27,
      sexo: 'Feminino',
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
      dataNascimento: '1993-09-12',
      idade: 33,
      sexo: 'Masculino',
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
      dataNascimento: '1990-09-20',
      idade: 36,
      sexo: 'Feminino',
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
      dataNascimento: '1988-10-05',
      idade: 38,
      sexo: 'Masculino',
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
      dataNascimento: '1995-11-14',
      idade: 31,
      sexo: 'Feminino',
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
      dataNascimento: '1991-12-22',
      idade: 35,
      sexo: 'Feminino',
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
  
  const getTodayAtHour = (hour, minute = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

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
    // Consultas de HOJE
    {
      id: 'cons_today_1',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_4',
      paciente_nome: 'Lucas Fontes',
      paciente_telefone: '(19) 98112-3344',
      paciente_email: 'lucas.fontes@email.com',
      data_consulta: getTodayAtHour(9, 0),
      status: 'confirmada',
      confirmacao: 'confirmado',
      modalidade: 'presencial',
      tipo: 'Bioimpedância & Ajuste de Carga'
    },
    {
      id: 'cons_today_2',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_1',
      paciente_nome: 'Mariana Silveira',
      paciente_telefone: '(11) 98765-4321',
      paciente_email: 'mariana.silveira@email.com',
      data_consulta: getTodayAtHour(11, 0),
      status: 'confirmada',
      confirmacao: 'confirmado',
      modalidade: 'online',
      linkTeleconsulta: 'https://meet.google.com/viva-nutri-tele',
      tipo: 'Consulta de Retorno & Cardápio'
    },
    {
      id: 'cons_today_3',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_5',
      paciente_nome: 'Fernanda Rocha',
      paciente_telefone: '(31) 98877-6655',
      paciente_email: 'fernanda.rocha@email.com',
      data_consulta: getTodayAtHour(14, 30),
      status: 'agendada',
      confirmacao: 'pendente',
      modalidade: 'presencial',
      tipo: 'Acompanhamento Saúde Intestinal'
    },
    {
      id: 'cons_today_4',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_6',
      paciente_nome: 'Rodrigo Guimarães',
      paciente_telefone: '(41) 99234-5566',
      paciente_email: 'rodrigo.g@email.com',
      data_consulta: getTodayAtHour(16, 30),
      status: 'agendada',
      confirmacao: 'pendente',
      modalidade: 'online',
      linkTeleconsulta: 'https://meet.google.com/viva-nutri-tele',
      tipo: 'Revisão Calórica & Treino'
    },
    // Consultas anteriores e futuras
    {
      id: 'cons_m_1',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_2',
      paciente_nome: 'Carlos Eduardo Mendes',
      paciente_telefone: '(11) 97123-8899',
      paciente_email: 'carlos.mendes@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 10, 0).toISOString(),
      status: 'realizada',
      confirmacao: 'confirmado',
      modalidade: 'presencial',
      tipo: 'Avaliação Inicial de Glicemia'
    },
    {
      id: 'cons_m_2',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_7',
      paciente_nome: 'Camila Vasconcelos',
      paciente_telefone: '(11) 97788-9900',
      paciente_email: 'camila.vasc@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 15, 0).toISOString(),
      status: 'realizada',
      confirmacao: 'confirmado',
      modalidade: 'online',
      linkTeleconsulta: 'https://meet.google.com/viva-nutri-tele',
      tipo: 'Revisão Pós-Parto'
    },
    {
      id: 'cons_m_3',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_8',
      paciente_nome: 'Juliana Paes Costa',
      paciente_telefone: '(11) 96655-4433',
      paciente_email: 'juliana.costa@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 30).toISOString(),
      status: 'confirmada',
      confirmacao: 'confirmado',
      modalidade: 'presencial',
      tipo: 'Avaliação Perfil Lipídico'
    },
    {
      id: 'cons_m_4',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_3',
      paciente_nome: 'Beatriz Almeida',
      paciente_telefone: '(21) 99456-1122',
      paciente_email: 'beatriz.almeida@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 14, 0).toISOString(),
      status: 'agendada',
      confirmacao: 'pendente',
      modalidade: 'online',
      linkTeleconsulta: 'https://meet.google.com/viva-nutri-tele',
      tipo: 'Reeducação Alimentar'
    },
    {
      id: 'cons_m_5',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_4',
      paciente_nome: 'Lucas Fontes',
      paciente_telefone: '(19) 98112-3344',
      paciente_email: 'lucas.fontes@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 16, 0).toISOString(),
      status: 'agendada',
      confirmacao: 'confirmado',
      modalidade: 'presencial',
      tipo: 'Hipertrofia & Suplementação'
    },
    {
      id: 'cons_m_6',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_1',
      paciente_nome: 'Mariana Silveira',
      paciente_telefone: '(11) 98765-4321',
      paciente_email: 'mariana.silveira@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 11, 9, 30).toISOString(),
      status: 'agendada',
      confirmacao: 'pendente',
      modalidade: 'presencial',
      tipo: 'Bioimpedância Mensal'
    },
    {
      id: 'cons_m_7',
      nutricionista_id: nutricionistaId,
      paciente_id: 'pac_5',
      paciente_nome: 'Fernanda Rocha',
      paciente_telefone: '(31) 98877-6655',
      paciente_email: 'fernanda.rocha@email.com',
      data_consulta: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 11, 0).toISOString(),
      status: 'agendada',
      confirmacao: 'pendente',
      modalidade: 'online',
      linkTeleconsulta: 'https://meet.google.com/viva-nutri-tele',
      tipo: 'FODMAP Fase 2'
    }
  ];
}


// Função síncrona de compatibilidade para código que usa loadDatabase diretamente
function loadDatabase(nutricionistaId) {
  try {
    let pacientes = JSON.parse(localStorage.getItem(STORAGE_KEY_PACIENTES) || 'null');
    let consultas = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || 'null');

    const initialMock = getInitialPatients(nutricionistaId);

    if (!pacientes || !Array.isArray(pacientes)) {
      pacientes = initialMock;
      localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(pacientes));
    } else {
      let modified = false;
      pacientes = pacientes.map((p, idx) => {
        if (!p.dataNascimento) {
          modified = true;
          const matchInitial = initialMock.find(im => im.id === p.id) || initialMock[idx % initialMock.length];
          return {
            ...p,
            dataNascimento: matchInitial?.dataNascimento || '1996-08-29',
            idade: matchInitial?.idade || 30
          };
        }
        return p;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(pacientes));
      }
    }

    if (!consultas || !Array.isArray(consultas)) {
      consultas = getInitialAppointments(nutricionistaId);
      localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(consultas));
    } else {
      const occupiedTimes = new Set();
      let consultasModified = false;
      consultas = consultas.map(c => {
        const d = new Date(c.data_consulta);
        const timeKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
        let finalData = c.data_consulta;
        if (occupiedTimes.has(timeKey)) {
          consultasModified = true;
          d.setHours(d.getHours() + 1);
          d.setMinutes(d.getMinutes() + 15);
          finalData = d.toISOString();
        }
        occupiedTimes.add(timeKey);

        const modalidade = c.modalidade || (c.tipo?.toLowerCase().includes('tele') || c.tipo?.toLowerCase().includes('online') ? 'online' : 'presencial');
        const confirmacao = c.confirmacao || (c.status === 'confirmada' ? 'confirmado' : 'pendente');

        if (!c.modalidade || !c.confirmacao) {
          consultasModified = true;
        }

        return {
          ...c,
          data_consulta: finalData,
          modalidade,
          confirmacao,
          linkTeleconsulta: c.linkTeleconsulta || (modalidade === 'online' ? 'https://meet.google.com/viva-nutri-tele' : '')
        };
      });

      if (consultasModified) {
        localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(consultas));
      }
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
 * Retorna informações de aniversariantes (Hoje, Esta Semana, Este Mês)
 */
export function getAniversariantesInfo(pacientes = []) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const list = [];

  pacientes.forEach(p => {
    if (!p.dataNascimento) return;
    const parts = p.dataNascimento.split('-');
    if (parts.length < 3) return;

    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);

    if (isNaN(birthMonth) || isNaN(birthDay)) return;

    let nextBday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (nextBday < todayZero) {
      nextBday = new Date(today.getFullYear() + 1, birthMonth - 1, birthDay);
    }

    const diffTime = nextBday.getTime() - todayZero.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const isToday = (birthMonth === currentMonth && birthDay === currentDay);
    const isThisWeek = diffDays >= 0 && diffDays <= 7;
    const isThisMonth = (birthMonth === currentMonth);

    const idadeNova = today.getFullYear() - birthYear + (nextBday.getFullYear() > today.getFullYear() ? 1 : 0);

    if (isThisMonth || isThisWeek || isToday) {
      list.push({
        paciente: p,
        birthDay,
        birthMonth,
        diffDays,
        isToday,
        isThisWeek,
        isThisMonth,
        idadeNova: idadeNova > 0 ? idadeNova : (p.idade || 30)
      });
    }
  });

  list.sort((a, b) => a.diffDays - b.diffDays);

  const aniversariantesHoje = list.filter(item => item.isToday);
  const aniversariantesSemana = list.filter(item => !item.isToday && item.isThisWeek);
  const aniversariantesMes = list.filter(item => !item.isToday && !item.isThisWeek && item.isThisMonth);

  return {
    todos: list,
    aniversariantesHoje,
    aniversariantesSemana,
    aniversariantesMes,
    totalAniversariantes: list.length
  };
}


/**
 * Motor Analítico e BI do VIVA NUTRI
 * Agora carrega dados da API (Neon) com fallback para localStorage
 */
export async function getDashboardMetrics(nutricionistaId, timeframe = '30d') {
  // Tentar carregar da API primeiro, fallback para cache local
  let pacientes, consultas;
  try {
    const [pacResult, consResult] = await Promise.allSettled([
      loadPacientesFromApi(nutricionistaId),
      loadConsultasFromApi(nutricionistaId)
    ]);
    pacientes = pacResult.status === 'fulfilled' ? pacResult.value : loadPacientesFromCache(nutricionistaId);
    consultas = consResult.status === 'fulfilled' ? consResult.value : loadConsultasFromCache(nutricionistaId);
  } catch {
    const db = loadDatabase(nutricionistaId);
    pacientes = db.pacientes;
    consultas = db.consultas;
  }

  const now = new Date();

  // 1. Total e Classificação de Pacientes
  const totalPacientes = pacientes.filter(p => p.status === 'ativo').length;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 2. Consultas da Semana Vigente
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

  // 2.1 Consultas de HOJE
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const consultasHojeLista = consultas.filter(c => {
    const dataC = new Date(c.data_consulta);
    return dataC >= startOfToday && dataC <= endOfToday && c.status !== 'cancelada';
  }).sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));

  const consultasHojeCount = consultasHojeLista.length;
  const proximaConsultaHoje = consultasHojeLista.find(c => new Date(c.data_consulta) >= now && c.status !== 'realizada') || consultasHojeLista[0] || null;

  // 3. Matriz de Risco e Pacientes Sem Retorno
  const futureAppointments = consultas.filter(c => {
    const dataC = new Date(c.data_consulta);
    return dataC > now && c.status !== 'cancelada';
  });
  const futurePatientIds = new Set(futureAppointments.map(c => c.paciente_id));

  const pacientesAnaliticos = pacientes.map(p => {
    const lastDate = p.ultima_consulta ? new Date(p.ultima_consulta) : null;
    const diasSemConsulta = lastDate 
      ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : 75;

    const hasFuture = futurePatientIds.has(p.id);

    let riskLevel = 'baixo';
    let scoreRisco = 15;

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

  const pacientesSemRetorno = pacientesAnaliticos
    .filter(p => !p.hasFuture && p.diasSemConsulta >= 30)
    .sort((a, b) => b.scoreRisco - a.scoreRisco);

  const totalSemRetorno = pacientesSemRetorno.length;
  const criticosCount = pacientesSemRetorno.filter(p => p.riskLevel === 'critico').length;
  const mediosCount = pacientesSemRetorno.filter(p => p.riskLevel === 'medio').length;

  // 4. Métricas Globais de BI
  const retentionRate = totalPacientes > 0 
    ? Math.round(((totalPacientes - totalSemRetorno) / totalPacientes) * 100 * 10) / 10
    : 100;

  const occupancyRate = 78.5;
  const avgCycleDays = 27;
  const churnRate = 4.2;

  // 5. Distribuição por Objetivo Clínico
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

  // 6. Série Temporal Histórica
  const monthlyTrends = [
    { label: 'Mar', atendimentos: 34, meta: 30, retencao: 82 },
    { label: 'Abr', atendimentos: 42, meta: 35, retencao: 85 },
    { label: 'Mai', atendimentos: 38, meta: 40, retencao: 84 },
    { label: 'Jun', atendimentos: 48, meta: 42, retencao: 87 },
    { label: 'Jul', atendimentos: 55, meta: 45, retencao: 89 },
    { label: 'Ago', atendimentos: 58, meta: 50, retencao: 91 }
  ];

  // 7. Ocupação da Semana
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
    consultasHojeLista,
    consultasHojeCount,
    proximaConsultaHoje,
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

/**
 * Atualiza o status de uma consulta
 */
export async function atualizarStatusConsulta(consultaId, novoStatus, nutricionistaId) {
  // Tentar via API
  const result = await apiCall('/api/consultas', 'PUT', {
    consultaId,
    dadosAtualizados: { status: novoStatus },
    nutricionistaId
  });

  if (result && result.success) {
    // Atualizar cache local
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || '[]');
    const updated = cached.map(c => c.id === consultaId ? { ...c, status: novoStatus } : c);
    localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updated));
    notifyDatabaseChange();
    return result.consulta;
  }

  // Fallback localStorage
  const { consultas } = loadDatabase(nutricionistaId);
  const updated = consultas.map(c => c.id === consultaId ? { ...c, status: novoStatus } : c);
  localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updated));
  notifyDatabaseChange();
  return updated.find(c => c.id === consultaId);
}

/**
 * Retorna todas as consultas registradas
 */
export async function getTodasConsultas(nutricionistaId) {
  const consultas = await loadConsultasFromApi(nutricionistaId);
  return [...consultas].sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));
}

/**
 * Remove ou desmarca uma consulta
 */
export async function desmarcarConsulta(consultaId, nutricionistaId) {
  const result = await apiCall('/api/consultas', 'DELETE', { consultaId, nutricionistaId });

  // Atualizar cache local independentemente
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || '[]');
  const updated = cached.filter(c => c.id !== consultaId);
  localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updated));
  notifyDatabaseChange();
  return true;
}


export async function getPacientes(nutricionistaId) {
  return await loadPacientesFromApi(nutricionistaId);
}

export async function getPacienteById(pacienteId, nutricionistaId) {
  // Tentar API
  const result = await apiCall(`/api/pacientes?id=${pacienteId}`);
  if (result && result.success && result.paciente) {
    return result.paciente;
  }
  // Fallback cache
  const pacientes = loadPacientesFromCache(nutricionistaId);
  return pacientes.find(p => p.id === pacienteId) || null;
}

export async function cadastrarPaciente(pacienteData, nutricionistaId) {
  // Tentar via API (salva no Neon)
  const result = await apiCall('/api/pacientes', 'POST', { pacienteData, nutricionistaId });

  if (result && result.success && result.paciente) {
    // Atualizar cache local
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_PACIENTES) || '[]');
    localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify([result.paciente, ...cached]));
    notifyDatabaseChange();
    return result.paciente;
  }

  // Fallback: salvar apenas no localStorage
  console.warn('[VIVA NUTRI] API indisponível, salvando paciente apenas no cache local.');
  const { pacientes } = loadDatabase(nutricionistaId);
  const now = new Date().toISOString();

  const objetivosList = Array.isArray(pacienteData.objetivos) && pacienteData.objetivos.length > 0
    ? pacienteData.objetivos
    : (pacienteData.objetivo ? [pacienteData.objetivo] : ['Saúde geral']);

  const objetivoPrincipal = pacienteData.objetivoDetalhes 
    ? `${objetivosList.join(', ')} (${pacienteData.objetivoDetalhes})`
    : objetivosList.join(', ');

  const pesoNum = pacienteData.pesoAtual ? Number(pacienteData.pesoAtual) : null;
  const alturaNum = pacienteData.altura ? Number(pacienteData.altura) : null;
  
  let imcCalculado = null;
  if (pesoNum && alturaNum && alturaNum > 0) {
    const alturaMetros = alturaNum / 100;
    imcCalculado = Number((pesoNum / (alturaMetros * alturaMetros)).toFixed(1));
  }

  const novoPaciente = {
    id: `pac_${Date.now()}`,
    nutricionista_id: nutricionistaId,
    nome: pacienteData.nome.trim(),
    dataNascimento: pacienteData.dataNascimento || '',
    idade: pacienteData.idade || null,
    sexo: pacienteData.sexo || 'Não informado',
    telefone: pacienteData.telefone?.trim() || '',
    whatsapp: pacienteData.whatsapp?.trim() || pacienteData.telefone?.trim() || '',
    email: pacienteData.email?.trim() || '',
    pesoAtual: pesoNum || 70,
    pesoInicial: pesoNum || 70,
    altura: alturaNum || 170,
    imc: imcCalculado,
    objetivos: objetivosList,
    objetivoDetalhes: pacienteData.objetivoDetalhes || '',
    objetivo: objetivoPrincipal,
    categoria: objetivosList[0] || 'Saúde geral',
    nivelAtividade: pacienteData.nivelAtividade || 'Sedentário',
    patologias: Array.isArray(pacienteData.patologias) ? pacienteData.patologias : [],
    restricoesAlimentares: Array.isArray(pacienteData.restricoesAlimentares) ? pacienteData.restricoesAlimentares : [],
    alergiasAlimentares: Array.isArray(pacienteData.alergiasAlimentares) ? pacienteData.alergiasAlimentares : [],
    medicamentosContinuos: pacienteData.medicamentosContinuos || '',
    suplementos: pacienteData.suplementos || '',
    refeicoesPorDia: pacienteData.refeicoesPorDia ? Number(pacienteData.refeicoesPorDia) : 4,
    horarioAcorda: pacienteData.horarioAcorda || '07:00',
    horarioDorme: pacienteData.horarioDorme || '23:00',
    aguaPorDia: pacienteData.aguaPorDia ? Number(pacienteData.aguaPorDia) : 2,
    praticaAtividadeFisica: Boolean(pacienteData.praticaAtividadeFisica),
    atividadeFisicaDetalhes: pacienteData.atividadeFisicaDetalhes || '',
    observacoesGerais: pacienteData.observacoesGerais || '',
    status: 'ativo',
    adesaoPlano: 85,
    consultasTotais: 1,
    gorduraAtual: 24,
    gorduraInicial: 24,
    massaMagraAtual: 30,
    massaMagraInicial: 30,
    cinturaAtual: 82,
    cinturaInicial: 82,
    historicoEvolucao: [{
      data: now,
      peso: pesoNum || 70,
      gordura: 24,
      massaMagra: 30,
      cintura: 82,
      adesao: 85,
      notas: 'Primeira consulta e cadastro do paciente'
    }],
    ultima_consulta: now,
    created_at: now
  };

  const updatedPacientes = [novoPaciente, ...pacientes];
  localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(updatedPacientes));
  notifyDatabaseChange();
  return novoPaciente;
}

export async function atualizarPaciente(pacienteId, dadosAtualizados, nutricionistaId) {
  // Tentar via API
  const result = await apiCall('/api/pacientes', 'PUT', { pacienteId, dadosAtualizados, nutricionistaId });

  if (result && result.success && result.paciente) {
    // Atualizar cache local
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_PACIENTES) || '[]');
    const updated = cached.map(p => p.id === pacienteId ? { ...p, ...result.paciente } : p);
    localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(updated));
    notifyDatabaseChange();
    return result.paciente;
  }

  // Fallback localStorage
  const { pacientes } = loadDatabase(nutricionistaId);

  const updated = pacientes.map(p => {
    if (p.id !== pacienteId) return p;

    const pesoNum = dadosAtualizados.pesoAtual !== undefined ? Number(dadosAtualizados.pesoAtual) : p.pesoAtual;
    const alturaNum = dadosAtualizados.altura !== undefined ? Number(dadosAtualizados.altura) : p.altura;
    let imcCalculado = p.imc;
    if (pesoNum && alturaNum && alturaNum > 0) {
      const alturaMetros = alturaNum / 100;
      imcCalculado = Number((pesoNum / (alturaMetros * alturaMetros)).toFixed(1));
    }

    const objetivosList = dadosAtualizados.objetivos !== undefined 
      ? dadosAtualizados.objetivos 
      : (p.objetivos || [p.objetivo]);

    const objetivoPrincipal = dadosAtualizados.objetivoDetalhes !== undefined || dadosAtualizados.objetivos !== undefined
      ? (dadosAtualizados.objetivoDetalhes ? `${objetivosList.join(', ')} (${dadosAtualizados.objetivoDetalhes})` : objetivosList.join(', '))
      : (dadosAtualizados.objetivo || p.objetivo);

    return {
      ...p,
      ...dadosAtualizados,
      pesoAtual: pesoNum,
      altura: alturaNum,
      imc: imcCalculado,
      objetivos: objetivosList,
      objetivo: objetivoPrincipal
    };
  });

  localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(updated));
  notifyDatabaseChange();
  return updated.find(p => p.id === pacienteId);
}

export async function excluirPaciente(pacienteId, nutricionistaId) {
  // Tentar via API
  await apiCall('/api/pacientes', 'DELETE', { pacienteId, nutricionistaId });

  // Atualizar cache local
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_PACIENTES) || '[]');
  const cachedConsultas = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || '[]');
  localStorage.setItem(STORAGE_KEY_PACIENTES, JSON.stringify(cached.filter(p => p.id !== pacienteId)));
  localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(cachedConsultas.filter(c => c.paciente_id !== pacienteId)));
  notifyDatabaseChange();
  return true;
}

/**
 * Verifica se já existe consulta agendada para a data/horário selecionados
 */
export async function verificarConflitoHorario(dataConsultaIso, nutricionistaId, ignoreConsultaId = null) {
  const consultas = await loadConsultasFromApi(nutricionistaId);
  const targetDate = new Date(dataConsultaIso);
  const targetTime = targetDate.getTime();
  const DURATION_MS = 40 * 60 * 1000;

  const conflito = consultas.find(c => {
    if (ignoreConsultaId && c.id === ignoreConsultaId) return false;
    if (c.status === 'cancelada') return false;

    const cDate = new Date(c.data_consulta);
    const cTime = cDate.getTime();
    const diffMs = Math.abs(targetTime - cTime);
    return diffMs < DURATION_MS;
  });

  return conflito || null;
}

export async function agendarConsulta({ 
  pacienteId, 
  pacienteNome, 
  dataConsulta, 
  tipo, 
  modalidade = 'presencial', 
  linkTeleconsulta = '', 
  confirmacao = 'pendente',
  forcarEncaixe = false 
}, nutricionistaId) {
  // Tentar via API
  const result = await apiCall('/api/consultas', 'POST', {
    consultaData: {
      pacienteId,
      pacienteNome,
      dataConsulta,
      tipo,
      modalidade,
      linkTeleconsulta,
      confirmacao,
      forcarEncaixe
    },
    nutricionistaId
  });

  if (result && result.success && result.consulta) {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || '[]');
    localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify([result.consulta, ...cached]));
    notifyDatabaseChange();
    return result.consulta;
  }

  // Verificação de conflito local
  if (!forcarEncaixe) {
    const conflito = await verificarConflitoHorario(dataConsulta, nutricionistaId);
    if (conflito) {
      const dConf = new Date(conflito.data_consulta);
      const horaConf = dConf.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dataConf = dConf.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const erro = new Error(`Horário Ocupado: O paciente "${conflito.paciente_nome}" já está agendado para ${dataConf} às ${horaConf}.`);
      erro.isConflict = true;
      erro.conflito = conflito;
      throw erro;
    }
  }

  // Fallback localStorage
  const { consultas } = loadDatabase(nutricionistaId);
  const novaConsulta = {
    id: `cons_${Date.now()}`,
    nutricionista_id: nutricionistaId,
    paciente_id: pacienteId,
    paciente_nome: pacienteNome,
    data_consulta: dataConsulta,
    status: 'agendada',
    modalidade: modalidade || 'presencial',
    linkTeleconsulta: linkTeleconsulta || '',
    confirmacao: confirmacao || 'pendente',
    tipo: tipo || 'Consulta de Retorno'
  };

  const updatedConsultas = [novaConsulta, ...consultas];
  localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updatedConsultas));
  notifyDatabaseChange();
  return novaConsulta;
}

/**
 * Retorna todas as consultas de um paciente específico
 */
export async function getConsultasDoPaciente(pacienteId, nutricionistaId) {
  const consultas = await loadConsultasFromApi(nutricionistaId);
  return consultas
    .filter(c => c.paciente_id === pacienteId && c.status !== 'cancelada')
    .sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta));
}

/**
 * Atualiza qualquer dado da consulta
 */
export async function atualizarConsulta(consultaId, dadosAtualizados, nutricionistaId) {
  const result = await apiCall('/api/consultas', 'PUT', { consultaId, dadosAtualizados, nutricionistaId });

  if (result && result.success && result.consulta) {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CONSULTAS) || '[]');
    const updated = cached.map(c => c.id === consultaId ? { ...c, ...result.consulta } : c);
    localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updated));
    notifyDatabaseChange();
    return result.consulta;
  }

  // Fallback
  const { consultas } = loadDatabase(nutricionistaId);
  
  if (dadosAtualizados.data_consulta) {
    const conflito = await verificarConflitoHorario(dadosAtualizados.data_consulta, nutricionistaId, consultaId);
    if (conflito && !dadosAtualizados.forcarEncaixe) {
      const dConf = new Date(conflito.data_consulta);
      const horaConf = dConf.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dataConf = dConf.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const erro = new Error(`Horário Ocupado: O paciente "${conflito.paciente_nome}" já está agendado para ${dataConf} às ${horaConf}.`);
      erro.isConflict = true;
      erro.conflito = conflito;
      throw erro;
    }
  }

  const updated = consultas.map(c => {
    if (c.id === consultaId) {
      return {
        ...c,
        ...dadosAtualizados,
        status: dadosAtualizados.confirmacao === 'confirmado' ? 'confirmada' : (dadosAtualizados.status || c.status)
      };
    }
    return c;
  });

  localStorage.setItem(STORAGE_KEY_CONSULTAS, JSON.stringify(updated));
  notifyDatabaseChange();
  return updated.find(c => c.id === consultaId);
}

/**
 * Alterna o status de confirmação da consulta
 */
export async function alternarConfirmacaoConsulta(consultaId, nutricionistaId) {
  const consultas = await loadConsultasFromApi(nutricionistaId);
  const consulta = consultas.find(c => c.id === consultaId);
  if (!consulta) return null;

  const proximo = consulta.confirmacao === 'confirmado' ? 'pendente' : 'confirmado';
  return atualizarConsulta(consultaId, { confirmacao: proximo }, nutricionistaId);
}


export async function agendarRetornoRapido(paciente, nutricionistaId) {
  const now = new Date();
  let nextDate = new Date(now);
  nextDate.setDate(now.getDate() + 3);
  nextDate.setHours(14, 0, 0, 0);

  let conflito = await verificarConflitoHorario(nextDate.toISOString(), nutricionistaId);
  if (conflito) {
    nextDate.setHours(15, 30, 0, 0);
  }

  return agendarConsulta({
    pacienteId: paciente.id,
    pacienteNome: paciente.nome,
    dataConsulta: nextDate.toISOString(),
    tipo: 'Retorno Agendado (Automático)'
  }, nutricionistaId);
}


/**
 * Adiciona um novo registro de evolução clínica e bioimpedância ao paciente
 */
export async function adicionarMedicaoEvolucao(pacienteId, medicao, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const now = new Date().toISOString();
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return null;

  const novoHistorico = [
    ...(paciente.historicoEvolucao || []),
    {
      data: now,
      peso: Number(medicao.peso),
      gordura: Number(medicao.gordura || paciente.gorduraAtual || 20),
      massaMagra: Number(medicao.massaMagra || paciente.massaMagraAtual || 30),
      cintura: Number(medicao.cintura || paciente.cinturaAtual || 80),
      adesao: Number(medicao.adesao || 90),
      notas: medicao.notas || 'Nova avaliação de retorno registrada'
    }
  ];

  const dadosAtualizados = {
    pesoAtual: Number(medicao.peso),
    gorduraAtual: medicao.gordura ? Number(medicao.gordura) : paciente.gorduraAtual,
    massaMagraAtual: medicao.massaMagra ? Number(medicao.massaMagra) : paciente.massaMagraAtual,
    cinturaAtual: medicao.cintura ? Number(medicao.cintura) : paciente.cinturaAtual,
    adesaoPlano: medicao.adesao ? Number(medicao.adesao) : paciente.adesaoPlano,
    ultima_consulta: now,
    consultasTotais: (paciente.consultasTotais || 0) + 1,
    historicoEvolucao: novoHistorico
  };

  return atualizarPaciente(pacienteId, dadosAtualizados, nutricionistaId);
}

/**
 * Adiciona um novo arquivo/exame ao prontuário do paciente
 */
export async function anexarArquivoPaciente(pacienteId, anexoData, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return null;

  const novoAnexo = {
    id: `anx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nome: anexoData.nome || 'Documento sem título',
    tipo: anexoData.tipo || 'application/octet-stream',
    tamanho: anexoData.tamanho || 0,
    categoria: anexoData.categoria || 'Exame Laboratorial',
    observacao: anexoData.observacao || '',
    dataUrl: anexoData.dataUrl || '',
    created_at: new Date().toISOString()
  };

  const anexosExistentes = Array.isArray(paciente.anexos) ? paciente.anexos : [];
  const dadosAtualizados = { anexos: [novoAnexo, ...anexosExistentes] };

  const pacienteAtualizado = await atualizarPaciente(pacienteId, dadosAtualizados, nutricionistaId);
  return { novoAnexo, pacienteAtualizado };
}

/**
 * Remove um arquivo/exame do prontuário do paciente
 */
export async function removerArquivoPaciente(pacienteId, anexoId, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return null;

  const anexosFiltrados = (paciente.anexos || []).filter(a => a.id !== anexoId);
  return atualizarPaciente(pacienteId, { anexos: anexosFiltrados }, nutricionistaId);
}

/**
 * Retorna os planos alimentares de um paciente
 */
export async function getPlanosAlimentares(pacienteId, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const p = pacientes.find(item => item.id === pacienteId);
  if (!p) return [];
  return Array.isArray(p.planosAlimentares) ? p.planosAlimentares : [];
}

/**
 * Salva um novo plano alimentar para o paciente
 */
export async function salvarPlanoAlimentar(pacienteId, planoData, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return null;

  const novoPlano = {
    id: `plano_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    titulo: planoData.titulo || 'Plano Nutricional Individualizado',
    dataGeracao: planoData.dataGeracao || new Date().toISOString(),
    caloriasTotais: Number(planoData.caloriasTotais) || 1800,
    macros: planoData.macros || { proteina: '120g', gordura: '50g', carboidrato: '200g' },
    refeicoes: planoData.refeicoes || [],
    orientacoesGerais: planoData.orientacoesGerais || 'Manter boa ingestão hídrica ao longo de todo o dia.',
    created_at: new Date().toISOString()
  };

  const listaAtual = Array.isArray(paciente.planosAlimentares) ? paciente.planosAlimentares : [];
  const dadosAtualizados = { planosAlimentares: [novoPlano, ...listaAtual] };

  const pacienteAtualizado = await atualizarPaciente(pacienteId, dadosAtualizados, nutricionistaId);
  return { novoPlano, pacienteAtualizado };
}

/**
 * Remove um plano alimentar
 */
export async function removerPlanoAlimentar(pacienteId, planoId, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return null;

  const listaFiltrada = (paciente.planosAlimentares || []).filter(pl => pl.id !== planoId);
  return atualizarPaciente(pacienteId, { planosAlimentares: listaFiltrada }, nutricionistaId);
}

/**
 * Registra uma nova consulta clínica completa com evolução
 */
export async function registrarConsultaCompleta(pacienteId, dadosConsulta, nutricionistaId) {
  const pacientes = await loadPacientesFromApi(nutricionistaId);
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return { pacienteAtualizado: null, retornoAgendado: null };

  const dataConsultaIso = dadosConsulta.data ? new Date(dadosConsulta.data).toISOString() : new Date().toISOString();

  let novoRetornoAgendado = null;
  if (dadosConsulta.proximoRetorno) {
    const dataRetornoIso = new Date(dadosConsulta.proximoRetorno).toISOString();
    novoRetornoAgendado = await agendarConsulta({
      pacienteId: pacienteId,
      pacienteNome: paciente.nome,
      dataConsulta: dataRetornoIso,
      tipo: 'Consulta de Retorno',
      modalidade: dadosConsulta.modalidadeRetorno || 'presencial',
      confirmacao: 'pendente'
    }, nutricionistaId);
  }

  const novoRegistro = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    data: dataConsultaIso,
    peso: Number(dadosConsulta.peso),
    cintura: dadosConsulta.cintura ? Number(dadosConsulta.cintura) : (paciente.cinturaAtual || null),
    quadril: dadosConsulta.quadril ? Number(dadosConsulta.quadril) : (paciente.quadrilAtual || null),
    gordura: dadosConsulta.gordura ? Number(dadosConsulta.gordura) : (paciente.gorduraAtual || null),
    massaMagra: dadosConsulta.massaMagra ? Number(dadosConsulta.massaMagra) : (paciente.massaMagraAtual || null),
    notas: dadosConsulta.observacoes || dadosConsulta.notas || 'Consulta de acompanhamento registrada',
    proximoRetorno: dadosConsulta.proximoRetorno || null
  };

  const historicoAtual = Array.isArray(paciente.historicoEvolucao) ? paciente.historicoEvolucao : [];
  const novoHistorico = [...historicoAtual, novoRegistro].sort((a, b) => new Date(a.data) - new Date(b.data));

  const dadosAtualizados = {
    pesoAtual: Number(dadosConsulta.peso),
    cinturaAtual: dadosConsulta.cintura ? Number(dadosConsulta.cintura) : paciente.cinturaAtual,
    quadrilAtual: dadosConsulta.quadril ? Number(dadosConsulta.quadril) : paciente.quadrilAtual,
    gorduraAtual: dadosConsulta.gordura ? Number(dadosConsulta.gordura) : paciente.gorduraAtual,
    massaMagraAtual: dadosConsulta.massaMagra ? Number(dadosConsulta.massaMagra) : paciente.massaMagraAtual,
    ultima_consulta: dataConsultaIso,
    consultasTotais: (paciente.consultasTotais || 0) + 1,
    historicoEvolucao: novoHistorico
  };

  const pacienteAtualizado = await atualizarPaciente(pacienteId, dadosAtualizados, nutricionistaId);
  return { pacienteAtualizado, retornoAgendado: novoRetornoAgendado };
}

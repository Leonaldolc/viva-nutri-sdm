import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

/**
 * Cria uma instância de conexão SQL com o Neon PostgreSQL.
 * Usa a variável de ambiente DATABASE_URL configurada no .env ou Vercel.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada. Adicione no .env ou nas variáveis de ambiente da Vercel.');
  }
  return neon(databaseUrl);
}

/**
 * Converte qualquer string (ID de auth, string simples ou uuid) em um UUID válido e determinístico
 */
export function toValidUuid(str) {
  if (!str) return '00000000-0000-0000-0000-000000000001';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(String(str).trim())) {
    return String(str).trim();
  }
  const hash = crypto.createHash('md5').update(String(str).trim()).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Garante que o registro do nutricionista exista na tabela nutricionistas (evita falha na foreign key)
 */
export async function ensureNutricionista(sql, nutriId, name = 'Nutricionista', email = null) {
  try {
    const validId = toValidUuid(nutriId);
    const nutriEmail = email || `nutri_${validId.slice(0, 8)}@vivanutri.com`;
    await sql`
      INSERT INTO nutricionistas (id, nome, email)
      VALUES (${validId}::uuid, ${name || 'Nutricionista'}, ${nutriEmail})
      ON CONFLICT (id) DO NOTHING
    `;
    return validId;
  } catch (err) {
    console.warn('[DB] Aviso ao verificar nutricionista:', err.message);
    return toValidUuid(nutriId);
  }
}

/**
 * Garante que as tabelas necessárias existam no banco e seus tipos estejam corretos.
 */
export async function ensureTablesExist(sql) {
  try {
    // 1. Tabela Nutricionistas
    await sql`
      CREATE TABLE IF NOT EXISTS nutricionistas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 2. Tabela Pacientes
    await sql`
      CREATE TABLE IF NOT EXISTS pacientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nutricionista_id UUID REFERENCES nutricionistas(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Garantir colunas completas da tabela pacientes
    await sql`
      ALTER TABLE pacientes
        ADD COLUMN IF NOT EXISTS data_nascimento DATE,
        ADD COLUMN IF NOT EXISTS idade INTEGER,
        ADD COLUMN IF NOT EXISTS sexo TEXT DEFAULT 'Não informado',
        ADD COLUMN IF NOT EXISTS telefone TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS objetivo TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS objetivos JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS objetivo_detalhes TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS nivel_atividade TEXT DEFAULT 'Sedentário',
        ADD COLUMN IF NOT EXISTS peso_atual NUMERIC(6,2),
        ADD COLUMN IF NOT EXISTS peso_inicial NUMERIC(6,2),
        ADD COLUMN IF NOT EXISTS peso_meta NUMERIC(6,2),
        ADD COLUMN IF NOT EXISTS altura NUMERIC(5,1),
        ADD COLUMN IF NOT EXISTS imc NUMERIC(4,1),
        ADD COLUMN IF NOT EXISTS gordura_atual NUMERIC(4,1) DEFAULT 24,
        ADD COLUMN IF NOT EXISTS gordura_inicial NUMERIC(4,1) DEFAULT 24,
        ADD COLUMN IF NOT EXISTS massa_magra_atual NUMERIC(4,1) DEFAULT 30,
        ADD COLUMN IF NOT EXISTS massa_magra_inicial NUMERIC(4,1) DEFAULT 30,
        ADD COLUMN IF NOT EXISTS cintura_atual NUMERIC(5,1) DEFAULT 82,
        ADD COLUMN IF NOT EXISTS cintura_inicial NUMERIC(5,1) DEFAULT 82,
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo',
        ADD COLUMN IF NOT EXISTS adesao_plano INTEGER DEFAULT 85,
        ADD COLUMN IF NOT EXISTS consultas_totais INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS ultima_consulta TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS patologias JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS restricoes_alimentares JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS alergias_alimentares JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS medicamentos_continuos TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS suplementos TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS refeicoes_por_dia INTEGER DEFAULT 4,
        ADD COLUMN IF NOT EXISTS horario_acorda TEXT DEFAULT '07:00',
        ADD COLUMN IF NOT EXISTS horario_dorme TEXT DEFAULT '23:00',
        ADD COLUMN IF NOT EXISTS agua_por_dia NUMERIC(3,1) DEFAULT 2,
        ADD COLUMN IF NOT EXISTS pratica_atividade_fisica BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS atividade_fisica_detalhes TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS observacoes_gerais TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS historico_evolucao JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS planos_alimentares JSONB DEFAULT '[]'::jsonb
    `;

    // 3. Tabela Consultas
    await sql`
      CREATE TABLE IF NOT EXISTS consultas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nutricionista_id UUID,
        paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
        paciente_nome TEXT DEFAULT '',
        paciente_telefone TEXT DEFAULT '',
        paciente_email TEXT DEFAULT '',
        data_consulta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status TEXT DEFAULT 'agendada',
        confirmacao TEXT DEFAULT 'pendente',
        modalidade TEXT DEFAULT 'presencial',
        link_teleconsulta TEXT DEFAULT '',
        tipo TEXT DEFAULT 'Consulta de Retorno',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Garantir colunas completas da tabela consultas caso ela já existisse
    await sql`
      ALTER TABLE consultas
        ADD COLUMN IF NOT EXISTS nutricionista_id UUID,
        ADD COLUMN IF NOT EXISTS paciente_id UUID,
        ADD COLUMN IF NOT EXISTS paciente_nome TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS paciente_telefone TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS paciente_email TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS data_consulta TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'agendada',
        ADD COLUMN IF NOT EXISTS confirmacao TEXT DEFAULT 'pendente',
        ADD COLUMN IF NOT EXISTS modalidade TEXT DEFAULT 'presencial',
        ADD COLUMN IF NOT EXISTS link_teleconsulta TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'Consulta de Retorno'
    `;

    // 4. Tabela Planos Alimentares
    await sql`
      CREATE TABLE IF NOT EXISTS planos_alimentares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
        nutricionista_id UUID NOT NULL,
        titulo TEXT DEFAULT 'Plano Nutricional',
        data_geracao TIMESTAMPTZ DEFAULT NOW(),
        calorias_totais INTEGER DEFAULT 1800,
        macros JSONB DEFAULT '{}'::jsonb,
        refeicoes JSONB DEFAULT '[]'::jsonb,
        orientacoes_gerais TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

  } catch (err) {
    console.warn('[DB] Aviso em ensureTablesExist:', err.message);
  }
}

/**
 * Helper para converter snake_case do banco para camelCase do frontend
 */
export function dbRowToFrontend(row) {
  if (!row) return null;

  const parseJsonField = (val, defaultVal = []) => {
    if (!val) return defaultVal;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return defaultVal;
    }
  };

  return {
    id: row.id,
    nutricionista_id: row.nutricionista_id,
    nome: row.nome,
    dataNascimento: row.data_nascimento ? new Date(row.data_nascimento).toISOString().split('T')[0] : '',
    idade: row.idade,
    sexo: row.sexo,
    telefone: row.telefone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    objetivo: row.objetivo || '',
    objetivos: parseJsonField(row.objetivos, []),
    objetivoDetalhes: row.objetivo_detalhes || '',
    categoria: row.categoria || '',
    nivelAtividade: row.nivel_atividade || '',
    pesoAtual: row.peso_atual ? Number(row.peso_atual) : null,
    pesoInicial: row.peso_inicial ? Number(row.peso_inicial) : null,
    pesoMeta: row.peso_meta ? Number(row.peso_meta) : null,
    altura: row.altura ? Number(row.altura) : null,
    imc: row.imc ? Number(row.imc) : null,
    gorduraAtual: row.gordura_atual ? Number(row.gordura_atual) : 24,
    gorduraInicial: row.gordura_inicial ? Number(row.gordura_inicial) : 24,
    massaMagraAtual: row.massa_magra_atual ? Number(row.massa_magra_atual) : 30,
    massaMagraInicial: row.massa_magra_inicial ? Number(row.massa_magra_inicial) : 30,
    cinturaAtual: row.cintura_atual ? Number(row.cintura_atual) : 82,
    cinturaInicial: row.cintura_inicial ? Number(row.cintura_inicial) : 82,
    status: row.status || 'ativo',
    adesaoPlano: row.adesao_plano !== undefined && row.adesao_plano !== null ? Number(row.adesao_plano) : 85,
    consultasTotais: row.consultas_totais !== undefined && row.consultas_totais !== null ? Number(row.consultas_totais) : 1,
    ultima_consulta: row.ultima_consulta || row.created_at || new Date().toISOString(),
    patologias: parseJsonField(row.patologias, []),
    restricoesAlimentares: parseJsonField(row.restricoes_alimentares, []),
    alergiasAlimentares: parseJsonField(row.alergias_alimentares, []),
    medicamentosContinuos: row.medicamentos_continuos || '',
    suplementos: row.suplementos || '',
    refeicoesPorDia: row.refeicoes_por_dia ? Number(row.refeicoes_por_dia) : 4,
    horarioAcorda: row.horario_acorda || '07:00',
    horarioDorme: row.horario_dorme || '23:00',
    aguaPorDia: row.agua_por_dia ? Number(row.agua_por_dia) : 2,
    praticaAtividadeFisica: Boolean(row.pratica_atividade_fisica),
    atividadeFisicaDetalhes: row.atividade_fisica_detalhes || '',
    observacoesGerais: row.observacoes_gerais || '',
    historicoEvolucao: parseJsonField(row.historico_evolucao, []),
    anexos: parseJsonField(row.anexos, []),
    planosAlimentares: parseJsonField(row.planos_alimentares, []),
    created_at: row.created_at
  };
}

/**
 * Helper para converter camelCase do frontend para snake_case do banco
 */
export function frontendToDbRow(data) {
  const row = {};
  if (data.nome !== undefined) row.nome = data.nome;
  if (data.dataNascimento !== undefined) row.data_nascimento = data.dataNascimento || null;
  if (data.idade !== undefined) row.idade = data.idade;
  if (data.sexo !== undefined) row.sexo = data.sexo;
  if (data.telefone !== undefined) row.telefone = data.telefone;
  if (data.whatsapp !== undefined) row.whatsapp = data.whatsapp;
  if (data.email !== undefined) row.email = data.email;
  if (data.objetivo !== undefined) row.objetivo = data.objetivo;
  if (data.objetivos !== undefined) row.objetivos = Array.isArray(data.objetivos) ? data.objetivos : [];
  if (data.objetivoDetalhes !== undefined) row.objetivo_detalhes = data.objetivoDetalhes;
  if (data.categoria !== undefined) row.categoria = data.categoria;
  if (data.nivelAtividade !== undefined) row.nivel_atividade = data.nivelAtividade;
  if (data.pesoAtual !== undefined) row.peso_atual = data.pesoAtual;
  if (data.pesoInicial !== undefined) row.peso_inicial = data.pesoInicial;
  if (data.pesoMeta !== undefined) row.peso_meta = data.pesoMeta;
  if (data.altura !== undefined) row.altura = data.altura;
  if (data.imc !== undefined) row.imc = data.imc;
  if (data.gorduraAtual !== undefined) row.gordura_atual = data.gorduraAtual;
  if (data.gorduraInicial !== undefined) row.gordura_inicial = data.gorduraInicial;
  if (data.massaMagraAtual !== undefined) row.massa_magra_atual = data.massaMagraAtual;
  if (data.massaMagraInicial !== undefined) row.massa_magra_inicial = data.massaMagraInicial;
  if (data.cinturaAtual !== undefined) row.cintura_atual = data.cinturaAtual;
  if (data.cinturaInicial !== undefined) row.cintura_inicial = data.cinturaInicial;
  if (data.status !== undefined) row.status = data.status;
  if (data.adesaoPlano !== undefined) row.adesao_plano = data.adesaoPlano;
  if (data.consultasTotais !== undefined) row.consultas_totais = data.consultasTotais;
  if (data.ultima_consulta !== undefined) row.ultima_consulta = data.ultima_consulta;
  if (data.patologias !== undefined) row.patologias = Array.isArray(data.patologias) ? data.patologias : [];
  if (data.restricoesAlimentares !== undefined) row.restricoes_alimentares = Array.isArray(data.restricoesAlimentares) ? data.restricoesAlimentares : [];
  if (data.alergiasAlimentares !== undefined) row.alergias_alimentares = Array.isArray(data.alergiasAlimentares) ? data.alergiasAlimentares : [];
  if (data.medicamentosContinuos !== undefined) row.medicamentos_continuos = data.medicamentosContinuos;
  if (data.suplementos !== undefined) row.suplementos = data.suplementos;
  if (data.refeicoesPorDia !== undefined) row.refeicoes_por_dia = data.refeicoesPorDia;
  if (data.horarioAcorda !== undefined) row.horario_acorda = data.horarioAcorda;
  if (data.horarioDorme !== undefined) row.horario_dorme = data.horarioDorme;
  if (data.aguaPorDia !== undefined) row.agua_por_dia = data.aguaPorDia;
  if (data.praticaAtividadeFisica !== undefined) row.pratica_atividade_fisica = data.praticaAtividadeFisica;
  if (data.atividadeFisicaDetalhes !== undefined) row.atividade_fisica_detalhes = data.atividadeFisicaDetalhes;
  if (data.observacoesGerais !== undefined) row.observacoes_gerais = data.observacoesGerais;
  if (data.historicoEvolucao !== undefined) row.historico_evolucao = Array.isArray(data.historicoEvolucao) ? data.historicoEvolucao : [];
  if (data.anexos !== undefined) row.anexos = Array.isArray(data.anexos) ? data.anexos : [];
  if (data.planosAlimentares !== undefined) row.planos_alimentares = Array.isArray(data.planosAlimentares) ? data.planosAlimentares : [];
  return row;
}

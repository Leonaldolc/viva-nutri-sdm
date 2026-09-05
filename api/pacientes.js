import { getDb, ensureTablesExist, ensureNutricionista, toValidUuid, dbRowToFrontend, frontendToDbRow } from './db.js';

/**
 * Serverless Function: /api/pacientes
 * CRUD completo de pacientes com persistência no Neon PostgreSQL
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = getDb();
    await ensureTablesExist(sql);

    // ===== GET: Listar pacientes do nutricionista =====
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const rawNutricionistaId = url.searchParams.get('nutricionista_id');
      const rawPacienteId = url.searchParams.get('id');

      if (rawPacienteId) {
        const pacienteId = toValidUuid(rawPacienteId);
        const rows = await sql`
          SELECT * FROM pacientes WHERE id = ${pacienteId}::uuid
        `;
        if (rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Paciente não encontrado.' });
        }
        return res.status(200).json({ success: true, paciente: dbRowToFrontend(rows[0]) });
      }

      if (!rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'nutricionista_id é obrigatório.' });
      }

      const nutricionistaId = toValidUuid(rawNutricionistaId);
      await ensureNutricionista(sql, nutricionistaId);

      const rows = await sql`
        SELECT * FROM pacientes 
        WHERE nutricionista_id = ${nutricionistaId}::uuid 
        ORDER BY created_at DESC
      `;

      const pacientes = rows.map(dbRowToFrontend);
      return res.status(200).json({ success: true, pacientes });
    }

    // ===== POST: Cadastrar novo paciente =====
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { pacienteData, nutricionistaId: rawNutricionistaId } = body;

      if (!pacienteData || !rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'pacienteData e nutricionistaId são obrigatórios.' });
      }

      if (!pacienteData.nome || !pacienteData.nome.trim()) {
        return res.status(400).json({ success: false, error: 'Nome do paciente é obrigatório.' });
      }

      const nutricionistaId = toValidUuid(rawNutricionistaId);
      await ensureNutricionista(sql, nutricionistaId);

      // Preparar dados
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

      const now = new Date().toISOString();

      const historicoInicial = Array.isArray(pacienteData.historicoEvolucao) && pacienteData.historicoEvolucao.length > 0
        ? pacienteData.historicoEvolucao
        : [{
            data: now,
            peso: pesoNum || 70,
            gordura: 24,
            massaMagra: 30,
            cintura: 82,
            adesao: 85,
            notas: 'Primeira consulta e cadastro do paciente'
          }];

      const patologiasList = Array.isArray(pacienteData.patologias) ? pacienteData.patologias : [];
      const restricoesList = Array.isArray(pacienteData.restricoesAlimentares) ? pacienteData.restricoesAlimentares : [];
      const alergiasList = Array.isArray(pacienteData.alergiasAlimentares) ? pacienteData.alergiasAlimentares : [];

      const rows = await sql`
        INSERT INTO pacientes (
          nutricionista_id, nome, data_nascimento, idade, sexo, telefone, whatsapp, email,
          objetivo, objetivos, objetivo_detalhes, categoria, nivel_atividade,
          peso_atual, peso_inicial, altura, imc,
          gordura_atual, gordura_inicial, massa_magra_atual, massa_magra_inicial,
          cintura_atual, cintura_inicial, status, adesao_plano, consultas_totais,
          patologias, restricoes_alimentares, alergias_alimentares,
          medicamentos_continuos, suplementos,
          refeicoes_por_dia, horario_acorda, horario_dorme, agua_por_dia,
          pratica_atividade_fisica, atividade_fisica_detalhes, observacoes_gerais,
          historico_evolucao, ultima_consulta
        ) VALUES (
          ${nutricionistaId}::uuid,
          ${(pacienteData.nome || '').trim()},
          ${pacienteData.dataNascimento || null},
          ${pacienteData.idade || null},
          ${pacienteData.sexo || 'Não informado'},
          ${(pacienteData.telefone || '').trim()},
          ${(pacienteData.whatsapp || pacienteData.telefone || '').trim()},
          ${(pacienteData.email || '').trim()},
          ${objetivoPrincipal},
          ${JSON.stringify(objetivosList)}::jsonb,
          ${pacienteData.objetivoDetalhes || ''},
          ${objetivosList[0] || 'Saúde geral'},
          ${pacienteData.nivelAtividade || 'Sedentário'},
          ${pesoNum || 70},
          ${pesoNum || 70},
          ${alturaNum || 170},
          ${imcCalculado},
          ${24}, ${24}, ${30}, ${30}, ${82}, ${82},
          'ativo',
          ${85},
          ${1},
          ${JSON.stringify(patologiasList)}::jsonb,
          ${JSON.stringify(restricoesList)}::jsonb,
          ${JSON.stringify(alergiasList)}::jsonb,
          ${pacienteData.medicamentosContinuos || ''},
          ${pacienteData.suplementos || ''},
          ${pacienteData.refeicoesPorDia ? Number(pacienteData.refeicoesPorDia) : 4},
          ${pacienteData.horarioAcorda || '07:00'},
          ${pacienteData.horarioDorme || '23:00'},
          ${pacienteData.aguaPorDia ? Number(pacienteData.aguaPorDia) : 2},
          ${Boolean(pacienteData.praticaAtividadeFisica)},
          ${pacienteData.atividadeFisicaDetalhes || ''},
          ${pacienteData.observacoesGerais || ''},
          ${JSON.stringify(historicoInicial)}::jsonb,
          ${now}
        ) RETURNING *
      `;

      return res.status(201).json({
        success: true,
        paciente: dbRowToFrontend(rows[0])
      });
    }

    // ===== PUT: Atualizar paciente =====
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { pacienteId: rawPacienteId, dadosAtualizados, nutricionistaId: rawNutricionistaId } = body;

      if (!rawPacienteId || !rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'pacienteId e nutricionistaId são obrigatórios.' });
      }

      const pacienteId = toValidUuid(rawPacienteId);
      const nutricionistaId = toValidUuid(rawNutricionistaId);
      await ensureNutricionista(sql, nutricionistaId);

      // Converter camelCase para snake_case
      const dbData = frontendToDbRow(dadosAtualizados || {});

      // Buscar paciente atual
      const currentRows = await sql`
        SELECT * FROM pacientes 
        WHERE id = ${pacienteId}::uuid AND nutricionista_id = ${nutricionistaId}::uuid
      `;
      if (currentRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Paciente não encontrado.' });
      }

      const current = currentRows[0];
      const merged = { ...current, ...dbData };

      // Recalcular IMC se peso ou altura mudaram
      let imcFinal = merged.imc;
      if (merged.peso_atual && merged.altura && Number(merged.altura) > 0) {
        const altM = Number(merged.altura) / 100;
        imcFinal = Number((Number(merged.peso_atual) / (altM * altM)).toFixed(1));
      }

      const rows = await sql`
        UPDATE pacientes SET
          nome = ${merged.nome || current.nome},
          data_nascimento = ${merged.data_nascimento || null},
          idade = ${merged.idade || null},
          sexo = ${merged.sexo || current.sexo},
          telefone = ${merged.telefone || ''},
          whatsapp = ${merged.whatsapp || ''},
          email = ${merged.email || ''},
          objetivo = ${merged.objetivo || ''},
          objetivos = ${JSON.stringify(Array.isArray(merged.objetivos) ? merged.objetivos : [])}::jsonb,
          objetivo_detalhes = ${merged.objetivo_detalhes || ''},
          categoria = ${merged.categoria || ''},
          nivel_atividade = ${merged.nivel_atividade || 'Sedentário'},
          peso_atual = ${merged.peso_atual ? Number(merged.peso_atual) : null},
          peso_inicial = ${merged.peso_inicial ? Number(merged.peso_inicial) : null},
          peso_meta = ${merged.peso_meta ? Number(merged.peso_meta) : null},
          altura = ${merged.altura ? Number(merged.altura) : null},
          imc = ${imcFinal},
          gordura_atual = ${merged.gordura_atual ? Number(merged.gordura_atual) : 24},
          gordura_inicial = ${merged.gordura_inicial ? Number(merged.gordura_inicial) : 24},
          massa_magra_atual = ${merged.massa_magra_atual ? Number(merged.massa_magra_atual) : 30},
          massa_magra_inicial = ${merged.massa_magra_inicial ? Number(merged.massa_magra_inicial) : 30},
          cintura_atual = ${merged.cintura_atual ? Number(merged.cintura_atual) : 82},
          cintura_inicial = ${merged.cintura_inicial ? Number(merged.cintura_inicial) : 82},
          status = ${merged.status || 'ativo'},
          adesao_plano = ${merged.adesao_plano !== undefined ? Number(merged.adesao_plano) : 85},
          consultas_totais = ${merged.consultas_totais !== undefined ? Number(merged.consultas_totais) : 1},
          ultima_consulta = ${merged.ultima_consulta || current.ultima_consulta},
          patologias = ${JSON.stringify(Array.isArray(merged.patologias) ? merged.patologias : [])}::jsonb,
          restricoes_alimentares = ${JSON.stringify(Array.isArray(merged.restricoes_alimentares) ? merged.restricoes_alimentares : [])}::jsonb,
          alergias_alimentares = ${JSON.stringify(Array.isArray(merged.alergias_alimentares) ? merged.alergias_alimentares : [])}::jsonb,
          medicamentos_continuos = ${merged.medicamentos_continuos || ''},
          suplementos = ${merged.suplementos || ''},
          refeicoes_por_dia = ${merged.refeicoes_por_dia ? Number(merged.refeicoes_por_dia) : 4},
          horario_acorda = ${merged.horario_acorda || '07:00'},
          horario_dorme = ${merged.horario_dorme || '23:00'},
          agua_por_dia = ${merged.agua_por_dia ? Number(merged.agua_por_dia) : 2},
          pratica_atividade_fisica = ${Boolean(merged.pratica_atividade_fisica)},
          atividade_fisica_detalhes = ${merged.atividade_fisica_detalhes || ''},
          observacoes_gerais = ${merged.observacoes_gerais || ''},
          historico_evolucao = ${JSON.stringify(Array.isArray(merged.historico_evolucao) ? merged.historico_evolucao : [])}::jsonb,
          anexos = ${JSON.stringify(Array.isArray(merged.anexos) ? merged.anexos : [])}::jsonb,
          planos_alimentares = ${JSON.stringify(Array.isArray(merged.planos_alimentares) ? merged.planos_alimentares : [])}::jsonb
        WHERE id = ${pacienteId}::uuid AND nutricionista_id = ${nutricionistaId}::uuid
        RETURNING *
      `;

      return res.status(200).json({
        success: true,
        paciente: dbRowToFrontend(rows[0])
      });
    }

    // ===== DELETE: Excluir paciente =====
    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { pacienteId: rawPacienteId, nutricionistaId: rawNutricionistaId } = body;

      if (!rawPacienteId || !rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'pacienteId e nutricionistaId são obrigatórios.' });
      }

      const pacienteId = toValidUuid(rawPacienteId);
      const nutricionistaId = toValidUuid(rawNutricionistaId);

      // Deletar consultas do paciente
      await sql`
        DELETE FROM consultas WHERE paciente_id = ${pacienteId}::uuid
      `;

      // Deletar o paciente
      await sql`
        DELETE FROM pacientes WHERE id = ${pacienteId}::uuid AND nutricionista_id = ${nutricionistaId}::uuid
      `;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API /api/pacientes:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor.'
    });
  }
}

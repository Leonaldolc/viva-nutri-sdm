import { getDb, ensureTablesExist, ensureNutricionista, toValidUuid } from './db.js';

/**
 * Serverless Function: /api/consultas
 * CRUD completo de consultas com persistência no Neon PostgreSQL
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  /**
   * Converte row do banco para formato camelCase do frontend
   */
  function consultaToFrontend(row) {
    if (!row) return null;
    return {
      id: row.id,
      nutricionista_id: row.nutricionista_id,
      paciente_id: row.paciente_id,
      paciente_nome: row.paciente_nome || '',
      paciente_telefone: row.paciente_telefone || '',
      paciente_email: row.paciente_email || '',
      data_consulta: row.data_consulta,
      status: row.status || 'agendada',
      confirmacao: row.confirmacao || 'pendente',
      modalidade: row.modalidade || 'presencial',
      linkTeleconsulta: row.link_teleconsulta || '',
      tipo: row.tipo || 'Consulta de Retorno',
      created_at: row.created_at
    };
  }

  try {
    const sql = getDb();
    await ensureTablesExist(sql);

    // ===== GET: Listar consultas =====
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const rawNutricionistaId = url.searchParams.get('nutricionista_id');
      const rawPacienteId = url.searchParams.get('paciente_id');

      if (rawPacienteId) {
        const pacienteId = toValidUuid(rawPacienteId);
        const rows = await sql`
          SELECT * FROM consultas 
          WHERE paciente_id = ${pacienteId}::uuid 
          ORDER BY data_consulta DESC
        `;
        return res.status(200).json({ success: true, consultas: rows.map(consultaToFrontend) });
      }

      if (!rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'nutricionista_id é obrigatório.' });
      }

      const nutricionistaId = toValidUuid(rawNutricionistaId);
      await ensureNutricionista(sql, nutricionistaId);

      const rows = await sql`
        SELECT * FROM consultas 
        WHERE nutricionista_id = ${nutricionistaId}::uuid 
        ORDER BY data_consulta ASC
      `;

      return res.status(200).json({ success: true, consultas: rows.map(consultaToFrontend) });
    }

    // ===== POST: Agendar consulta =====
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { consultaData, nutricionistaId: rawNutricionistaId } = body;

      if (!consultaData || !rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'consultaData e nutricionistaId são obrigatórios.' });
      }

      const nutricionistaId = toValidUuid(rawNutricionistaId);
      await ensureNutricionista(sql, nutricionistaId);

      const pacienteId = consultaData.pacienteId ? toValidUuid(consultaData.pacienteId) : null;

      // Verificar conflito de horário (40 minutos)
      if (!consultaData.forcarEncaixe && consultaData.dataConsulta) {
        const targetDate = new Date(consultaData.dataConsulta);
        const conflitos = await sql`
          SELECT * FROM consultas 
          WHERE nutricionista_id = ${nutricionistaId}::uuid
          AND status != 'cancelada'
          AND ABS(EXTRACT(EPOCH FROM (data_consulta - ${targetDate.toISOString()}::timestamptz))) < 2400
        `;

        if (conflitos.length > 0) {
          const c = consultaToFrontend(conflitos[0]);
          const dConf = new Date(c.data_consulta);
          const horaConf = dConf.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const dataConf = dConf.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          return res.status(409).json({
            success: false,
            isConflict: true,
            conflito: c,
            error: `Horário Ocupado: O paciente "${c.paciente_nome}" já está agendado para ${dataConf} às ${horaConf}.`
          });
        }
      }

      const rows = await sql`
        INSERT INTO consultas (
          nutricionista_id, paciente_id, paciente_nome, paciente_telefone, paciente_email,
          data_consulta, status, confirmacao, modalidade, link_teleconsulta, tipo
        ) VALUES (
          ${nutricionistaId}::uuid,
          ${pacienteId ? sql`${pacienteId}::uuid` : null},
          ${consultaData.pacienteNome || ''},
          ${consultaData.pacienteTelefone || ''},
          ${consultaData.pacienteEmail || ''},
          ${consultaData.dataConsulta ? new Date(consultaData.dataConsulta).toISOString() : new Date().toISOString()}::timestamptz,
          ${consultaData.status || 'agendada'},
          ${consultaData.confirmacao || 'pendente'},
          ${consultaData.modalidade || 'presencial'},
          ${consultaData.linkTeleconsulta || ''},
          ${consultaData.tipo || 'Consulta de Retorno'}
        ) RETURNING *
      `;

      return res.status(201).json({
        success: true,
        consulta: consultaToFrontend(rows[0])
      });
    }

    // ===== PUT: Atualizar consulta =====
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { consultaId: rawConsultaId, dadosAtualizados, nutricionistaId: rawNutricionistaId } = body;

      if (!rawConsultaId || !rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'consultaId e nutricionistaId são obrigatórios.' });
      }

      const consultaId = toValidUuid(rawConsultaId);
      const nutricionistaId = toValidUuid(rawNutricionistaId);
      await ensureNutricionista(sql, nutricionistaId);

      // Buscar atual
      const currentRows = await sql`SELECT * FROM consultas WHERE id = ${consultaId}::uuid`;
      if (currentRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Consulta não encontrada.' });
      }

      const current = currentRows[0];
      const novoStatus = dadosAtualizados.confirmacao === 'confirmado' ? 'confirmada' : (dadosAtualizados.status || current.status);

      const rows = await sql`
        UPDATE consultas SET
          data_consulta = ${dadosAtualizados.data_consulta || current.data_consulta}::timestamptz,
          status = ${novoStatus},
          confirmacao = ${dadosAtualizados.confirmacao || current.confirmacao},
          modalidade = ${dadosAtualizados.modalidade || current.modalidade},
          link_teleconsulta = ${dadosAtualizados.linkTeleconsulta !== undefined ? dadosAtualizados.linkTeleconsulta : (current.link_teleconsulta || '')},
          tipo = ${dadosAtualizados.tipo || current.tipo}
        WHERE id = ${consultaId}::uuid
        RETURNING *
      `;

      return res.status(200).json({
        success: true,
        consulta: consultaToFrontend(rows[0])
      });
    }

    // ===== DELETE: Desmarcar consulta =====
    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { consultaId: rawConsultaId, nutricionistaId: rawNutricionistaId } = body;

      if (!rawConsultaId || !rawNutricionistaId) {
        return res.status(400).json({ success: false, error: 'consultaId e nutricionistaId são obrigatórios.' });
      }

      const consultaId = toValidUuid(rawConsultaId);
      const nutricionistaId = toValidUuid(rawNutricionistaId);

      await sql`
        DELETE FROM consultas WHERE id = ${consultaId}::uuid AND nutricionista_id = ${nutricionistaId}::uuid
      `;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API /api/consultas:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor.'
    });
  }
}

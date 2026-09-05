import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Serverless Function: /api/gerar-plano
 * Endpoint seguro para geração de plano alimentar semanal via IA Google Gemini
 * Compatível com Vercel Serverless e Vite Dev Middleware
 */
export default async function handler(req, res) {
  // Configurar cabeçalhos CORS e JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Utilize POST.'
    });
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY;

  if (!apiKey || apiKey === 'sua_chave_aqui' || apiKey === 'sua_chave_google_aqui') {
    return res.status(500).json({
      success: false,
      error: 'GOOGLE_API_KEY não configurada no ambiente.',
      fallbackAvailable: true
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { paciente, instrucoesAdicionais } = body;

    if (!paciente) {
      return res.status(400).json({
        success: false,
        error: 'Dados do paciente não fornecidos na requisição.'
      });
    }

    // Formatar contexto clínico do paciente para o prompt
    const dadosPacienteFormatados = `
- Nome: ${paciente.nome || 'Paciente'}
- Idade: ${paciente.idade || 'Não informada'} anos | Sexo: ${paciente.sexo || 'Não informado'}
- Peso: ${paciente.peso || 'Não informado'} kg | Altura: ${paciente.altura || 'Não informada'} cm | IMC: ${paciente.imc || 'Não calculado'}
- Objetivo Clínico: ${paciente.objetivo || 'Reeducação alimentar e saúde'}
- Alergias e Intolerâncias: ${paciente.alergias || 'Nenhuma informada'}
- Restrições Alimentares: ${paciente.restricoes || 'Nenhuma informada'}
- Preferências / Alimentos Favoritos: ${paciente.preferencias || 'Não especificadas'}
- Aversões Alimentares: ${paciente.aversoes || 'Nenhuma'}
- Nível de Atividade Física: ${paciente.nivelAtividade || 'Moderado'}
- Taxa Metabólica Basal (TMB): ${paciente.tmb ? `${paciente.tmb} kcal` : 'Aproximadamente 1600 kcal'}
- Gasto Energético Total (GET): ${paciente.get ? `${paciente.get} kcal` : 'Aproximadamente 2100 kcal'}
- Meta Calórica Estimada: ${paciente.caloriasMeta ? `${paciente.caloriasMeta} kcal/dia` : 'Adequada ao objetivo'}
- Observações Clínicas / Histórico: ${paciente.observacoesClinicas || paciente.observacoes || 'Sem histórico prévio de patologias graves.'}
${instrucoesAdicionais ? `- Instruções Específicas do Nutricionista: ${instrucoesAdicionais}` : ''}
    `.trim();

    const promptInterno = `
Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dadosPacienteFormatados}

# Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Terça-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Quarta-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Quinta-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Sexta-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Sábado",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Domingo",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}
`.trim();

    const genAI = new GoogleGenerativeAI(apiKey);

    // Tentar modelos atuais do Gemini com structured JSON output
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError = null;
    let jsonResult = null;
    let successfulModel = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });

        const result = await model.generateContent(promptInterno);
        const textResponse = result.response.text();

        // Limpeza segura de blocos de formatação caso a IA tenha adicionado markdown
        let cleanText = textResponse.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        const parsed = JSON.parse(cleanText);

        if (parsed && Array.isArray(parsed.plano_semanal) && parsed.plano_semanal.length > 0) {
          jsonResult = parsed;
          successfulModel = modelName;
          break;
        }
      } catch (err) {
        lastError = err;
        // Tentar o próximo modelo da lista
        continue;
      }
    }

    if (!jsonResult) {
      throw lastError || new Error('Não foi possível obter resposta JSON estruturada da IA.');
    }

    return res.status(200).json({
      success: true,
      data: jsonResult,
      model: successfulModel,
      pacienteNome: paciente.nome
    });

  } catch (error) {
    console.error('Erro na geração do plano alimentar com Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar a geração do plano com IA.',
      fallbackAvailable: true
    });
  }
}

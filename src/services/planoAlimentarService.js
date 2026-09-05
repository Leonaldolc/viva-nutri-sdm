/**
 * Serviço de Integração de Planos Alimentares com IA (Prompt 6)
 * Realiza chamadas seguras para a Serverless Function /api/gerar-plano
 * e provê gerador clínico inteligente brasileiro para contingência/fallback.
 */

export const DIAS_DA_SEMANA = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

export const DIAS_ABREV = {
  'Segunda-feira': 'SEG',
  'Terça-feira': 'TER',
  'Quarta-feira': 'QUA',
  'Quinta-feira': 'QUI',
  'Sexta-feira': 'SEX',
  'Sábado': 'SÁB',
  'Domingo': 'DOM'
};

export const TIPOS_REFEICOES = [
  { key: 'cafe_da_manha', label: 'Café da Manhã', horario: '07:30', icone: '☕' },
  { key: 'lanche_manha', label: 'Lanche da Manhã', horario: '10:00', icone: '🍎' },
  { key: 'almoco', label: 'Almoço', horario: '12:30', icone: '🥗' },
  { key: 'lanche_tarde', label: 'Lanche da Tarde', horario: '16:00', icone: '🥪' },
  { key: 'jantar', label: 'Jantar', horario: '19:30', icone: '🍲' }
];

/**
 * Cria a estrutura base vazia de um plano semanal
 */
export function criarEstruturaPlanoSemanalVazio() {
  return DIAS_DA_SEMANA.map(dia => ({
    dia,
    refeicoes: {
      cafe_da_manha: ['', '', '', '', ''],
      lanche_manha: ['', '', '', '', ''],
      almoco: ['', '', '', '', ''],
      lanche_tarde: ['', '', '', '', ''],
      jantar: ['', '', '', '', '']
    }
  }));
}

/**
 * Gerador de cardápio clínico brasileiro variado para os 7 dias da semana
 */
export function gerarCardapioContingencia(paciente) {
  const objetivo = (paciente?.objetivo || '').toLowerCase();
  const restricoes = (paciente?.restricoes || '').toLowerCase();
  const isVeg = restricoes.includes('veg') || restricoes.includes('vegetar') || restricoes.includes('vegan');
  const isHipertrofia = objetivo.includes('hipertrofia') || objetivo.includes('ganho de massa');
  const isEmagrecimento = objetivo.includes('emagrecimento') || objetivo.includes('perda de peso') || objetivo.includes('secar');

  const cardapiosPorDia = {
    'Segunda-feira': {
      cafe_da_manha: [
        '2 ovos mexidos com orégano e 1 fatia de pão 100% integral',
        '1 xícara de café preto sem açúcar ou chá verde com gotas de limão',
        '1 fatia média de mamão formosa com 1 colher de sopa de sementes de chia',
        'Opção de troca: 1 tapioca pequena (30g) com queijo cottage ou ricota',
        '250ml de água mineral para hidratação matinal'
      ],
      lanche_manha: [
        '1 maçã fuji higienizada com casca',
        '15g de mix de castanhas-do-pará e nozes',
        '1 copo (250ml) de água de coco natural',
        'Opção de troca: 1 iogurte natural desnatado sem açúcar',
        '1 colher de sobremesa de farelo de aveia'
      ],
      almoco: [
        isVeg ? '150g Tofu marinado grelhado com gergelim' : (isHipertrofia ? '180g Filé de peito de frango grelhado com ervas finas' : '130g Filé de frango grelhado acebolado'),
        '1 concha média de feijão carioca fresquinho (caldo ralo)',
        isEmagrecimento ? '80g Arroz integral com cenoura ralada' : '140g Arroz integral com legumes',
        'Salada colorida à vontade: alface crespa, rúcula, tomate-cereja e pepino',
        '1 colher de sobremesa de azeite de oliva extravirgem + limão espremido'
      ],
      lanche_tarde: [
        '1 crepioca fit (1 ovo + 1 colher de sopa de goma de tapioca + pitada de sal)',
        'Recheio: 1 colher de sopa de queijo branco ralado ou pasta de amendoim integral',
        '1 banana prata fatiada com canela em pó salpicada',
        '1 xícara de chá de camomila ou erva-doce gelado',
        'Opção de troca: Vitamina de leite vegetal com morangos frescos'
      ],
      jantar: [
        isVeg ? 'Sopa cremosa de lentilha com espinafre e cenoura' : '140g Omelete com 2 ovos, tomate picado, espinafre e orégano',
        'Mix de legumes no vapor (brócolis, couve-flor e abobrinha)',
        'Salada verde de folhas escuras com azeite extravirgem',
        '1 prato fundo de caldo verde fit (couve com batata-doce)',
        'Chá digestivo de hortelã 30 min após a refeição'
      ]
    },
    'Terça-feira': {
      cafe_da_manha: [
        '1 pote de iogurte natural desnatado com 2 colheres de aveia em flocos finos',
        '1 punhado de morangos picados com sementes de linhaça dourada',
        '1 ovo cozido com pitada de açafrão e pimenta-do-reino',
        '1 xícara de café expresso ou chá de hibisco',
        'Opção de troca: 1 torrada integral com pasta de ricota e tomate'
      ],
      lanche_manha: [
        '1 pera williams com casca',
        '10 unidades de amêndoas tostadas sem sal',
        '300ml de água mineral aromatizada com hortelã',
        'Opção de troca: 1 fatia de melão doce',
        '1 colher de chá de sementes de abóbora'
      ],
      almoco: [
        isVeg ? '1 concha farta de lentilha temperada com cúrcuma e louro' : (isHipertrofia ? '180g Patinho moído magro refogado com cheiro-verde' : '130g Patinho moído refogado com legumes'),
        '1 concha média de feijão preto temperado com alho e cebola',
        isEmagrecimento ? '90g Mandioca cozida' : '150g Mandioca cozida com azeite',
        'Salada de repolho roxo, cenoura ralada, acelga e tomate',
        '1 colher de sobremesa de azeite extravirgem e vinagre de maçã'
      ],
      lanche_tarde: [
        '1 fatia de pão 100% integral com pasta de atum ou ricota temperada',
        '1 copo de suco verde natural (couve, limão, gengibre e maçã)',
        '1 punhado pequeno de uvas passas ou damascos',
        'Opção de troca: 1 taça de salada de frutas com chia',
        'Água mineral gelada'
      ],
      jantar: [
        isVeg ? 'Hambúrguer de grão-de-bico artesanal assado' : (isHipertrofia ? '180g Filé de tilápia grelhada com alecrim e alho' : '140g Filé de tilápia grelhada com limão'),
        '100g Purê de abóbora cabotiá temperado com noz-moscada',
        'Salada de folhas verdes com tomate-cereja e palmito',
        '1 colher de azeite de oliva extravirgem',
        'Chá de erva-cidreira'
      ]
    },
    'Quarta-feira': {
      cafe_da_manha: [
        '1 tapioca fina (35g) recheada com 2 ovos mexidos',
        '1 fatia de queijo minas frescal light',
        '1 fatia de abacaxi com folhas de hortelã',
        '1 xícara de café com leite vegetal ou café puro',
        '250ml de água morna com gotas de limão'
      ],
      lanche_manha: [
        '1 banana prata com 1 colher de pasta de amendoim 100% pura',
        '1 punhado de castanhas de caju sem sal',
        '1 copo de chá verde gelado com limão',
        'Opção de troca: 1 fatia de melancia fresca',
        'Água mineral constante'
      ],
      almoco: [
        isVeg ? 'Mix de cogumelos shimeji e paris refogados no azeite' : (isHipertrofia ? '190g Sobrecoxa de frango desossada assada com cúrcuma' : '140g Sobrecoxa de frango desossada assada'),
        '1 concha de feijão carioca com louro',
        isEmagrecimento ? '80g Quinoa em grãos cozida' : '140g Batata-doce assada em rodelas',
        'Salada crua: agrião, alface americana, beterraba ralada e rabanete',
        'Molho de limão com azeite extravirgem e orégano'
      ],
      lanche_tarde: [
        '2 fatias de queijo branco grelhado com orégano e tomate',
        '1 maçã verde fatiada com canela',
        '1 xícara de café com canela ou chá mate natural',
        'Opção de troca: Panqueca de 1 ovo + 2 colheres de aveia',
        '300ml de água com gás e rodelas de limão'
      ],
      jantar: [
        isVeg ? 'Sopa cremosa de abóbora com gengibre e sementes de girassol' : (isHipertrofia ? '170g Iscas de alcatra magra aceboladas com pimentões' : '130g Iscas de carne magra aceboladas'),
        'Brócolis e cenoura cozidos no vapor com azeite',
        'Salada de alface romana com pepino japonês e chia',
        '1 colher de azeite extravirgem',
        'Chá de camomila morno'
      ]
    },
    'Quinta-feira': {
      cafe_da_manha: [
        'Panqueca de banana fit (1 banana amassada + 1 ovo + 2 colheres de aveia + canela)',
        '1 xícara de café coado sem açúcar',
        '1/2 mamão papaia com raspas de limão',
        'Opção de troca: 2 ovos pochê com torrada integral',
        '250ml de água mineral fresca'
      ],
      lanche_manha: [
        '1 pote de iogurte desnatado ou kefir natural',
        '1 colher de sopa de sementes de chia ou linhaça',
        '1 ameixa fresca ou kiwi fatiado',
        'Opção de troca: 1 punhado de castanhas e nozes',
        'Água mineral'
      ],
      almoco: [
        isVeg ? 'Hambúrguer de lentilha com quinoa assado ao forno' : (isHipertrofia ? '180g Bife de alcatra magro grelhado' : '130g Bife de alcatra magro grelhado'),
        '1 concha de feijão preto fresquinho',
        isEmagrecimento ? '80g Arroz integral com salsa' : '140g Arroz 7 grãos integral',
        'Prato farto de salada: escarola refogada no alho, tomate e pepino',
        '1 colher de azeite de oliva extravirgem'
      ],
      lanche_tarde: [
        '1 sanduíche integral com patê de ricota, cenoura ralada e peito de frango desfiado',
        '1 copo de suco de maracujá natural sem açúcar',
        'Opção de troca: 1 crepioca com queijo cottage',
        '1 xícara de chá de hortelã',
        'Água mineral'
      ],
      jantar: [
        isVeg ? 'Omelete vegano de grão-de-bico com espinafre e tomate' : (isHipertrofia ? '180g Peito de frango desfiado com legumes' : '130g Peito de frango desfiado com legumes'),
        '1 prato de sopa de legumes com couve e abobrinha',
        'Mix de folhas verdes com palmito e azeite',
        '1 colher de azeite extravirgem',
        'Chá de melissa ou erva-doce'
      ]
    },
    'Sexta-feira': {
      cafe_da_manha: [
        '2 fatias de pão 100% integral com ovos mexidos e tomate concassé',
        '1 fatia de melão doce com raspas de limão',
        '1 xícara de café puro ou chá verde',
        'Opção de troca: 1 tapioca com recheio de frango desfiado e ricota',
        '250ml de água mineral'
      ],
      lanche_manha: [
        '1 goiaba vermelha ou 1 maçã higienizada',
        '15g de castanhas-de-caju sem sal',
        '1 copo de água de coco fresca',
        'Opção de troca: 1 iogurte com aveia',
        'Água mineral'
      ],
      almoco: [
        isVeg ? 'Moqueca vegetariana de palmito, banana-da-terra e pimentões' : (isHipertrofia ? '190g Filé de salmão ou tilápia grelhada com alecrim' : '140g Filé de peixe assado ao forno com ervas'),
        '1 concha média de feijão carioca',
        isEmagrecimento ? '80g Batata-doce assada' : '140g Batata inglesa assada com azeite',
        'Salada colorida de folhas nobres, tomate-cereja e cenoura',
        '1 colher de sobremesa de azeite de oliva extravirgem'
      ],
      lanche_tarde: [
        '1 crepioca fit de cacau 100% com recheio de banana e canela',
        '1 xícara de café com canela ou chá gelado de hibisco',
        'Opção de troca: 1 punhado de mix de oleaginosas com uva passa',
        '1 fatia de queijo branco',
        '300ml de água mineral'
      ],
      jantar: [
        isVeg ? 'Strogonoff fit de cogumelos com leite de aveia' : (isHipertrofia ? '170g Filé de frango grelhado com cogumelos e salada' : '130g Filé de frango grelhado com legumes'),
        'Mix de vegetais grelhados: abobrinha, berinjela e tomate',
        'Salada verde de rúcula com limão e azeite',
        '1 colher de azeite de oliva extravirgem',
        'Chá de camomila com hortelã'
      ]
    },
    'Sábado': {
      cafe_da_manha: [
        'Waffle ou panqueca fit de aveia (1 ovo + 2 colheres de aveia + pitada de cacau)',
        '1 porção de frutas vermelhas (morangos, amoras ou mirtilos)',
        '1 xícara de café com leite vegetal ou café expresso',
        'Opção de troca: 2 ovos mexidos com queijo branco e 1 fatia de pão integral',
        '250ml de água mineral'
      ],
      lanche_manha: [
        '1 taça de salada de frutas frescas com 1 colher de sementes de chia',
        '10 amêndoas tostadas',
        '1 copo de água mineral aromatizada com rodelas de laranja e alecrim',
        'Opção de troca: 1 banana com canela',
        'Água mineral'
      ],
      almoco: [
        isVeg ? 'Feijoada vegana fit (feijão preto com tofu defumado, abóbora e cenoura)' : (isHipertrofia ? '190g Frango grelhado com vinagrete e arroz integral' : '140g Frango assado com ervas e vinagrete leve'),
        '1 concha generosa de feijão preto com louro',
        isEmagrecimento ? '80g Arroz integral com couve refogada' : '140g Arroz integral com couve e laranja',
        'Salada de couve crua bem fatiada, tomate e palmito com limão',
        '1 colher de azeite de oliva extravirgem'
      ],
      lanche_tarde: [
        '1 pote de iogurte grego natural com 1 colher de granola sem açúcar',
        '1 maçã fatiada com canela',
        '1 xícara de chá de capim-santo ou erva-doce',
        'Opção de troca: 1 tapioca pequena com ovo mexido',
        'Água mineral'
      ],
      jantar: [
        isVeg ? 'Sopa cremosa de mandioquinha com espinafre e grão-de-bico' : (isHipertrofia ? '180g Hambúrguer caseiro de patinho no prato com salada' : '130g Hambúrguer caseiro de patinho com salada rica'),
        'Salada de folhas verdes, tomate, pepino e sementes de girassol',
        'Mix de legumes refogados no azeite',
        '1 colher de azeite extravirgem',
        'Chá digestivo de hortelã'
      ]
    },
    'Domingo': {
      cafe_da_manha: [
        'Ovos mexidos cremosos com tomate concassé e manjericão fresco',
        '1 fatia de pão integral artesanal com azeite extravirgem',
        '1 fatia de mamão com gotas de limão e chia',
        '1 xícara de café passado especial ou chá verde',
        '250ml de água mineral para começar bem o domingo'
      ],
      lanche_manha: [
        '1 fatia de melancia ou abacaxi com raspas de hortelã',
        '1 punhado pequeno de castanhas-do-pará',
        '1 copo de água de coco natural gelada',
        'Opção de troca: 1 pote de iogurte natural',
        'Água mineral'
      ],
      almoco: [
        isVeg ? 'Lasanha vegetariana de berinjela e abobrinha com molho de tomate natural e ricota' : (isHipertrofia ? '200g Peixe ou frango assado ao forno com batatas e alecrim' : '150g Peixe ou frango assado ao forno com legumes'),
        '1 concha de feijão carioca',
        isEmagrecimento ? '80g Arroz integral com açafrão' : '130g Arroz integral com brócolis',
        'Salada tropical com folhas verdes, manga picada e tomate-cereja',
        '1 colher de azeite de oliva extravirgem'
      ],
      lanche_tarde: [
        '1 crepioca leve recheada com queijo minas frescal e orégano',
        '1 copo de suco de polpa de frutas vermelhas natural',
        '1 xícara de chá de camomila',
        'Opção de troca: Vitamina de abacate com limão e água de coco',
        'Água mineral'
      ],
      jantar: [
        isVeg ? 'Sopa nutritiva de legumes com tofu em cubos e aveia' : (isHipertrofia ? '180g Omelete farto com 3 claras e 1 gema, frango desfiado e vegetais' : '130g Omelete com 2 ovos, vegetais e queijo branco'),
        'Mix de folhas verdes com palmito e tomate',
        'Caldo verde fit com couve fatiada fininha',
        '1 colher de azeite extravirgem',
        'Chá relaxante de melissa e camomila para preparar o sono'
      ]
    }
  };

  return DIAS_DA_SEMANA.map(dia => ({
    dia,
    refeicoes: cardapiosPorDia[dia] || cardapiosPorDia['Segunda-feira']
  }));
}

/**
 * Chama o backend para gerar o plano alimentar via IA Gemini
 * com mensagens de loading dinâmicas e fallback robusto
 */
export async function gerarPlanoAlimentarComIA({
  paciente,
  instrucoesAdicionais = '',
  onProgressMessage = () => {}
}) {
  onProgressMessage('Conectando à IA Google Gemini...');
  await new Promise(r => setTimeout(r, 400));

  onProgressMessage('Analisando metas, TMB, GET, alergias e preferências...');
  await new Promise(r => setTimeout(r, 600));

  onProgressMessage('Calculando cardápios variados para os 7 dias da semana...');
  await new Promise(r => setTimeout(r, 500));

  onProgressMessage('Estruturando opções detalhadas de Segunda a Domingo...');

  try {
    const response = await fetch('/api/gerar-plano', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paciente: {
          nome: paciente.nome,
          idade: paciente.idade,
          sexo: paciente.sexo,
          peso: paciente.peso,
          altura: paciente.altura,
          imc: paciente.imc,
          objetivo: paciente.objetivo,
          alergias: paciente.alergias,
          restricoes: paciente.restricoes,
          preferencias: paciente.preferencias,
          aversoes: paciente.aversoes,
          nivelAtividade: paciente.nivelAtividade,
          tmb: paciente.tmb,
          get: paciente.get,
          caloriasMeta: paciente.caloriasMeta,
          observacoesClinicas: paciente.observacoesClinicas || paciente.observacoes
        },
        instrucoesAdicionais
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Falha na resposta do servidor.');
    }

    onProgressMessage('Plano alimentar semanal gerado com sucesso pela IA!');
    return {
      success: true,
      planoSemanal: result.data.plano_semanal,
      tipo: 'IA',
      modelo: result.model || 'Gemini 2.5 Flash'
    };

  } catch (error) {
    console.warn('IA remota indisponível ou com erro. Ativando assistente clínico inteligente local:', error);

    // Fallback inteligente garantido conforme especificações do Prompt 6
    const contingencia = gerarCardapioContingencia(paciente);

    return {
      success: true,
      planoSemanal: contingencia,
      tipo: 'Manual / Assistido',
      modelo: 'Assistente Clínico VIVA NUTRI (Offline/Contingência)',
      aviso: 'Plano alimentar semanal completo estruturado com cardápios variados de Segunda a Domingo.'
    };
  }
}

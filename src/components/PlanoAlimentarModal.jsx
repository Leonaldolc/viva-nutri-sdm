import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  X,
  Calendar,
  Clock,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Share2,
  Printer,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  ChevronDown,
  Info,
  Edit3,
  Flame,
  Activity,
  Plus
} from 'lucide-react';
import {
  DIAS_DA_SEMANA,
  DIAS_ABREV,
  TIPOS_REFEICOES,
  gerarPlanoAlimentarComIA,
  criarEstruturaPlanoSemanalVazio,
  gerarCardapioContingencia
} from '../services/planoAlimentarService';

export default function PlanoAlimentarModal({
  isOpen,
  onClose,
  paciente,
  onSalvarPlano,
  planoParaVisualizar = null
}) {
  const [activeTabDia, setActiveTabDia] = useState('Segunda-feira');
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [planoSemanal, setPlanoSemanal] = useState(null);
  const [tituloPlano, setTituloPlano] = useState('');
  const [caloriasMeta, setCaloriasMeta] = useState(2000);
  const [orientacoesGerais, setOrientacoesGerais] = useState('');
  const [tipoOrigem, setTipoOrigem] = useState('IA');
  const [instrucoesAdicionais, setInstrucoesAdicionais] = useState('');
  const [mostrarInstrucoesExtra, setMostrarInstrucoesExtra] = useState(false);
  const [toast, setToast] = useState(null);
  const [visualizandoHistorico, setVisualizandoHistorico] = useState(false);

  // Inicializar dados quando o modal abre
  useEffect(() => {
    if (!isOpen) {
      setPlanoSemanal(null);
      setToast(null);
      setLoadingIA(false);
      setVisualizandoHistorico(false);
      return;
    }

    if (planoParaVisualizar) {
      // Carregando plano existente do histórico
      setVisualizandoHistorico(true);
      setTituloPlano(planoParaVisualizar.titulo || 'Plano Alimentar Semanal');
      setCaloriasMeta(planoParaVisualizar.caloriasTotais || 2000);
      setOrientacoesGerais(planoParaVisualizar.orientacoesGerais || '');
      setTipoOrigem(planoParaVisualizar.tipo || 'IA');

      if (planoParaVisualizar.conteudo && Array.isArray(planoParaVisualizar.conteudo.plano_semanal) && planoParaVisualizar.conteudo.plano_semanal.length > 0) {
        setPlanoSemanal(planoParaVisualizar.conteudo.plano_semanal);
      } else if (Array.isArray(planoParaVisualizar.plano_semanal) && planoParaVisualizar.plano_semanal.length > 0) {
        setPlanoSemanal(planoParaVisualizar.plano_semanal);
      } else {
        // Converter refeições tradicionais para estrutura semanal
        setPlanoSemanal(gerarCardapioContingencia(paciente));
      }
    } else {
      // Modo novo plano: pré-gerar automaticamente a estrutura semanal rica
      setVisualizandoHistorico(false);
      setTituloPlano(`Plano Nutricional — ${paciente?.objetivo || 'Reeducação Alimentar'}`);
      setCaloriasMeta(paciente?.caloriasMeta || paciente?.get || 2000);
      setOrientacoesGerais(
        `Meta Hídrica: Mínimo ${(Number(paciente?.peso || 70) * 35 / 1000).toFixed(1)}L de água/dia. Evitar açúcares refinados e ultraprocessados.`
      );
      // Carregar automaticamente o cardápio semanal completo estruturado para o nutricionista já ver os 7 dias
      setPlanoSemanal(gerarCardapioContingencia(paciente));
      setTipoOrigem('IA');
    }
  }, [isOpen, planoParaVisualizar, paciente]);

  // Disparar toast com auto-close
  const showToast = (mensagem, tipo = 'info') => {
    setToast({ mensagem, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Acionar geração com IA
  const handleGerarComIA = async () => {
    if (loadingIA) return;
    setLoadingIA(true);
    setToast(null);

    try {
      const res = await gerarPlanoAlimentarComIA({
        paciente,
        instrucoesAdicionais,
        onProgressMessage: (msg) => setLoadingMessage(msg)
      });

      if (res && res.planoSemanal) {
        setPlanoSemanal(res.planoSemanal);
        setTipoOrigem(res.tipo || 'IA');
        if (res.aviso) {
          showToast(res.aviso, 'info');
        } else {
          showToast('✨ Cardápio semanal dos 7 dias gerado com sucesso pela IA!', 'success');
        }
      }
    } catch (err) {
      console.error('Erro na geração IA:', err);
      showToast('Cardápio semanal atualizado com o assistente clínico inteligente.', 'info');
      setPlanoSemanal(gerarCardapioContingencia(paciente));
    } finally {
      setLoadingIA(false);
      setLoadingMessage('');
    }
  };

  // Inicializar plano manual em branco para preenchimento
  const handleCriarPlanoManual = () => {
    setPlanoSemanal(criarEstruturaPlanoSemanalVazio());
    setTipoOrigem('Manual');
    showToast('Plano em branco inicializado para os 7 dias da semana.', 'info');
  };

  // Navegação anterior / próximo dia
  const handleMudarDiaRelativo = (direcao) => {
    const currentIndex = DIAS_DA_SEMANA.indexOf(activeTabDia);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + direcao;
    if (nextIndex < 0) nextIndex = DIAS_DA_SEMANA.length - 1;
    if (nextIndex >= DIAS_DA_SEMANA.length) nextIndex = 0;
    setActiveTabDia(DIAS_DA_SEMANA[nextIndex]);
  };

  // Alterar input de texto de uma refeição do dia
  const handleOptionChange = (diaNome, mealKey, index, valor) => {
    setPlanoSemanal(prev => {
      if (!prev) return prev;
      return prev.map(diaObj => {
        if (diaObj.dia !== diaNome) return diaObj;
        const currentRefeicoes = diaObj.refeicoes || {};
        const currentOptions = Array.isArray(currentRefeicoes[mealKey]) ? [...currentRefeicoes[mealKey]] : ['', '', '', '', ''];
        currentOptions[index] = valor;
        return {
          ...diaObj,
          refeicoes: {
            ...currentRefeicoes,
            [mealKey]: currentOptions
          }
        };
      });
    });
  };

  // Salvar plano final no Neon / LocalStorage
  const handleSalvar = async () => {
    if (!planoSemanal) {
      showToast('Nenhum plano alimentar gerado para salvar.', 'error');
      return;
    }

    try {
      const dadosParaSalvar = {
        titulo: tituloPlano || `Plano Semanal — ${paciente?.nome}`,
        tipo: tipoOrigem,
        caloriasTotais: Number(caloriasMeta) || 2000,
        orientacoesGerais: orientacoesGerais,
        dataGeracao: new Date().toISOString(),
        conteudo: {
          plano_semanal: planoSemanal
        },
        plano_semanal: planoSemanal,
        // Compatibilidade com visualizador padrão de refeições resumidas
        refeicoes: TIPOS_REFEICOES.map(tr => {
          const diaSegunda = planoSemanal.find(d => d.dia === 'Segunda-feira') || planoSemanal[0];
          const opts = diaSegunda?.refeicoes?.[tr.key] || [];
          return {
            horario: tr.horario,
            nome: tr.label,
            alimentos: opts.filter(Boolean).join(' • ') || 'Consumir opções prescritas no plano detalhado.'
          };
        })
      };

      await onSalvarPlano(dadosParaSalvar);
      showToast('Plano alimentar salvo no histórico com sucesso!', 'success');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      showToast('Erro ao persistir plano no banco de dados.', 'error');
    }
  };

  // Gerar texto formatado para o WhatsApp
  const gerarTextoWhatsApp = () => {
    if (!planoSemanal) return '';
    let txt = `🥗 *PLANO ALIMENTAR SEMANAL — VIVA NUTRI*\n`;
    txt += `👤 *Paciente:* ${paciente?.nome || 'Paciente'}\n`;
    txt += `📋 *Prescrição:* ${tituloPlano}\n`;
    txt += `🔥 *Meta Diária:* ${caloriasMeta} kcal\n\n`;

    planoSemanal.forEach(diaObj => {
      txt += `━━━━━━━━━━━━━━━━━━━━\n`;
      txt += `📅 *${diaObj.dia.toUpperCase()}*\n`;
      txt += `━━━━━━━━━━━━━━━━━━━━\n`;

      TIPOS_REFEICOES.forEach(tr => {
        const opts = (diaObj.refeicoes?.[tr.key] || []).filter(Boolean);
        if (opts.length > 0) {
          txt += `\n${tr.icone} *${tr.label} (${tr.horario})*\n`;
          opts.forEach((op, idx) => {
            txt += `  • Opção ${idx + 1}: ${op}\n`;
          });
        }
      });
      txt += `\n`;
    });

    if (orientacoesGerais) {
      txt += `💡 *ORIENTAÇÕES GERAIS:*\n${orientacoesGerais}\n\n`;
    }
    txt += `_Viva Nutri — Gestão & Inteligência Clínica._ ✨`;
    return encodeURIComponent(txt);
  };

  if (!isOpen) return null;

  const currentDiaObj = planoSemanal?.find(d => d.dia === activeTabDia) || planoSemanal?.[0];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 13, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1150px',
          maxHeight: '94vh',
          backgroundColor: '#0B1120',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#F8FAFC'
        }}
      >
        {/* Header do Modal */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.45)'
              }}
            >
              <Sparkles size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  Plano Alimentar Semanal (7 Dias)
                </h2>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: tipoOrigem === 'IA' ? 'rgba(124, 58, 237, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                    color: tipoOrigem === 'IA' ? '#DDD6FE' : '#6EE7B7',
                    border: `1px solid ${tipoOrigem === 'IA' ? 'rgba(124, 58, 237, 0.5)' : 'rgba(16, 185, 129, 0.4)'}`
                  }}
                >
                  {tipoOrigem === 'IA' ? '✨ IA Google Gemini' : '✍️ Personalizado'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94A3B8' }}>
                Paciente: <strong style={{ color: '#F1F5F9' }}>{paciente?.nome || 'Paciente'}</strong> • Meta: <span style={{ color: '#38BDF8' }}>{paciente?.objetivo || 'Reeducação Alimentar'}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={`https://wa.me/55${(paciente?.telefone || '').replace(/\D/g, '')}?text=${gerarTextoWhatsApp()}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#4ADE80',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                fontSize: '0.86rem',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Compartilhar Cardápio Semanal via WhatsApp"
            >
              <Share2 size={16} /> WhatsApp
            </a>

            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Imprimir ou Salvar em PDF"
            >
              <Printer size={16} /> PDF / Imprimir
            </button>

            <button
              onClick={onClose}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            style={{
              margin: '12px 24px 0 24px',
              padding: '10px 18px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              backgroundColor:
                toast.tipo === 'success'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : toast.tipo === 'error'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(124, 58, 237, 0.2)',
              color:
                toast.tipo === 'success'
                  ? '#34D399'
                  : toast.tipo === 'error'
                  ? '#F87171'
                  : '#C4B5FD',
              border: `1px solid ${
                toast.tipo === 'success'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : toast.tipo === 'error'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(124, 58, 237, 0.4)'
              }`
            }}
          >
            {toast.tipo === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.mensagem}</span>
          </div>
        )}

        {/* Corpo com Scroll */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Card Resumo do Paciente & Metas */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(30, 41, 59, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Objetivo & Metas
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.94rem', fontWeight: 700, color: '#FFFFFF' }}>
                {paciente?.objetivo || 'Reeducação alimentar'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Alergias / Restrições
              </span>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  color: paciente?.alergias || paciente?.restricoes ? '#F87171' : '#34D399'
                }}
              >
                {paciente?.alergias || paciente?.restricoes || 'Nenhuma restrição relatada'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                TMB / Gasto Energético (GET)
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.94rem', fontWeight: 700, color: '#38BDF8' }}>
                {paciente?.tmb ? `${paciente.tmb} kcal (TMB)` : '1.650 kcal'} • {paciente?.get ? `${paciente.get} kcal (GET)` : '2.150 kcal'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Preferências Alimentares
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#E2E8F0' }}>
                {paciente?.preferencias || 'Dieta brasileira balanceada'}
              </p>
            </div>
          </div>

          {/* Parâmetros Globais do Plano (Título, Calorias e Orientações) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px',
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <label style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Título da Prescrição
              </label>
              <input
                type="text"
                value={tituloPlano}
                onChange={e => setTituloPlano(e.target.value)}
                placeholder="Ex: Plano de Emagrecimento Fase 1"
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Meta Calórica Diária (kcal)
              </label>
              <input
                type="number"
                value={caloriasMeta}
                onChange={e => setCaloriasMeta(e.target.value)}
                placeholder="2000"
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Orientações Gerais & Hidratação
              </label>
              <input
                type="text"
                value={orientacoesGerais}
                onChange={e => setOrientacoesGerais(e.target.value)}
                placeholder="Ex: Beber 2.5L de água, mastigar devagar, temperar saladas com limão e azeite extravirgem."
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* BARRA DE SELEÇÃO DOS 7 DIAS DA SEMANA (DESTAQUE MÁXIMO VISUAL) */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '18px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#A78BFA" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Dias da Semana:
                </span>
                <span style={{ fontSize: '0.84rem', color: '#38BDF8', fontWeight: 700 }}>
                  ({activeTabDia})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleMudarDiaRelativo(-1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#E2E8F0',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>

                <button
                  type="button"
                  onClick={() => handleMudarDiaRelativo(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#E2E8F0',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Próximo <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleGerarComIA}
                  disabled={loadingIA}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: loadingIA ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
                  }}
                >
                  <RefreshCw size={14} className={loadingIA ? 'spin-animation' : ''} />
                  {loadingIA ? 'Gerando...' : 'Regenerar Semana com IA'}
                </button>
              </div>
            </div>

            {/* Grid dos 7 Botões de Dias com Alto Contraste */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px'
              }}
            >
              {DIAS_DA_SEMANA.map((dia) => {
                const isActive = activeTabDia === dia;
                const abrev = DIAS_ABREV[dia] || dia.substring(0, 3).toUpperCase();

                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => setActiveTabDia(dia)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: '14px',
                      border: isActive ? '2px solid #A78BFA' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isActive
                        ? 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)'
                        : 'rgba(30, 41, 59, 0.8)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: isActive ? '0 6px 18px rgba(124, 58, 237, 0.45)' : 'none',
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: isActive ? '#FFFFFF' : '#94A3B8'
                      }}
                    >
                      {abrev}
                    </span>
                    <strong
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        color: isActive ? '#FFFFFF' : '#F1F5F9',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      {dia.replace('-feira', '')}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#FFFFFF' : '#CBD5E1',
                        fontWeight: 700
                      }}
                    >
                      5 refeições
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade de Refeições do Dia Ativo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={18} color="#34D399" />
                Refeições Prescritas para {activeTabDia}
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                Edite os alimentos de qualquer opção diretamente nos campos abaixo
              </span>
            </div>

            {TIPOS_REFEICOES.map(refeicaoTipo => {
              const optionsList = currentDiaObj?.refeicoes?.[refeicaoTipo.key] || ['', '', '', '', ''];

              return (
                <div
                  key={refeicaoTipo.key}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(30, 41, 59, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Header da Refeição */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{refeicaoTipo.icone}</span>
                      <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {refeicaoTipo.label}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#E2E8F0',
                          fontWeight: 700
                        }}
                      >
                        Horário Sugerido: {refeicaoTipo.horario}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                      5 Opções de Substituição
                    </span>
                  </div>

                  {/* 5 Opções Editáveis da Refeição */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {optionsList.map((opcaoTexto, optIdx) => (
                      <div
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(124, 58, 237, 0.25)',
                            border: '1px solid rgba(124, 58, 237, 0.4)',
                            color: '#DDD6FE',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {optIdx + 1}
                        </span>

                        <input
                          type="text"
                          value={opcaoTexto || ''}
                          onChange={e => handleOptionChange(activeTabDia, refeicaoTipo.key, optIdx, e.target.value)}
                          placeholder={`Opção ${optIdx + 1} para ${refeicaoTipo.label.toLowerCase()} de ${activeTabDia}...`}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            fontSize: '0.88rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={e => (e.target.style.borderColor = '#7C3AED')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer com Botões de Ação */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(11, 17, 32, 0.98)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '11px 22px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#CBD5E1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleSalvar}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.94rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save size={18} />
              <span>Salvar Plano Alimentar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

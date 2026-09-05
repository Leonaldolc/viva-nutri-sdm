import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  X,
  Calendar,
  Clock,
  Utensils,
  ChevronRight,
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

      if (planoParaVisualizar.conteudo && Array.isArray(planoParaVisualizar.conteudo.plano_semanal)) {
        setPlanoSemanal(planoParaVisualizar.conteudo.plano_semanal);
      } else if (Array.isArray(planoParaVisualizar.plano_semanal)) {
        setPlanoSemanal(planoParaVisualizar.plano_semanal);
      } else {
        // Converter refeições tradicionais para estrutura semanal
        setPlanoSemanal(gerarCardapioContingencia(paciente));
      }
    } else {
      // Modo novo plano
      setVisualizandoHistorico(false);
      setTituloPlano(`Plano Nutricional — ${paciente?.objetivo || 'Reeducação Alimentar'}`);
      setCaloriasMeta(paciente?.caloriasMeta || paciente?.get || 2000);
      setOrientacoesGerais(
        `Meta Hídrica: Mínimo ${(Number(paciente?.peso || 70) * 35 / 1000).toFixed(1)}L de água/dia. Evitar açúcares refinados e ultraprocessados.`
      );
      setPlanoSemanal(null);
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
          showToast('✨ Plano alimentar semanal gerado com sucesso pela IA!', 'success');
        }
      }
    } catch (err) {
      console.error('Erro na geração IA:', err);
      showToast('Não foi possível gerar com IA no momento. Você pode tentar novamente ou gerar manualmente.', 'error');
    } finally {
      setLoadingIA(false);
      setLoadingMessage('');
    }
  };

  // Inicializar plano manual em branco para preenchimento
  const handleCriarPlanoManual = () => {
    setPlanoSemanal(criarEstruturaPlanoSemanalVazio());
    setTipoOrigem('Manual');
    showToast('Plano em branco inicializado. Preencha as refeições de cada dia.', 'info');
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

  // Adicionar uma nova opção na refeição
  const handleAddOption = (diaNome, mealKey) => {
    setPlanoSemanal(prev => {
      if (!prev) return prev;
      return prev.map(diaObj => {
        if (diaObj.dia !== diaNome) return diaObj;
        const currentRefeicoes = diaObj.refeicoes || {};
        const currentOptions = Array.isArray(currentRefeicoes[mealKey]) ? [...currentRefeicoes[mealKey]] : [];
        return {
          ...diaObj,
          refeicoes: {
            ...currentRefeicoes,
            [mealKey]: [...currentOptions, '']
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
      }, 1200);
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      showToast('Erro ao persistir plano no banco de dados.', 'error');
    }
  };

  // Gerar texto formatado para o WhatsApp
  const gerarTextoWhatsApp = () => {
    if (!planoSemanal) return '';
    let txt = `🥗 *PLANO ALIMENTAR — VIVA NUTRI*\n`;
    txt += `👤 *Paciente:* ${paciente?.nome || 'Paciente'}\n`;
    txt += `📋 *Título:* ${tituloPlano}\n`;
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
    txt += `_Viva Nutri — Saúde, Equilíbrio e Performance._ ✨`;
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
        backgroundColor: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: '1100px',
          maxHeight: '92vh',
          backgroundColor: '#0F172A',
          border: '1px solid rgba(124, 58, 237, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(124, 58, 237, 0.2)',
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
              }}
            >
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {visualizandoHistorico ? 'Plano Alimentar Prescrito' : 'Gerador Inteligente de Plano Alimentar'}
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: tipoOrigem === 'IA' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                    color: tipoOrigem === 'IA' ? '#C4B5FD' : '#6EE7B7',
                    border: `1px solid ${tipoOrigem === 'IA' ? 'rgba(124, 58, 237, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                  }}
                >
                  {tipoOrigem === 'IA' ? '✨ IA Google Gemini' : '✍️ Personalizado'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.84rem', color: '#94A3B8' }}>
                Paciente: <strong style={{ color: '#E2E8F0' }}>{paciente?.nome || 'Não identificado'}</strong> • Meta: {paciente?.objetivo || 'Reeducação Alimentar'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {planoSemanal && (
              <>
                <a
                  href={`https://wa.me/55${(paciente?.telefone || '').replace(/\D/g, '')}?text=${gerarTextoWhatsApp()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ADE80',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Compartilhar Cardápio Completo via WhatsApp"
                >
                  <Share2 size={15} /> WhatsApp
                </a>

                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Imprimir ou Salvar em PDF"
                >
                  <Printer size={15} /> Imprimir / PDF
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            style={{
              margin: '12px 24px 0 24px',
              padding: '10px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.86rem',
              fontWeight: 500,
              backgroundColor:
                toast.tipo === 'success'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : toast.tipo === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
              color:
                toast.tipo === 'success'
                  ? '#34D399'
                  : toast.tipo === 'error'
                  ? '#F87171'
                  : '#60A5FA',
              border: `1px solid ${
                toast.tipo === 'success'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : toast.tipo === 'error'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)'
              }`
            }}
          >
            {toast.tipo === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
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
            gap: '18px'
          }}
        >
          {/* Card de Informações e Metas do Paciente */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                Objetivo & Metas
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#F1F5F9' }}>
                {paciente?.objetivo || 'Reeducação alimentar'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                Alergias / Restrições
              </span>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: paciente?.alergias || paciente?.restricoes ? '#F87171' : '#10B981'
                }}
              >
                {paciente?.alergias || paciente?.restricoes || 'Nenhuma restrição relatada'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                TMB / Gasto Energético (GET)
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#38BDF8' }}>
                {paciente?.tmb ? `${paciente.tmb} kcal (TMB)` : '1.650 kcal'} • {paciente?.get ? `${paciente.get} kcal (GET)` : '2.150 kcal'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                Preferências Alimentares
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.88rem', color: '#E2E8F0' }}>
                {paciente?.preferencias || 'Dieta brasileira balanceada'}
              </p>
            </div>
          </div>

          {/* Área de Ação: Gerar com IA ou Carregar */}
          {!visualizandoHistorico && !planoSemanal && (
            <div
              style={{
                padding: '36px 24px',
                borderRadius: '16px',
                border: '2px dashed rgba(124, 58, 237, 0.4)',
                backgroundColor: 'rgba(124, 58, 237, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(79, 70, 229, 0.25) 100%)',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A78BFA'
                }}
              >
                <Sparkles size={32} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Gere o Plano Alimentar Semanal com Inteligência Artificial
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: '#94A3B8', maxWidth: '650px' }}>
                  A IA lerá os dados cadastrais, histórico clínico, TMB/GET, alergias e preferências de{' '}
                  <strong style={{ color: '#E2E8F0' }}>{paciente?.nome}</strong> para elaborar um cardápio semanal completo com 5 opções em cada refeição.
                </p>
              </div>

              {/* Botão de Instruções Extras Opcionais */}
              <button
                type="button"
                onClick={() => setMostrarInstrucoesExtra(!mostrarInstrucoesExtra)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A78BFA',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {mostrarInstrucoesExtra ? 'Ocultar orientações personalizadas' : '+ Adicionar orientações específicas para a IA (Opcional)'}
              </button>

              {mostrarInstrucoesExtra && (
                <div style={{ width: '100%', maxWidth: '650px', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Instruções Específicas do Nutricionista para este paciente:
                  </label>
                  <textarea
                    value={instrucoesAdicionais}
                    onChange={e => setInstrucoesAdicionais(e.target.value)}
                    placeholder="Ex: Focar em proteínas no pós-treino às 18h, incluir água de coco pela manhã, evitar glúten nos lanches..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: '0.86rem',
                      resize: 'none'
                    }}
                  />
                </div>
              )}

              {/* Ações: Gerar IA ou Manual */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleGerarComIA}
                  disabled={loadingIA}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 28px',
                    borderRadius: '12px',
                    background: loadingIA
                      ? 'rgba(124, 58, 237, 0.5)'
                      : 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: loadingIA ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {loadingIA ? (
                    <>
                      <RefreshCw size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{loadingMessage || 'Processando com IA Google Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>✨ Gerar Plano com IA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCriarPlanoManual}
                  disabled={loadingIA}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={16} />
                  <span>Criar Plano Manual</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Visual com Mensagens Dinâmicas */}
          {loadingIA && !planoSemanal && (
            <div
              style={{
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: '3px solid rgba(124, 58, 237, 0.2)',
                  borderTopColor: '#7C3AED',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#C4B5FD' }}>
                {loadingMessage || 'IA calculando cardápio...'}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Estruturando tabela semanal com 5 opções por refeição
              </span>
            </div>
          )}

          {/* Interface de Edição e Visualização do Plano Semanal */}
          {planoSemanal && (
            <>
              {/* Metadados do Plano (Título, Calorias e Orientações) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Título da Prescrição
                  </label>
                  <input
                    type="text"
                    value={tituloPlano}
                    onChange={e => setTituloPlano(e.target.value)}
                    placeholder="Ex: Plano de Emagrecimento Fase 1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Meta Calórica Diária (kcal)
                  </label>
                  <input
                    type="number"
                    value={caloriasMeta}
                    onChange={e => setCaloriasMeta(e.target.value)}
                    placeholder="2000"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Orientações Gerais & Hidratação
                  </label>
                  <input
                    type="text"
                    value={orientacoesGerais}
                    onChange={e => setOrientacoesGerais(e.target.value)}
                    placeholder="Ex: Beber 2.5L de água, mastigar devagar, temperar saladas com limão e azeite extravirgem."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              {/* Botão de Regeneração Rápida */}
              {!visualizandoHistorico && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.86rem', color: '#94A3B8' }}>
                    💡 Você pode editar qualquer opção de alimento diretamente nos campos abaixo:
                  </span>
                  <button
                    type="button"
                    onClick={handleGerarComIA}
                    disabled={loadingIA}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: '1px solid rgba(124, 58, 237, 0.4)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      color: '#C4B5FD',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={14} className={loadingIA ? 'spin-animation' : ''} />
                    Regenerar com IA
                  </button>
                </div>
              )}

              {/* Abas dos Dias da Semana (Tabs) */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {DIAS_DA_SEMANA.map(dia => {
                  const isActive = activeTabDia === dia;
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setActiveTabDia(dia)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px 10px 0 0',
                        border: 'none',
                        backgroundColor: isActive ? 'rgba(124, 58, 237, 0.25)' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#94A3B8',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        borderBottom: isActive ? '3px solid #7C3AED' : '3px solid transparent',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              {/* Grade de Refeições do Dia Ativo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {TIPOS_REFEICOES.map(refeicaoTipo => {
                  const optionsList = currentDiaObj?.refeicoes?.[refeicaoTipo.key] || ['', '', '', '', ''];

                  return (
                    <div
                      key={refeicaoTipo.key}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        backgroundColor: 'rgba(30, 41, 59, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      {/* Header da Refeição */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{refeicaoTipo.icone}</span>
                          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {refeicaoTipo.label}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#94A3B8',
                              fontWeight: 600
                            }}
                          >
                            Horário Sugerido: {refeicaoTipo.horario}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
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
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(124, 58, 237, 0.15)',
                                color: '#A78BFA',
                                fontSize: '0.75rem',
                                fontWeight: 700,
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
                              placeholder={`Opção ${optIdx + 1} para ${refeicaoTipo.label.toLowerCase()}...`}
                              style={{
                                flex: 1,
                                padding: '9px 14px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#F1F5F9',
                                fontSize: '0.86rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                              }}
                              onFocus={e => (e.target.style.borderColor = '#7C3AED')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer com Botões de Ação */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.95)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#94A3B8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>

          {planoSemanal && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSalvar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Save size={16} />
                <span>Salvar Plano Alimentar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

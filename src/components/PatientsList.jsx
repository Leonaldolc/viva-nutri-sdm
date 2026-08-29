import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Calendar, 
  Target, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  Filter, 
  Activity, 
  Phone, 
  Mail, 
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Edit3,
  PartyPopper,
  Cake,
  Gift
} from 'lucide-react';
import BirthdayAlertsCard from './BirthdayAlertsCard';
import { getAniversariantesInfo } from '../services/dashboardService';

export default function PatientsList({ 
  pacientes = [], 
  onSelectPatient, 
  onOpenNewPatientForm, 
  loading = false,
  onRefresh,
  onParabenizar
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('todos');
  const [sortBy, setSortBy] = useState('recente'); // 'recente' | 'nome' | 'antigo' | 'aniversario'

  // Análise de aniversariantes
  const aniversariantesData = useMemo(() => {
    return getAniversariantesInfo(pacientes);
  }, [pacientes]);

  // Mapa rápido de aniversariantes por ID do paciente
  const bdayMap = useMemo(() => {
    const map = {};
    aniversariantesData.todos.forEach(item => {
      map[item.paciente.id] = item;
    });
    return map;
  }, [aniversariantesData]);

  // Lista única de objetivos para filtro
  const availableObjectives = useMemo(() => {
    const set = new Set();
    pacientes.forEach(p => {
      if (p.objetivos && Array.isArray(p.objetivos)) {
        p.objetivos.forEach(o => set.add(o));
      } else if (p.objetivo) {
        set.add(p.objetivo);
      }
    });
    return Array.from(set);
  }, [pacientes]);

  // Filtragem e ordenação
  const filteredPatients = useMemo(() => {
    let list = [...pacientes];

    // Busca por nome, email ou telefone
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        (p.nome && p.nome.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.telefone && p.telefone.includes(q)) ||
        (p.objetivo && p.objetivo.toLowerCase().includes(q))
      );
    }

    // Filtro por objetivo
    if (selectedObjective !== 'todos') {
      list = list.filter(p => {
        if (p.objetivos && Array.isArray(p.objetivos)) {
          return p.objetivos.includes(selectedObjective);
        }
        return p.objetivo?.includes(selectedObjective) || p.categoria === selectedObjective;
      });
    }

    // Ordenação
    if (sortBy === 'nome') {
      list.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortBy === 'antigo') {
      list.sort((a, b) => new Date(a.ultima_consulta || 0) - new Date(b.ultima_consulta || 0));
    } else if (sortBy === 'aniversario') {
      list.sort((a, b) => {
        const itemA = bdayMap[a.id]?.diffDays ?? 999;
        const itemB = bdayMap[b.id]?.diffDays ?? 999;
        return itemA - itemB;
      });
    } else {
      // recente (padrão)
      list.sort((a, b) => new Date(b.ultima_consulta || b.created_at || 0) - new Date(a.ultima_consulta || a.created_at || 0));
    }

    return list;
  }, [pacientes, searchTerm, selectedObjective, sortBy, bdayMap]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Sem registro';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Sem registro';
    }
  };

  return (
    <div className="patients-list-view">
      {/* Header da Tela de Pacientes */}
      <div className="patients-view-header">
        <div className="header-titles">
          <div className="badge-patients-count">
            <Users size={16} />
            <span>{pacientes.length} Pacientes Cadastrados</span>
          </div>
          <h1 className="view-title">Base de Pacientes</h1>
          <p className="view-subtitle">
            Gerencie prontuários, planos alimentares, exames e alertas de aniversário dos seus pacientes.
          </p>
        </div>

        <div className="header-actions">
          <button 
            type="button" 
            className="btn-new-patient-cta"
            onClick={onOpenNewPatientForm}
          >
            <UserPlus size={18} />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* WIDGET DE ALERTA DE ANIVERSARIANTES */}
      {aniversariantesData.totalAniversariantes > 0 && onParabenizar && (
        <BirthdayAlertsCard 
          aniversariantesData={aniversariantesData}
          onParabenizar={onParabenizar}
        />
      )}

      {/* Barra de Filtros e Busca */}
      <div className="patients-control-toolbar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input 
            type="text"
            className="patients-search-input"
            placeholder="Buscar paciente por nome, objetivo, e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="btn-clear-search" 
              onClick={() => setSearchTerm('')}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <div className="toolbar-right-filters">
          {availableObjectives.length > 0 && (
            <div className="filter-select-wrapper">
              <select 
                className="patients-select-filter"
                value={selectedObjective}
                onChange={(e) => setSelectedObjective(e.target.value)}
              >
                <option value="todos">Todos os Objetivos</option>
                {availableObjectives.map(obj => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-select-wrapper">
            <select 
              className="patients-select-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recente">Mais Recentes</option>
              <option value="aniversario">🎂 Próximos Aniversários</option>
              <option value="nome">Nome (A - Z)</option>
              <option value="antigo">Mais Antigos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo: Listagem ou Empty State */}
      {loading ? (
        <div className="patients-loading-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="patient-card-skeleton" />
          ))}
        </div>
      ) : pacientes.length === 0 ? (
        /* Caso não haja nenhum paciente cadastrado no sistema */
        <div className="patients-empty-state">
          <div className="empty-state-visual">
            <div className="empty-icon-circle">
              <Users size={48} className="icon-empty-users" />
            </div>
          </div>
          <h2 className="empty-main-title">Nenhum paciente cadastrado ainda</h2>
          <p className="empty-main-desc">
            Cadastre seu primeiro paciente com dados pessoais, clínicos e hábitos para iniciar o acompanhamento nutricional.
          </p>
          <button 
            type="button" 
            className="btn-new-patient-cta btn-empty-action"
            onClick={onOpenNewPatientForm}
          >
            <UserPlus size={18} />
            <span>Cadastrar Primeiro Paciente</span>
          </button>
        </div>
      ) : filteredPatients.length === 0 ? (
        /* Caso a busca/filtro não encontre resultados */
        <div className="patients-empty-state">
          <div className="empty-state-visual">
            <div className="empty-icon-circle">
              <Search size={36} className="icon-empty-users" />
            </div>
          </div>
          <h2 className="empty-main-title">Nenhum paciente encontrado</h2>
          <p className="empty-main-desc">
            Nenhum paciente corresponde ao termo pesquisado <strong>"{searchTerm}"</strong>.
          </p>
          <button 
            type="button" 
            className="btn-secondary-action"
            onClick={() => { setSearchTerm(''); setSelectedObjective('todos'); }}
          >
            Limpar Filtros de Busca
          </button>
        </div>
      ) : (
        /* Grid de Cards de Pacientes */
        <div className="patients-cards-grid">
          {filteredPatients.map(paciente => {
            const initial = paciente.nome ? paciente.nome.charAt(0).toUpperCase() : '?';
            const objetivoText = paciente.objetivo || 'Acompanhamento Geral';
            const ultimaConsultaText = formatDate(paciente.ultima_consulta);
            const bdayInfo = bdayMap[paciente.id];

            return (
              <div 
                key={paciente.id}
                className={`patient-interactive-card ${bdayInfo?.isToday ? 'card-birthday-today' : ''}`}
                onClick={() => onSelectPatient(paciente)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectPatient(paciente); }}
              >
                {/* Banner de Aniversário no Topo do Card */}
                {bdayInfo && (
                  <div className={`card-birthday-badge ${bdayInfo.isToday ? 'badge-bday-today' : 'badge-bday-soon'}`}>
                    <PartyPopper size={13} />
                    <span>
                      {bdayInfo.isToday 
                        ? `🎉 Aniversário Hoje! (${bdayInfo.idadeNova} anos)` 
                        : `🎂 Aniversário em ${bdayInfo.diffDays} dias (${String(bdayInfo.birthDay).padStart(2,'0')}/${String(bdayInfo.birthMonth).padStart(2,'0')})`}
                    </span>
                    {onParabenizar && (
                      <button 
                        type="button" 
                        className="btn-congratulate-inline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onParabenizar(paciente, bdayInfo.idadeNova);
                        }}
                        title="Enviar parabéns por e-mail ou WhatsApp"
                      >
                        <Mail size={12} /> Parabenizar
                      </button>
                    )}
                  </div>
                )}

                <div className="card-top-row">
                  <div className="patient-avatar-box">
                    <span className="avatar-letter">{initial}</span>
                  </div>
                  <div className="patient-main-meta">
                    <h3 className="patient-name-title" title={paciente.nome}>
                      {paciente.nome}
                    </h3>
                    <div className="patient-contact-sub">
                      {paciente.email && (
                        <span className="contact-item" title={paciente.email}>
                          <Mail size={12} />
                          <span className="contact-text">{paciente.email}</span>
                        </span>
                      )}
                      {paciente.telefone && (
                        <span className="contact-item" title={paciente.telefone}>
                          <Phone size={12} />
                          <span className="contact-text">{paciente.telefone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-arrow-action">
                    <ArrowUpRight size={18} className="arrow-hover-icon" />
                  </div>
                </div>

                <div className="card-divider" />

                <div className="card-details-grid">
                  <div className="detail-pill-box">
                    <span className="detail-label">
                      <Target size={13} className="pill-icon" /> Objetivo:
                    </span>
                    <span className="detail-value-highlight" title={objetivoText}>
                      {objetivoText}
                    </span>
                  </div>

                  <div className="detail-pill-box">
                    <span className="detail-label">
                      <Calendar size={13} className="pill-icon" /> Última consulta:
                    </span>
                    <span className="detail-value-date">
                      {ultimaConsultaText}
                    </span>
                  </div>
                </div>

                {/* Footer com Tags Clínicas Rápidas */}
                <div className="card-footer-tags">
                  {paciente.idade && (
                    <span className="mini-tag mini-tag-muted">{paciente.idade} anos</span>
                  )}
                  {paciente.pesoAtual && (
                    <span className="mini-tag mini-tag-green">{paciente.pesoAtual} kg</span>
                  )}
                  {paciente.imc && (
                    <span className="mini-tag mini-tag-purple">IMC {paciente.imc}</span>
                  )}
                  {paciente.anexos && paciente.anexos.length > 0 && (
                    <span className="mini-tag mini-tag-orange" title={`${paciente.anexos.length} anexo(s)`}>
                      📎 {paciente.anexos.length}
                    </span>
                  )}
                  <span className="view-profile-hint">Ver Prontuário ➔</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

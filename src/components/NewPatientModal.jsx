import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { cadastrarPaciente } from '../services/dashboardService';

export default function NewPatientModal({ onClose, onCreated, nutricionistaId }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Informe o nome completo do paciente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await cadastrarPaciente({
        nome,
        email,
        telefone,
        objetivo: objetivo.trim() || 'Acompanhamento Nutricional Geral'
      }, nutricionistaId);

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header">
          <div className="modal-header-icon modal-icon-purple">
            <UserPlus size={22} />
          </div>
          <div>
            <h2 className="modal-title">Novo Paciente</h2>
            <p className="modal-subtitle">Cadastre um paciente para iniciar o acompanhamento</p>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </header>

        {error && (
          <div className="alert alert-error" style={{ margin: '0 24px 16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Larissa Monteiro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="paciente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone / Celular</label>
              <input
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Objetivo Nutricional</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Emagrecimento, Hipertrofia, Longevidade..."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar Paciente'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

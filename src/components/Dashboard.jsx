import React from 'react';
import { LogOut, Users, Calendar, Utensils, ShieldCheck, UserCheck } from 'lucide-react';
import Logo from './Logo';

export default function Dashboard({ user, onLogout }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Nutricionista';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size="small" />
        </div>

        <div className="dashboard-user-section">
          <div className="user-badge">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>

          <button className="btn-logout" onClick={onLogout} title="Sair da conta">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-hero">
          <h1>Olá, {userName}! 👋</h1>
          <p>Bem-vinda ao seu sistema de gestão nutricional VIVA NUTRI. Seu banco de dados Neon e RLS estão conectados e seguros.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-purple">
              <Users size={24} />
            </div>
            <div>
              <div className="stat-number">0</div>
              <div className="stat-label">Pacientes Cadastrados</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-orange">
              <Calendar size={24} />
            </div>
            <div>
              <div className="stat-number">0</div>
              <div className="stat-label">Consultas Agendadas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-green">
              <Utensils size={24} />
            </div>
            <div>
              <div className="stat-number">0</div>
              <div className="stat-label">Planos Alimentares</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
              <ShieldCheck size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Status da Autenticação Neon Auth</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} style={{ color: 'var(--primary-purple)' }} />
              <span>Sessão ativa e persistida no navegador (localStorage).</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} style={{ color: 'var(--primary-purple)' }} />
              <span>Sincronização automática ativa com a tabela <code>public.nutricionistas</code>.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} style={{ color: 'var(--primary-purple)' }} />
              <span>Políticas de Row Level Security (RLS) protegendo os dados do nutricionista.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

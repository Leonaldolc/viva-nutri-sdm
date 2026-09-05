import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  Calendar,
  Scale,
  Activity,
  HeartPulse,
  Utensils
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import WatermarkBackground from './WatermarkBackground';
import { registerUser } from '../services/neonAuth';
import { cadastrarPaciente } from '../services/dashboardService';

export default function Register({
  onSwitchToLogin,
  onRegisterSuccess,
  theme,
  onToggleTheme,
  initialAccountType = 'nutricionista'
}) {
  const [accountType, setAccountType] = useState(initialAccountType); // 'nutricionista' | 'paciente'

  // Campos Nutricionista
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Campos Paciente (Auto-cadastro / Pré-anamnese)
  const [pacNome, setPacNome] = useState('');
  const [pacEmail, setPacEmail] = useState('');
  const [pacTelefone, setPacTelefone] = useState('');
  const [pacDataNasc, setPacDataNasc] = useState('');
  const [pacSexo, setPacSexo] = useState('Feminino');
  const [pacPeso, setPacPeso] = useState('');
  const [pacAltura, setPacAltura] = useState('');
  const [pacObjetivo, setPacObjetivo] = useState('Emagrecimento');
  const [pacRestricoes, setPacRestricoes] = useState('');
  const [pacAlergias, setPacAlergias] = useState('');
  const [pacSenha, setPacSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [patientSuccess, setPatientSuccess] = useState(false);

  // Submit Nutricionista
  const handleSubmitNutri = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve conter no mínimo 9 caracteres para sua segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Por favor, verifique.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({ name, email, password });
      if (result?.success) {
        onRegisterSuccess(result.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Paciente (Auto-cadastro)
  const handleSubmitPaciente = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pacNome.trim() || !pacEmail.trim() || !pacTelefone.trim()) {
      setErrorMessage('Por favor, preencha nome, e-mail e WhatsApp.');
      return;
    }

    setLoading(true);

    try {
      const restricoesArr = pacRestricoes ? pacRestricoes.split(',').map(s => s.trim()).filter(Boolean) : [];
      const alergiasArr = pacAlergias ? pacAlergias.split(',').map(s => s.trim()).filter(Boolean) : [];

      const dadosNovoPaciente = {
        nome: pacNome.trim(),
        email: pacEmail.trim().toLowerCase(),
        telefone: pacTelefone.trim(),
        whatsapp: pacTelefone.trim(),
        dataNascimento: pacDataNasc || '1995-01-01',
        sexo: pacSexo,
        pesoAtual: pacPeso ? Number(pacPeso) : 70,
        pesoInicial: pacPeso ? Number(pacPeso) : 70,
        altura: pacAltura ? Number(pacAltura) : 170,
        objetivo: pacObjetivo,
        categoria: pacObjetivo,
        restricoesAlimentares: restricoesArr,
        alergiasAlimentares: alergiasArr,
        patologias: [],
        refeicoesPorDia: 4,
        aguaPorDia: 2,
        status: 'ativo'
      };

      // Registrar no banco de dados
      await cadastrarPaciente(dadosNovoPaciente, 'default');

      // Também registrar conta de usuário do paciente para permitir login
      try {
        await registerUser({
          name: pacNome.trim(),
          email: pacEmail.trim().toLowerCase(),
          password: pacSenha && pacSenha.length >= 6 ? pacSenha : 'paciente123',
          role: 'paciente'
        });
      } catch {
        // Se a conta já existir ou der aviso de senha, segue com sucesso cadastral
      }

      setPatientSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Ocorreu um erro ao cadastrar seus dados de paciente.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValidLength = password.length >= 9;
  const isPasswordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="auth-bg-wrapper">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="floating" />
      <WatermarkBackground />

      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-blob auth-blob-3"></div>

      <div className="auth-container" style={{ maxWidth: accountType === 'paciente' ? '540px' : '480px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="large" variant="vertical" />
            <h1 className="auth-title">
              {accountType === 'nutricionista' ? 'Criar conta profissional' : 'Pré-Cadastro do Paciente'}
            </h1>
            <p className="auth-subtitle">
              {accountType === 'nutricionista'
                ? 'Comece a gerenciar seus pacientes com excelência'
                : 'Preencha sua ficha cadastral e anamnese inicial'}
            </p>
          </div>

          {/* Seletor de Tipo de Cadastro: Nutricionista vs Paciente */}
          <div
            style={{
              display: 'flex',
              padding: '4px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              marginBottom: '20px',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAccountType('nutricionista');
                setErrorMessage('');
                setPatientSuccess(false);
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                border: 'none',
                background: accountType === 'nutricionista' ? 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' : 'transparent',
                color: accountType === 'nutricionista' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: accountType === 'nutricionista' ? '0 4px 12px rgba(124, 58, 237, 0.35)' : 'none'
              }}
            >
              <Utensils size={15} /> Sou Nutricionista
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('paciente');
                setErrorMessage('');
                setPatientSuccess(false);
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                border: 'none',
                background: accountType === 'paciente' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
                color: accountType === 'paciente' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: accountType === 'paciente' ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
              }}
            >
              <User size={15} /> Sou Paciente
            </button>
          </div>

          {errorMessage && (
            <div className="alert alert-error" style={{ marginBottom: '18px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* =========================================================================
              MODO 1: CADASTRO DE NUTRICIONISTA
              ========================================================================= */}
          {accountType === 'nutricionista' && (
            <form className="auth-form" onSubmit={handleSubmitNutri}>
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Nome completo</label>
                <div className="input-wrapper">
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="Dra. Mariana Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <User className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">E-mail profissional</label>
                <div className="input-wrapper">
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder="seu.email@nutri.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="email"
                  />
                  <Mail className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Senha (mínimo 9 caracteres)</label>
                <div className="input-wrapper">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="•••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                  <Lock className="input-icon" size={18} />
                  <button
                    type="button"
                    className="input-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="input-hint" style={{ color: isPasswordValidLength ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} style={{ opacity: isPasswordValidLength ? 1 : 0.4 }} />
                    {isPasswordValidLength ? 'Mínimo de 9 caracteres atendido' : `${password.length}/9 caracteres mínimo`}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm-password" className="form-label">Confirmar senha</label>
                <div className="input-wrapper">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="•••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                  <Lock className="input-icon" size={18} />
                  <button
                    type="button"
                    className="input-toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="input-hint" style={{ color: isPasswordsMatch ? 'var(--accent-green)' : 'var(--error-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isPasswordsMatch ? (
                      <>
                        <CheckCircle2 size={13} />
                        Senhas coincidem
                      </>
                    ) : (
                      'Senhas não coincidem'
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Criando conta profissional...
                  </>
                ) : (
                  <>
                    Criar conta profissional
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =========================================================================
              MODO 2: CADASTRO / PRÉ-ANAMNESE DO PACIENTE
              ========================================================================= */}
          {accountType === 'paciente' && !patientSuccess && (
            <form className="auth-form" onSubmit={handleSubmitPaciente}>
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={pacNome}
                    onChange={(e) => setPacNome(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <User className="input-icon" size={18} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">WhatsApp / Telefone *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="(11) 99999-9999"
                      value={pacTelefone}
                      onChange={(e) => setPacTelefone(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <Phone className="input-icon" size={18} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      className="form-input"
                      value={pacDataNasc}
                      onChange={(e) => setPacDataNasc(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="seu.email@exemplo.com"
                    value={pacEmail}
                    onChange={(e) => setPacEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Mail className="input-icon" size={18} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Peso Atual (kg)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="Ex: 72.5"
                      value={pacPeso}
                      onChange={(e) => setPacPeso(e.target.value)}
                      disabled={loading}
                    />
                    <Scale className="input-icon" size={18} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Altura (cm)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Ex: 170"
                      value={pacAltura}
                      onChange={(e) => setPacAltura(e.target.value)}
                      disabled={loading}
                    />
                    <Activity className="input-icon" size={18} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Objetivo Principal</label>
                <select
                  className="form-input"
                  value={pacObjetivo}
                  onChange={(e) => setPacObjetivo(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', paddingLeft: '14px', backgroundColor: 'var(--bg-input)' }}
                >
                  <option value="Emagrecimento">Emagrecimento & Perda de Gordura</option>
                  <option value="Hipertrofia">Ganho de Massa Muscular (Hipertrofia)</option>
                  <option value="Reeducação Alimentar">Reeducação Alimentar & Hábitos Saudáveis</option>
                  <option value="Saúde e Longevidade">Saúde Geral & Longevidade</option>
                  <option value="Performance Esportiva">Performance Esportiva</option>
                  <option value="Controle de Patologias">Controle de Diabetes / Colesterol / Pressão</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Alergias ou Restrições Alimentares (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Intolerância a lactose, vegetariano, alergia a amendoim..."
                  value={pacAlergias}
                  onChange={(e) => setPacAlergias(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', paddingLeft: '14px' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                  marginTop: '6px'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Realizando cadastro...
                  </>
                ) : (
                  <>
                    Concluir Pré-Cadastro de Paciente
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Confirmação de Sucesso Paciente */}
          {accountType === 'paciente' && patientSuccess && (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #10B981'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                Pré-Cadastro Realizado com Sucesso!
              </h3>

              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Olá, <strong style={{ color: '#FFFFFF' }}>{pacNome}</strong>! Seus dados e anamnese inicial foram recebidos pelo consultório <strong style={{ color: '#A78BFA' }}>VIVA NUTRI</strong>.
              </p>

              <button
                type="button"
                className="btn-primary"
                onClick={onSwitchToLogin}
                style={{
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)'
                }}
              >
                Ir para o Login
              </button>
            </div>
          )}

          <div className="auth-footer" style={{ marginTop: '20px' }}>
            <span>Já possui uma conta?</span>
            <button type="button" className="auth-link" onClick={onSwitchToLogin}>
              Faça login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

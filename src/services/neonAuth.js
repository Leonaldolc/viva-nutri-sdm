// Neon Auth API Service for VIVA NUTRI

const NEON_AUTH_BASE_URL = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-frosty-bird-ackukmvt.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
const SESSION_STORAGE_KEY = 'viva_nutri_user_session';

/**
 * Normaliza erros retornados pela API Neon Auth ou pela rede
 */
function parseErrorMessage(data, defaultMsg = 'Ocorreu um erro ao processar sua solicitação.') {
  let msg = defaultMsg;
  if (typeof data === 'string') {
    msg = data;
  } else if (data?.message) {
    msg = data.message;
  } else if (data?.error) {
    if (typeof data.error === 'string') msg = data.error;
    else if (data.error.message) msg = data.error.message;
  }

  // Traduções amigáveis de mensagens da API Better Auth / Neon Auth
  const lower = String(msg).toLowerCase();
  if (lower.includes('invalid origin')) {
    return 'Origem de requisição não autorizada. As origens locais foram configuradas, recarregue a página.';
  }
  if (lower.includes('already exists') || lower.includes('duplicate') || lower.includes('email already in use')) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
  }
  if (lower.includes('invalid credentials') || lower.includes('invalid_email_or_password') || lower.includes('invalid password')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }
  if (lower.includes('user not found')) {
    return 'Nenhuma conta encontrada com este e-mail.';
  }

  return msg;
}

/**
 * Obtém a sessão salva no armazenamento local
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler sessão local:', err);
    return null;
  }
}

/**
 * Salva a sessão localmente
 */
export function saveSession(user, token = null) {
  const sessionData = {
    user,
    token: token || `session_${Date.now()}_${user.id || 'usr'}`,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  return sessionData;
}

/**
 * Limpa a sessão salva
 */
export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Cadastra um novo nutricionista via Neon Auth
 */
export async function registerUser({ name, email, password }) {
  if (!password || password.length < 9) {
    throw new Error('A senha deve conter no mínimo 9 caracteres.');
  }

  try {
    const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim()
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Tradução de mensagens comuns de erro de auth
      const rawError = parseErrorMessage(data, 'Falha ao criar conta.');
      if (rawError.includes('already exists') || rawError.includes('duplicate')) {
        throw new Error('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
      }
      throw new Error(rawError);
    }

    // Extrai os dados do usuário retornado
    const user = data?.user || {
      id: data?.id || `user_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim()
    };

    // Salva a sessão ativa localmente
    saveSession(user, data?.token);
    return { success: true, user };
  } catch (error) {
    console.error('Erro no registro via Neon Auth:', error);
    // Caso haja erro de conexão de rede ou CORS no ambiente local, tratamos gracioso
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Não foi possível conectar ao servidor de autenticação. Verifique sua conexão.');
    }
    throw error;
  }
}

/**
 * Realiza o login de um nutricionista via Neon Auth
 */
export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Por favor, informe seu e-mail e sua senha.');
  }

  try {
    const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const rawError = parseErrorMessage(data, 'E-mail ou senha incorretos.');
      if (response.status === 401 || rawError.includes('Invalid credentials') || rawError.includes('invalid_email_or_password')) {
        throw new Error('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
      }
      if (rawError.includes('User not found')) {
        throw new Error('Nenhuma conta encontrada com este e-mail.');
      }
      throw new Error(rawError);
    }

    const user = data?.user || {
      id: data?.id || `user_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: data?.user?.name || email.split('@')[0]
    };

    saveSession(user, data?.token);
    return { success: true, user };
  } catch (error) {
    console.error('Erro no login via Neon Auth:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Não foi possível conectar ao servidor de autenticação. Verifique sua conexão.');
    }
    throw error;
  }
}

/**
 * Solicita recuperação de senha via Neon Auth
 */
export async function requestPasswordReset(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Informe um e-mail válido para solicitar a recuperação de senha.');
  }

  try {
    const response = await fetch(`${NEON_AUTH_BASE_URL}/forget-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        redirectTo: window.location.origin
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const rawError = parseErrorMessage(data, 'Falha ao solicitar recuperação de senha.');
      throw new Error(rawError);
    }

    return { success: true, message: 'Link de redefinição enviado para seu e-mail.' };
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
    throw error;
  }
}

/**
 * Encerra a sessão atual
 */
export async function logoutUser() {
  try {
    await fetch(`${NEON_AUTH_BASE_URL}/sign-out`, {
      method: 'POST'
    }).catch(() => null);
  } finally {
    clearSession();
  }
}

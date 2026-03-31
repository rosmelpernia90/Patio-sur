import apiClient from './client';
import type { User, UserRole } from '../../stores/authStore';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Demo users for offline/local mode (when backend is not available)
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'gerente@pcmejia.com': {
    password: 'PcMejia2025*',
    user: { id: 'demo-1', email: 'gerente@pcmejia.com', full_name: 'Gerente PC Mejia', role: 'gerente' as UserRole, is_active: true, last_login: null },
  },
  'controller@pcmejia.com': {
    password: 'Controller2025*',
    user: { id: 'demo-2', email: 'controller@pcmejia.com', full_name: 'Rosmel Pernia', role: 'controller' as UserRole, is_active: true, last_login: null },
  },
  'ingeniero@pcmejia.com': {
    password: 'Ingeniero2025*',
    user: { id: 'demo-3', email: 'ingeniero@pcmejia.com', full_name: 'Ingeniero PCM', role: 'ingeniero' as UserRole, is_active: true, last_login: null },
  },
  'viewer@pcmejia.com': {
    password: 'Viewer2025*',
    user: { id: 'demo-4', email: 'viewer@pcmejia.com', full_name: 'Viewer PCM', role: 'viewer' as UserRole, is_active: true, last_login: null },
  },
};

function generateDemoToken(user: User): string {
  // Create a base64 JWT-like token that won't expire for 30 days
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  }));
  return `${header}.${payload}.demo-signature`;
}

function demoLogin(email: string, password: string): LoginResponse {
  const entry = DEMO_USERS[email];
  if (!entry) throw new Error('Credenciales incorrectas. Verifique su correo.');
  if (entry.password !== password) throw new Error('Contrasena incorrecta.');
  return {
    access_token: generateDemoToken(entry.user),
    token_type: 'bearer',
    user: { ...entry.user, last_login: new Date().toISOString() },
  };
}

export async function loginAPI(email: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return data;
  } catch (err: unknown) {
    const axiosErr = err as { code?: string; response?: { status?: number } };
    const status = axiosErr.response?.status;
    // If backend is unreachable, returns server error (5xx), or has no usable auth endpoint, use demo login
    if (
      axiosErr.code === 'ERR_NETWORK' ||
      !axiosErr.response ||
      (status && status >= 500)
    ) {
      return demoLogin(email, password);
    }
    throw err;
  }
}

export async function getMeAPI(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export async function changePasswordAPI(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.put('/auth/me/password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

export async function listUsersAPI(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/auth/users');
  return data;
}

export async function createUserAPI(user: {
  email: string;
  password: string;
  full_name: string;
  role: string;
}): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/users', user);
  return data;
}

export async function updateUserAPI(
  userId: string,
  updates: { full_name?: string; role?: string; is_active?: boolean }
): Promise<User> {
  const { data } = await apiClient.put<User>(`/auth/users/${userId}`, updates);
  return data;
}

export async function deleteUserAPI(userId: string): Promise<void> {
  await apiClient.delete(`/auth/users/${userId}`);
}

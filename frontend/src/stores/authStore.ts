/**
 * Authentication store using Zustand.
 * Manages JWT token, user data, and auth state.
 */
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'gerente' | 'controller' | 'ingeniero' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrateFromStorage: () => void;
}

const TOKEN_KEY = 'pcm_access_token';
const USER_KEY = 'pcm_user';

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  hydrateFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr && !isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// ==================== ROLE PERMISSIONS ====================

export interface RolePermissions {
  label: string;
  modules: string[];
}

export const ROLE_CONFIG: Record<UserRole, RolePermissions> = {
  gerente: {
    label: 'Gerente de Proyecto',
    modules: ['dashboard', 'business-case', 'budget', 'cronograma', 'cash-flow', 'reports', 'documents', 'ai-analyzer'],
  },
  controller: {
    label: 'Controller Financiero',
    modules: ['dashboard', 'business-case', 'budget', 'cronograma', 'cash-flow', 'reports', 'documents', 'ai-analyzer'],
  },
  ingeniero: {
    label: 'Ingeniero',
    modules: ['dashboard', 'cronograma', 'documents', 'ai-analyzer'],
  },
  viewer: {
    label: 'Solo Lectura',
    modules: ['dashboard'],
  },
};

export function hasAccess(role: UserRole, module: string): boolean {
  return ROLE_CONFIG[role]?.modules.includes(module) ?? false;
}

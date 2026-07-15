import { create } from 'zustand';
import { api, setApiToken } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organizationId?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('vitahub_token'),
  loading: true,
  error: null,
  login: async (email, password) => {
    set({ error: null });
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    setApiToken(res.access_token);
    set({ user: res.user, token: res.access_token });
  },
  register: async (data) => {
    set({ error: null });
    const res = await api.post<{ access_token: string; user: User }>('/auth/register', data);
    setApiToken(res.access_token);
    set({ user: res.user, token: res.access_token });
  },
  logout: () => {
    setApiToken(null);
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    const t = localStorage.getItem('vitahub_token');
    if (!t) {
      set({ loading: false });
      return;
    }
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, token: t, loading: false });
    } catch {
      setApiToken(null);
      set({ user: null, token: null, loading: false });
    }
  },
  clearError: () => set({ error: null }),
}));

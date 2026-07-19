/**
 * @fileoverview Authentication state management (Zustand).
 *
 * The store keeps the authenticated user and access token in sync with the
 * typed API client. On bootstrap it verifies the stored token via `/auth/me`.
 */

import { create } from 'zustand';
import type { AuthResponse, UserRole } from '@vitahub/shared';
import { api, setApiToken } from './api';

/**
 * Authenticated user profile exposed to the UI.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: string;
}

/**
 * Payload required to register a new account.
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}

/**
 * Authentication store state and actions.
 */
export interface AuthState {
  /** Currently authenticated user or null. */
  user: User | null;
  /** Raw JWT access token or null. */
  token: string | null;
  /** True while the initial token validation is in progress. */
  loading: boolean;
  /** Last authentication error message. */
  error: string | null;

  /** Log in with email/password. */
  login: (email: string, password: string) => Promise<void>;
  /** Register a new account. */
  register: (data: RegisterData) => Promise<void>;
  /** Clear session and token. */
  logout: () => void;
  /** Restore session from persisted token. */
  checkAuth: () => Promise<void>;
  /** Clear transient error state. */
  clearError: () => void;
}

/**
 * Zustand store that manages authentication lifecycle.
 */
export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('vitahub_token'),
  loading: true,
  error: null,

  login: async (email: string, password: string): Promise<void> => {
    set({ error: null });
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    setApiToken(res.accessToken);
    set({ user: res.user as User, token: res.accessToken });
  },

  register: async (data: RegisterData): Promise<void> => {
    set({ error: null });
    const res = await api.post<AuthResponse>('/auth/register', data);
    setApiToken(res.accessToken);
    set({ user: res.user as User, token: res.accessToken });
  },

  logout: (): void => {
    setApiToken(null);
    set({ user: null, token: null });
  },

  checkAuth: async (): Promise<void> => {
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

  clearError: (): void => set({ error: null }),
}));

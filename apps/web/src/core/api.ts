import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

let token: string | null = localStorage.getItem('vitahub_token');

export function setApiToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('vitahub_token', t);
  else localStorage.removeItem('vitahub_token');
}

export function getApiToken() {
  return token;
}

apiClient.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      setApiToken(null);
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Error de servidor';
    return Promise.reject(new Error(message));
  },
);

export const api = {
  get<T = unknown>(path: string) {
    return apiClient.get<T>(path).then((r) => r.data);
  },
  post<T = unknown>(path: string, body?: unknown) {
    return apiClient.post<T>(path, body).then((r) => r.data);
  },
  put<T = unknown>(path: string, body?: unknown) {
    return apiClient.put<T>(path, body).then((r) => r.data);
  },
  delete<T = unknown>(path: string) {
    return apiClient.delete<T>(path).then((r) => r.data);
  },
};

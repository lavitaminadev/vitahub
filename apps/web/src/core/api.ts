/**
 * @fileoverview Typed Axios client used by the React frontend.
 *
 * The client attaches the bearer token to every request and centralizes
 * global error handling (e.g. 401 redirect). Token storage defaults to
 * `localStorage` for SPA simplicity; migrate to `HttpOnly` cookies for
 * stronger XSS protection once the backend sets them.
 */

import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

/** Environment-driven base URL for the VITAHUB API. */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** LocalStorage key used to persist the session token. */
const TOKEN_KEY = 'vitahub_token';

/** Default request timeout in milliseconds. */
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Shape of error payloads returned by the NestJS backend.
 * The backend uses `{ success: false, message?: string, errors?: [...] }`.
 */
interface ApiErrorPayload {
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

/**
 * Global axios instance configured with the API base URL, JSON headers,
 * and a defensive request timeout.
 */
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/** In-memory token cache to avoid reading localStorage on every request. */
let token: string | null = localStorage.getItem(TOKEN_KEY);

/**
 * Stores the session token both in memory and in `localStorage`.
 *
 * @param t - JWT access token or `null` to clear the session.
 */
export function setApiToken(t: string | null): void {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Returns the current in-memory token.
 */
export function getApiToken(): string | null {
  return token;
}

// Attach bearer token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Extracts a human-readable message from an axios error.
 *
 * @param error - Axios error caught from a failed request.
 * @returns Localized error message.
 */
function extractErrorMessage(error: AxiosError<ApiErrorPayload>): string {
  const data = error.response?.data;
  return data?.message || error.message || 'Error de servidor';
}

// Centralize 401 handling and uniform error messages.
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response?.status === 401) {
      setApiToken(null);
      // Prefer a graceful router transition once a global navigate helper exists.
      window.location.href = '/login';
    }
    return Promise.reject(new Error(extractErrorMessage(error)));
  },
);

/**
 * Type-safe HTTP helpers built on top of `apiClient`.
 *
 * @template T - Expected response body type.
 * @template B - Request body type for POST/PUT.
 */
export const api = {
  /**
   * Performs a GET request.
   *
   * @param path - Relative API path.
   * @param config - Optional axios request config.
   */
  get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get<T>(path, config).then((r) => r.data);
  },

  /**
   * Performs a POST request.
   *
   * @param path - Relative API path.
   * @param body - Request payload.
   */
  post<T = unknown, B = unknown>(path: string, body?: B): Promise<T> {
    return apiClient.post<T>(path, body).then((r) => r.data);
  },

  /**
   * Performs a PUT request.
   *
   * @param path - Relative API path.
   * @param body - Request payload.
   */
  put<T = unknown, B = unknown>(path: string, body?: B): Promise<T> {
    return apiClient.put<T>(path, body).then((r) => r.data);
  },

  /**
   * Performs a PATCH request.
   *
   * @param path - Relative API path.
   * @param body - Request payload.
   */
  patch<T = unknown, B = unknown>(path: string, body?: B): Promise<T> {
    return apiClient.patch<T>(path, body).then((r) => r.data);
  },

  /**
   * Performs a DELETE request.
   *
   * @param path - Relative API path.
   */
  delete<T = unknown>(path: string): Promise<T> {
    return apiClient.delete<T>(path).then((r) => r.data);
  },
};

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const TOKEN_STORAGE_KEY = "token";

let accessToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
let refreshPromise: Promise<string | null> | null = null;

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function setAccessToken(token: string | null, persist = true): void {
  accessToken = token;
  if (token && persist) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAccessToken(): string | null {
  return accessToken ?? localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function refreshAccessToken(persist = true): Promise<string | null> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const newToken = response.data.token as string;
    setAccessToken(newToken, persist);
    return newToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

/** Restore session from httpOnly refresh cookie (e.g. after browser restart with Remember me). */
export async function tryRestoreSession(): Promise<boolean> {
  const token = getAccessToken();
  if (token && !isTokenExpired(token)) return true;

  const hasPersistedToken = !!localStorage.getItem(TOKEN_STORAGE_KEY);
  const newToken = await refreshAccessToken(hasPersistedToken || !!token);
  return !!newToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (!refreshPromise) {
        const persist = !!localStorage.getItem(TOKEN_STORAGE_KEY);
        refreshPromise = refreshAccessToken(persist);
      }
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }
    if (error.response?.status === 401) setAccessToken(null);
    return Promise.reject(error);
  }
);

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // ignore
  }
  setAccessToken(null);
}

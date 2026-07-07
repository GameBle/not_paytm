import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let accessToken: string | null = localStorage.getItem("token");
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function getAccessToken(): string | null {
  return accessToken ?? localStorage.getItem("token");
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

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const newToken = response.data.token as string;
    setAccessToken(newToken);
    return newToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (!refreshPromise) refreshPromise = refreshAccessToken();
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

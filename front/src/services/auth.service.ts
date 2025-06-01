import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getCookie('refreshToken');
      if (refreshToken) {
        try {
          const response = await refreshAccessToken(refreshToken);
          setCookie('accessToken', response.accessToken);
          api.defaults.headers.Authorization = `Bearer ${response.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Если обновление токена не удалось, перенаправляем на логин
          clearAuthCookies();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API методы для авторизации
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', credentials),

  logout: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/logout'),

  refreshToken: (refreshToken: string): Promise<AxiosResponse<{ accessToken: string }>> =>
    api.post('/auth/refresh', { refreshToken }),
};

// Утилиты для работы с куки
export const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const clearAuthCookies = (): void => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
};

const refreshAccessToken = async (refreshToken: string) => {
  const response = await authAPI.refreshToken(refreshToken);
  return response.data;
};

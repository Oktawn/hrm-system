import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно для работы с cookie
});

// Интерсептор для обработки ответов и автоматического обновления токенов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что это ошибка 401, запрос еще не повторялся, и это НЕ запрос на refresh или login
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токены через refresh endpoint
        await api.post('/auth/refresh');
        
        // Если обновление прошло успешно, повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        // Если обновление токена не удалось, перенаправляем на логин
        console.error('Failed to refresh token:', refreshError);
        
        // Очищаем cookie через logout
        try {
          await api.post('/auth/logout');
        } catch (logoutError) {
          console.error('Logout error:', logoutError);
        }
        
        // Перенаправляем на страницу логина только если мы не на странице логина
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
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

  refreshToken: (): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/auth/refresh'),

  checkToken: (): Promise<AxiosResponse<{ valid: boolean; user?: any }>> =>
    api.get('/auth/check'),
};

// Утилиты для проверки авторизации
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await authAPI.checkToken();
    return response.data.valid;
  } catch (error) {
    return false;
  }
};

// Функция для безопасного выполнения API запросов с автоматическим обновлением токенов
export const safeApiCall = async <T>(apiCall: () => Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error: any) {
    // Если это ошибка 401, interceptor уже попытается обновить токен
    // и повторить запрос автоматически
    throw error;
  }
};

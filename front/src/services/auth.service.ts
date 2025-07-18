import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_HOST_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh');

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);

        try {
          await api.post('/auth/logout');
        } catch (logoutError) {
          console.error('Logout error:', logoutError);
        }

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await authAPI.checkToken();
    return response.data.valid;
  } catch  {
    return false;
  }
};



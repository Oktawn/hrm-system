import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, LoginRequest, User } from '../types/auth.types';
import { authAPI, setCookie, getCookie, clearAuthCookies } from '../services/auth.service';

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Начальное состояние
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Действия
        login: async (credentials: LoginRequest) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authAPI.login(credentials);
            const { accessToken, refreshToken, user } = response.data;

            // Сохраняем токены в куки
            setCookie('accessToken', accessToken, 7);
            setCookie('refreshToken', refreshToken, 30);

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });

          try {
            await authAPI.logout();
          } catch (error) {
            console.error('Ошибка при выходе:', error);
          } finally {
            // Очищаем состояние и куки в любом случае
            clearAuthCookies();
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        checkAuth: () => {
          const accessToken = getCookie('accessToken');
          const refreshToken = getCookie('refreshToken');

          if (accessToken && refreshToken) {
            const { user } = get();
            if (user) {
              set({
                accessToken,
                refreshToken,
                isAuthenticated: true,
              });
            }
          } else {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setUser: (user: User) => {
          set({ user });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

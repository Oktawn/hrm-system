import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, LoginRequest, User } from '../types/auth.types';
import { authAPI } from '../services/auth.service';

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // Начальное состояние
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Действия
        login: async (credentials: LoginRequest) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authAPI.login(credentials);
            // В новой системе токены автоматически сохраняются в httpOnly cookie
            // Нам нужно только получить данные пользователя
            
            set({
              user: response.data.user || null, // Если есть данные пользователя в ответе
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
            set({
              user: null,
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
            // Очищаем состояние - куки очистит сервер
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });
          
          try {
            const response = await authAPI.checkToken();
            
            if (response.data.valid) {
              set({
                user: response.data.user || null,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } catch (error: any) {
            // Если проверка токена не удалась, пользователь не авторизован
            // Не логируем ошибку как error, это нормальная ситуация для неавторизованного пользователя
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setUser: (user: User) => {
          set({ user });
        },

        updateUser: (userData: Partial<User>) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null
          }));
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

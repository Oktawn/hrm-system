/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, LoginRequest, User } from '../types/auth.types';
import { authAPI } from '../services/auth.service';
import { useNavigationStore } from './navigation.store';

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
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials: LoginRequest) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authAPI.login(credentials);
            set({
              user: response.data.user || null,
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
            useNavigationStore.getState().clearLastVisitedPath();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        checkAuth: async () => {
          const currentState = useAuthStore.getState();

          if (currentState.isLoading) {
            return;
          }

          set({ isLoading: true });

          try {
            const response = await authAPI.checkToken();

            if (response.data.valid && response.data.user) {
              set({
                user: response.data.user,
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
            console.error('Auth check failed:', error);
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
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  lastVisitedPath: string;
  previousPath: string | null;
}

interface NavigationActions {
  setLastVisitedPath: (path: string) => void;
  setPreviousPath: (path: string) => void;
  getLastVisitedPath: () => string;
  clearLastVisitedPath: () => void;
  isProtectedRoute: (path: string) => boolean;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      lastVisitedPath: '/',
      previousPath: null,

      setLastVisitedPath: (path: string) => {
        if (path !== '/login') {
          const currentState = get();
          set({ 
            previousPath: currentState.lastVisitedPath,
            lastVisitedPath: path 
          });
        }
      },

      setPreviousPath: (path: string) => {
        set({ previousPath: path });
      },

      getLastVisitedPath: () => {
        const state = get();
        return state.lastVisitedPath || '/';
      },

      clearLastVisitedPath: () => {
        set({ lastVisitedPath: '/', previousPath: null });
      },

      isProtectedRoute: (path: string) => {
        const publicRoutes = ['/login'];
        return !publicRoutes.includes(path) && path !== '';
      },
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({
        lastVisitedPath: state.lastVisitedPath,
        previousPath: state.previousPath,
      }),
    }
  )
);

export const useNavigation = () => {
  const store = useNavigationStore();

  return {
    lastVisitedPath: store.lastVisitedPath,
    previousPath: store.previousPath,
    setLastVisitedPath: store.setLastVisitedPath,
    setPreviousPath: store.setPreviousPath,
    getLastVisitedPath: store.getLastVisitedPath,
    clearLastVisitedPath: store.clearLastVisitedPath,
    isProtectedRoute: store.isProtectedRoute,
  };
};

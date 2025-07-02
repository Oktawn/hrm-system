import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationStore } from '../../stores/navigation.store';

interface NavigationTrackerProps {
  children: ReactNode;
}

export function NavigationTracker({ children }: NavigationTrackerProps) {
  const location = useLocation();
  const setLastVisitedPath = useNavigationStore((state) => state.setLastVisitedPath);
  const isProtectedRoute = useNavigationStore((state) => state.isProtectedRoute);

  useEffect(() => {
    if (isProtectedRoute(location.pathname)) {
      setLastVisitedPath(location.pathname + location.search);
    }
  }, [location.pathname, location.search, setLastVisitedPath, isProtectedRoute]);

  return <>{children}</>;
};

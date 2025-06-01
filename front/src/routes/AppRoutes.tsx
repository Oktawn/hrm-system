import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { HomePage } from '../pages/HomePage/HomePage';
import { AppLayout } from '../components/Layout/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div style={{ padding: '24px' }}>
                <h2>Сотрудники</h2>
                <p>Страница в разработке...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div style={{ padding: '24px' }}>
                <h2>Задачи</h2>
                <p>Страница в разработке...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div style={{ padding: '24px' }}>
                <h2>Заявки</h2>
                <p>Страница в разработке...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div style={{ padding: '24px' }}>
                <h2>Профиль</h2>
                <p>Страница в разработке...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div style={{ padding: '24px' }}>
                <h2>Настройки</h2>
                <p>Страница в разработке...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

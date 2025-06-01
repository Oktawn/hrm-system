import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './stores/auth.store';
import './App.css';

export function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider locale={ruRU}>
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App

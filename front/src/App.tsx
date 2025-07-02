import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import ruRU from 'antd/locale/ru_RU';
import { AppRoutes } from './routes/AppRoutes';
import { NavigationTracker } from './components/NavigationTracker/NavigationTracker';
import { useAuthStore } from './stores/auth.store';
import './App.css';

export function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated]);

  return (
    <ConfigProvider locale={ruRU}>
      <Router>
        <NavigationTracker>
          <AppRoutes />
        </NavigationTracker>
      </Router>
    </ConfigProvider>
  );
}

export default App

import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button, type MenuProps } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import './AppLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: handleLogout,
    },
  ];

  const navigationItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Главная',
      onClick: () => navigate('/'),
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Сотрудники',
      onClick: () => navigate('/employees'),
    },
    {
      key: '/tasks',
      icon: <ProjectOutlined />,
      label: 'Задачи',
      onClick: () => navigate('/tasks'),
    },
    {
      key: '/requests',
      icon: <FileTextOutlined />,
      label: 'Заявки',
      onClick: () => navigate('/requests'),
    },
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="app-sider"
        width={256}
        collapsedWidth={80}
      >
        <div className="app-logo">
          <Text strong style={{ color: 'white', fontSize: collapsed ? '14px' : '18px' }}>
            {collapsed ? 'HR' : 'HR System'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={navigationItems}
          className="app-menu"
        />
      </Sider>

      <Layout>
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
          </div>

          <div className="header-right">
            <Space>
              <Text style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                {user?.firstName} {user?.lastName || user?.email}
              </Text>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar
                  style={{ cursor: 'pointer' }}
                  icon={<UserOutlined />}
                  size="default"
                />
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className="app-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

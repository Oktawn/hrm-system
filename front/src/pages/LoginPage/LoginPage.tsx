import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigation } from '../../stores/navigation.store';
import { validateLoginForm } from '../../utils/validation';
import './LoginPage.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const { getLastVisitedPath, clearLastVisitedPath } = useNavigation();

  const [form] = Form.useForm();
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const from = (location.state as any)?.from?.pathname || getLastVisitedPath();

  useEffect(() => {
    if (isAuthenticated) {
      clearLastVisitedPath();
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, clearLastVisitedPath]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (values: LoginFormData) => {
    const { email, password } = values;

    const validation = validateLoginForm(email, password);

    if (!validation.isValid) {
      setFormErrors({
        email: validation.email || undefined,
        password: validation.password || undefined,
      });
      return;
    }

    setFormErrors({});
    clearError();

    try {
      await login({ email, password });
    } catch (err) {
      console.error('Ошибка входа:', err);
    }
  };

  const handleFieldChange = () => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
    if (error) {
      clearError();
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="login-header">
            <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
              Добро пожаловать
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Войдите в свою учетную запись
            </Text>
          </div>

          {error && (
            <Alert
              message="Ошибка авторизации"
              description={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
            />
          )}

          <Form
            form={form}
            name="login"
            size="large"
            onFinish={handleSubmit}
            onChange={handleFieldChange}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              validateStatus={formErrors.email ? 'error' : ''}
              help={formErrors.email}
              rules={[
                { required: true, message: 'Пожалуйста, введите email' },
                { type: 'email', message: 'Введите корректный email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Введите ваш email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Пароль"
              validateStatus={formErrors.password ? 'error' : ''}
              help={formErrors.password}
              rules={[
                { required: true, message: 'Пожалуйста, введите пароль' },
                { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Введите ваш пароль"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                size="large"
                className="login-button"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Tabs,
  Space,
  Typography,
  Divider,
  message,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SettingOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import profileAPI from '../../services/profile.service';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../../types/auth.types';
import './ProfilePage.css';

const { Title, Text } = Typography;

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await profileAPI.getProfile();
        const profile = response.data.user;
        updateUser(profile);
        profileForm.setFieldsValue({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          position: profile.position || '',
          department: profile.department || ''
        });
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [updateUser, profileForm]);

  const handleProfileUpdate = async (values: UpdateProfileRequest) => {
    setLoading(true);
    try {
      await profileAPI.updateProfile(values);
      updateUser(values);
      message.success('Профиль успешно обновлен');
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при обновлении профиля';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: ChangePasswordRequest) => {
    setLoading(true);
    try {
      await profileAPI.changePassword(values);
      message.success('Пароль успешно изменен');
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при смене пароля';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const ProfileInfo = () => (
    <Card className="profile-card">
      <div className="profile-header">
        <Space size="large" align="start">
          <div className="avatar-section">
            <Avatar
              size={100}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
          </div>

          <div className="profile-info">
            <Title level={3}>
              {user?.firstName} {user?.lastName}
            </Title>
            <br />
            <Text type="secondary">
              {user?.email}
            </Text>
          </div>
        </Space>

        <Button
          type="primary"
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Отмена' : 'Редактировать'}
        </Button>
      </div>

      <Divider />

      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleProfileUpdate}
        disabled={!isEditing || loading}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Имя"
              name="firstName"
              rules={[{ required: true, message: 'Введите имя' }]}
            >
              <Input placeholder="Введите имя" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Фамилия"
              name="lastName"
              rules={[{ required: true, message: 'Введите фамилию' }]}
            >
              <Input placeholder="Введите фамилию" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Введите корректный email' }
              ]}
            >
              <Input placeholder="Введите email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Телефон"
              name="phone"
            >
              <Input placeholder="Введите номер телефона" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Должность"
              name="position"
            >
              <Input placeholder="Должность" disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Отдел"
              name="department"
            >
              <Input placeholder="Отдел" disabled />
            </Form.Item>
          </Col>
        </Row>

        {isEditing && (
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Сохранить изменения
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  );

  const SecuritySettings = () => (
    <Card title="Безопасность" className="security-card">
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Form.Item
          label="Текущий пароль"
          name="currentPassword"
          rules={[{ required: true, message: 'Введите текущий пароль' }]}
        >
          <Input.Password placeholder="Введите текущий пароль" />
        </Form.Item>

        <Form.Item
          label="Новый пароль"
          name="newPassword"
          rules={[
            { required: true, message: 'Введите новый пароль' },
            { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
          ]}
        >
          <Input.Password placeholder="Введите новый пароль" />
        </Form.Item>

        <Form.Item
          label="Подтвердите новый пароль"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Подтвердите новый пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Подтвердите новый пароль" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<LockOutlined />}
          >
            Изменить пароль
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Личная информация
        </span>
      ),
      children: <ProfileInfo />
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          Настройки
        </span>
      ),
      children: <SecuritySettings />
    }
  ];

  return (
    <div className="profile-page">
      <div className="profile-header-section">
        <Title level={2}>Профиль пользователя</Title>
      </div>

      <Tabs
        defaultActiveKey="profile"
        className="profile-tabs"
        items={tabItems}
      />
    </div>
  );
};

export default ProfilePage;

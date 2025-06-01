import { Layout, Typography, Card, Row, Col, Statistic, Space } from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';

const { Content } = Layout;
const { Title, Text } = Typography;

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <Content style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>
            Добро пожаловать, {user?.firstName || user?.email || 'Пользователь'}!
          </Title>
          <Text type="secondary">
            Система управления персоналом
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Сотрудники"
                value={42}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Активные задачи"
                value={15}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Выполнено"
                value={28}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Ожидают"
                value={7}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Последние задачи" extra={<a href="#">Показать все</a>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Обновить документацию</Text>
                  <br />
                  <Text type="secondary">Срок: завтра</Text>
                </div>
                <div>
                  <Text strong>Провести собеседование</Text>
                  <br />
                  <Text type="secondary">Срок: на следующей неделе</Text>
                </div>
                <div>
                  <Text strong>Подготовить отчет</Text>
                  <br />
                  <Text type="secondary">Срок: через 3 дня</Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Уведомления" extra={<a href="#">Показать все</a>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Новый сотрудник присоединился</Text>
                  <br />
                  <Text type="secondary">2 часа назад</Text>
                </div>
                <div>
                  <Text strong>Задача "Проект А" завершена</Text>
                  <br />
                  <Text type="secondary">5 часов назад</Text>
                </div>
                <div>
                  <Text strong>Запрос на отпуск от Иванова И.И.</Text>
                  <br />
                  <Text type="secondary">1 день назад</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </Content>
  );
}

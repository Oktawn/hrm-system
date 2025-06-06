import { useEffect, useState } from 'react';
import { Layout, Typography, Card, Table, Tag, Space, Select } from 'antd';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task } from '../../services/tasks.service';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function MyTasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await tasksAPI.getByAssignee(user.id.toString());
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки моих задач:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'processing';
      case 'review': return 'warning';
      case 'done': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'К выполнению';
      case 'in_progress': return 'В работе';
      case 'review': return 'На проверке';
      case 'done': return 'Выполнено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критический';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (text: string) => text || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      width: '15%',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: 'Дедлайн',
      dataIndex: 'deadline',
      key: 'deadline',
      width: '15%',
      render: (deadline: string) => deadline ? new Date(deadline).toLocaleDateString() : '—',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Мои задачи</Title>
          <Space style={{ marginBottom: '16px' }}>
            <Select
              placeholder="Статус"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => {
                if (value) {
                  setTasks(prev => prev.filter(task => task.status === value));
                } else {
                  fetchMyTasks();
                }
              }}
            >
              <Option value="todo">К выполнению</Option>
              <Option value="in_progress">В работе</Option>
              <Option value="review">На проверке</Option>
              <Option value="done">Выполнено</Option>
              <Option value="cancelled">Отменено</Option>
            </Select>
            <Select
              placeholder="Приоритет"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => {
                if (value) {
                  setTasks(prev => prev.filter(task => task.priority === value));
                } else {
                  fetchMyTasks();
                }
              }}
            >
              <Option value="critical">Критический</Option>
              <Option value="high">Высокий</Option>
              <Option value="medium">Средний</Option>
              <Option value="low">Низкий</Option>
            </Select>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={tasks}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total} задач`,
            }}
          />
        </Card>
      </Content>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { Layout, Typography, Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task, type TaskFilter } from '../../services/tasks.service';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>({});

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll(filter);
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

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
      width: '25%',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (text: string) => text || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
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
      width: '12%',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: 'Исполнители',
      dataIndex: 'assignees',
      key: 'assignees',
      width: '20%',
      render: (assignees: any[]) => (
        <div>
          {assignees && assignees.length > 0
            ? assignees.map(a => `${a.firstName} ${a.lastName}`).join(', ')
            : '—'
          }
        </div>
      ),
    },
    {
      title: 'Дедлайн',
      dataIndex: 'deadline',
      key: 'deadline',
      width: '12%',
      render: (deadline: string) => deadline ? new Date(deadline).toLocaleDateString() : '—',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={2}>Все задачи</Title>
            {(user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') && (
              <Button type="primary" icon={<PlusOutlined />}>
                Создать задачу
              </Button>
            )}
          </div>

          <Space style={{ marginBottom: '16px' }}>
            <Input
              placeholder="Поиск по названию"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setFilter({ ...filter, title: e.target.value })}
            />
            <Select
              placeholder="Статус"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
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
              onChange={(value) => setFilter({ ...filter, priority: value })}
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

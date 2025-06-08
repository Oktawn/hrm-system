import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task, type TaskFilter } from '../../services/tasks.service';
import TaskDetail from '../../components/TaskDetail/TaskDetail';
import StatusSelector from '../../components/StatusSelector/StatusSelector';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchParams, setSearchParams] = useSearchParams();

  // Получаем ID задачи из URL
  const selectedTaskId = searchParams.get('task');
  const taskDetailVisible = Boolean(selectedTaskId);

  // Определяем, показывать ли только мои задачи
  const isEmployee = user?.role === 'EMPLOYEE';
  const isManager = user?.role === 'MANAGER' || user?.role === 'HR' || user?.role === 'ADMIN';

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let response;

      if (isEmployee) {
        // Для обычных сотрудников показываем только их задачи
        response = await tasksAPI.getByAssignee(user.id);
      } else {
        // Для руководителей показываем все задачи
        response = await tasksAPI.getAll(filter);
      }

      setTasks(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, user]);

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

  const canChangeStatus = (task: Task) => {
    if (!user) return false;

    const isCreator = task.creator.id === user.id.toString();
    const isAssignee = task.assignees.some(assignee => assignee.id === user.id.toString());
    const isManagerRole = user.role === 'ADMIN' || user.role === 'HR' || user.role === 'MANAGER';

    return isCreator || isAssignee || isManagerRole;
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      fetchTasks(); // Обновляем список задач
    } catch (error) {
      console.error('Ошибка при изменении статуса задачи:', error);
    }
  };

  const handleTaskClick = (taskId: number) => {
    setSearchParams({ task: taskId.toString() });
  };

  const closeTaskDetail = () => {
    setSearchParams({});
  };

  const handleTaskUpdate = () => {
    fetchTasks(); // Обновляем список задач после изменения
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      render: (id: number) => `#${id}`,
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (text: string) => text || '—',
    },
    ...(isManager ? [{
      title: 'Создатель',
      dataIndex: 'creator',
      key: 'creator',
      width: '12%',
      render: (creator: any) => creator ? `${creator.firstName} ${creator.lastName}` : '—',
    }] : []),
    {
      title: 'Исполнители',
      dataIndex: 'assignees',
      key: 'assignees',
      width: '15%',
      render: (assignees: any[]) =>
        assignees?.map(assignee => `${assignee.firstName} ${assignee.lastName}`).join(', ') || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string, record: Task) =>
        canChangeStatus(record) ? (
          <StatusSelector
            currentStatus={status}
            onStatusChange={(newStatus) => handleStatusChange(record.id, newStatus)}
            type="task"
          />
        ) : (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        ),
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      width: '10%',
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
      width: '12%',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '8%',
      render: (_: any, record: Task) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleTaskClick(record.id)}
            title="Посмотреть детали"
          />
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={2}>
              {isEmployee ? 'Мои задачи' : 'Задачи'}
            </Title>
            <Button type="primary" icon={<PlusOutlined />}>
              Создать задачу
            </Button>
          </div>

          <Space style={{ marginBottom: '16px' }}>
            {!isEmployee && (
              <Input
                placeholder="Поиск по названию"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                onChange={(e) => setFilter({ ...filter, title: e.target.value })}
              />
            )}
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
            onRow={(record) => ({
              onClick: () => handleTaskClick(record.id),
              style: { cursor: 'pointer' }
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total} задач`,
            }}
          />
        </Card>

        <TaskDetail
          taskId={selectedTaskId ? parseInt(selectedTaskId, 10) : null}
          visible={taskDetailVisible}
          onClose={closeTaskDetail}
          onTaskUpdate={handleTaskUpdate}
        />
      </Content>
    </Layout>
  );
}

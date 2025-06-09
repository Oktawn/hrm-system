import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task, type TaskFilter } from '../../services/tasks.service';
import TaskDetail from '../../components/TaskDetail/TaskDetail';
import CreateTaskModal from '../../components/CreateTaskModal/CreateTaskModal';
import { 
  getTaskStatusColor, 
  getTaskStatusText, 
  getPriorityColor, 
  getPriorityText 
} from '../../utils/status.utils';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Получаем ID задачи из URL
  const selectedTaskId = searchParams.get('task');
  const taskDetailVisible = Boolean(selectedTaskId);

  // Определяем, какие задачи показывать
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const fetchTasks = async (page = 1, pageSize = 10) => {
    if (!user) return;

    try {
      setLoading(true);

      if (isEmployee) {
        // Для обычных сотрудников нужен employeeId
        if (!user.employeeId) return;
        
        // Показываем задачи, где они исполнители И создатели
        const [assignedResponse, createdResponse] = await Promise.all([
          tasksAPI.getByAssignee(user.employeeId),
          tasksAPI.getByCreator(user.employeeId)
        ]);
        
        const assignedTasks = assignedResponse.data || [];
        const createdTasks = createdResponse.data || [];
        
        // Объединяем задачи и убираем дублирование по ID
        const allTasks = [...assignedTasks];
        createdTasks.forEach(createdTask => {
          if (!allTasks.some(task => task.id === createdTask.id)) {
            allTasks.push(createdTask);
          }
        });
        
        setTasks(allTasks);
        setPagination(prev => ({
          ...prev,
          total: allTasks.length,
          current: 1,
          pageSize: allTasks.length || 10,
        }));
      } else {
        // Для руководителей показываем все задачи с пагинацией
        const filterWithPagination = {
          ...filter,
          page,
          limit: pageSize,
        };
        const response = await tasksAPI.getAll(filterWithPagination);
        setTasks(response.data || []);
        setPagination({
          current: response.meta?.page || 1,
          pageSize: response.meta?.limit || 10,
          total: response.meta?.total || 0,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(pagination.current, pagination.pageSize);
  }, [filter, user]);

  const handleTaskClick = (taskId: number) => {
    setSearchParams({ task: taskId.toString() });
  };

  const closeTaskDetail = () => {
    setSearchParams({});
  };

  const handleTaskUpdate = () => {
    fetchTasks(pagination.current, pagination.pageSize); // Обновляем список задач после изменения
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
      render: (status: string) => (
        <Tag color={getTaskStatusColor(status)}>
          {getTaskStatusText(status)}
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateTaskModalVisible(true)}>
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
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Всего: ${total} задач`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
                fetchTasks(page, pageSize);
              },
              onShowSizeChange: (_, size) => {
                setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
                fetchTasks(1, size);
              },
            }}
          />
        </Card>

        <TaskDetail
          taskId={selectedTaskId ? parseInt(selectedTaskId, 10) : null}
          visible={taskDetailVisible}
          onClose={closeTaskDetail}
          onTaskUpdate={handleTaskUpdate}
        />

        <CreateTaskModal
          visible={createTaskModalVisible}
          onClose={() => setCreateTaskModalVisible(false)}
          onTaskCreated={() => {
            setCreateTaskModalVisible(false);
            fetchTasks(pagination.current, pagination.pageSize); // Обновляем список задач после создания
          }}
        />
      </Content>
    </Layout>
  );
}

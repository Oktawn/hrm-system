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

  const selectedTaskId = searchParams.get('task');
  const taskDetailVisible = Boolean(selectedTaskId);

  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const fetchTasks = async (page = 1, pageSize = 10, currentFilter = filter) => {
    if (!user) return;

    try {
      setLoading(true);

      if (isEmployee) {
        if (!user.employeeId) return;

        const [assignedResponse, createdResponse] = await Promise.all([
          tasksAPI.getByAssignee(user.employeeId),
          tasksAPI.getByCreator(user.employeeId)
        ]);

        const assignedTasks = assignedResponse.data || [];
        const createdTasks = createdResponse.data || [];

        const allTasks = [...assignedTasks];
        createdTasks.forEach(createdTask => {
          if (!allTasks.some(task => task.id === createdTask.id)) {
            allTasks.push(createdTask);
          }
        });

        // Применяем клиентскую сортировку для сотрудников
        let sortedTasks = [...allTasks];
        if (currentFilter.sortBy && currentFilter.sortOrder) {
          const allowedSortFields = ['id', 'title', 'deadline', 'createdAt'];
          if (allowedSortFields.includes(currentFilter.sortBy)) {
            sortedTasks.sort((a, b) => {
              const field = currentFilter.sortBy!;
              let aValue: any = a[field as keyof Task];
              let bValue: any = b[field as keyof Task];

              // Обрабатываем даты
              if (field === 'deadline' || field === 'createdAt') {
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
              }

              // Обрабатываем строки
              if (field === 'title' && typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
              }

              if (aValue < bValue) return currentFilter.sortOrder === 'ASC' ? -1 : 1;
              if (aValue > bValue) return currentFilter.sortOrder === 'ASC' ? 1 : -1;
              return 0;
            });
          }
        }

        setTasks(sortedTasks);
        setPagination(prev => ({
          ...prev,
          total: sortedTasks.length,
          current: 1,
          pageSize: sortedTasks.length || 10,
        }));
      } else {
        const filterWithPagination = {
          ...currentFilter,
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
    fetchTasks(pagination.current, pagination.pageSize, filter);
  }, [filter, user]);

  const handleTaskClick = (taskId: number) => {
    setSearchParams({ task: taskId.toString() });
  };

  const closeTaskDetail = () => {
    setSearchParams({});
  };

  const handleTaskUpdate = () => {
    fetchTasks(pagination.current, pagination.pageSize, filter);
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    let newSortField = '';
    let newSortOrder: 'ascend' | 'descend' | null = null;
    
    if (sorter && sorter.field && sorter.order) {
      newSortField = sorter.field;
      newSortOrder = sorter.order;
    }
    
    const newPagination = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    };
    setPagination(newPagination);
    
    // Обновляем фильтр с параметрами сортировки
    const updatedFilter: TaskFilter = {
      ...filter,
      sortBy: newSortField || undefined,
      sortOrder: newSortOrder === 'ascend' ? 'ASC' : newSortOrder === 'descend' ? 'DESC' : undefined,
    };
    
    setFilter(updatedFilter);
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      sorter: true,
      render: (id: number) => `#${id}`,
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      sorter: true,
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
      sorter: true,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      sorter: true,
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
            onChange={handleTableChange}
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
                fetchTasks(page, pageSize, filter);
              },
              onShowSizeChange: (_, size) => {
                setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
                fetchTasks(1, size, filter);
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
            fetchTasks(pagination.current, pagination.pageSize, filter);
          }}
        />
      </Content>
    </Layout>
  );
}

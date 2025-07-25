import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task, type TaskFilter } from '../../services/tasks.service';
import employeesAPI from '../../services/employees.service';
import TaskDetail from '../../components/TaskDetail/TaskDetail';
import CreateTaskModal from '../../components/CreateTaskModal/CreateTaskModal';
import {
  getTaskStatusColor,
  getTaskStatusText,
  getPriorityColor,
  getPriorityText,
  TaskPriorityEnum,
  TaskStatusEnum
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
  const [employees, setEmployees] = useState<Array<{ id: string, firstName: string, lastName: string }>>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const selectedTaskId = searchParams.get('task');
  const taskDetailVisible = Boolean(selectedTaskId);
  const myTasksFilter = searchParams.get('myTasks') === 'true';

  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const fetchTasks = useCallback(async (page = 1, pageSize = 10, currentFilter = filter) => {
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

        const sortedTasks = [...allTasks];
        if (currentFilter.sortBy && currentFilter.sortOrder) {
          const allowedSortFields = ['id', 'title', 'deadline', 'createdAt'];
          if (allowedSortFields.includes(currentFilter.sortBy)) {
            sortedTasks.sort((a, b) => {
              const field = currentFilter.sortBy!;
              let aValue: any = a[field as keyof Task];
              let bValue: any = b[field as keyof Task];

              if (field === 'deadline' || field === 'createdAt') {
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
              }

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
  }, [filter, isEmployee, user]);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll({ limit: 1000 });
      if (response.data?.data) {
        setEmployees(response.data.data.map((emp: any) => ({
          id: emp.id,
          firstName: emp.firstName || '',
          lastName: emp.lastName || ''
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  useEffect(() => {
    fetchTasks(1, 10, filter);
  }, [filter, fetchTasks]);

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  useEffect(() => {
    if (myTasksFilter && user?.employeeId && !filter.assigneesId) {
      setFilter(prev => ({ ...prev, assigneesId: [user.employeeId!] }));
    }
  }, [filter.assigneesId, myTasksFilter, user?.employeeId]);

  const handleTaskClick = (taskId: number) => {
    setSearchParams({ task: taskId.toString() });
  };

  const closeTaskDetail = () => {
    setSearchParams({});
  };

  const clearMyTasksFilter = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('myTasks');
    setSearchParams(newSearchParams);
    setFilter(prev => {
      const { ...rest } = prev;
      return rest;
    });
  };

  const handleTaskUpdate = () => {
    fetchTasks(pagination.current, pagination.pageSize, filter);
  };

  const handleTableChange = (paginationInfo: any, _filters: any, sorter: any) => {
    let newSortField = '';
    let newSortOrder: 'ascend' | 'descend' | null = null;

    if (sorter && sorter.field && sorter.order) {
      newSortField = sorter.field;
      newSortOrder = sorter.order;
    }

    const updatedFilter: TaskFilter = {
      ...filter,
      sortBy: newSortField || undefined,
      sortOrder: newSortOrder === 'ascend' ? 'ASC' : newSortOrder === 'descend' ? 'DESC' : undefined,
    };

    if (paginationInfo.current !== pagination.current || paginationInfo.pageSize !== pagination.pageSize) {
      fetchTasks(paginationInfo.current, paginationInfo.pageSize, updatedFilter);
    } else if (JSON.stringify(updatedFilter) !== JSON.stringify(filter)) {
      setFilter(updatedFilter);
    }
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
            <div>
              <Title level={2}>
                {isEmployee ? 'Мои задачи' : 'Задачи'}
              </Title>
              {myTasksFilter && !isEmployee && (
                <div style={{ marginTop: '8px' }}>
                  <Tag closable onClose={clearMyTasksFilter} color="blue">
                    Фильтр: Мои задачи
                  </Tag>
                </div>
              )}
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateTaskModalVisible(true)}>
              Создать задачу
            </Button>
          </div>

          <Space style={{ marginBottom: '16px' }}>
            {isManager && (
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
              value={filter.status}
              onChange={(value) => setFilter({ ...filter, status: value })}
            >
              {Object.values(TaskStatusEnum).map(status => (
                <Option key={status} value={status}>
                  {getTaskStatusText(status)}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Приоритет"
              style={{ width: 150 }}
              allowClear
              value={filter.priority}
              onChange={(value) => setFilter({ ...filter, priority: value })}
            >
              {Object.values(TaskPriorityEnum).map(priority => (
                <Option key={priority} value={priority}>
                  {getPriorityText(priority)}
                </Option>
              ))}
            </Select>
            {isManager && (
              <Select
                placeholder="Исполнитель"
                style={{ width: 200 }}
                allowClear
                mode="multiple"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                }
                value={filter.assigneesId}
                onChange={(value) => setFilter({ ...filter, assigneesId: value })}
              >
                {employees.map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </Option>
                ))}
              </Select>
            )}
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
                fetchTasks(page, pageSize, filter);
              },
              onShowSizeChange: (_, size) => {
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

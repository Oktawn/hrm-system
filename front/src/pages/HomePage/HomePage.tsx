import { useEffect, useState } from 'react';
import { Layout, Typography, Card, Row, Col, Statistic, Space, Spin, List, Tag, Alert, Button } from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  getTaskStatusColor,
  getTaskStatusText,
  getPriorityColor,
  getPriorityText,
  getRequestStatusColor,
  getRequestStatusText
} from '../../utils/status.utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import employeesAPI from '../../services/employees.service';
import tasksAPI, { type TaskStats, type Task } from '../../services/tasks.service';
import requestsAPI from '../../services/requests.service';
import departmentsAPI, { type DepartmentStats } from '../../services/departments.service';
import { statisticsService } from '../../services/statistics.service';
import type { EmployeeStats } from '../../types/employee.types';
import type { Request } from '../../types/request.types';

const { Content } = Layout;
const { Title, Text } = Typography;

export function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [employeesStats, setEmployeesStats] = useState<EmployeeStats | null>(null);
  const [tasksStats, setTasksStats] = useState<TaskStats | null>(null);
  const [personalTasksStats, setPersonalTasksStats] = useState<any | null>(null);
  const [departmentsStats, setDepartmentsStats] = useState<DepartmentStats[]>([]);

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const isEmployee = user?.role === 'employee';
        const isHrOrManager = user?.role === 'hr' || user?.role === 'manager';
        const isAdmin = user?.role === 'admin';

        if (!isEmployee) {
          const [
            employeesStatsData,
            tasksStatsData,
            recentTasksData,
          ] = await Promise.all([
            employeesAPI.getEmployeeStats().catch(() => ({ total: 0, active: 0, inactive: 0 })),
            tasksAPI.getStats().then(res => res.data).catch(() => ({ total: 0, todo: 0, inProgress: 0, review: 0, done: 0, cancelled: 0 })),
            tasksAPI.getRecent(5).then(res => res.data).catch(() => []),
          ]);

          setEmployeesStats(employeesStatsData);
          setTasksStats(tasksStatsData);
          setRecentTasks(recentTasksData);
        }

        if (isEmployee) {
          try {
            const personalStats = await statisticsService.getPersonalStatistics();
            setPersonalTasksStats(personalStats.data);
          } catch (error) {
            console.warn('Ошибка загрузки личной статистики:', error);
          }
        }

        if (isHrOrManager || isAdmin) {
          try {
            const departmentsData = await departmentsAPI.getAll();
            if (departmentsData.data && Array.isArray(departmentsData.data)) {
              const statsData = departmentsData.data.map((dept: any) => ({
                id: dept.id,
                name: dept.name,
                employeeCount: dept.employees?.length || 0
              }));
              setDepartmentsStats(statsData);
            }
          } catch (error) {
            console.warn('Ошибка загрузки отделов:', error);
          }
        }

        if (user && user.employeeId) {
          try {
            let requestsData;
            if (user.role === 'employee') {
              requestsData = await requestsAPI.getByEmployee(user.employeeId);
            } else {
              requestsData = await requestsAPI.getAll({ limit: 5 });
            }
            setRecentRequests(requestsData.data || []);
          } catch (error) {
            console.warn('Ошибка загрузки заявок:', error);
          }
        }

        if (user && user.employeeId && !isAdmin) {
          try {
            const userTasksData = await tasksAPI.getByAssignee(user.employeeId);
            setUserTasks(userTasksData.data || []);
          } catch (error) {
            console.warn('Ошибка загрузки задач пользователя:', error);
          }
        }

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Ошибка загрузки данных. Попробуйте обновить страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);


  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Ошибка загрузки"
            description={error}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Добро пожаловать, {user?.firstName || 'Пользователь'}!</Title>
            <Text type="secondary">Обзор системы управления персоналом</Text>
          </div>

          {/* Статистика */}
          <Row gutter={[16, 16]}>
            {user?.role === 'employee' && personalTasksStats && (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Мои активные задачи"
                      value={personalTasksStats.inProgressCount + personalTasksStats.todoCount || 0}
                      prefix={<ProjectOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Мои выполненные задачи"
                      value={personalTasksStats.doneCount || 0}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Просроченные задачи"
                      value={personalTasksStats.overdueTasks || 0}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Процент выполнения"
                      value={personalTasksStats.completionRate || 0}
                      suffix="%"
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: personalTasksStats.completionRate >= 80 ? '#52c41a' : personalTasksStats.completionRate >= 50 ? '#faad14' : '#f5222d' }}
                    />
                  </Card>
                </Col>
              </>
            )}

            {/* Для HR, менеджеров и админов показываем общую статистику */}
            {(user?.role === 'hr' || user?.role === 'manager') && (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Общее количество сотрудников"
                      value={employeesStats?.total || 0}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Активные задачи"
                      value={userTasks.filter(task => task.status === 'in_progress' || task.status === 'todo').length || 0}
                      prefix={<ProjectOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Выполненные задачи"
                      value={userTasks.filter(task => task.status === 'done').length || 0}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Количество отделов"
                      value={departmentsStats.length}
                      prefix={<ApartmentOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Общее количество сотрудников"
                      value={employeesStats?.total || 0}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Активные задачи"
                      value={tasksStats?.inProgress || 0}
                      prefix={<ProjectOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Выполненные задачи"
                      value={tasksStats?.done || 0}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Количество отделов"
                      value={departmentsStats.length}
                      prefix={<ApartmentOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {/* Детальная статистика */}
          <Row gutter={[16, 16]}>
            {user?.role === 'employee' && personalTasksStats && (
              <>
                <Col xs={24} lg={12}>
                  <Card title="Статистика по задачам" size="small">
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Statistic
                          title="К выполнению"
                          value={personalTasksStats.todoCount || 0}
                          valueStyle={{ color: '#faad14' }}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="В работе"
                          value={personalTasksStats.inProgressCount || 0}
                          valueStyle={{ color: '#1890ff' }}
                          prefix={<ProjectOutlined />}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Выполнено"
                          value={personalTasksStats.doneCount || 0}
                          valueStyle={{ color: '#52c41a' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card
                    title="Моя статистика"
                    size="small"
                    extra={
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate('/tasks?myTasks=true')}
                      >
                        Мои задачи
                      </Button>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Всего задач"
                          value={personalTasksStats.totalTasks || 0}
                          valueStyle={{ color: '#1890ff' }}
                          prefix={<ProjectOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Процент выполнения"
                          value={personalTasksStats.completionRate || 0}
                          suffix="%"
                          valueStyle={{ color: personalTasksStats.completionRate >= 80 ? '#52c41a' : personalTasksStats.completionRate >= 50 ? '#faad14' : '#f5222d' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </>
            )}

            {/* Для HR, менеджеров и админов показываем общую статистику */}
            {(user?.role === 'hr' || user?.role === 'manager' || user?.role === 'admin') && (
              <>
                <Col xs={24} lg={12}>
                  <Card title="Статистика по задачам" size="small">
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Statistic
                          title="К выполнению"
                          value={tasksStats?.todo || 0}
                          valueStyle={{ color: '#faad14' }}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="В работе"
                          value={tasksStats?.inProgress || 0}
                          valueStyle={{ color: '#1890ff' }}
                          prefix={<ProjectOutlined />}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Выполнено"
                          value={tasksStats?.done || 0}
                          valueStyle={{ color: '#52c41a' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    title="Статистика по сотрудникам"
                    size="small"
                    extra={
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate('/employees')}
                      >
                        Все сотрудники
                      </Button>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Активные"
                          value={employeesStats?.active || 0}
                          valueStyle={{ color: '#52c41a' }}
                          prefix={<TeamOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Неактивные"
                          value={employeesStats?.inactive || 0}
                          valueStyle={{ color: '#f5222d' }}
                          prefix={<TeamOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {/* Списки данных */}
          <Row gutter={[16, 16]}>
            {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager') && (
              <Col xs={24} lg={user && user.role !== 'admin' ? 8 : 12}>
                <Card
                  title="Последние задачи"
                  size="small"
                  extra={
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => navigate('/tasks')}
                    >
                      Все задачи
                    </Button>
                  }
                >
                  <List
                    dataSource={recentTasks}
                    locale={{ emptyText: 'Нет задач' }}
                    renderItem={(task) => (
                      <List.Item>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{task.title}</Text>
                            <Tag color={getTaskStatusColor(task.status)}>
                              {getTaskStatusText(task.status)}
                            </Tag>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <Tag color={getPriorityColor(task.priority)}>
                              {getPriorityText(task.priority)}
                            </Tag>
                            {task.assignees && task.assignees.length > 0 && (
                              <Text type="secondary" style={{ marginLeft: '8px' }}>
                                Исполнители: {task.assignees.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                              </Text>
                            )}
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            )}

            {/* Мои задачи - для всех кроме админов */}
            {user && user.role !== 'admin' && (
              <Col xs={24} lg={user.role === 'employee' ? 12 : 8}>
                <Card
                  title="Мои задачи"
                  size="small"
                  extra={
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => navigate('/tasks?myTasks=true')}
                    >
                      Все мои задачи
                    </Button>
                  }
                >
                  <List
                    dataSource={userTasks}
                    locale={{ emptyText: 'У вас нет задач' }}
                    renderItem={(task) => (
                      <List.Item>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{task.title}</Text>
                            <Tag color={getTaskStatusColor(task.status)}>
                              {getTaskStatusText(task.status)}
                            </Tag>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <Tag color={getPriorityColor(task.priority)}>
                              {getPriorityText(task.priority)}
                            </Tag>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            )}

            {/* Заявки */}
            <Col xs={24} lg={user && user.role !== 'admin' ? (user.role === 'employee' ? 12 : 8) : 12}>
              <Card
                title={user?.role === 'employee' ? 'Мои заявки' : 'Последние заявки'}
                size="small"
                extra={
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate('/requests')}
                  >
                    {user?.role === 'employee' ? 'Все мои заявки' : 'Все заявки'}
                  </Button>
                }
              >
                <List
                  dataSource={recentRequests}
                  locale={{ emptyText: 'Нет заявок' }}
                  renderItem={(request) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{request.title}</Text>
                          <Tag color={getRequestStatusColor(request.status)}>
                            {getRequestStatusText(request.status)}
                          </Tag>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary">
                            {request.creator ? `${request.creator.firstName} ${request.creator.lastName}` : 'Неизвестный сотрудник'}
                          </Text>
                          {request.assignee && (
                            <Text type="secondary" style={{ marginLeft: '8px' }}>
                              • Назначен: {request.assignee.firstName} {request.assignee.lastName}
                            </Text>
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </Content>
    </Layout>
  );
}

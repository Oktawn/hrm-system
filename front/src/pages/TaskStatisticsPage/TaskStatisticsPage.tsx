import { useEffect, useState } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Table, 
  Space, 
  Button, 
  DatePicker, 
  Row, 
  Col, 
  Statistic,
  message,
  Spin
} from 'antd';
import { 
  DownloadOutlined, 
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../stores/auth.store';
import { statisticsService } from '../../services/statistics.service';
import type { TaskStatistics, TaskStatisticsFilter } from '../../types/statistics.types';

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

export function TaskStatisticsPage() {
  const { user } = useAuthStore();
  const [statistics, setStatistics] = useState<TaskStatistics[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<TaskStatisticsFilter>({});

  const hasAccess = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager';

  const fetchStatistics = async () => {
    if (!hasAccess) return;

    try {
      setLoading(true);
      const response = await statisticsService.getStatistics(filter);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      const blob = await statisticsService.exportToExcel(filter);
      statisticsService.downloadExcel(blob);
      message.success('Файл успешно загружен');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Ошибка при экспорте в Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilter(prev => ({
        ...prev,
        dateFrom: dates[0].format('YYYY-MM-DD'),
        dateTo: dates[1].format('YYYY-MM-DD')
      }));
    } else {
      setFilter(prev => {
        const { dateFrom, dateTo, ...rest } = prev;
        return rest;
      });
    }
  };

  const resetFilters = () => {
    setFilter({});
  };

  useEffect(() => {
    fetchStatistics();
  }, [filter, hasAccess]);

  const totalStats = statistics.reduce((acc, stat) => ({
    totalEmployees: acc.totalEmployees + 1,
    totalTasks: acc.totalTasks + stat.totalTasks,
    totalCompleted: acc.totalCompleted + stat.doneCount,
    totalOverdue: acc.totalOverdue + stat.overdueTasks,
  }), {
    totalEmployees: 0,
    totalTasks: 0,
    totalCompleted: 0,
    totalOverdue: 0,
  });

  const overallCompletionRate = totalStats.totalTasks > 0 
    ? Math.round((totalStats.totalCompleted / totalStats.totalTasks) * 100) 
    : 0;

  const columns: ColumnsType<TaskStatistics> = [
    {
      title: 'ФИО сотрудника',
      dataIndex: 'employeeName',
      key: 'employeeName',
      fixed: 'left',
      width: 200,
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Отдел',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (value) => value || 'Не указан',
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      render: (value) => value || 'Не указана',
    },
    {
      title: 'К выполнению',
      dataIndex: 'todoCount',
      key: 'todoCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.todoCount - b.todoCount,
    },
    {
      title: 'В процессе',
      dataIndex: 'inProgressCount',
      key: 'inProgressCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.inProgressCount - b.inProgressCount,
    },
    {
      title: 'На проверке',
      dataIndex: 'reviewCount',
      key: 'reviewCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.reviewCount - b.reviewCount,
    },
    {
      title: 'Выполнено',
      dataIndex: 'doneCount',
      key: 'doneCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.doneCount - b.doneCount,
      render: (value) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{value}</span>
    },
    {
      title: 'Отменено',
      dataIndex: 'cancelledCount',
      key: 'cancelledCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.cancelledCount - b.cancelledCount,
    },
    {
      title: 'Всего задач',
      dataIndex: 'totalTasks',
      key: 'totalTasks',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.totalTasks - b.totalTasks,
      render: (value) => <strong>{value}</strong>
    },
    {
      title: 'Просрочено',
      dataIndex: 'overdueTasks',
      key: 'overdueTasks',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.overdueTasks - b.overdueTasks,
      render: (value) => value > 0 ? <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{value}</span> : value
    },
    {
      title: 'Выполнение (%)',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 130,
      align: 'center',
      sorter: (a, b) => a.completionRate - b.completionRate,
      render: (value) => {
        let color = '#52c41a'; // зеленый
        if (value < 50) color = '#ff4d4f'; // красный
        else if (value < 80) color = '#faad14'; // желтый
        
        return <strong style={{ color }}>{value}%</strong>;
      }
    },
  ];

  if (!hasAccess) {
    return (
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Title level={3}>Доступ запрещен</Title>
              <p>У вас нет прав для просмотра статистики задач.</p>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <BarChartOutlined /> Статистика задач по сотрудникам
          </Title>
          
          {/* Общая статистика */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Всего сотрудников" 
                  value={totalStats.totalEmployees} 
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Всего задач" 
                  value={totalStats.totalTasks}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Выполнено задач" 
                  value={totalStats.totalCompleted}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Общий % выполнения" 
                  value={overallCompletionRate}
                  suffix="%"
                  valueStyle={{ color: overallCompletionRate >= 80 ? '#52c41a' : overallCompletionRate >= 50 ? '#faad14' : '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Фильтры */}
          <Card title="Фильтры" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <RangePicker
                  placeholder={['Дата от', 'Дата до']}
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                  value={filter.dateFrom && filter.dateTo ? [dayjs(filter.dateFrom), dayjs(filter.dateTo)] : null}
                />
              </Col>
              <Col span={8}>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={resetFilters}
                  >
                    Сбросить фильтры
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={handleExportToExcel}
                    loading={exporting}
                  >
                    Экспорт в Excel
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Таблица статистики */}
          <Card title="Детальная статистика">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={statistics}
                rowKey="employeeId"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} из ${total} сотрудников`,
                }}
                scroll={{ x: 1400 }}
                size="small"
              />
            </Spin>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

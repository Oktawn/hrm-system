import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import requestsAPI, { type Request, type RequestFilter } from '../../services/requests.service';
import RequestDetail from '../../components/RequestDetail/RequestDetail';
import CreateRequestModal from '../../components/CreateRequestModal/CreateRequestModal';
import { 
  getRequestStatusColor, 
  getRequestStatusText, 
  getPriorityColor, 
  getPriorityText, 
  getRequestTypeText 
} from '../../utils/status.utils';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function RequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<RequestFilter>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [createRequestModalVisible, setCreateRequestModalVisible] = useState(false);

  // Получаем ID заявки из URL
  const selectedRequestId = searchParams.get('request');
  const requestDetailVisible = Boolean(selectedRequestId);

  // Определяем, показывать ли только мои заявки
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let response;
      
      if (isEmployee) {
        // Для обычных сотрудников показываем только их заявки
        if (!user.employeeId) {
          console.error('EmployeeId отсутствует для сотрудника');
          return;
        }
        response = await requestsAPI.getByEmployee(user.employeeId);
      } else {
        // Для руководителей показываем все заявки
        response = await requestsAPI.getAll(filter);
      }
      
      setRequests(response.data);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter, user]);

  const handleRequestClick = (requestId: number) => {
    setSearchParams({ request: requestId.toString() });
  };

  const closeRequestDetail = () => {
    setSearchParams({});
  };

  const handleRequestUpdate = () => {
    fetchRequests(); // Обновляем список заявок после изменения
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
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type: string) => getRequestTypeText(type),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
    },
    ...(isManager ? [{
      title: 'Автор',
      dataIndex: 'creator',
      key: 'creator',
      width: '15%',
      render: (creator: any) => creator ? `${creator.firstName} ${creator.lastName}` : '—',
    }] : []),
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => (
        <Tag color={getRequestStatusColor(status)}>
          {getRequestStatusText(status)}
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
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '8%',
      render: (_: any, record: Request) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleRequestClick(record.id)}
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
              {isEmployee ? 'Мои заявки' : 'Заявки'}
            </Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateRequestModalVisible(true)}
            >
              Создать заявку
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
              placeholder="Тип заявки"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilter({ ...filter, type: value })}
            >
              <Option value="document">Документ</Option>
              <Option value="certificate">Справка</Option>
              <Option value="leave_vacation">Отпуск</Option>
              <Option value="leave_sick">Больничный</Option>
              <Option value="leave_personal">Личный отпуск</Option>
            </Select>
            <Select
              placeholder="Статус"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
            >
              <Option value="pending">На рассмотрении</Option>
              <Option value="approved">Одобрено</Option>
              <Option value="rejected">Отклонено</Option>
              <Option value="completed">Выполнено</Option>
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
            dataSource={requests}
            loading={loading}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRequestClick(record.id),
              style: { cursor: 'pointer' }
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total} заявок`,
            }}
          />
        </Card>

        <RequestDetail
          requestId={selectedRequestId ? parseInt(selectedRequestId, 10) : null}
          visible={requestDetailVisible}
          onClose={closeRequestDetail}
          onRequestUpdate={handleRequestUpdate}
        />

        <CreateRequestModal
          visible={createRequestModalVisible}
          onClose={() => setCreateRequestModalVisible(false)}
          onRequestCreated={() => {
            setCreateRequestModalVisible(false);
            fetchRequests();
          }}
        />
      </Content>
    </Layout>
  );
}

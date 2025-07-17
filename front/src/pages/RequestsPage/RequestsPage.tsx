import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Typography, Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { useAuthStore } from '../../stores/auth.store';
import requestsAPI from '../../services/requests.service';
import employeesAPI from '../../services/employees.service';
import type { Request, RequestFilter } from '../../types/request.types';
import RequestDetail from '../../components/RequestDetail/RequestDetail';
import CreateRequestModal from '../../components/CreateRequestModal/CreateRequestModal';
import {
  getRequestStatusColor,
  getRequestStatusText,
  getPriorityColor,
  getPriorityText,
  getRequestTypeText,
  RequestTypeEnum,
  RequestStatusEnum,
  TaskPriorityEnum
} from '../../utils/status.utils';
import type { Employee } from '../../types/employee.types';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function RequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<RequestFilter>({});
  const [searchText, setSearchText] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [createRequestModalVisible, setCreateRequestModalVisible] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const selectedRequestId = searchParams.get('request');
  const requestDetailVisible = Boolean(selectedRequestId);

  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const fetchRequests = useCallback(async (page = 1, pageSize = 10, currentFilter = filter) => {
    if (!user) return;

    try {
      setLoading(true);
      let response;

      if (isEmployee) {
        if (!user.employeeId) {
          console.error('EmployeeId отсутствует для сотрудника');
          return;
        }
        response = await requestsAPI.getByEmployee(user.employeeId);

        let filteredRequests = [...(response.data || [])];

        if (currentFilter.title) {
          filteredRequests = filteredRequests.filter(req =>
            req.title.toLowerCase().includes(currentFilter.title!.toLowerCase())
          );
        }
        if (currentFilter.status) {
          filteredRequests = filteredRequests.filter(req => req.status === currentFilter.status);
        }
        if (currentFilter.type) {
          filteredRequests = filteredRequests.filter(req => req.type === currentFilter.type);
        }
        if (currentFilter.priority) {
          filteredRequests = filteredRequests.filter(req => req.priority === currentFilter.priority);
        }

        const sortedRequests = [...filteredRequests];
        if (currentFilter.sortBy && currentFilter.sortOrder) {
          const allowedSortFields = ['id', 'title', 'createdAt'];
          if (allowedSortFields.includes(currentFilter.sortBy)) {
            sortedRequests.sort((a, b) => {
              const field = currentFilter.sortBy!;
              let aValue: any = a[field as keyof Request];
              let bValue: any = b[field as keyof Request];

              if (field === 'createdAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
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

        setRequests(sortedRequests);
        setPagination(prev => ({
          ...prev,
          total: sortedRequests.length,
          current: 1,
          pageSize: sortedRequests.length || 10,
        }));
      } else {
        const filterWithPagination = {
          ...currentFilter,
          page,
          limit: pageSize,
        };
        response = await requestsAPI.getAll(filterWithPagination);
        setRequests(response.data || []);
        setPagination({
          current: response.meta?.page || 1,
          pageSize: response.meta?.limit || 10,
          total: response.meta?.total || 0,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, isEmployee, user]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeesAPI.getAll({ limit: 1000 });
      setEmployees(response.data?.data || []);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setFilter(prev => ({
        ...prev,
        title: searchValue.trim() || undefined
      }));
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  useEffect(() => {
    fetchRequests(pagination.current, pagination.pageSize, filter);
    if (isManager) {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filter, user, fetchRequests, fetchEmployees, isManager]);

  const handleRequestClick = (requestId: number) => {
    setSearchParams({ request: requestId.toString() });
  };

  const closeRequestDetail = () => {
    setSearchParams({});
  };

  const handleRequestUpdate = () => {
    fetchRequests(pagination.current, pagination.pageSize, filter);
  };

  const handleTableChange = (paginationInfo: any, _filters: any, sorter: any) => {
    let newSortField = '';
    let newSortOrder: 'ascend' | 'descend' | null = null;

    if (sorter && sorter.field && sorter.order) {
      newSortField = sorter.field;
      newSortOrder = sorter.order;
    }

    const newPagination = {
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: paginationInfo.total,
    };
    setPagination(newPagination);

    const updatedFilter: RequestFilter = {
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
      render: (creator: Employee) => creator ? `${creator.firstName} ${creator.lastName}` : '—',
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
      sorter: true,
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

          <Space style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
            <Input
              placeholder="Поиск по названию"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {isManager && (
              <Select
                placeholder="Сотрудник"
                style={{ width: 200 }}
                allowClear
                showSearch
                optionFilterProp="children"
                value={filter.creatorId}
                onChange={(value) => setFilter({ ...filter, creatorId: value })}
              >
                {employees.map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </Option>
                ))}
              </Select>
            )}
            <Select
              placeholder="Тип заявки"
              style={{ width: 180 }}
              allowClear
              value={filter.type}
              onChange={(value) => setFilter({ ...filter, type: value })}
            >
              {Object.values(RequestTypeEnum).map(type => (
                <Option key={type} value={type}>
                  {getRequestTypeText(type)}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Статус"
              style={{ width: 150 }}
              allowClear
              value={filter.status}
              onChange={(value) => setFilter({ ...filter, status: value })}
            >
              {Object.values(RequestStatusEnum).map(status => (
                <Option key={status} value={status}>
                  {getRequestStatusText(status)}
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
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={requests}
            loading={loading}
            rowKey="id"
            onChange={handleTableChange}
            onRow={(record) => ({
              onClick: () => handleRequestClick(record.id),
              style: { cursor: 'pointer' }
            })}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Всего: ${total} заявок`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
              onShowSizeChange: (_, size) => {
                setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
              },
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
            fetchRequests(pagination.current, pagination.pageSize, filter);
          }}
        />
      </Content>
    </Layout>
  );
}

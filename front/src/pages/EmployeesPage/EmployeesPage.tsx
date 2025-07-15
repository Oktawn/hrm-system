/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Input, Select, Tag, Avatar, Space, Modal, Descriptions, Spin, message, Pagination } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import employeesAPI from '../../services/employees.service';
import { CreateEmployeeModal } from '../../components/CreateEmployeeModal/CreateEmployeeModal';
import { debounce } from 'lodash';
import { getRoleColor, getRoleText } from '../../utils/status.utils';
import type { Employee } from '../../types/employee.types';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export function EmployeesPage() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  const [positionFilter, setPositionFilter] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const fetchEmployees = useCallback(async (filters?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    departmentId?: string;
    positionId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll({
        page: currentPage,
        limit: pageSize,
        ...filters
      });
      const employeesData = response.data.data || [];
      setEmployees(employeesData);
      setTotal(response.data.total || 0);

      if (!filters || Object.keys(filters).length === 0) {
        const allResponse = await employeesAPI.getAll({ limit: 1000 });
        setAllEmployees(allResponse.data.data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      message.error('Ошибка загрузки сотрудников');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchValue: string, deptId?: string, posId?: string, isActive?: boolean) => {
      const filters: any = {};

      if (searchValue.trim()) {
        if (searchValue.includes('@')) {
          filters.email = searchValue.trim();
        } else {
          const searchTerms = searchValue.trim().split(' ');
          if (searchTerms.length === 1) {
            filters.firstName = searchTerms[0];
          } else if (searchTerms.length >= 2) {
            filters.firstName = searchTerms[0];
            filters.lastName = searchTerms[1];
          }
        }
      }

      if (deptId) filters.departmentId = deptId;
      if (posId) filters.positionId = posId;
      if (isActive !== undefined) filters.isActive = isActive;

      setCurrentPage(1); 
      fetchEmployees(Object.keys(filters).length > 0 ? filters : undefined);
    }, 500),
    [fetchEmployees]
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (currentPage > 1 || pageSize !== 25) {
      debouncedSearch(searchText, departmentFilter, positionFilter, activeFilter);
    }
  }, [activeFilter, currentPage, debouncedSearch, departmentFilter, pageSize, positionFilter, searchText]);

  useEffect(() => {
    debouncedSearch(searchText, departmentFilter, positionFilter, activeFilter);
  }, [searchText, departmentFilter, positionFilter, activeFilter, debouncedSearch]);

  const filteredEmployees = employees;

  const showEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailModalVisible(true);
  };

  const uniqueDepartments = Array.from(
    new Set(allEmployees.filter(e => e.department).map(e => e.department!.id))
  ).map(id => allEmployees.find(e => e.department?.id === id)?.department).filter(Boolean);

  const uniquePositions = Array.from(
    new Set(allEmployees.filter(e => e.position).map(e => e.position!.id))
  ).map(id => allEmployees.find(e => e.position?.id === id)?.position).filter(Boolean);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={2}>Сотрудники</Title>
            {(user?.role === 'admin' || user?.role === 'hr') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Добавить сотрудника
              </Button>
            )}
          </div>

          <Space style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
            <Input
              placeholder="Поиск по имени или email"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Отдел"
              style={{ width: 200 }}
              allowClear
              value={departmentFilter}
              onChange={setDepartmentFilter}
            >
              {uniqueDepartments.map(dept => (
                <Option key={dept!.id} value={dept!.id}>
                  {dept!.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Должность"
              style={{ width: 200 }}
              allowClear
              value={positionFilter}
              onChange={setPositionFilter}
            >
              {uniquePositions.map(pos => (
                <Option key={pos!.id} value={pos!.id}>
                  {pos!.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Статус"
              style={{ width: 150 }}
              allowClear
              value={activeFilter}
              onChange={setActiveFilter}
            >
              <Option value={true}>Активные</Option>
              <Option value={false}>Неактивные</Option>
            </Select>
          </Space>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text>Показать по:</Text>
              <Select
                value={pageSize}
                onChange={(value) => {
                  setPageSize(value);
                  setCurrentPage(1);
                }}
                style={{ width: 80 }}
              >
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredEmployees.map((employee) => (
              <Col xs={24} sm={12} md={8} lg={6} key={employee.id}>
                <Card
                  hoverable
                  actions={[
                    <EyeOutlined
                      key="view"
                      onClick={() => showEmployeeDetails(employee)}
                      title="Подробности"
                    />,
                    ...(user?.role === 'admin' || user?.role === 'hr' ? [
                      <EditOutlined key="edit" title="Редактировать" />
                    ] : [])
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      >
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </Avatar>
                    }
                    title={
                      <div>
                        <Text strong>{employee.firstName} {employee.lastName}</Text>
                        {employee.user && (
                          <div style={{ marginTop: '4px' }}>
                            <Tag
                              color={getRoleColor(employee.user.role)}
                            >
                              {getRoleText(employee.user.role)}
                            </Tag>
                            <Tag
                              color={employee.user.isActive ? 'green' : 'red'}
                            >
                              {employee.user.isActive ? 'Активен' : 'Неактивен'}
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary">{employee.user?.email || 'Нет email'}</Text>
                        </div>
                        {employee.position && (
                          <div style={{ marginBottom: '4px' }}>
                            <Text strong>Должность: </Text>
                            <Text>{employee.position.name}</Text>
                          </div>
                        )}
                        {employee.department && (
                          <div style={{ marginBottom: '4px' }}>
                            <Text strong>Отдел: </Text>
                            <Text>{employee.department.name}</Text>
                          </div>
                        )}
                        {employee.assignedManager && (
                          <div>
                            <Text strong>Менеджер: </Text>
                            <Text>{employee.assignedManager.lastName} {employee.assignedManager.firstName}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {filteredEmployees.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text type="secondary">Сотрудники не найдены</Text>
          </div>
        )}

        {/* Пагинация */}
        {total > pageSize && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} из ${total} сотрудников`
              }
              onChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </div>
        )}

        {/* Модальное окно с подробной информацией */}
        <Modal
          title={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Информация о сотруднике'}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Закрыть
            </Button>,
            ...(user?.role === 'admin' || user?.role === 'hr' ? [
              <Button key="edit" type="primary" icon={<EditOutlined />}>
                Редактировать
              </Button>
            ] : [])
          ]}
          width={600}
        >
          {selectedEmployee && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                </Avatar>
                <div style={{ marginTop: '8px' }}>
                  {selectedEmployee.user && (
                    <Space>
                      <Tag color={getRoleColor(selectedEmployee.user.role)}>
                        {getRoleText(selectedEmployee.user.role)}
                      </Tag>
                      <Tag color={selectedEmployee.user.isActive ? 'green' : 'red'}>
                        {selectedEmployee.user.isActive ? 'Активен' : 'Неактивен'}
                      </Tag>
                    </Space>
                  )}
                </div>
              </div>

              <Descriptions column={1} bordered>
                <Descriptions.Item label="Имя">
                  {selectedEmployee.firstName}
                </Descriptions.Item>
                <Descriptions.Item label="Фамилия">
                  {selectedEmployee.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedEmployee.user?.email}
                </Descriptions.Item>
                {selectedEmployee.phone && (
                  <Descriptions.Item label="Телефон">
                    {selectedEmployee.phone}
                  </Descriptions.Item>
                )}
                {selectedEmployee.position && (
                  <Descriptions.Item label="Должность">
                    {selectedEmployee.position.name}
                  </Descriptions.Item>
                )}
                {selectedEmployee.department && (
                  <Descriptions.Item label="Отдел">
                    {selectedEmployee.department.name}
                  </Descriptions.Item>
                )}
                {selectedEmployee.hireDate && (
                  <Descriptions.Item label="Дата найма">
                    {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                  </Descriptions.Item>
                )}
                {selectedEmployee.assignedManager && (
                  <Descriptions.Item label="Ответственный менеджер">
                    {selectedEmployee.assignedManager.lastName} {selectedEmployee.assignedManager.firstName}
                    {selectedEmployee.assignedManager.role && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {getRoleText(selectedEmployee.assignedManager.role)}
                      </Tag>
                    )}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Дата создания">
                  {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Последнее обновление">
                  {new Date(selectedEmployee.updatedAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>

        <CreateEmployeeModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onEmployeeCreated={() => {
            fetchEmployees();
            setCreateModalVisible(false);
          }}
        />
      </Content>
    </Layout>
  );
}

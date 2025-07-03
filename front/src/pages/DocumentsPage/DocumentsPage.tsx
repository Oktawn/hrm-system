import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Input,
  Select,
  message,
  Modal,
  Typography,
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import documentsAPI from '../../services/documents.service';
import { useAuthStore } from '../../stores/auth.store';
import { getDocumentStatusColor, getDocumentStatusText, getDocumentTypeText, getDocumentTypeColor } from '../../utils/status.utils';
import './DocumentsPage.css';
import type { DocumentFilter, Document } from '../../types/document.types';

const { Title } = Typography;
const { Option } = Select;

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<DocumentFilter>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { user } = useAuthStore();
  const isManager = user?.role && ['admin', 'hr', 'manager'].includes(user.role);
  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    fetchDocuments(pagination.current, pagination.pageSize, filter);
  }, [filter]);

  const fetchDocuments = async (page: number = 1, pageSize: number = 10, currentFilter: DocumentFilter = {}) => {
    try {
      setLoading(true);
      let response;

      if (isEmployee && user?.employeeId) {
        response = await documentsAPI.getByEmployee(user.employeeId);

        let filteredDocuments = [...(response.data || [])];

        if (currentFilter.status) {
          filteredDocuments = filteredDocuments.filter(doc => doc.status === currentFilter.status);
        }
        if (currentFilter.type) {
          filteredDocuments = filteredDocuments.filter(doc => doc.type === currentFilter.type);
        }
        if (currentFilter.title) {
          filteredDocuments = filteredDocuments.filter(doc =>
            doc.title.toLowerCase().includes(currentFilter.title!.toLowerCase())
          );
        }

        if (currentFilter.sortBy && currentFilter.sortOrder) {
          filteredDocuments.sort((a, b) => {
            const field = currentFilter.sortBy!;
            let aValue: any = a[field as keyof Document];
            let bValue: any = b[field as keyof Document];

            if (field === 'createdAt') {
              aValue = new Date(aValue).getTime();
              bValue = new Date(bValue).getTime();
            }

            if (aValue < bValue) return currentFilter.sortOrder === 'ASC' ? -1 : 1;
            if (aValue > bValue) return currentFilter.sortOrder === 'ASC' ? 1 : -1;
            return 0;
          });
        }

        setDocuments(filteredDocuments);
        setPagination(prev => ({
          ...prev,
          total: filteredDocuments.length,
          current: 1,
          pageSize: filteredDocuments.length || 10,
        }));
      } else {
        const filterWithPagination = {
          ...currentFilter,
          page,
          limit: pageSize,
        };
        response = await documentsAPI.getAll(filterWithPagination);
        setDocuments(response.data || []);
        setPagination({
          current: response.meta?.page || 1,
          pageSize: response.meta?.limit || 10,
          total: response.meta?.total || 0,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
      message.error('Не удалось загрузить документы');
    } finally {
      setLoading(false);
    }
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

    const updatedFilter: DocumentFilter = {
      ...filter,
      sortBy: newSortField || undefined,
      sortOrder: newSortOrder === 'ascend' ? 'ASC' : newSortOrder === 'descend' ? 'DESC' : undefined,
    };

    setFilter(updatedFilter);
  };

  const handleStatusChange = async (documentId: number, newStatus: string) => {
    try {
      if (newStatus === 'signed') {
        await documentsAPI.sign(documentId);
        message.success('Документ подписан');
      } else if (newStatus === 'rejected') {
        const reason = await new Promise<string>((resolve) => {
          Modal.confirm({
            title: 'Отклонение документа',
            content: (
              <Input.TextArea
                placeholder="Укажите причину отклонения..."
                onChange={(e) => resolve(e.target.value)}
              />
            ),
            onOk: () => resolve('Документ отклонен'),
            onCancel: () => resolve(''),
          });
        });

        if (reason) {
          await documentsAPI.reject(documentId, reason);
          message.success('Документ отклонен');
        }
        return;
      } else {
        await documentsAPI.updateStatus(documentId, newStatus);
        message.success('Статус документа изменен');
      }

      fetchDocuments(pagination.current, pagination.pageSize, filter);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      message.error('Не удалось изменить статус');
    }
  };

  const handleDownload = async (document: Document) => {
    if (document.fileUrl) {
      try {
        await documentsAPI.downloadDocument(document.fileUrl);
        message.success('Файл успешно скачан');
      } catch (error) {
        console.error('Ошибка скачивания файла:', error);
        message.error('Не удалось скачать файл');
      }
    } else {
      message.info('Файл документа недоступен');
    }
  };

  const handleViewDocument = (document: Document) => {
    Modal.info({
      title: document.title,
      content: (
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <p><strong>Тип:</strong> {getDocumentTypeText(document.type)}</p>
          <p><strong>Статус:</strong> {getDocumentStatusText(document.status)}</p>
          <p><strong>Описание:</strong> {document.description}</p>
          {document.content && (
            <div>
              <strong>Содержимое:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>
                {document.content}
              </pre>
            </div>
          )}
        </div>
      ),
      width: 800,
      okText: 'Закрыть',
    });
  };

  const canChangeStatus = (document: Document) => {
    if (!user) return false;

    const isCreator = document.createdBy?.id === user.employeeId;
    const isDocumentManager = ['admin', 'hr', 'manager'].includes(user.role);

    return isCreator || isDocumentManager;
  };

  const getStatusActions = (document: Document) => {
    if (!canChangeStatus(document)) return null;

    const actions = [];

    if (document.status === 'under_review') {
      if (['admin', 'hr', 'manager'].includes(user?.role || '')) {
        actions.push(
          <Tooltip title="Подписать документ" key="sign">
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={() => handleStatusChange(document.id, 'signed')}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        );
        actions.push(
          <Tooltip title="Отклонить документ" key="reject">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => handleStatusChange(document.id, 'rejected')}
              style={{ color: '#ff4d4f' }}
            />
          </Tooltip>
        );
      }
    }

    return actions.length > 0 ? <Space>{actions}</Space> : null;
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
      width: '25%',
      sorter: true,
      render: (title: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>{title}</span>
        </Space>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type: string) => (
        <Tag color={getDocumentTypeColor(type)}>
          {getDocumentTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => (
        <Tag color={getDocumentStatusColor(status)}>
          {getDocumentStatusText(status)}
        </Tag>
      ),
    },
    ...(isManager ? [{
      title: 'Запросил',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      width: '15%',
      render: (requestedBy: any) => requestedBy ? `${requestedBy.firstName} ${requestedBy.lastName}` : '—',
    }] : []),
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '15%',
      render: (_: any, record: Document) => (
        <Space>
          <Tooltip title="Скачать документ">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              disabled={!record.fileUrl}
            />
          </Tooltip>
          <Tooltip title="Просмотреть документ">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDocument(record)}
            />
          </Tooltip>
          {getStatusActions(record)}
        </Space>
      ),
    },
  ];

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div className="header-title">
          <Title level={2}>
            {isEmployee ? 'Мои документы' : 'Документы'}
          </Title>
        </div>

        <div className="header-filters">
          <Space wrap>
            {!isEmployee && (
              <Input
                placeholder="Поиск по названию"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                onChange={(e) => setFilter({ ...filter, title: e.target.value })}
              />
            )}
            <Select
              placeholder="Тип документа"
              style={{ width: 180 }}
              allowClear
              onChange={(value) => setFilter({ ...filter, type: value })}
            >
              <Option value="work_certificate">Справка с места работы</Option>
              <Option value="salary_certificate">Справка о доходах</Option>
              <Option value="employment_certificate">Справка о трудоустройстве</Option>
              <Option value="personal_data_extract">Выписка из личного дела</Option>
              <Option value="contract_copy">Копия трудового договора</Option>
              <Option value="other">Другое</Option>
            </Select>
            <Select
              placeholder="Статус"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
            >
              <Option value="under_review">На рассмотрении</Option>
              <Option value="signed">Подписан</Option>
              <Option value="rejected">Отказано</Option>
              <Option value="draft">Черновик</Option>
              <Option value="expired">Истёк срок</Option>
            </Select>
          </Space>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={documents}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Всего: ${total} документов`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
              fetchDocuments(page, pageSize, filter);
            },
            onShowSizeChange: (_, size) => {
              setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
              fetchDocuments(1, size, filter);
            },
          }}
        />
      </Card>
    </div>
  );
}

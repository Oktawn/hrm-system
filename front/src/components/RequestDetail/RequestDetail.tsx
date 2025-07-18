import { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Typography,
  Tag,
  Space,
  Button,
  Select,
  Card,
  Divider,
  Input,
  Form,
  message
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import requestsAPI from '../../services/requests.service';
import employeesAPI from '../../services/employees.service';
import { api } from '../../services/auth.service';
import StatusSelector from '../StatusSelector/StatusSelector';
import {
  getPriorityColor, getPriorityText,
  getRequestTypeText,
  getRequestStatusText, getRequestStatusColor
} from '../../utils/status.utils';
import './RequestDetail.css';
import type { Employee } from '../../types/employee.types';
import type { Request, RequestStatus } from '../../types/request.types';
import type { FileAttachment } from '../../types/document.types';
import Comments from '../Comments/Comments';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RequestDetailProps {
  requestId: number | null;
  visible: boolean;
  onClose: () => void;
  onRequestUpdate?: () => void;
}

export function RequestDetail({ requestId, visible, onClose, onRequestUpdate }: RequestDetailProps) {
  const { user } = useAuthStore();
  const [request, setRequest] = useState<Request | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();



  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;

    try {
      setLoading(true);
      const response = await requestsAPI.getById(requestId);
      setRequest(response.data);

      form.setFieldsValue({
        title: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        assigneeId: response.data.assignee?.id
      });
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error);
      message.error('Не удалось загрузить заявку');
    } finally {
      setLoading(false);
    }
  }, [requestId, form]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  }, []);



  useEffect(() => {
    if (visible && requestId) {
      fetchRequestDetails();
      fetchEmployees();
    }
  }, [visible, requestId, fetchRequestDetails, fetchEmployees]);

  const handleStatusChange = async (newStatus: string) => {
    if (!request) return;

    try {
      await requestsAPI.updateStatus(request.id, newStatus);
      setRequest({ ...request, status: newStatus as RequestStatus });
      onRequestUpdate?.();
      message.success('Статус заявки изменен');
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      message.error('Не удалось изменить статус');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await requestsAPI.update(request!.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        userId: request!.creator.id
      });

      await fetchRequestDetails();
      setEditing(false);
      onRequestUpdate?.();
      message.success('Заявка обновлена');
    } catch (error) {
      console.error('Ошибка обновления заявки:', error);
      message.error('Не удалось обновить заявку');
    }
  };

  const canEdit = () => {
    if (!user || !request) return false;
    const isCreator = request.creator.id === user.id.toString();
    const isAssignee = request.assignee?.id === user.id.toString();
    const isManager = ['admin', 'hr', 'manager'].includes(user.role);
    return isCreator || isAssignee || isManager;
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await api.get(`/uploads/download/${filename}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
      message.error('Не удалось скачать файл');
    }
  };

  const handleView = async (filename: string) => {
    try {
      const response = await api.get(`/uploads/view/${filename}`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Ошибка просмотра файла:', error);
      message.error('Не удалось открыть файл');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimetype?: string) => {
    return mimetype && mimetype.startsWith('image/');
  };

  if (!request) return null;

  return (
    <Drawer
      title={
        <Space>
          <span>Заявка #{request.id}</span>
          {canEdit() && (
            <Button
              type="text"
              icon={editing ? <CloseOutlined /> : <EditOutlined />}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Отмена' : 'Редактировать'}
            </Button>
          )}
        </Space>
      }
      placement="right"
      width={600}
      open={visible}
      onClose={onClose}
      loading={loading}
    >
      <div className="request-detail">
        {editing ? (
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="Название" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Описание">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item name="priority" label="Приоритет">
              <Select>
                <Option value="low">Низкий</Option>
                <Option value="medium">Средний</Option>
                <Option value="high">Высокий</Option>
                <Option value="critical">Критический</Option>
              </Select>
            </Form.Item>

            <Form.Item name="assigneeId" label="Ответственный">
              <Select placeholder="Выберите ответственного" allowClear>
                {employees.map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  Сохранить
                </Button>
                <Button onClick={() => setEditing(false)}>
                  Отмена
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <>
            <Card className="request-info">
              <Title level={4}>{request.title}</Title>

              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Статус: </Text>
                  {canEdit() ? (
                    <StatusSelector
                      currentStatus={request.status}
                      type="request"
                      onStatusChange={handleStatusChange}
                    />
                  ) : (
                    <Tag color={getRequestStatusColor(request.status)}>
                      {getRequestStatusText(request.status)}
                    </Tag>
                  )}
                </div>

                <div>
                  <Text strong>Тип: </Text>
                  <Tag color="purple">
                    {getRequestTypeText(request.type)}
                  </Tag>
                </div>

                <div>
                  <Text strong>Приоритет: </Text>
                  <Tag color={getPriorityColor(request.priority)}>
                    {getPriorityText(request.priority)}
                  </Tag>
                </div>

                <div>
                  <Text strong>Создатель: </Text>
                  <Text>{request.creator.firstName} {request.creator.lastName}</Text>
                </div>

                {request.assignee && (
                  <div>
                    <Text strong>Ответственный: </Text>
                    <Tag icon={<UserOutlined />}>
                      {request.assignee.firstName} {request.assignee.lastName}
                    </Tag>
                  </div>
                )}

                <div>
                  <Text strong>Создана: </Text>
                  <Tag icon={<ClockCircleOutlined />}>
                    {new Date(request.createdAt).toLocaleString()}
                  </Tag>
                </div>

                {request.description && (
                  <div>
                    <Text strong>Описание:</Text>
                    <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                      <Text>{request.description}</Text>
                    </div>
                  </div>
                )}

                {/* Отображение прикрепленных файлов заявки */}
                {request.attachments && request.attachments.length > 0 && (
                  <div>
                    <Text strong>Прикрепленные файлы:</Text>
                    <div style={{ marginTop: 8 }}>
                      {request.attachments.map((attachment: FileAttachment, index: number) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 4,
                          padding: '8px 12px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}>
                          <span style={{ flex: 1, marginRight: 8 }}>
                            📎 {attachment.originalName} ({formatFileSize(attachment.size)})
                          </span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {isImage(attachment.mimetype) && (
                              <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handleView(attachment.filename)}
                                title="Просмотр"
                              />
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(attachment.filename)}
                              title="Скачать"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Space>
            </Card>

            <Divider>Комментарии</Divider>

            <Comments
              type="request"
              itemId={request.id}
            />
          </>
        )}
      </div>
    </Drawer>
  );
};

export default RequestDetail;
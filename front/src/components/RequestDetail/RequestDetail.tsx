import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Select, 
  Card, 
  Divider, 
  List, 
  Avatar, 
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
import requestsAPI, { type Request } from '../../services/requests.service';
import employeesAPI, { type Employee } from '../../services/employees.service';
import { commentsService, type IComment, type ICreateComment } from '../../services/comments.service';
import StatusSelector from '../StatusSelector/StatusSelector';
import SimpleFileUpload from '../SimpleFileUpload/SimpleFileUpload';
import { getPriorityColor, getPriorityText, getRequestTypeText } from '../../utils/status.utils';
import './RequestDetail.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RequestDetailProps {
  requestId: number | null;
  visible: boolean;
  onClose: () => void;
  onRequestUpdate?: () => void;
}

export const RequestDetail: React.FC<RequestDetailProps> = ({ 
  requestId, 
  visible, 
  onClose, 
  onRequestUpdate 
}) => {
  const { user } = useAuthStore();
  const [request, setRequest] = useState<Request | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && requestId) {
      fetchRequestDetails();
      fetchEmployees();
      fetchComments();
    }
  }, [visible, requestId]);

  const fetchRequestDetails = async () => {
    if (!requestId) return;
    
    try {
      setLoading(true);
      const response = await requestsAPI.getById(requestId);
      setRequest(response.data);
      
      // Заполняем форму данными
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
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  const fetchComments = async () => {
    if (!requestId) return;
    
    try {
      const data = await commentsService.getCommentsByRequest(requestId);
      setComments(data);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!request) return;
    
    try {
      await requestsAPI.updateStatus(request.id, newStatus);
      setRequest({ ...request, status: newStatus as any });
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

  const handleAddComment = async () => {
    if (!newComment.trim() || !request) return;

    try {
      const commentData: ICreateComment = {
        content: newComment,
        type: 'request',
        requestId: request.id
      };

      if (commentAttachments.length > 0) {
        await commentsService.createCommentWithFiles(commentData, commentAttachments);
      } else {
        await commentsService.createComment(commentData);
      }

      setNewComment('');
      setCommentAttachments([]);
      fetchComments();
      message.success('Комментарий добавлен');
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      message.error('Не удалось добавить комментарий');
    }
  };

  const canEdit = () => {
    if (!user || !request) return false;
    const isCreator = request.creator.id === user.id.toString();
    const isAssignee = request.assignee?.id === user.id.toString();
    const isManager = ['ADMIN', 'HR', 'MANAGER'].includes(user.role);
    return isCreator || isAssignee || isManager;
  };

  // Функции для работы с файлами комментариев
  const handleDownload = (filename: string) => {
    window.open(`/api/uploads/download/${filename}`, '_blank');
  };

  const handleView = (filename: string) => {
    window.open(`/api/uploads/view/${filename}`, '_blank');
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
                      onStatusChange={handleStatusChange}
                      type="request"
                    />
                  ) : (
                    <Tag color="blue">{request.status}</Tag>
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
              </Space>
            </Card>
            
            <Divider>Комментарии</Divider>
            
            <div className="comments-section">
              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <Text strong>
                            {comment.author.firstName} {comment.author.lastName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(comment.created_at).toLocaleString()}
                          </Text>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{comment.content}</div>
                          {/* Отображение вложений */}
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong style={{ fontSize: '12px', color: '#666' }}>
                                Вложения:
                              </Text>
                              <div style={{ marginTop: 4 }}>
                                {comment.attachments.map((attachment: any, index: number) => (
                                  <div key={index} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: 4,
                                    padding: '4px 8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                  }}>
                                    <span style={{ flex: 1, marginRight: 8 }}>
                                      {attachment.originalName} ({formatFileSize(attachment.size)})
                                    </span>
                                    <div style={{ display: 'flex', gap: 4 }}>
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
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
              
              <div className="add-comment" style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <Input.TextArea
                    placeholder="Добавить комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <SimpleFileUpload
                    files={commentAttachments}
                    onFilesChange={setCommentAttachments}
                    maxFiles={3}
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                </div>
                
                <Button 
                  type="primary" 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Отправить
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default RequestDetail;

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
  DatePicker,
  message
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task } from '../../services/tasks.service';
import employeesAPI, { type Employee } from '../../services/employees.service';
import { commentsService } from '../../services/comments.service';
import { type IComment, type ICreateComment } from '../../services/comments.service';
import StatusSelector from '../StatusSelector/StatusSelector';
import FileUpload from '../FileUpload/FileUpload';
import SimpleFileUpload from '../SimpleFileUpload/SimpleFileUpload';
import { getPriorityColor, getPriorityText } from '../../utils/status.utils';
import dayjs from 'dayjs';
import './TaskDetail.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TaskDetailProps {
  taskId: number | null;
  visible: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId,
  visible,
  onClose,
  onTaskUpdate
}) => {
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && taskId) {
      fetchTaskDetails();
      fetchEmployees();
      fetchComments();
    }
  }, [visible, taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const response = await tasksAPI.getById(taskId);
      setTask(response.data);
      setAttachments(response.data.attachments || []);

      // Заполняем форму данными
      form.setFieldsValue({
        title: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        deadline: response.data.deadline ? dayjs(response.data.deadline) : null,
        assignees: response.data.assignees.map(a => a.id)
      });
    } catch (error) {
      message.error('Не удалось загрузить задачу');
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
    if (!taskId) return;

    try {
      const data = await commentsService.getCommentsByTask(taskId);
      setComments(data);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    try {
      await tasksAPI.updateStatus(task.id, newStatus);
      setTask({ ...task, status: newStatus as any });
      onTaskUpdate?.();
      message.success('Статус задачи изменен');
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      message.error('Не удалось изменить статус');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await tasksAPI.update(task!.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        assigneesId: values.assignees,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      await fetchTaskDetails();
      setEditing(false);
      onTaskUpdate?.();
      message.success('Задача обновлена');
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      message.error('Не удалось обновить задачу');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;

    try {
      const commentData: ICreateComment = {
        content: newComment,
        type: 'task',
        taskId: task.id
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
    if (!user || !task || !user.employeeId) return false;
    const isCreator = task.creator.id === user.employeeId;
    const isAssignee = task.assignees.some(a => a.id === user.employeeId);
    const isManager = ['admin', 'hr', 'manager'].includes(user.role);
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

  if (!task) return null;

  return (
    <Drawer
      title={
        <Space>
          <span>Задача #{task.id}</span>
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
      <div className="task-detail">
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

            <Form.Item name="deadline" label="Дедлайн">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="assignees" label="Исполнители">
              <Select mode="multiple" placeholder="Выберите исполнителей">
                {employees.map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Прикрепленные файлы
              </label>
              <FileUpload
                value={attachments}
                onChange={setAttachments}
                maxFiles={5}
                showDownload={true}
              />
            </div>

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
            <Card className="task-info">
              <Title level={4}>{task.title}</Title>

              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Статус: </Text>
                  {canEdit() ? (
                    <StatusSelector
                      currentStatus={task.status}
                      onStatusChange={handleStatusChange}
                      type="task"
                    />
                  ) : (
                    <Tag color="blue">{task.status}</Tag>
                  )}
                </div>

                <div>
                  <Text strong>Приоритет: </Text>
                  <Tag color={getPriorityColor(task.priority)}>
                    {getPriorityText(task.priority)}
                  </Tag>
                </div>

                <div>
                  <Text strong>Создатель: </Text>
                  <Text>{task.creator.firstName} {task.creator.lastName}</Text>
                </div>

                <div>
                  <Text strong>Исполнители: </Text>
                  <Space wrap>
                    {task.assignees.map(assignee => (
                      <Tag key={assignee.id} icon={<UserOutlined />}>
                        {assignee.firstName} {assignee.lastName}
                      </Tag>
                    ))}
                  </Space>
                </div>

                {task.deadline && (
                  <div>
                    <Text strong>Дедлайн: </Text>
                    <Tag icon={<CalendarOutlined />}>
                      {new Date(task.deadline).toLocaleDateString()}
                    </Tag>
                  </div>
                )}

                <div>
                  <Text strong>Создана: </Text>
                  <Tag icon={<ClockCircleOutlined />}>
                    {new Date(task.createdAt).toLocaleString()}
                  </Tag>
                </div>

                {task.description && (
                  <div>
                    <Text strong>Описание:</Text>
                    <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                      <Text>{task.description}</Text>
                    </div>
                  </div>
                )}

                {(task.attachments && task.attachments.length > 0) && (
                  <div>
                    <Text strong>Прикрепленные файлы:</Text>
                    <div style={{ marginTop: 8 }}>
                      <FileUpload
                        value={task.attachments}
                        onChange={() => { }}
                        disabled={true}
                        showDownload={true}
                      />
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

export default TaskDetail;

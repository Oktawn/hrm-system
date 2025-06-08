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
  CloseOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type Task } from '../../services/tasks.service';
import employeesAPI, { type Employee } from '../../services/employees.service';
import { commentsService } from '../../services/comments.service';
import { type IComment, type ICreateComment } from '../../services/comments.service';
import StatusSelector from '../StatusSelector/StatusSelector';
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

      // Заполняем форму данными
      form.setFieldsValue({
        title: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        deadline: response.data.deadline ? dayjs(response.data.deadline) : null,
        assignees: response.data.assignees.map(a => a.id)
      });
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
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
        assigneesId: values.assignees
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

      await commentsService.createComment(commentData);
      setNewComment('');
      fetchComments();
      message.success('Комментарий добавлен');
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      message.error('Не удалось добавить комментарий');
    }
  };

  const canEdit = () => {
    if (!user || !task) return false;
    const isCreator = task.creator.id === user.id.toString();
    const isAssignee = task.assignees.some(a => a.id === user.id.toString());
    const isManager = ['admin', 'hr', 'manager'].includes(user.role);
    return isCreator || isAssignee || isManager;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критический';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
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
                      description={comment.content}
                    />
                  </List.Item>
                )}
              />

              <div className="add-comment" style={{ marginTop: 16 }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Добавить комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onPressEnter={handleAddComment}
                  />
                  <Button type="primary" onClick={handleAddComment}>
                    Отправить
                  </Button>
                </Space.Compact>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default TaskDetail;

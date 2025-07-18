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
import employeesAPI from '../../services/employees.service';
import StatusSelector from '../StatusSelector/StatusSelector';
import FileUpload from '../FileUpload/FileUpload';
import { getPriorityColor, getPriorityText, TaskPriorityEnum } from '../../utils/status.utils';
import dayjs from 'dayjs';
import './TaskDetail.css';
import type { Employee } from '../../types/employee.types';
import Comments from '../Comments/Comments';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TaskDetailProps {
  taskId: number | null;
  visible: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export function TaskDetail({ taskId, visible, onClose, onTaskUpdate }: TaskDetailProps) {
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [form] = Form.useForm();


  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const response = await tasksAPI.getById(taskId);
      setTask(response.data);
      setAttachments(response.data.attachments || []);

      form.setFieldsValue({
        title: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        deadline: response.data.deadline ? dayjs(response.data.deadline) : null,
        assignees: response.data.assignees.map(a => a.id)
      });
    } catch {
      message.error('Не удалось загрузить задачу');
    } finally {
      setLoading(false);
    }
  }, [taskId, form]);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  useEffect(() => {
    if (visible && taskId) {
      fetchTaskDetails();
      fetchEmployees();
    }
  }, [visible, taskId, fetchTaskDetails]);

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

  const canEdit = () => {
    if (!user || !task || !user.employeeId) return false;
    const isCreator = task.creator.id === user.employeeId;
    const isAssignee = task.assignees.some(a => a.id === user.employeeId);
    const isManager = ['admin', 'hr', 'manager'].includes(user.role);
    return isCreator || isAssignee || isManager;
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
                {Object.values(TaskPriorityEnum).map(priority => (
                  <Option key={priority} value={priority}>
                    {getPriorityText(priority)}
                  </Option>
                ))}
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

            <Comments
              type="task"
              itemId={task.id}
            />
          </>
        )}
      </div>
    </Drawer>
  );
};

export default TaskDetail;

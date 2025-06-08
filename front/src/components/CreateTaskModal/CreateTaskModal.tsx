import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Space,
} from 'antd';
import { useAuthStore } from '../../stores/auth.store';
import tasksAPI, { type CreateTaskData } from '../../services/tasks.service';
import employeesAPI, { type Employee } from '../../services/employees.service';
import FileUpload from '../FileUpload/FileUpload';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onTaskCreated
}) => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      fetchEmployees();
      form.resetFields();
      setAttachments([]);
    }
  }, [visible, form]);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      message.error('Не удалось загрузить список сотрудников');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const taskData: CreateTaskData = {
        title: values.title,
        description: values.description,
        priority: values.priority || 'medium',
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        assigneesId: values.assigneesId || [],
        creatorId: user?.id || '',
        attachments: attachments.length > 0 ? attachments : undefined
      };

      await tasksAPI.create(taskData);
      
      message.success('Задача успешно создана');
      form.resetFields();
      setAttachments([]);
      onClose();
      onTaskCreated?.();
    } catch (error: any) {
      console.error('Ошибка создания задачи:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Не удалось создать задачу');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Создать задачу"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Создать задачу
        </Button>
      ]}
      width={600}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="title"
          label="Название задачи"
          rules={[
            { required: true, message: 'Пожалуйста, введите название задачи' },
            { min: 3, message: 'Название должно содержать минимум 3 символа' }
          ]}
        >
          <Input placeholder="Введите название задачи" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
        >
          <TextArea 
            rows={4} 
            placeholder="Введите описание задачи (необязательно)" 
          />
        </Form.Item>

        <Space style={{ width: '100%' }} direction="vertical">
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="priority"
              label="Приоритет"
              style={{ flex: 1 }}
              initialValue="medium"
            >
              <Select placeholder="Выберите приоритет">
                <Option value="low">Низкий</Option>
                <Option value="medium">Средний</Option>
                <Option value="high">Высокий</Option>
                <Option value="critical">Критический</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="deadline"
              label="Дедлайн"
              style={{ flex: 1 }}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Выберите дату"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="assigneesId"
            label="Исполнители"
          >
            <Select
              mode="multiple"
              placeholder="Выберите исполнителей"
              showSearch
              filterOption={(input, option) => {
                const label = option?.label || '';
                return label.toString().toLowerCase().includes(input.toLowerCase());
              }}
            >
              {employees.map(employee => (
                <Option 
                  key={employee.id} 
                  value={employee.id}
                  label={`${employee.firstName} ${employee.lastName}`}
                >
                  {employee.firstName} {employee.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Прикрепленные файлы
            </label>
            <FileUpload
              value={attachments}
              onChange={setAttachments}
              maxFiles={5}
            />
          </div>
        </Space>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  InputNumber,
} from 'antd';
import { useAuthStore } from '../../stores/auth.store';
import requestsAPI from '../../services/requests.service';
import SimpleFileUpload from '../SimpleFileUpload/SimpleFileUpload';
import dayjs from 'dayjs';
import type { CreateRequestData } from '../../types/request.types';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CreateRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestCreated?: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  visible,
  onClose,
  onRequestCreated
}) => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setRequestType('');
      setAttachments([]);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (!user?.employeeId) {
        message.error('Ошибка: не найден ID сотрудника');
        return;
      }

      if (isLeaveRequest && values.dateRange) {
        const [startDate, endDate] = values.dateRange;
        const duration = endDate.diff(startDate, 'day') + 1;

        const threeDaysFromNow = dayjs().add(3, 'day').startOf('day');
        if (startDate.isBefore(threeDaysFromNow)) {
          message.error('Отпуск нельзя подавать раньше чем за 3 дня от текущей даты');
          return;
        }

        if (values.type === 'leave_vacation' && duration > 30) {
          message.error('Оплачиваемый отпуск не может быть больше 30 дней');
          return;
        }
      }

      const requestData: CreateRequestData = {
        type: values.type,
        title: values.title,
        description: values.description || '',
        priority: values.priority || 'medium',
        userId: user.employeeId,
        ...(values.dateRange && {
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
        }),
        ...(values.duration && { duration: values.duration }),
      };

      if (attachments.length > 0) {
        await requestsAPI.createWithFiles(requestData, attachments);
      } else {
        await requestsAPI.create(requestData);
      }

      message.success('Заявка успешно создана');
      form.resetFields();
      setAttachments([]);
      onClose();
      onRequestCreated?.();
    } catch (error: any) {
      console.error('Ошибка создания заявки:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Не удалось создать заявку');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setRequestType('');
    setAttachments([]);
    onClose();
  };

  const isLeaveRequest = ['leave_vacation', 'leave_sick', 'leave_personal'].includes(requestType);

  return (
    <Modal
      title="Создать заявку"
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
          Создать заявку
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
          name="type"
          label="Тип заявки"
          rules={[{ required: true, message: 'Пожалуйста, выберите тип заявки' }]}
        >
          <Select
            placeholder="Выберите тип заявки"
            onChange={(value) => setRequestType(value)}
          >
            <Option value="document">Запрос документа</Option>
            <Option value="certificate">Справка</Option>
            <Option value="leave_vacation">Отпуск</Option>
            <Option value="leave_sick">Больничный</Option>
            <Option value="leave_personal">Личный отпуск</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Название заявки"
          rules={[
            { required: true, message: 'Пожалуйста, введите название заявки' },
            { min: 3, message: 'Название должно содержать минимум 3 символа' }
          ]}
        >
          <Input placeholder="Введите название заявки" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Пожалуйста, введите описание заявки' }]}
        >
          <TextArea
            rows={4}
            placeholder="Введите подробное описание заявки"
          />
        </Form.Item>

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

          {isLeaveRequest && (
            <Form.Item
              name="duration"
              label="Продолжительность (дни)"
              style={{ flex: 1 }}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    if (requestType === 'leave_vacation' && value > 30) {
                      return Promise.reject(new Error('Оплачиваемый отпуск не может быть больше 30 дней'));
                    }

                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={1}
                max={requestType === 'leave_vacation' ? 30 : 365}
                placeholder="Количество дней"
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
        </div>

        {isLeaveRequest && (
          <Form.Item
            name="dateRange"
            label="Период отпуска"
            rules={[
              { required: true, message: 'Пожалуйста, выберите период' },
              {
                validator: (_, value) => {
                  if (!value || !value[0] || !value[1]) {
                    return Promise.resolve();
                  }

                  const [startDate, endDate] = value;
                  const duration = endDate.diff(startDate, 'day') + 1;
                  const threeDaysFromNow = dayjs().add(3, 'day').startOf('day');

                  if (startDate.isBefore(threeDaysFromNow)) {
                    return Promise.reject(new Error('Отпуск нельзя подавать раньше чем за 3 дня от текущей даты'));
                  }

                  if (requestType === 'leave_vacation' && duration > 30) {
                    return Promise.reject(new Error('Оплачиваемый отпуск не может быть больше 30 дней'));
                  }

                  return Promise.resolve();
                }
              }
            ]}
          >
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Дата начала', 'Дата окончания']}
              disabledDate={(current) => {
                const threeDaysFromNow = dayjs().add(3, 'day').startOf('day');
                return current && current < threeDaysFromNow;
              }}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  const duration = dates[1].diff(dates[0], 'day') + 1;
                  form.setFieldValue('duration', duration);
                }
              }}
            />
          </Form.Item>
        )}

        <Form.Item label="Прикрепить файлы">
          <SimpleFileUpload
            files={attachments}
            onFilesChange={setAttachments}
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRequestModal;

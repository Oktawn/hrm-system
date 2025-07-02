import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import dayjs from 'dayjs';
import { employeesAPI } from '../../services/employees.service';
import departmentsService from '../../services/departments.service';
import positionsService from '../../services/positions.service';
import type { CreateEmployeeData, Manager } from '../../types/employee.types';

const { Option } = Select;

interface CreateEmployeeModalProps {
  visible: boolean;
  onClose: () => void;
  onEmployeeCreated?: () => void;
}

interface Department {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

export function CreateEmployeeModal({ visible, onClose, onEmployeeCreated }: CreateEmployeeModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      loadDepartments();
      loadPositions();
      loadManagers();
    }
  }, [visible, form]);

  const loadDepartments = async () => {
    try {
      const response = await departmentsService.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await positionsService.getAll();
      setPositions(response.data || []);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await employeesAPI.getAvailableManagers();
      setManagers(response.data.data || []);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const employeeData: CreateEmployeeData = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
        phone: values.phone,
        departmentId: values.departmentId,
        positionId: values.positionId,
        assignedManagerId: values.assignedManagerId,
      };

      await employeesAPI.create(employeeData);

      message.success('Сотрудник успешно создан');
      form.resetFields();
      onClose();
      onEmployeeCreated?.();
    } catch (error: any) {
      console.error('Ошибка создания сотрудника:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Не удалось создать сотрудника');
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
      title="Создать сотрудника"
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
          Создать
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Пожалуйста, введите email' },
            { type: 'email', message: 'Введите корректный email' }
          ]}
        >
          <Input placeholder="employee@company.com" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Фамилия"
          rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
        >
          <Input placeholder="Иванов" />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="Имя"
          rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
        >
          <Input placeholder="Иван" />
        </Form.Item>

        <Form.Item
          name="middleName"
          label="Отчество"
        >
          <Input placeholder="Иванович" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Телефон"
        >
          <Input placeholder="+7 (999) 123-45-67" />
        </Form.Item>

        <Form.Item
          name="birthDate"
          label="Дата рождения"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Выберите дату рождения"
            format="DD.MM.YYYY"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="hireDate"
          label="Дата трудоустройства"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Выберите дату трудоустройства"
            format="DD.MM.YYYY"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="departmentId"
          label="Отдел"
        >
          <Select placeholder="Выберите отдел" allowClear>
            {departments.map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="positionId"
          label="Должность"
        >
          <Select placeholder="Выберите должность" allowClear>
            {positions.map(pos => (
              <Option key={pos.id} value={pos.id}>
                {pos.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedManagerId"
          label="Ответственный менеджер/HR"
        >
          <Select placeholder="Выберите ответственного" allowClear>
            {managers.map(manager => (
              <Option key={manager.id} value={manager.id}>
                {manager.lastName} {manager.firstName} {manager.middleName || ''} ({manager.role})
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

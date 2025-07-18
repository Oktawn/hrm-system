import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import dayjs from 'dayjs';
import { employeesAPI } from '../../services/employees.service';
import departmentsService from '../../services/departments.service';
import positionsService from '../../services/positions.service';
import { useAuthStore } from '../../stores/auth.store';
import type { Employee, UpdateEmployeeData, Manager } from '../../types/employee.types';

const { Option } = Select;

interface EditEmployeeModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEmployeeUpdated?: () => void;
}

interface Department {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

export function EditEmployeeModal({ visible, employee, onClose, onEmployeeUpdated }: EditEmployeeModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();
  const { user, updateUser } = useAuthStore();

  const loadDepartments = async () => {
    try {
      const response = await departmentsService.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPositions = useCallback(async (departmentId?: number) => {
    try {
      if (departmentId) {
        const response = await positionsService.getByDepartment(departmentId);
        setPositions(response.data || []);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
      setPositions([]);
    }
  }, []);

  const loadManagers = useCallback(async () => {
    try {
      const response = await employeesAPI.getAvailableManagers();
      setManagers(response.data.data || []);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  }, []);


  useEffect(() => {
    if (visible && employee) {
      const departmentId = employee.department?.id;

      form.setFieldsValue({
        email: employee.user?.email || '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName || '',
        birthDate: employee.birthDate ? dayjs(employee.birthDate) : null,
        hireDate: employee.hireDate ? dayjs(employee.hireDate) : null,
        phone: employee.phone || '',
        departmentId: departmentId,
        positionId: employee.position?.id,
        assignedManagerId: employee.assignedManager?.id,
        tgID: employee.tgID || '',
        tgUsername: employee.tgUsername || '',
      });
      setSelectedDepartmentId(departmentId ? parseInt(departmentId) : undefined);

      loadDepartments();
      loadManagers();

      if (departmentId) {
        loadPositions(parseInt(departmentId));
      }
    }
  }, [visible, employee, form, loadPositions, loadManagers]);



  const handleSubmit = async (values: any) => {
    if (!employee) return;

    try {
      setLoading(true);

      const updateData: UpdateEmployeeData = {
        userId: employee.user!.id,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || null,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,
        phone: values.phone || null,
        departmentId: values.departmentId || null,
        positionId: values.positionId || null,
        assignedManagerId: values.assignedManagerId || null,
        tgID: values.tgID ? parseInt(values.tgID) : undefined,
        tgUsername: values.tgUsername || undefined,
      };

      await employeesAPI.update(updateData);

      message.success('Сотрудник успешно обновлен');

      if (user && user.id === employee.user?.id) {
        const updatedEmployee = await employeesAPI.getById(employee.id);
        if (updatedEmployee.data.user) {
          updateUser({
            email: updatedEmployee.data.user.email,
            role: updatedEmployee.data.user.role
          });
        }
      }

      onClose();
      if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при обновлении сотрудника';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = async (departmentId: number | undefined) => {
    setSelectedDepartmentId(departmentId);

    form.setFieldValue('positionId', undefined);

    if (departmentId) {
      await loadPositions(departmentId);
    } else {
      setPositions([]);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedDepartmentId(undefined);
    setPositions([]);
    onClose();
  };

  return (
    <Modal
      title={`Редактировать сотрудника: ${employee?.firstName} ${employee?.lastName}`}
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
          onClick={() => form.submit()}
        >
          Сохранить
        </Button>
      ]}
      width={600}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email обязателен' },
            { type: 'email', message: 'Неверный формат email' }
          ]}
        >
          <Input placeholder="Введите email" />
        </Form.Item>

        <Form.Item
          label="Имя"
          name="firstName"
          rules={[{ required: true, message: 'Имя обязательно' }]}
        >
          <Input placeholder="Введите имя" />
        </Form.Item>

        <Form.Item
          label="Фамилия"
          name="lastName"
          rules={[{ required: true, message: 'Фамилия обязательна' }]}
        >
          <Input placeholder="Введите фамилию" />
        </Form.Item>

        <Form.Item
          label="Отчество"
          name="middleName"
        >
          <Input placeholder="Введите отчество" />
        </Form.Item>

        <Form.Item
          label="Дата рождения"
          name="birthDate"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Выберите дату рождения"
            format="DD.MM.YYYY"
          />
        </Form.Item>

        <Form.Item
          label="Дата найма"
          name="hireDate"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Выберите дату найма"
            format="DD.MM.YYYY"
          />
        </Form.Item>

        <Form.Item
          label="Телефон"
          name="phone"
        >
          <Input placeholder="Введите телефон" />
        </Form.Item>

        <Form.Item
          label="Отдел"
          name="departmentId"
        >
          <Select
            placeholder="Выберите отдел"
            allowClear
            onChange={handleDepartmentChange}
          >
            {departments.map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Должность"
          name="positionId"
        >
          <Select
            placeholder={selectedDepartmentId ? "Выберите должность" : "Сначала выберите отдел"}
            allowClear
            disabled={!selectedDepartmentId}
          >
            {positions.map(pos => (
              <Option key={pos.id} value={pos.id}>
                {pos.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Менеджер"
          name="assignedManagerId"
        >
          <Select placeholder="Выберите менеджера" allowClear>
            {managers.map(manager => (
              <Option key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Telegram ID"
          name="tgID"
        >
          <Input placeholder="Введите Telegram ID" type="number" />
        </Form.Item>

        <Form.Item
          label="Telegram Username"
          name="tgUsername"
        >
          <Input placeholder="Введите Telegram Username" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

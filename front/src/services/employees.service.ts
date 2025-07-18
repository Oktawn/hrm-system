import type { AxiosResponse } from 'axios';
import { api } from './auth.service';
import type {
  CreateEmployeeData,
  Employee,
  EmployeesResponse,
  EmployeeStats,
  Manager,
  UpdateEmployeeData
} from '../types/employee.types';



export const employeesAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    departmentId?: string;
    positionId?: string;
    isActive?: boolean;
  }): Promise<AxiosResponse<EmployeesResponse>> =>
    api.get('/employees', { params: { limit: params?.limit || 100, ...params } }),

  getById: (id: string): Promise<AxiosResponse<Employee>> =>
    api.get(`/employees/${id}`),

  create: (data: CreateEmployeeData): Promise<AxiosResponse<{ success: boolean; data: Employee; message: string }>> =>
    api.post('/employees/create', data),

  update: (data: UpdateEmployeeData): Promise<AxiosResponse<{ success: boolean; data: Employee; message: string }>> =>
    api.put('/employees/update', data),

  updateMe: (data: Partial<UpdateEmployeeData>): Promise<AxiosResponse<{ message: string }>> =>
    api.put('/employees/update/me', data),

  delete: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/employees/${id}`),

  getAvailableManagers: (): Promise<AxiosResponse<{ success: boolean; data: Manager[] }>> =>
    api.get('/employees/managers'),

  getEmployeeStats: (): Promise<EmployeeStats> =>
    api.get('/employees/stats').then(res => res.data.data),
};

export default employeesAPI;

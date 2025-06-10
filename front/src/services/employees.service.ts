import type { AxiosResponse } from 'axios';
import { api } from './auth.service';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  hireDate?: string;
  phone?: string;
  position?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  assignedManager?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  hireDate?: string;
  phone?: string;
  departmentId?: number;
  positionId?: number;
  assignedManagerId?: string;
}

export interface UpdateEmployeeData {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  hireDate?: string;
  phone?: string;
  departmentId?: number;
  positionId?: number;
  assignedManagerId?: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
}

export interface EmployeesResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

// API методы для сотрудников
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
    api.get('/employees', { params: { limit: 100, ...params } }),
    
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

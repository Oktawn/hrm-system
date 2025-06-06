import type { AxiosResponse } from 'axios';
import { api } from './auth.service';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
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
  hireDate?: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
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
    
  getEmployeeStats: (): Promise<EmployeeStats> =>
    api.get('/employees/stats').then(res => res.data.data),
};

export default employeesAPI;

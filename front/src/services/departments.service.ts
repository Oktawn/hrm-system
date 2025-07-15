/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './auth.service';

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  employees?: any[];
  positions?: any[];
}

export interface DepartmentStats {
  id: number;
  name: string;
  employeeCount: number;
}

class DepartmentsService {
  async getAll(): Promise<{ success: boolean; data: Department[] }> {
    const response = await api.get('/departments');
    return response.data;
  }

  async getById(id: number): Promise<{ success: boolean; data: Department }> {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  }

  async getStats(): Promise<{ success: boolean; data: DepartmentStats[] }> {
    const response = await api.get('/departments/stats');
    return response.data;
  }

  async create(name: string): Promise<{ success: boolean; data: Department; message: string }> {
    const response = await api.post('/departments', { name });
    return response.data;
  }

  async update(id: number, name: string): Promise<{ success: boolean; data: Department; message: string }> {
    const response = await api.put(`/departments/${id}`, { name });
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  }
}

export default new DepartmentsService();

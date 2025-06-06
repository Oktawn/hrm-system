import { api } from './auth.service';

export interface Position {
  id: number;
  name: string;
  description?: string;
  baseSalary?: number;
  grade?: string;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    name: string;
  };
  employees?: any[];
}

export interface CreatePositionData {
  name: string;
  description?: string;
  baseSalary?: number;
  grade?: string;
  departmentId?: number;
}

class PositionsService {
  async getAll(): Promise<{ success: boolean; data: Position[] }> {
    const response = await api.get('/positions');
    return response.data;
  }

  async getById(id: number): Promise<{ success: boolean; data: Position }> {
    const response = await api.get(`/positions/${id}`);
    return response.data;
  }

  async getByDepartment(departmentId: number): Promise<{ success: boolean; data: Position[] }> {
    const response = await api.get(`/positions/department/${departmentId}`);
    return response.data;
  }

  async create(positionData: CreatePositionData): Promise<{ success: boolean; data: Position; message: string }> {
    const response = await api.post('/positions', positionData);
    return response.data;
  }

  async update(id: number, positionData: Partial<CreatePositionData>): Promise<{ success: boolean; data: Position; message: string }> {
    const response = await api.put(`/positions/${id}`, positionData);
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/positions/${id}`);
    return response.data;
  }
}

export default new PositionsService();

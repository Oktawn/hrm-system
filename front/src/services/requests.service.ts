/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CreateRequestData, RequestFilter, Request } from '../types/request.types';
import { api } from './auth.service';

class RequestsService {
  async getAll(filter?: RequestFilter): Promise<{ success: boolean; data: Request[]; meta?: any }> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/requests?${params.toString()}`);
    return response.data;
  }

  async getById(id: number): Promise<{ success: boolean; data: Request }> {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  }

  async getByEmployee(employeeId: string): Promise<{ success: boolean; data: Request[] }> {
    const response = await api.get(`/requests/employee/${employeeId}`);
    return response.data;
  }

  async getByStatus(status: string): Promise<{ success: boolean; data: Request[] }> {
    const response = await api.get(`/requests/status/${status}`);
    return response.data;
  }

  async create(requestData: CreateRequestData): Promise<{ success: boolean; data: Request; message?: string }> {
    const response = await api.post('/requests/create', requestData);
    return response.data;
  }

  async createWithFiles(requestData: CreateRequestData, files: File[]): Promise<{ success: boolean; data: Request; message?: string }> {
    const formData = new FormData();

    Object.entries(requestData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    const response = await api.post('/requests/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id: number, requestData: Partial<CreateRequestData>): Promise<{ success: boolean; data: Request; message?: string }> {
    const response = await api.put(`/requests/update/${id}`, { id, ...requestData });
    return response.data;
  }

  async updateStatus(id: number, status: string): Promise<{ success: boolean; data: Request; message?: string }> {
    const response = await api.patch(`/requests/${id}/status`, { status });
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  }
}

export default new RequestsService();

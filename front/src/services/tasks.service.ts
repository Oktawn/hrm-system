import type { TaskPriority, TaskStatus } from '../types/common.types';
import { api } from './auth.service';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  assignees: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
  }>;
  attachments?: any[];
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  cancelled: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskFilter {
  page?: number;
  limit?: number;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  deadline?: string;
  creatorId?: string;
  assigneesId?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  assigneesId?: string[];
  creatorId: string;
  attachments?: any[];
}

class TasksService {
  async getAll(filter?: TaskFilter): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  }

  async getStats(): Promise<{ success: boolean; data: TaskStats }> {
    const response = await api.get('/tasks/stats');
    return response.data;
  }

  async getRecent(limit: number = 5): Promise<{ success: boolean; data: Task[] }> {
    const response = await api.get(`/tasks/recent?limit=${limit}`);
    return response.data;
  }

  async getById(id: number): Promise<{ success: boolean; data: Task }> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async getByAssignee(assigneeId: string): Promise<{ success: boolean; data: Task[] }> {
    const response = await api.get(`/tasks/assignee/${assigneeId}`);
    return response.data;
  }

  async getByCreator(creatorId: string): Promise<{ success: boolean; data: Task[] }> {
    const response = await api.get(`/tasks/creator/${creatorId}`);
    return response.data;
  }

  async getByStatus(status: string): Promise<{ success: boolean; data: Task[] }> {
    const response = await api.get(`/tasks/status/${status}`);
    return response.data;
  }

  async getByPriority(priority: string): Promise<{ success: boolean; data: Task[] }> {
    const response = await api.get(`/tasks/priority/${priority}`);
    return response.data;
  }

  async create(taskData: CreateTaskData): Promise<{ success: boolean; data: Task; message?: string }> {
    const response = await api.post('/tasks/create', taskData);
    return response.data;
  }

  async createWithFiles(taskData: CreateTaskData, files: File[]): Promise<{ success: boolean; data: Task; message?: string }> {
    const formData = new FormData();

    Object.entries(taskData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v.toString()));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    const response = await api.post('/tasks/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id: number, taskData: Partial<CreateTaskData>): Promise<{ success: boolean; data: Task; message?: string }> {
    const response = await api.put(`/tasks/update/${id}`, { idTask: id, ...taskData });
    return response.data;
  }

  async updateStatus(id: number, status: string): Promise<{ success: boolean; data: Task; message?: string }> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
}

export default new TasksService();

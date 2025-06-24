import type { TaskStatistics, TaskStatisticsFilter } from '../types/statistics.types';
import { api } from './auth.service';

class TaskStatisticsService {
  async getStatistics(filter?: TaskStatisticsFilter): Promise<{ success: boolean; data: TaskStatistics[] }> {
    const params = new URLSearchParams();

    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.positionId) params.append('positionId', filter.positionId);
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);

    const queryString = params.toString();
    const endpoint = `/tasks/statistics${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(endpoint);
    return response.data;
  }

  async exportToExcel(filter?: TaskStatisticsFilter): Promise<Blob> {
    const params = new URLSearchParams();

    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.positionId) params.append('positionId', filter.positionId);
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);

    const queryString = params.toString();
    const endpoint = `/tasks/statistics/export${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(endpoint, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response.data;
  }

  downloadExcel(blob: Blob, filename?: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `task-statistics-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async getTotalStatistics(filter?: TaskStatisticsFilter): Promise<{ success: boolean; data: any }> {
    const params = new URLSearchParams();

    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.positionId) params.append('positionId', filter.positionId);
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);

    const queryString = params.toString();
    const endpoint = `/tasks/statistics/total${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(endpoint);
    return response.data;
  }
}

export const statisticsService = new TaskStatisticsService();

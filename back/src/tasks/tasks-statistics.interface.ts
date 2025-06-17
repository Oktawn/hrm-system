export interface ITaskStatistics {
  employeeId: string;
  employeeName: string;
  department?: string;
  position?: string;
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  doneCount: number;
  cancelledCount: number;
  totalTasks: number;
  overdueTasks: number;
  completionRate: number; 
}

export interface ITaskStatisticsFilter {
  departmentId?: string;
  positionId?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IExportStatisticsRequest {
  filter?: ITaskStatisticsFilter;
  format?: 'excel' | 'csv';
}

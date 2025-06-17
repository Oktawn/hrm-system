export interface TaskStatistics {
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

export interface TaskStatisticsFilter {
  departmentId?: string;
  positionId?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

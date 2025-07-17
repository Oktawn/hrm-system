import type { FileAttachment } from "./document.types";

export type RequestPriority = 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type RequestStatus = 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type RequestType = 'document'
  | 'certificate'
  | 'leave_vacation'
  | 'leave_sick'
  | 'leave_personal'
  | 'business_trip'
  | 'remote_work'
  | 'equipment'
  | 'other';


export interface CreateRequestData {
  type: RequestType;
  priority?: RequestPriority;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  userId: string;
}

export interface Request {
  id: number;
  type: RequestType;
  priority: RequestPriority;
  title: string;
  description: string;
  status: RequestStatus;
  startDate?: string;
  endDate?: string;
  duration?: number;
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  assignee?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}



export interface RequestFilter {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  priority?: string;
  creatorId?: string;
  assigneeId?: string;
  description?: string;
  title?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateRequestData {
  type: RequestType;
  priority?: RequestPriority;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  userId: string;
}
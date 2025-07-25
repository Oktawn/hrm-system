import { RequestStatusEnum, RequestTypeEnum } from "../commons/enums/enums";

export interface ICreateRequest {
  type: RequestTypeEnum;
  title: string;
  description?: string;
  status: RequestStatusEnum;
  userId: string;
  startDate?: Date;
  endDate?: Date;
  attachments?: any;
}

export interface IUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  status?: RequestStatusEnum;
  startDate?: Date;
  endDate?: Date;
  attachments?: any;
}

export interface IRequestFilter {
  type?: RequestTypeEnum | RequestTypeEnum[];
  status?: RequestStatusEnum | RequestStatusEnum[];
  description?: string;
  title?: string;
  employeeId?: string;
  creatorId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
import { RequestStatusEnum, RequestTypeEnum } from "../commons/enums/enums";

export interface ICreateRequest {
  type: RequestTypeEnum;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  attachments?: any;
}

export interface IUpdateRequest {
  title?: string;
  description?: string;
  status?: RequestStatusEnum;
  startDate?: Date;
  endDate?: Date;
  assignedToId?: string;
  attachments?: any;
}

export interface IRequestFilter {
  type?: RequestTypeEnum | RequestTypeEnum[];
  status?: RequestStatusEnum | RequestStatusEnum[];
  employeeId?: string;
  assignedToId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  page?: number;
  limit?: number;
}
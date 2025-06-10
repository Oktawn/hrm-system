import { TaskPriorityEnum, TaskStatusEnum } from "../commons/enums/enums";

export interface ICreateTask {
  title: string;
  creatorId: string;
  assigneesId?: string[];
  description?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  deadline?: Date;
  attachments?: any;
}

export interface IUpdateTask {
  idTask: number;
  title?: string;
  description?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  deadline?: Date;
  assigneesId?: string[];
  attachments?: any;
}

export interface ITaskFilter {
  title?: string;
  description?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  deadline?: Date;
  creatorId?: string;
  assigneesId?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
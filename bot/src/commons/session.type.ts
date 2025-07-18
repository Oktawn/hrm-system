import { UserRoleEnum } from "./enums";
import { RequestType, Task } from "./types";

type UserSession = {
  user: {
    role: UserRoleEnum;
    userId: string;
    tgID: number;
  }
}


type TaskDataSession = {
  currentPage: number;
  totalPages?: number;
  tasks: Task[];
}

type RequestDataSession = {
  currentPage: number;
  totalPages?: number;
  requests: RequestType[];
}

type TasksSession = {
  tasks: TaskDataSession;
}

type RequestsSession = {
  requests: RequestDataSession;
}


export {
  TaskDataSession,
  RequestsSession,
  RequestDataSession,
  TasksSession,
  UserSession
}
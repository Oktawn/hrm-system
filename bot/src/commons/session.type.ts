import { RequestType, Task } from "./types";

type UserSession = {
  user: {
    Role: string;
    tgID: number;
  }
}


type TaskDataSession = {
  currentPage: number;
  totalPages?: number;
  tasks: Task[];
}

type TasksSession = {
  tasks: TaskDataSession;
}

type RequestsSession = {
  requests: {
    currentPage: number;
    totalPages?: number;
    requests: RequestType[];
  };
}


export {
  TaskDataSession,
  RequestsSession,
  TasksSession,
  UserSession
}
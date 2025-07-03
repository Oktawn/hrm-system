import { Task } from "./types";

type TaskDataSession = {
  currentPage: number;
  totalPages?: number;
  tasks: Task[];
}

type TasksSession = {
  tasks: TaskDataSession;
}

export {
  TaskDataSession,
  TasksSession,
}
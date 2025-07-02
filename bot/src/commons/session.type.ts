import { Task } from "./types";

type TasksSession = {
  tasks: {
    currentPage: number;
    totalPages?: number;
    tasks: Task[];
  }
}

export {
  TasksSession,
}
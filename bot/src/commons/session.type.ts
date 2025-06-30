
type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
}

type TasksSession = {
  tasks: {
    currentPage: number;
    tasks: Task[];
  }
}

export {
  TasksSession,
}
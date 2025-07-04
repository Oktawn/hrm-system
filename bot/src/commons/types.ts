type Attachment = {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadDate: Date;
}

type Assignee = {
  firstName: string;
  lastName: string;
}

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  creator: Assignee;
  assignees: Assignee[];
}

type DataTask = {
  tgID: number;
  id?: number;
  status?: string;
  priority?: string;
}

export {
  Task,
  DataTask,
  Assignee
}
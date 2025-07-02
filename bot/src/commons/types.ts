type Attachment = {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadDate: Date;
}

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  attachments?: Attachment[];
}

type DataTask = {
  tgID: number;
  id?: number;
  status?: string;
  priority?: string;
}

export {
  Task,
  DataTask
}
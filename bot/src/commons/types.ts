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

type RequestType = {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  creator: Assignee;
  assignee: Assignee;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
}

type CreateRequestType = {
  type: string;
  title: string;
  description: string;
  priority: string;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
}

type CreateCommentType = {
  content: string;
  tgID: number;
  type: 'task' | 'request';
  taskId?: number;
  requestId?: number;
  attachments?: any[];
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
}


type DataRequest = {
  tgID: number;
  request?: CreateRequestType;
  id?: number;
  status?: string;
  priority?: string;
  requestId?: number;
  comment?: string;
  employeeName?: string;
  departmentName?: string;
}

type DataTask = {
  tgID: number;
  id?: number;
  status?: string;
  priority?: string;
}

export {
  Task,
  RequestType,
  CreateRequestType,
  CreateCommentType,
  Attachment,
  DataRequest,
  DataTask,
  Assignee
}
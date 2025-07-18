export interface ICreateComment {
  content: string;
  type: 'task' | 'request';
  taskId?: number;
  requestId?: number;
  attachments?: any;
}

export interface IUpdateComment {
  content: string;
  attachments?: any;
}

export interface ICommentResponse {
  id: number;
  content: string;
  type: 'task' | 'request';
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attachments?: any;
  created_at: Date;
  updated_at: Date;
}

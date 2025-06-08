export interface ICreateComment {
  content: string;
  type: 'task' | 'request';
  taskId?: number;
  requestId?: number;
}

export interface IUpdateComment {
  content: string;
}

export interface ICommentResponse {
  id: string;
  content: string;
  type: 'task' | 'request';
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  created_at: Date;
  updated_at: Date;
}

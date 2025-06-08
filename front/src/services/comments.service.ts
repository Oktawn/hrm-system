import { api } from './auth.service';

export interface IComment {
  id: string;
  content: string;
  type: 'task' | 'request';
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ICreateComment {
  content: string;
  type: 'task' | 'request';
  taskId?: number;
  requestId?: number;
}

export interface IUpdateComment {
  content: string;
}

class CommentsService {
  async createComment(commentData: ICreateComment): Promise<IComment> {
    const response = await api.post('/comments', commentData);
    return response.data;
  }

  async getCommentsByTask(taskId: number): Promise<IComment[]> {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  }

  async getCommentsByRequest(requestId: number): Promise<IComment[]> {
    const response = await api.get(`/comments/request/${requestId}`);
    return response.data;
  }

  async updateComment(commentId: string, commentData: IUpdateComment): Promise<IComment> {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }
}

export const commentsService = new CommentsService();

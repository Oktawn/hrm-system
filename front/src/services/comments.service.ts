import { api } from './auth.service';

export interface IComment {
  id: number;
  content: string;
  type: 'task' | 'request';
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attachments?: any[];
  created_at: string;
  updated_at: string;
}

export interface ICreateComment {
  content: string;
  type: 'task' | 'request';
  taskId?: number;
  requestId?: number;
  attachments?: any[];
}

export interface IUpdateComment {
  content: string;
  attachments?: any[];
}

class CommentsService {
  async createComment(commentData: ICreateComment): Promise<IComment> {
    const response = await api.post('/comments', commentData);
    return response.data.success ? response.data.data : response.data;
  }

  async createCommentWithFiles(commentData: ICreateComment, files: File[]): Promise<IComment> {
    const formData = new FormData();

    Object.entries(commentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    const response = await api.post('/comments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.success ? response.data.data : response.data;
  }

  async getCommentsByTask(taskId: number): Promise<IComment[]> {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  }

  async getCommentsByRequest(requestId: number): Promise<IComment[]> {
    const response = await api.get(`/comments/request/${requestId}`);
    return response.data;
  }

  async updateComment(commentId: number, commentData: IUpdateComment): Promise<IComment> {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }
}

export const commentsService = new CommentsService();

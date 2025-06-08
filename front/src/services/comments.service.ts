const API_BASE_URL = 'http://localhost:8000/api';

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
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async createComment(commentData: ICreateComment): Promise<IComment> {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create comment');
    }

    return response.json();
  }

  async getCommentsByTask(taskId: number): Promise<IComment[]> {
    const response = await fetch(`${API_BASE_URL}/comments/task/${taskId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch task comments');
    }

    return response.json();
  }

  async getCommentsByRequest(requestId: number): Promise<IComment[]> {
    const response = await fetch(`${API_BASE_URL}/comments/request/${requestId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch request comments');
    }

    return response.json();
  }

  async updateComment(commentId: string, commentData: IUpdateComment): Promise<IComment> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }

    return response.json();
  }

  async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  }
}

export const commentsService = new CommentsService();

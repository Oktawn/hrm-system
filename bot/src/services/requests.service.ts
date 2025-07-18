import { CreateCommentType, DataRequest, RequestType } from "../commons/types";
import { envConfig } from "../config/config";
import { api } from "./api";

export class RequestsService {

  async createRequest(body: DataRequest): Promise<void> {
    try {
      await api.post("/requests/bot/create", body.request, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
    } catch (error) {
      console.error('Ошибка при создании запроса:', error.response?.data || error.message);
      throw error;
    }

  }

  async getRequests(body: DataRequest): Promise<RequestType[]> {
    try {
      const response = await api.get("/requests/bot/", {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении заявок:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRequestsById(body: DataRequest): Promise<RequestType> {
    try {
      const response = await api.get(`/requests/bot/${body.id}`, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении запроса по ID:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRequestsByStatus(body: DataRequest): Promise<RequestType[]> {
    try {
      const response = await api.get(`/requests/bot/status/${body.status}`, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении запросов по статусу:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRequestsByPriority(body: DataRequest): Promise<RequestType[]> {
    try {
      const response = await api.get(`/requests/bot/priority/${body.priority}`, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении запросов по приоритету:', error.response?.data || error.message);
      throw error;
    }
  }

  async addComment(body: CreateCommentType): Promise<void> {
    try {
      if (body.file.fileUrl) {
        const formData = new FormData();

        const commentData: any = {
          content: body.content,
          type: body.type
        };

        if (body.type === 'task') {
          commentData.taskId = body.requestId;
        } else {
          commentData.requestId = body.requestId;
        }

        Object.entries(commentData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        const url = `https://api.telegram.org/file/bot${envConfig.get("BOT_TOKEN")}/${body.file.fileUrl}`;
        const response = await fetch(url);
        const fileBlob = await response.blob();

        const files = [new File([fileBlob], body.file.fileName, {
          type: body.file.fileMime || 'application/octet-stream'
        })];
        if (body.file.width !== undefined && body.file.height !== undefined) {
          formData.append('width', body.file.width.toString());
          formData.append('height', body.file.height.toString());
        }

        files.forEach((file) => {
          formData.append('attachments', file);
        });
        await api.post(`/comments/bot/`, formData, {
          headers: {
            'x-telegram-id': body.tgID,
            'Content-Type': 'multipart/form-data'
          },

        });
      } else {
        const commentData: any = {
          content: body.content,
          type: body.type
        };
        if (body.type === 'task') {
          commentData.taskId = body.requestId;
        } else {
          commentData.requestId = body.requestId;
        }
        await api.post(`/comments/bot/`, commentData, {
          headers: {
            'x-telegram-id': body.tgID
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при добавлении комментария к запросу:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEmployeeRequests(body: DataRequest): Promise<RequestType[]> {
    try {
      const response = await api.get(`/requests/bot/employee/${body.employeeName}`, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении запросов сотрудника:', error.response?.data || error.message);
      throw error;
    }
  }


  async changeRequestStatus(body: DataRequest): Promise<void> {
    try {
      await api.patch(`/requests/bot/${body.requestId}/status`, { status: body.status }, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса запроса:', error.response?.data || error.message);
      throw error;
    }
  }
}
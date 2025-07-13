import { DataRequest, RequestType } from "../commons/types";
import { api } from "./api";

export class RequestsService {

  async createRequest(body: DataRequest): Promise<void> {
    try {
      await api.post("/requests", body.request, {
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
      const response = await api.get("/requests", {
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
      const response = await api.get(`/requests/${body.id}`, {
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
      const response = await api.get(`/requests/status/${body.status}`, {
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
      const response = await api.get(`/requests/priority/${body.priority}`, {
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

  async addCommentToRequest(body: DataRequest): Promise<void> {
    try {
      await api.post(`/requests/${body.requestId}/comments`, { comment: body.comment }, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
    } catch (error) {
      console.error('Ошибка при добавлении комментария к запросу:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEmployeeRequests(body: DataRequest): Promise<RequestType[]> {
    try {
      const response = await api.get(`/requests/employee/${body.employeeName}`, {
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
  async getDepartmentRequests(body: DataRequest): Promise<RequestType[]> {
    try {
      const response = await api.get(`/requests/department/${body.departmentName}`, {
        headers: {
          'x-telegram-id': body.tgID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении запросов по отделу:', error.response?.data || error.message);
      throw error;
    }
  }

  async changeRequestStatus(body: DataRequest): Promise<void> {
    try {
      await api.patch(`/requests/${body.requestId}/status`, { status: body.status }, {
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
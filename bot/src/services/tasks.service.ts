import { TaskPriorityEnum, TaskStatusEnum } from "../commons/enums";
import { DataTask, Task } from "../commons/types";
import { api } from "./api";

export class TasksService {

  async getTaskById(data: DataTask): Promise<Task> {
    try {
      const res = await api.get(`/tasks/bots/${data.id}`,
        {
          headers: {
            'x-telegram-id': data.tgID
          }
        }
      );
      return res.data.data;
    } catch (error) {
      console.error('Ошибка при получении задачи:', error.response?.data || error.message);
      throw error;
    }
  }

  async getActiveTasks(data: DataTask): Promise<Task[]> {
    try {
      const res = await api.get(`/tasks/bots/`,
        {
          headers: {
            'x-telegram-id': data.tgID
          }
        }
      );
      return res.data.data;
    } catch (error) {
      console.error('Ошибка при получении активных задач:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTasksByStatus(data: DataTask): Promise<Task[] | Task> {
    try {
      const res = await api.get(`/tasks/bots/status/${data.status.toUpperCase()}`,
        {
          headers: {
            'x-telegram-id': data.tgID
          }
        }
      );
      return res.data.data;
    } catch (error) {
      console.error('Ошибка при получении задач по статусу:', error.response?.data || error.message);
      throw error;

    }
  }
  async getTasksByPriority(data: DataTask): Promise<Task[] | Task> {
    try {
      console.log('Получение задач по приоритету:', data.priority);
      const res = await api.get(`/tasks/bots/priority/${data.priority.toUpperCase()}`,
        {
          headers: {
            'x-telegram-id': data.tgID
          }
        }
      );
      return res.data.data;
    } catch (error) {
      console.error('Ошибка при получении задач по приоритету:', error.response?.data || error.message);
      throw error;

    }
  }

}
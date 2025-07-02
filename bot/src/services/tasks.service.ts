import { DataTask, Task } from "../commons/types";
import { api } from "./api";

export class TasksService {

  async getTaskById(data: DataTask): Promise<Task> {
    const res = await api.get(`/tasks/bot/${data.id}`,
      {
        headers: {
          'X-telegram-id': data.tgID
        }
      }
    );
    return res.data;
  }

  async getActiveTasks(data: DataTask) {
    const res = await api.get(`/tasks/bot/`,
      {
        headers: {
          'X-telegram-id': data.tgID
        }
      }
    );
    return res.data;
  }

  async getTasksByStatus(data: DataTask) {
    const res = await api.get(`/tasks/bot/status/${data.status}`,
      {
        headers: {
          'X-telegram-id': data.tgID
        }
      }
    );
    return res.data;
  }
  async getTasksByPriority(data: DataTask) {
    const res = await api.get(`/tasks/bot/priority/${data.priority}`,
      {
        headers: {
          'X-telegram-id': data.tgID
        }
      }
    );
    return res.data;
  }

}
import { api } from "./api";

export class TasksService {

  async getTaskById(id: number) {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  }

  async getAllTasks(tgID: number) {
    const res = await api.get(`/tasks?tgID=${tgID}`);
    return res.data;
  }

}
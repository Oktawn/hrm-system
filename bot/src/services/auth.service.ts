import { UserSession } from "../commons/session.type";
import { api } from "./api";

export class AuthService {
  async checkBot(tgID: number): Promise<UserSession> {
    try {
      const res = await api.get(`/auth/check/bot`, {
        headers: {
          'x-telegram-id': tgID
        }
      });
      return res.data as UserSession;
    } catch (error) {
      console.error('Ошибка при проверке бота:', error.response?.data || error.message);
      throw error;
    }
  }
}
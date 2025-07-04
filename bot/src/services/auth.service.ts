import { api } from "./api";

export class AuthService {
  async checkBot(tgID: number): Promise<boolean> {
    try {
      const res = await api.get(`/auth/check/bot`, {
        headers: {
          'x-telegram-id': tgID
        }
      });
      return res.data.valid;
    } catch (error) {
      console.error('Ошибка при проверке бота:', error.response?.data || error.message);
      throw error;
    }
  }
}
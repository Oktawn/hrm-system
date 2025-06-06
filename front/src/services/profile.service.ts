import type { AxiosResponse } from 'axios';
import { api } from './auth.service';
import type { 
  UpdateProfileRequest, 
  ChangePasswordRequest, 
  ProfileResponse,
} from '../types/auth.types';

export const profileAPI = {
  // Получить профиль пользователя
  getProfile: (): Promise<AxiosResponse<ProfileResponse>> =>
    api.get('/profile'),

  // Обновить профиль пользователя
  updateProfile: (data: UpdateProfileRequest): Promise<AxiosResponse<ProfileResponse>> =>
    api.put('/profile', data),

  // Изменить пароль
  changePassword: (data: ChangePasswordRequest): Promise<AxiosResponse<{ message: string }>> =>
    api.put('/profile/password', data),

  // Загрузить аватар
  uploadAvatar: (file: FormData): Promise<AxiosResponse<{ message: string; avatarUrl: string }>> =>
    api.post('/profile/avatar', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Удалить аватар
  deleteAvatar: (): Promise<AxiosResponse<{ message: string }>> =>
    api.delete('/profile/avatar'),
};

export default profileAPI;

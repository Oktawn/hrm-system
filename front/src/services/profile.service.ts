import type { AxiosResponse } from 'axios';
import { api } from './auth.service';
import type { 
  UpdateProfileRequest, 
  ChangePasswordRequest, 
  ProfileResponse,
} from '../types/auth.types';

export const profileAPI = {
  getProfile: (): Promise<AxiosResponse<ProfileResponse>> =>
    api.get('/profile'),

  updateProfile: (data: UpdateProfileRequest): Promise<AxiosResponse<ProfileResponse>> =>
    api.put('/profile', data),

  changePassword: (data: ChangePasswordRequest): Promise<AxiosResponse<{ message: string }>> =>
    api.put('/profile/password', data),

  uploadAvatar: (file: FormData): Promise<AxiosResponse<{ message: string; avatarUrl: string }>> =>
    api.post('/profile/avatar', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteAvatar: (): Promise<AxiosResponse<{ message: string }>> =>
    api.delete('/profile/avatar'),
};

export default profileAPI;

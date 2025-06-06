import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authMiddleware } from '../auth/auth.middleware';

export const profileRouter = Router();
const profileController = new ProfileController();


// Все роуты требуют авторизации;

profileRouter.get('/', authMiddleware(), profileController.getProfile);
profileRouter.put('/', authMiddleware(), profileController.updateProfile);
profileRouter.put('/password', authMiddleware(), profileController.changePassword);

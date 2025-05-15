import { Router } from 'express';
import { AuthController } from './auth.controller';

export const authRouter = Router();
const authController = new AuthController();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refreshToken);
authRouter.post('/logout', authController.logout);

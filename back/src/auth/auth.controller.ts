import { Request, Response, NextFunction } from 'express';
import { AuthService } from "./auth.service";
import { ILogin, IRegister } from './auth.interface';
import { jwtConfig } from '../config/jwt.config';


const authService = new AuthService();

export class AuthController {

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: IRegister = req.body;
      return authService.registerUser(userData);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const logingData: ILogin = req.body;
      const result = await authService.login(logingData);
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        maxAge: jwtConfig.getExpiration("JWT_EXPIRES_IN"),
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict"
      })
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        maxAge: jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"),
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict"
      })
      res.status(200).json({
        message: 'Login successful',
      })
    } catch (error) {
      next(error);
    }
  }
}

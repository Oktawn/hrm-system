import { Request, Response, NextFunction } from 'express';
import { AuthService } from "./auth.service";
import { ILogin, IRegister, TokenPayload } from './auth.interface';
import { jwtConfig } from '../config/jwt.config';
import jwt from 'jsonwebtoken';


const authService = new AuthService();

export class AuthController {

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: IRegister = req.body;
      await authService.registerUser(userData);
      res.status(201).json({
        message: 'User registered successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(409).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: 'Internal server error',
        });
      }
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
        user: result.data
      })
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (refreshToken) {
        const payload = jwt.decode(refreshToken) as TokenPayload;
        if (payload.userId) {
          await authService.logout(payload.userId);
        }
      }
      
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.status(200).json({
        message: 'Logout successful',
      });
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided" });
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        maxAge: jwtConfig.getExpiration("JWT_EXPIRES_IN"),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        maxAge: jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        message: 'Tokens refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async checkToken(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies.access_token;
      
      if (!accessToken) {
        res.status(401).json({ message: "No access token provided", valid: false });
        return;
      }

      const payload = await authService.verifyAccessToken(accessToken);
      const userData = await authService.getUserData(payload.userId);
      
      res.status(200).json({ 
        message: "Token is valid", 
        valid: true,
        user: userData
      });
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token", valid: false });
    }
  }
}

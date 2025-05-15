import { Request, Response, NextFunction } from 'express';
import { UserRoleEnum } from '../commons/enums/enums';
import { verify } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { TokenPayload } from './auth.interface';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(requiredRoles?: UserRoleEnum[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const token = authHeader.split(" ")[1];
    try {
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(payload.role as UserRoleEnum)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
}

function verifyToken(token: string) {
  return verify(token, jwtConfig.get("JWT_SECRET")) as TokenPayload;
}
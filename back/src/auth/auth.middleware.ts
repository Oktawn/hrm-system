import { Response, NextFunction } from 'express';
import { UserRoleEnum } from '../commons/enums/enums';
import { verify } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { AuthenticatedRequest, TokenPayload } from './auth.interface';

export function authMiddleware(requiredRoles?: UserRoleEnum[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      res.status(401).json({ message: "No access token provided" });
      return;
    }

    try {
      const payload = verifyToken(accessToken);

      if (checkRole(payload, requiredRoles)) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired access token" });
      return;
    }
  };
}

function verifyToken(token: string) {
  return verify(token, jwtConfig.get("JWT_SECRET")) as TokenPayload;
}

function checkRole(payload: TokenPayload, roles?: UserRoleEnum[]) {
  return roles && roles.length > 0 &&
    !roles.includes(payload.role as UserRoleEnum);
}
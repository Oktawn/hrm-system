import { Response, NextFunction } from 'express';
import { UserRoleEnum } from '../commons/enums/enums';
import { decode, JwtPayload, TokenExpiredError, verify } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { AuthenticatedRequest, TokenPayload } from './auth.interface';
import { AuthService } from './auth.service';
import ms from 'ms';
const authService = new AuthService();

export function authMiddleware(requiredRoles?: UserRoleEnum[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    if (accessToken && refreshToken) {
      try {
        const payload = verifyToken(accessToken);
        if (checkRole(payload, requiredRoles)) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }
        req.user = payload;
        if (((decode(refreshToken) as JwtPayload).exp - (Date.now() * 1000)) < ms("1d")) {
          console.log("updated refresh token");
        }
        else {
          next();
          return;
        }
      } catch (error) {
        if (!(error instanceof TokenExpiredError)) {
          res.status(401).json({ message: "Invalid access token" });
          return;
        }

        if (!refreshToken) {
          res.status(401).json({ message: "Access token expired, no refresh token provided" });
          return;
        }
      }
    }

    if (refreshToken) {
      try {
        const refreshPayload = verifyToken(refreshToken);

        const newTokens = await authService.generateTokens(refreshPayload);
        res.cookie("access_token", newTokens.accessToken, {
          httpOnly: true,
          maxAge: jwtConfig.getExpiration("JWT_EXPIRES_IN"),
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        res.cookie("refresh_token", newTokens.refreshToken, {
          httpOnly: true,
          maxAge: jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"),
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });


        const newAccessTokenPayload = verifyToken(newTokens.accessToken);
        req.user = newAccessTokenPayload;
        next();
        return;
      } catch (error) {
        res.status(401).json({ message: "Invalid or expired refresh token" });
        return;
      }
    }

    res.status(401).json({ message: "Unauthorized - No valid tokens provided" });
  };
}


function verifyToken(token: string) {
  return verify(token, jwtConfig.get("JWT_SECRET")) as TokenPayload;
}

function checkRole(payload: TokenPayload, roles?: UserRoleEnum[]) {
  return roles && roles.length > 0 &&
    !roles.includes(payload.role as UserRoleEnum);
}
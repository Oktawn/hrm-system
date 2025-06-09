import createError from "http-errors";
import { ILogin, IRegister, TokenPayload } from "./auth.interface";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { employeeRepository, refreshTokenRepository, userRepository } from "../db/db-rep";

export class AuthService {

  async registerUser(userData: IRegister) {
    const exUser = await userRepository.findOneBy({ email: userData.email });
    if (exUser) {
      throw createError(409, "User already exists");
    }
    const newUser = userRepository.create({
      email: userData.email,
      password: hashSync(userData.password, 12),
    })

    try {
      await userRepository.save(newUser);
      const newEmployee = employeeRepository.create({
        user: newUser
      });
      await employeeRepository.save(newEmployee);
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async login(userData: ILogin) {
    const user = await userRepository.findOne({
      where: { email: userData.email },
      relations: ["employee"]
    })
    const isvalidPass = compareSync(userData.password, user.password);
    if (!user || !isvalidPass) {
      throw createError(401, "Invalid email or password");
    }
    try {
      const tokens = await this.generateTokens({
        userId: user.id,
        role: user.role,
      })

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        data: {
          id: user.id,
          employeeId: user.employee?.id || null,
          email: user.email,
          role: user.role,
          firstName: user.employee?.firstName || null,
          lastName: user.employee?.lastName || null,
          phone: user.employee?.phone || null,
          position: user.employee?.position?.name || null,
          department: user.employee?.department?.name || null,
        }
      };
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async generateTokens(payload: TokenPayload) {
    const clearPayload: TokenPayload = {
      userId: payload.userId,
      role: payload.role,
    }
    const tokens = await Promise.all([
      this.generateAccessToken(clearPayload),
      this.generateRefreshToken(clearPayload)
    ]).catch((error) => {
      console.log("Error generating tokens", error);
      throw createError(500, "Internal server error");
    });
    return {
      accessToken: tokens[0],
      refreshToken: tokens[1]
    }
  }

  async generateAccessToken(payload: TokenPayload) {
    const clearPayload: TokenPayload = {
      userId: payload.userId,
      role: payload.role,
    };
    const accessToken = jwt.sign(clearPayload, jwtConfig.get("JWT_SECRET"), {
      expiresIn: jwtConfig.getExpiration("JWT_EXPIRES_IN")
    });
    return accessToken;
  }

  async generateRefreshToken(payload: TokenPayload) {
    const clearPayload: TokenPayload = {
      userId: payload.userId,
      role: payload.role,
    }
    const refreshToken = jwt.sign(clearPayload, jwtConfig.get("JWT_SECRET"), {
      expiresIn: jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION")
    });
    try {
      const token = await refreshTokenRepository.findOneBy({ user: { id: payload.userId } });
      if (token) {
        await refreshTokenRepository.remove(token);
      };
      const newToken = refreshTokenRepository.create({
        tokens: refreshToken,
        user: { id: payload.userId },
        expires_at: new Date(Date.now() + jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"))
      });
      await refreshTokenRepository.save(newToken);
      return refreshToken;
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, jwtConfig.get("JWT_SECRET")) as TokenPayload;

      const tokenRecord = await refreshTokenRepository.findOne({
        where: {
          tokens: refreshToken,
          user: { id: payload.userId }
        },
        relations: ["user"]
      });

      if (!tokenRecord) {
        throw createError(401, "Invalid refresh token");
      }

      if (tokenRecord.expires_at < new Date()) {
        await refreshTokenRepository.remove(tokenRecord);
        throw createError(401, "Refresh token expired");
      }


      const newAccessToken = await this.generateAccessToken({
        userId: payload.userId,
        role: payload.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken 
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw createError(401, "Invalid refresh token");
      }
      throw error;
    }
  }

  async verifyAccessToken(accessToken: string): Promise<TokenPayload> {
    try {
      return jwt.verify(accessToken, jwtConfig.get("JWT_SECRET")) as TokenPayload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError(401, "Access token expired");
      }
      throw createError(401, "Invalid access token");
    }
  }

  async getUserData(userId: string) {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["employee", "employee.position", "employee.department"]
    });

    if (!user) {
      throw createError(404, "User not found");
    }

    return {
      id: user.id,
      employeeId: user.employee?.id || null,
      email: user.email,
      role: user.role,
      firstName: user.employee?.firstName || null,
      lastName: user.employee?.lastName || null,
      phone: user.employee?.phone || null,
      position: user.employee?.position?.name || null,
      department: user.employee?.department?.name || null,
    };
  }

  async logout(userId: string) {
    try {
      const token = await refreshTokenRepository.findOneBy({ user: { id: userId } });
      if (token) {
        await refreshTokenRepository.remove(token);
      }
    } catch (error) {
      throw createError(500, "Internal server error during logout");
    }
  }

}
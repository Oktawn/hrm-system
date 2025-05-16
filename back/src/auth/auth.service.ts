import createError from "http-errors";
import { ILogin, IRegister, TokenPayload } from "./auth.interface";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { refreshTokenRepository, userRepository } from "../db/db-rep";

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
      return tokens;
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, jwtConfig.get("JWT_SECRET"), {
      expiresIn: jwtConfig.getExpiration("JWT_EXPIRES_IN"),
    })
    const refreshToken = await this.generateRefreshToken(payload.userId);
    return { accessToken, refreshToken }
  }

  async generateRefreshToken(userId: string) {
    const refreshToken = jwt.sign({ userId }, jwtConfig.get("JWT_SECRET"), {
      expiresIn: jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION")
    });
    const token = await refreshTokenRepository.findOneBy({ user: { id: userId } });
    if (token) {
      await refreshTokenRepository.delete(token);
    };
    const newToken = refreshTokenRepository.create({
      tokens: refreshToken,
      user: { id: userId },
      expires_at: new Date(Date.now() + jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"))
    });
    try {
      refreshTokenRepository.save(newToken);
      return refreshToken;
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async updateRefreshToken(token: string) {
    const tokenData = await refreshTokenRepository.findOne({ where: { tokens: token }, relations: ["user"] });
    if (!tokenData) {
      throw createError(401, "Invalid token");
    }
    return this.generateRefreshToken(tokenData.user.id);

  }

}
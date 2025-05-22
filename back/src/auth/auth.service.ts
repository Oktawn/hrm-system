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
      return tokens;
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async generateTokens(payload: TokenPayload) {
    const tokens = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload)
    ]);
    return {
      accessToken: tokens[0],
      refreshToken: tokens[1]
    }
  }

  async generateAccessToken(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, jwtConfig.get("JWT_SECRET"), {
      expiresIn: jwtConfig.getExpiration("JWT_EXPIRES_IN")
    });
    return accessToken;
  }

  async generateRefreshToken(payload: TokenPayload) {
    const refreshToken = jwt.sign(payload, jwtConfig.get("JWT_SECRET"), {
      expiresIn: jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION")
    });
    const token = await refreshTokenRepository.findOneBy({ user: { id: payload.userId } });
    if (token) {
      await refreshTokenRepository.delete(token);
    };
    const newToken = refreshTokenRepository.create({
      tokens: refreshToken,
      user: { id: payload.userId },
      expires_at: new Date(Date.now() + jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"))
    });
    try {
      await refreshTokenRepository.save(newToken);
      return refreshToken;
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

}
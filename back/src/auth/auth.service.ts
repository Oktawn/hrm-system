import createError from "http-errors";
import { AppDataSource } from "../data-source";
import { EmployeesEntity } from "../entities/employees.entity";
import { UsersEntity } from "../entities/users.entity";
import { ILogin, IRegister, TokenPayload } from "./auth.interface";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { RefreshTokenEnity } from "../entities/refresh-tokens.entity";

const userRep = AppDataSource.getRepository(UsersEntity);
const employeesRep = AppDataSource.getRepository(EmployeesEntity);
const refreshTokenRep = AppDataSource.getRepository(RefreshTokenEnity);

export class AuthService {

  async registerUser(userData: IRegister) {
    const exUser = await userRep.findOneBy({ email: userData.email });
    if (exUser) {
      throw createError(409, "User already exists");
    }
    const newUser = userRep.create({
      email: userData.email,
      password: hashSync(userData.password, 12),
    })

    try {
      await userRep.save(newUser);
      const newEmployee = employeesRep.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        user: newUser,
      });
      employeesRep.save(newEmployee);
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async login(userData: ILogin) {
    const user = await userRep.findOne({
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
    const token = await refreshTokenRep.findOneBy({ user: { id: userId } });
    if (token) {
      await refreshTokenRep.delete(token);
    };
    const newToken = refreshTokenRep.create({
      tokens: refreshToken,
      user: { id: userId },
      expires_at: new Date(Date.now() + jwtConfig.getExpiration("JWT_REFRESH_EXPIRATION"))
    });
    try {
      refreshTokenRep.save(newToken);
      return refreshToken;
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

  async updateRefreshToken(token: string) {
    const tokenData = await refreshTokenRep.findOne({ where: { tokens: token }, relations: ["user"] });
    if (!tokenData) {
      throw createError(401, "Invalid token");
    }
    return this.generateRefreshToken(tokenData.user.id);

  }

}
import path from "node:path";
import { config } from "dotenv";
import ms from "ms";

interface IJwtConfig {
  JWT_SECRET: string;
  JWT_REFRESH_EXPIRATION: ms.StringValue;
  JWT_EXPIRES_IN: ms.StringValue;
}

class JwtConfig {
  constructor() {
    const jwtPath = path.resolve(__dirname, "jwt.env");
    const { error, parsed } = config({ path: jwtPath });
    if (error) {
      throw new Error(`Error loading .env file: ${error}`);
    }
    if (!parsed) {
      throw new Error("Error parsing .env file");
    }
  }
  public get(key: (keyof IJwtConfig)): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
  public getExpiration(key: (keyof IJwtConfig)) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return ms(value as ms.StringValue);
  }
}

export const jwtConfig = new JwtConfig();
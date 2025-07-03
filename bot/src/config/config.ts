import path from "path";
import { config } from "dotenv";

interface IEnvConfig {
  BOT_TOKEN: string;
  BOT_ID: string;
  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_EXTERNAL_PORT: number;
  DB_PORT: number;
  ORIGIN_FRONTEND: string;
}


class EnvConfig {
  constructor() {
    if (process.env.NODE_ENV === "production") {
      return;
    }
    const envPath = path.resolve(__dirname, "../../.env");
    const { error, parsed } = config({ path: envPath });
    if (error) {
      throw new Error(`Error loading .env file: ${error}`);
    }
    if (!parsed) {
      throw new Error("Error parsing .env file");
    }
  }

  public get(key: (keyof IEnvConfig)): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
}

export const envConfig = new EnvConfig();
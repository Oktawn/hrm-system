import { Knex } from "knex";
import { envConfig } from "../config";
import path from "path";

const nodeEnv = process.env.NODE_ENV || "development";

console.log(`Using environment: ${nodeEnv}`);

const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: "postgresql",
    connection: {
      host: "localhost",
      port: Number(envConfig.get("DB_EXTERNAL_PORT")),
      database: envConfig.get("DB_DATABASE"),
      user: envConfig.get("DB_USERNAME"),
      password: envConfig.get("DB_PASSWORD")
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, "../db/migrations"),
      extension: "ts"
    },
    seeds: {
      directory: path.join(__dirname, "../db/seeds"),
      extension: "ts"
    }
  },
  production: {
    client: "postgresql",
    connection: {
      host: envConfig.get("DB_HOST"),
      port: Number(envConfig.get("DB_PORT")),
      database: envConfig.get("DB_DATABASE"),
      user: envConfig.get("DB_USERNAME"),
      password: envConfig.get("DB_PASSWORD")
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./dist/db/migrations",
      extension: "js"
    },
    seeds: {
      directory: "./dist/db/seeds",
      extension: "js"
    }
  },
};

export default knexConfig[nodeEnv] || knexConfig.development;

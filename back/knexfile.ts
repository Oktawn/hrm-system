import type { Knex } from "knex";
import { envConfig } from "./src/config/config";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
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
      directory: "./src/migrations",
    },
    seeds: {
      directory: "./src/seeds",
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
      directory: "./src/migrations",
    },
    seeds: {
      directory: "./src/seeds",
    }
  }

};

module.exports = config;

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import "reflect-metadata";
import { envConfig } from './config/config';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: envConfig.get("DB_HOST"),
  port: Number(envConfig.get("DB_PORT")),
  username: envConfig.get("DB_USERNAME"),
  password: envConfig.get("DB_PASSWORD"),
  database: envConfig.get("DB_DATABASE"),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  cache: {
    duration: 10000
  },
});
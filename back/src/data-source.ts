import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import "reflect-metadata";
import { envConfig } from './config/config';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  port: Number(envConfig.get("DB_EXTERNAL_PORT")),
  username: envConfig.get("DB_USERNAME"),
  password: envConfig.get("DB_PASSWORD"),
  database: envConfig.get("DB_DATABASE"),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  cache: {
    duration: 10000
  },
});
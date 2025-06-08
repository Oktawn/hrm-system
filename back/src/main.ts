import express from 'express';
import cors from 'cors';
import { envConfig } from './config/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './auth/auth.router';
import { AppDataSource } from './data-source';
import { employeesRouter } from './employees/employees.router';
import { taskRouter } from './tasks/tasks.router';
import { requestRouter } from './requests/requests.router';
import { profileRouter } from './profile/profile.router';
import { departmentsRouter } from './departments/departments.router';
import { positionsRouter } from './positions/positions.router';
import { commentsRouter } from './comments/comments.router';

const app = express();
const port = envConfig.get("API_PORT");
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Разрешенные origins для фронтенда
  credentials: true, // Разрешить отправку cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/requests", requestRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/comments", commentsRouter);

AppDataSource.initialize()
  .then(() => {
    console.log('Соединение с базой данных установлено');

    app.listen(port, () => {
      console.log(`Сервер запущен на порту ${port}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка при инициализации соединения с базой данных', err);
  });
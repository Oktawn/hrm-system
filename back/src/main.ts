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

const app = express();
const port = envConfig.get("API_PORT");
app.use(cors({
  credentials: true,
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/requests", requestRouter);

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
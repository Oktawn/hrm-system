import express from 'express';
import cors from 'cors';
import { envConfig } from './config/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './auth/auth.router';

const app = express();
const port = envConfig.get("API_PORT");
app.use(cors({
  credentials: true,
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
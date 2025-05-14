import express from 'express';
import cors from 'cors';
import { envConfig } from './config/config';

const app = express();
const port = envConfig.get("API_PORT");
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);
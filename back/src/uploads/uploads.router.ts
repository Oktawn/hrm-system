import { Router } from 'express';
import { UploadsController } from './uploads.controller';
import { authMiddleware } from '../auth/auth.middleware';

const uploadsRouter = Router();
const uploadsController = new UploadsController();

// Загрузка файлов (требует аутентификации)
uploadsRouter.post('/upload', authMiddleware(), uploadsController.uploadFiles.bind(uploadsController));

// Скачивание файла
uploadsRouter.get('/download/:filename', uploadsController.downloadFile.bind(uploadsController));

// Просмотр файла (для изображений)
uploadsRouter.get('/view/:filename', uploadsController.viewFile.bind(uploadsController));

export { uploadsRouter };

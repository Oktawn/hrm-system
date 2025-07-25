import { Router } from 'express';
import { UploadsController } from './uploads.controller';
import { authMiddleware } from '../auth/auth.middleware';

const uploadsRouter = Router();
const uploadsController = new UploadsController();

uploadsRouter.post('/upload', authMiddleware(), uploadsController.uploadFiles.bind(uploadsController));
uploadsRouter.get('/download/:fileId', uploadsController.downloadFile.bind(uploadsController));
uploadsRouter.get('/view/:fileId', uploadsController.viewFile.bind(uploadsController));

export { uploadsRouter };

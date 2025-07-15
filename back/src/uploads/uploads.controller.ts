import { Request, Response, NextFunction } from 'express';
import { uploadMultiple, createAttachment } from '../middleware/upload.middleware';
import { AuthenticatedRequest } from '../auth/auth.interface';
import mime from 'mime-types';
import path from 'path';
import fs from 'fs';

export class UploadsController {
  private uploadsDir = "/app/uploads";
  async uploadFiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Не выбраны файлы для загрузки'
        });
      }

      const attachments = (req.files as Express.Multer.File[]).map(createAttachment);

      res.status(200).json({
        success: true,
        message: 'Файлы успешно загружены',
        data: attachments
      });
    });
  }

  async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;

      let filePath = path.join(this.uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        filePath = path.join(this.uploadsDir, 'documents', filename);
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      res.download(filePath);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      next(error);
    }
  }

  async viewFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;

      let filePath = path.join(this.uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        filePath = path.join(this.uploadsDir, 'documents', filename);
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      const mimeType = mime.lookup(filePath);

      if (mimeType) {
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', 'inline');
      }

      if (mimeType && mimeType.startsWith('image/')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }

      const absolutePath = path.resolve(filePath);
      res.sendFile(absolutePath);
    } catch (error) {
      console.error('Ошибка при просмотре файла:', error);
      next(error);
    }
  }
}

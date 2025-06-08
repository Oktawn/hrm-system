import { Request, Response, NextFunction } from 'express';
import { uploadMultiple, createAttachment } from '../middleware/upload.middleware';
import { AuthenticatedRequest } from '../auth/auth.interface';
import path from 'path';
import fs from 'fs';

export class UploadsController {
  // Загрузка файлов
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

      // Создаем объекты attachment для каждого файла
      const attachments = (req.files as Express.Multer.File[]).map(createAttachment);

      res.status(200).json({
        success: true,
        message: 'Файлы успешно загружены',
        data: attachments
      });
    });
  }

  // Скачивание файла
  async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadsDir, filename);

      // Проверяем существование файла
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      // Отправляем файл
      res.download(filePath);
    } catch (error) {
      next(error);
    }
  }

  // Просмотр файла (для изображений)
  async viewFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadsDir, filename);

      // Проверяем существование файла
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      // Отправляем файл для просмотра
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

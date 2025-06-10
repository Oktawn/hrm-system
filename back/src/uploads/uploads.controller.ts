import { Request, Response, NextFunction } from 'express';
import { uploadMultiple, createAttachment } from '../middleware/upload.middleware';
import { AuthenticatedRequest } from '../auth/auth.interface';
import path from 'path';
import fs from 'fs';

export class UploadsController {
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
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      let filePath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        filePath = path.join(uploadsDir, 'documents', filename);
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      res.download(filePath);
    } catch (error) {
      next(error);
    }
  }

  async viewFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

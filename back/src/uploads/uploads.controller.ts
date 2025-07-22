import { Request, Response, NextFunction } from 'express';
import { uploadMultiple } from '../middleware/upload.middleware';
import { AuthenticatedRequest } from '../auth/auth.interface';
import { GoogleDrive } from '../google-drive/drive';
import fs from 'fs';

export class UploadsController {
  private googleDrive = new GoogleDrive();

  async uploadFiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      uploadMultiple(req, res, async (err: any) => {
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

        try {
          const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
            const fileStream = fs.createReadStream(file.path);

            const fileId = await this.googleDrive.uploadFile(
              file.originalname,
              file.mimetype,
              fileStream
            );

            fs.unlinkSync(file.path);

            return {
              fileId,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              uploadDate: new Date()
            };
          });

          const attachments = await Promise.all(uploadPromises);

          res.status(200).json({
            success: true,
            message: 'Файлы успешно загружены в Google Drive',
            data: attachments
          });
        } catch (uploadError) {
          console.error('Ошибка при загрузке в Google Drive:', uploadError);
          res.status(500).json({
            success: false,
            message: 'Ошибка при загрузке файлов в Google Drive'
          });
        }
      });
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при загрузке файлов'
      });
      next(error);
    }
  }

  async downloadFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      await this.googleDrive.downloadFileToResponse(fileId, res);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      res.status(404).json({
        success: false,
        message: 'Файл не найден или ошибка доступа'
      });
    }
  }

  async viewFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const fileMetadata = await this.googleDrive.getFileMetadata(fileId);

      if (!fileMetadata) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      const fileStream = await this.googleDrive.downloadFile(fileId);

      res.setHeader('Content-Type', fileMetadata.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', 'inline');

      if (fileMetadata.mimeType && fileMetadata.mimeType.startsWith('image/')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }

      fileStream.pipe(res);
    } catch (error) {
      console.error('Ошибка при просмотре файла:', error);
      res.status(404).json({
        success: false,
        message: 'Файл не найден или ошибка доступа'
      });
    }
  }
}

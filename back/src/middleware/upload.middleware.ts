import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleDrive } from '../google-drive/drive';

const uploadsDir = "/tmp/uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);

    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_: any, _file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

export const uploadMultiple = upload.array('attachments', 5);

export const uploadSingle = upload.single('file');

export const createAttachment = async (file: Express.Multer.File) => {
  let originalName = file.originalname;
  try {
    if (Buffer.isBuffer(file.originalname)) {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } else if (typeof file.originalname === 'string') {
      const testBytes = Buffer.from(file.originalname, 'latin1');
      const decoded = testBytes.toString('utf8');
      if (!/[\uFFFD\u0000-\u001F]/.test(decoded)) {
        originalName = decoded;
      }
    }
  } catch (error) {
    console.warn('Ошибка при обработке имени файла:', error);
  }

  const googleDrive = new GoogleDrive();
  const fileStream = fs.createReadStream(file.path);

  try {
    const fileId = await googleDrive.uploadFile(
      originalName,
      file.mimetype,
      fileStream
    );


    return {
      fileId,
      originalName: originalName,
      mimetype: file.mimetype,
      size: file.size,
      uploadDate: new Date()
    };
  } catch (error) {
    console.error('Ошибка при загрузке в Google Drive:', error);
    throw error;
  }
  finally {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};


import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = "/app/uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);

    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'));
  }
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

export const createAttachment = (file: Express.Multer.File) => {
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

  return {
    filename: file.filename,
    originalName: originalName,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    uploadDate: new Date()
  };
};

export const deleteFile = (filename: string) => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

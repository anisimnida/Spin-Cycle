import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

// Multer configuration for image uploads
export const multerImageConfig: MulterOptions = {
  storage: memoryStorage(),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!validMimeTypes.includes(file.mimetype)) {
      return cb(new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max file size for images
  },
};

// Multer configuration for CSV uploads
export const multerCsvConfig: MulterOptions = {
  storage: memoryStorage(),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new BadRequestException('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size for CSV
  },
};

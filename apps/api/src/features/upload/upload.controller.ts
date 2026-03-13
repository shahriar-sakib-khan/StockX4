import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';
import { logger } from '../../config/logger';

export const UploadController = {
  uploadFile: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'stockx/brands', // Organize uploads
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error: ' + JSON.stringify(error));
            return res.status(500).json({ message: 'Upload failed' });
          }
          res.status(200).json({ url: result?.secure_url });
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    } catch (error) {
      logger.error('Upload error: ' + (error as Error).message);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

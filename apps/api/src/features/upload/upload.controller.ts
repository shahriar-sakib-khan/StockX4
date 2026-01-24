import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';

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
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Upload failed' });
          }
          res.status(200).json({ url: result?.secure_url });
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

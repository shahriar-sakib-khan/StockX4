import { Router } from 'express';
import { UploadController } from './upload.controller';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.post('/', upload.single('file'), UploadController.uploadFile);

export const UploadRoutes: Router = router;

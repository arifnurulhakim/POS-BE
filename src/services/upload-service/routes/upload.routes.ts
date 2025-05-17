import express from 'express';
import multer from 'multer';
// import { uploadMiddleware } from '../middlewares/upload.middleware';
import * as UploadController from '../controllers/upload.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = express.Router();

// Setup Multer
const storage = multer.diskStorage({
  destination: 'uploads/storage',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/create', uploadMiddleware, upload.single('file'), uploadMiddleware, UploadController.uploadFile);
router.get('/list', uploadMiddleware, UploadController.getAllUploads);
router.get('/show/:id', uploadMiddleware, UploadController.getUploadById);
router.delete('/delete/:id', uploadMiddleware, UploadController.deleteUpload);

export default router;
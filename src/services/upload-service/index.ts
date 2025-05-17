import express from 'express';
import uploadRoutes from './routes/upload.routes';

const uploadService = express();

// Middleware untuk parsing JSON
uploadService.use(express.json());

// Menggunakan rute upload
uploadService.use(uploadRoutes);

export default uploadService;
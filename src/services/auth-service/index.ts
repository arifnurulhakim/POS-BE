import express from 'express';
import authRoutes from './routes/auth.routes';

const authService = express();

// Middleware untuk parsing JSON
authService.use(express.json());

// Menggunakan rute auth
authService.use(authRoutes);

export default authService;
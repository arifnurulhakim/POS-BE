import express from 'express';
import transactionRoutes from './routes/transaction.routes';

const transactionService = express();

// Middleware untuk parsing JSON
transactionService.use(express.json());

// Menggunakan rute transaction
transactionService.use(transactionRoutes);

export default transactionService;
// src/routes/transactionRoutes.ts
import express from 'express';
// import { transactionMiddleware } from '../middlewares/transaction.middleware'; // Middleware untuk autentikasi
import * as TransactionController from '../controllers/transaction.controller';

const router = express.Router();

// Menambahkan middleware 'transactionMiddleware' pada rute yang membutuhkan autentikasi
router.get('/list',  TransactionController.getTransactions); // Melindungi rute GET /transactions
router.get('/show/:id',  TransactionController.getTransactionById); // Melindungi rute GET /transactions
router.get('/email/:email',  TransactionController.getTransactionsByEmail); // Melindungi rute GET /transactions
router.post('/create',  TransactionController.createTransaction); // Melindungi rute POST /transactions
router.post('/notif',  TransactionController.notifMidtrans); // Melindungi rute POST /transactions
// router.put('/update/:id',  TransactionController.updateTransaction); // Melindungi rute PUT /transactions/:id
// router.delete('/delete/:id',  TransactionController.deleteTransaction); // Melindungi rute DELETE /transactions/:id

export default router;
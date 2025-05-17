import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

const app = express();

// Middleware untuk parsing JSON
app.use(cors());
app.use(bodyParser.json());

// Mengimpor auth service dari services/auth-service
import authService from '../services/auth-service';
import productService from '../services/product-service';
import transactionService from '../services/transaction-service';

// Menggunakan auth service di aplikasi utama
app.use('/api/auth', authService);
app.use('/api/product', productService);
app.use('/api/transaction', transactionService);

// Menangani jika rute tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: 'Service not found' });
});

// Menjalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
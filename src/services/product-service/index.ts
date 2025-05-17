import express from 'express';
import productRoutes from './routes/product.routes';

const productService = express();

// Middleware untuk parsing JSON
productService.use(express.json());

// Menggunakan rute product
productService.use(productRoutes);

export default productService;
// src/routes/productRoutes.ts
import express from 'express';
import { productMiddleware } from '../middlewares/product.middleware'; // Middleware untuk autentikasi
import * as ProductController from '../controllers/product.controller';

const router = express.Router();

// Menambahkan middleware 'productMiddleware' pada rute yang membutuhkan autentikasi
router.get('/list', productMiddleware, ProductController.getAllProducts); // Melindungi rute GET /products
router.get('/show/:id', productMiddleware, ProductController.getProductById); // Melindungi rute GET /products
router.post('/create', productMiddleware, ProductController.createProduct); // Melindungi rute POST /products
router.put('/update/:id', productMiddleware, ProductController.updateProduct); // Melindungi rute PUT /products/:id
router.delete('/delete/:id', productMiddleware, ProductController.deleteProduct); // Melindungi rute DELETE /products/:id

export default router;
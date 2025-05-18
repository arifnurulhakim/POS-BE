import express from 'express';
import { productMiddleware } from '../middlewares/product.middleware';
import { upload } from '../middlewares/upload.middleware';
import * as ProductController from '../controllers/product.controller';

const router = express.Router();

// Rute produk dengan autentikasi dan (jika perlu) upload file
router.get('/list', productMiddleware, ProductController.getAllProducts);
router.get('/show/:id', productMiddleware, ProductController.getProductById);

// Gunakan upload.single('image') untuk rute yang menerima file gambar
router.post(
  '/create',
  productMiddleware,
  upload.single('image'), // `image` = nama field pada form
  ProductController.createProduct
);

router.put(
  '/update/:id',
  productMiddleware,
  upload.single('image'), // memungkinkan update dengan file baru
  ProductController.updateProduct
);

router.delete('/delete/:id', productMiddleware, ProductController.deleteProduct);

export default router;
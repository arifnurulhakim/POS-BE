import { Request, Response } from 'express';
import ProductRepository from '../repositories/product.repository';
import path from 'path';
import fs from 'fs';

import { Multer } from "multer";

// Tambahkan typing agar req.file dikenali
interface MulterRequest extends Request {
  file: Express.Multer.File;
}


export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page)) : 1;
    const rows = req.query.rows ? parseInt(String(req.query.rows)) : 10;
    const orderKey = req.query.orderKey ? String(req.query.orderKey) : 'created_at';
    const orderRule = req.query.orderRule === 'asc' ? 'asc' : 'desc';

    const offset = (page - 1) * rows;

    // Build basic query without filters
    const query = {
      orderBy: {
        [orderKey]: orderRule,
      },
      skip: offset,
      take: rows,
    };

    const products = await ProductRepository.findAll(query);

    res.status(200).json({
      status: 'success',
      message: 'Fetched all products',
      data: products,
      meta: {
        page,
        rows,
        orderKey,
        orderRule,
      },
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching products',
      error,
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await ProductRepository.findById(id);

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching product',
      error,
    });
  }
};


export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { name, description, price, stock } = req.body;

    // Validasi input
    if (!name || name.trim().length < 3) {
      res.status(400).json({
        status: "error",
        message: "Name must be at least 3 characters",
      });
      return;
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock) || parsedPrice <= 0 || parsedStock < 0) {
      res.status(400).json({
        status: "error",
        message: "Price must be > 0 and stock must be >= 0",
      });
      return;
    }

    // Path image
    let image_url = "";
    if (file) {
      // Simpan path relatif dari public root (bukan src/)
      image_url = path.join("storage/product", file.filename).replace(/\\/g, "/");
    }

    // Simpan ke DB
    const product = await ProductRepository.createProduct({
      name: name.trim(),
      description,
      price: parsedPrice,
      stock: parsedStock,
      image_url,
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    const file = req.file;

    // Cari data produk lama
    const existingProduct = await ProductRepository.findById(id);
    if (!existingProduct) {
      res.status(404).json({
        status: "error",
        message: "Product not found",
      });
      return;
    }

    // Validasi input
    if (name && name.trim().length < 3) {
      res.status(400).json({
        status: "error",
        message: "Name must be at least 3 characters",
      });
      return;
    }

    const parsedPrice = price !== undefined ? Number(price) : existingProduct.price;
    const parsedStock = stock !== undefined ? Number(stock) : existingProduct.stock;

    if (
      (price !== undefined && (isNaN(parsedPrice) || parsedPrice <= 0)) ||
      (stock !== undefined && (isNaN(parsedStock) || parsedStock < 0))
    ) {
      res.status(400).json({
        status: "error",
        message: "Price must be > 0 and stock must be >= 0",
      });
      return;
    }

    // Tangani file baru jika ada
    let image_url = existingProduct.image_url || "";
    if (file) {
      image_url = path.join("storage/product", file.filename).replace(/\\/g, "/");
    }

    const updatedProduct = await ProductRepository.updateProduct(id, {
      name: name?.trim() ?? existingProduct.name,
      description: description ?? existingProduct.description,
      price: parsedPrice,
      stock: parsedStock,
      image_url,
    });

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating product",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await ProductRepository.findById(id);

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    await ProductRepository.deleteProduct(id);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting product',
      error,
    });
  }
};
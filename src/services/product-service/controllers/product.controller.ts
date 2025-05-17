import { Request, Response } from 'express';
import ProductRepository from '../repositories/product.repository';

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
    const { name, description, price, stock, image_url } = req.body;

    if (!name || name.trim().length < 3) {
      res.status(400).json({
        status: 'error',
        message: 'Name must be at least 3 characters',
      });
      return;
    }

    if (!price || stock < 0) {
      res.status(400).json({
        status: 'error',
        message: 'Price and stock must be provided',
      });
      return;
    }

    const product = await ProductRepository.createProduct({
      name,
      description,
      price,
      stock,
      image_url,
    });

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating product',
      error,
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url } = req.body;

    const product = await ProductRepository.findById(id);

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    const updated = await ProductRepository.updateProduct(id, {
      name,
      description,
      price,
      stock,
      image_url,
    });

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating product',
      error,
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
import prisma from '../../../prisma/client';

class ProductRepository {
  // Get all products
  static async findAll(query: any) {
    try {
      console.log("Query to find products:", query); // Log the query
      // Fetch products based on the dynamic query
      const products = await prisma.product.findMany(query);

      console.log("Fetched products:", products); // Log the fetched products
      return products;
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new Error('Error fetching products');
    }
  }

  // Get product by ID
  static async findById(id: string) {
    try {
      return await prisma.product.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error('Error fetching product by ID');
    }
  }

  static async findByIds(ids: string[]) {
    try {
      return await prisma.product.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
    } catch (error) {
      throw new Error('Error fetching products by IDs');
    }
  }

  // Create new product
  static async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
  }) {
    try {
      return await prisma.product.create({
        data,
      });
    } catch (error) {
      throw new Error('Error creating product');
    }
  }

  // Update product
  static async updateProduct(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    image_url?: string;
  }) {
    try {
      return await prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error('Error updating product');
    }
  }

  // Delete product
  static async deleteProduct(id: string) {
    try {
      return await prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Error deleting product');
    }
  }
}

export default ProductRepository;
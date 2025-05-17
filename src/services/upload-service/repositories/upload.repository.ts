import { buildFilterQueryLimitOffsetV2 } from "../../helpers/FilterQueryV2";
import { FilteringQueryV2 } from "$entities/Query";
import { PrismaClient, UploadStatus } from '@prisma/client';
const prisma = new PrismaClient();

class UploadRepository {
  static async createUpload(data: {
    userId: string;
    filename: string;
    filepath: string;
    status: UploadStatus;
  }) {
    try {
      return await prisma.upload.create({ data });
    } catch (error) {
      throw new Error(`Failed to create upload: ${error}`);
    }
  }

  static async findAll(filterQuery: any) {
    try {
      return await prisma.upload.findMany(filterQuery);
    } catch (error) {
      throw new Error("Error fetching uploads");
    }
  }

  // Ambil semua upload milik user
  static async findAllByUser(
    userId: string,
    filters: FilteringQueryV2["filters"],
    searchFilters: FilteringQueryV2["searchFilters"],
    rangedFilters: FilteringQueryV2["rangedFilters"],
    page = 1,
    rows = 10,
    orderKey = "createdAt",
    orderRule: "asc" | "desc" = "asc"
  ) {
    try {
      // Bangun query menggunakan helper
      const query = buildFilterQueryLimitOffsetV2({
        filters,
        searchFilters,
        rangedFilters,
        page,
        rows,
        orderKey,
        orderRule,
      });

      // Tambahkan filter userId
      query.where.AND.push({ userId });

      // Hitung total data (untuk meta pagination jika perlu)
      const [data, total] = await Promise.all([
        prisma.upload.findMany(query),
        prisma.upload.count({ where: { AND: query.where.AND } }),
      ]);

      return {
        data,
        total,
        page,
        rows,
        totalPages: Math.ceil(total / rows),
      };
    } catch (error) {
      console.error("UploadRepository Error:", error);
      throw new Error("Error fetching uploads by user");
    }
  }

  // Ambil upload berdasarkan ID
  static async findById(id: string) {
    try {
      return await prisma.upload.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error('Error fetching upload by ID');
    }
  }

  // Update status upload
  static async updateStatus(id: string, status: UploadStatus) {
    try {
      return await prisma.upload.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      throw new Error('Error updating upload status');
    }
  }

  // Hapus upload berdasarkan ID
  static async deleteById(id: string) {
    try {
      return await prisma.upload.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Error deleting upload');
    }
  }
}

export default UploadRepository;
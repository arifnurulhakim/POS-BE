import { Request, Response } from 'express';
// import { v4 as uuidv4 } from 'uuid';
import UploadRepository from '../repositories/upload.repository';
import path from 'path';
import fs from 'fs';
import { UploadStatus } from '@prisma/client';
import { buildFilterQueryLimitOffsetV2 } from "../../helpers/FilterQueryV2";
const processingQueue: string[] = [];
const processQueue = () => {
    if (processingQueue.length === 0) return;
  
    const id = processingQueue.shift();
    if (!id) return;
  
    setTimeout(async () => {
      await UploadRepository.updateStatus(id, UploadStatus.SUCCESS);
      processQueue(); // recursive untuk memproses yang lain
    }, 3000); // simulasi delay 3 detik
};
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const file = req.file;
  
      if (!file || !userId) {
        res.status(400).json({ message: 'Missing file or user info' });
        return;
      }
  
      const newUpload = await UploadRepository.createUpload({
        userId: userId as string,
        filename: file.filename,
        filepath: path.join('uploads', 'storage', file.filename),
        status: UploadStatus.PENDING,
      });
      
      // Tambahkan ke queue
      processingQueue.push(newUpload.id);
      if (processingQueue.length === 1) processQueue();
      
      // Generate file URL
      const fileUrl = `${'http://localhost:3000'}/${newUpload.filepath.replace(/\\/g, '/')}`;
      
      res.status(201).json({
        status: 'success',
        message: 'File uploaded successfully, processing in background',
        data: {
          ...newUpload,
          fileUrl,
        },
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: 'error', message: 'Failed to upload file', error: error });
    }
};
export const getAllUploads = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
  
      const filters = req.query.filters ? JSON.parse(String(req.query.filters)) : {};
      const searchFilters = req.query.searchFilters ? JSON.parse(String(req.query.searchFilters)) : {};
      const rangedFilters = req.query.rangedFilters ? JSON.parse(String(req.query.rangedFilters)) : [];
  
      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const rows = req.query.rows ? parseInt(String(req.query.rows)) : 10;
      const orderKey = req.query.orderKey ? String(req.query.orderKey) : "createdAt";
      const orderRule = req.query.orderRule === "asc" ? "asc" : "desc";
  
      const query = buildFilterQueryLimitOffsetV2({
        filters,
        searchFilters,
        rangedFilters,
        page,
        rows,
        orderKey,
        orderRule,
      });
  
      // Tambahkan filter userId di `AND`
      query.where.AND.push({ userId });
  
      const uploads = await UploadRepository.findAll(query);
  
      res.status(200).json({
        status: "success",
        data: uploads,
        meta: {
          filters,
          searchFilters,
          rangedFilters,
          page,
          rows,
          orderKey,
          orderRule,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch uploads", error: error });
    }
};
export const getUploadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const upload = await UploadRepository.findById(id);
    if (!upload || upload.userId !== userId) {
      res.status(404).json({ message: 'File not found or not owned' });
      return;
    }

    res.status(200).json({ status: 'success', data: upload });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch upload', error: error });
  }
};
export const deleteUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const upload = await UploadRepository.findById(id);
    if (!upload || upload.userId !== userId) {
      res.status(404).json({ message: 'File not found or not owned' });
      return;
    }

    // Hapus file dari disk
    const filePath = path.join(__dirname, '..', 'uploads', 'storage', upload.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await UploadRepository.deleteById(id);

    res.status(200).json({ status: 'success', message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete upload', error: error });
  }
};
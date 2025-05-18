import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Path folder penyimpanan gambar
const storagePath = path.resolve(__dirname, '../storage/product');

// Buat folder jika belum ada
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storagePath);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}-${random}${ext}`);
  },
});

export const upload = multer({ storage });
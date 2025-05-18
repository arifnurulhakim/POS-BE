import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  // CLOUDINARY_URL sudah otomatis terpakai, jadi config manual opsional
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',  // folder di cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  } as any,  // <- ini supaya TypeScript tidak error
});

export const upload = multer({ storage });
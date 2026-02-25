
// cloudinary.js - Configuración de Cloudinary para manejo de imágenes en el backend

import { v2 as cloudinary } from 'cloudinary';

import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Verificación de seguridad para que no rompa sin avisar
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("❌ ERROR: No se cargaron las variables de Cloudinary. Revisa el .env");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Exportamos ambos como objetos nombrados para evitar líos
export { cloudinary, upload };
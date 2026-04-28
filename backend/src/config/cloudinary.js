

//src/config/cloudinary.js
// Configuración de Cloudinary para manejo de imágenes
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("❌ ERROR: Variables de Cloudinary no cargadas. Revisa el .env");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export { cloudinary };
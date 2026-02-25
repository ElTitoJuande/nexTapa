

// src/routes/photoRoutes.js
import { Router } from 'express';
import upload from '../config/multer.js';
import {
  uploadPhoto,
  getPhotosByEstablishment,
  getPhotoById,
  deletePhoto,
  setPrimaryPhoto,
  reorderPhotos,
  getPhotosByItem
} from '../controllers/photoController.js';

export const photoRouter = Router();



photoRouter.get('/establishment/:establishmentId', getPhotosByEstablishment);

photoRouter.post('/', upload.single('photo'), uploadPhoto);

photoRouter.get('/:id', getPhotoById);

photoRouter.delete('/:id', deletePhoto);

photoRouter.patch('/:id/set-primary', setPrimaryPhoto);

photoRouter.patch('/reorder', reorderPhotos);

photoRouter.get('/item/:itemId', getPhotosByItem);
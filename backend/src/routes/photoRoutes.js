

// src/routes/photoRoutes.js
import { Router } from 'express';
import upload from '../config/multer.js';
import {
  uploadTemporaryPhoto,
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

photoRouter.get('/item/:itemId', getPhotosByItem);

photoRouter.patch('/reorder', reorderPhotos);     

photoRouter.post('/temp', upload.single('photo'), uploadTemporaryPhoto);

photoRouter.post('/', upload.single('photo'), uploadPhoto);

photoRouter.get('/:id', getPhotoById);

photoRouter.delete('/:id', deletePhoto);

photoRouter.patch('/:id/set-primary', setPrimaryPhoto);

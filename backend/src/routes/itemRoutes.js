

// routes/itemRoutes.js
import { Router } from 'express';
import {
  getItemsByEstablishment,
  getItemsByEstablishmentSlug,
  getItemBySlug,
  getItemById,
  createItem,
  getAllItems,
  getTopRatedItems,
  updateItem,
  deleteItem,
  reorderItems
} from '../controllers/itemController.js';

export const itemRouter = Router();

itemRouter.get('/top-rated', getTopRatedItems);

itemRouter.get('/slug/:slug', getItemBySlug);

itemRouter.get('/establishment/slug/:slug', getItemsByEstablishmentSlug);

itemRouter.get('/establishment/:establishmentId', getItemsByEstablishment);

itemRouter.get('/', getAllItems);

itemRouter.get('/:id', getItemById);

itemRouter.post('/', createItem);

itemRouter.patch('/reorder', reorderItems);

itemRouter.put('/:id', updateItem);

itemRouter.delete('/:id', deleteItem);

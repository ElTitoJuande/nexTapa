

// routes/itemRoutes.js
import { Router } from 'express';
import {
  getItemsByEstablishment,
  getItemById,
  createItem,
  getAllItems,
  getTopRatedItems,
  updateItem,
  deleteItem,
  reorderItems
} from '../controllers/itemController.js';

export const itemRouter = Router();

itemRouter.get('/establishment/:establishmentId', getItemsByEstablishment);

itemRouter.get('/top-rated', getTopRatedItems);

itemRouter.get('/', getAllItems);

itemRouter.get('/:id', getItemById);

itemRouter.post('/', createItem);

itemRouter.put('/:id', updateItem);

itemRouter.delete('/:id', deleteItem);

itemRouter.patch('/reorder', reorderItems);
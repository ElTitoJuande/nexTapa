import { Router } from 'express';
import { 
  getEstablishments, 
  getEstablishmentById,
  createEstablishment, 
  deleteEstablishment, 
  reactivateEstablishment, 
  updateEstablishment,
  getEstablishmentBySlug
 } 
  from '../controllers/establishmentController.js';

export const establishmentRouter = Router();


establishmentRouter.get('/', getEstablishments);

establishmentRouter.get('/slug/:slug', getEstablishmentBySlug);//importante poner antes que el get por id para que no haya conflictos con los slugs que puedan ser similares a los ids

establishmentRouter.get('/:id', getEstablishmentById);

establishmentRouter.post('/', createEstablishment);

establishmentRouter.delete('/:id', deleteEstablishment);

establishmentRouter.patch('/:id/reactivate', reactivateEstablishment);//importante poner antes que el update para que no haya conflictos con los id de reactivación que puedan ser similares a los ids de actualización

establishmentRouter.patch('/:id', updateEstablishment);
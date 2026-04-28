

// src/routes/searchRoutes.js
import { Router } from 'express';
import { globalSearch, getSuggestions, getSuggestionsMore } from '../controllers/searchController.js';

export const searchRouter = Router();


searchRouter.get('/suggestions/more', getSuggestionsMore);

searchRouter.get('/suggestions', getSuggestions);

searchRouter.get('/', globalSearch);

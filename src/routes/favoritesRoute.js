import express from 'express';
import {
  showFavorites,
  switchFavorites,
} from '../controllers/favoritesControllers.js';

const router = express.Router();

router.get('', showFavorites);
router.patch('/item', switchFavorites);

export default router;

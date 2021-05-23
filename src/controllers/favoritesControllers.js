import {
  showFavorites2,
  switchFavorites2,
} from '../services/favoritesService.js';

export const showFavorites = async (req, res, next) => {
  try {
    let rows = await showFavorites2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const switchFavorites = async (req, res, next) => {
  try {
    let rows = await switchFavorites2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

import { shareItem2 } from '../services/shareService.js';

export const shareItem = async (req, res, next) => {
  try {
    let rows = await shareItem2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

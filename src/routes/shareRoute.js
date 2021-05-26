import express from 'express';
import { shareItem } from '../controllers/shareController.js';

const router = express.Router();

router.patch('/item', shareItem);

export default router;

import express from 'express';
import { findItem, updateItem } from '../controllers/filesController.js';

const router = express.Router();

router.get('/item', findItem);     // 폴더 & 파일 조회
router.patch('/item', updateItem); // 폴더 & 파일 수정

export default router;
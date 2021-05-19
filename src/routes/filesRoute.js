import express from 'express';
import { createFile, findItem, updateItem } from '../controllers/filesController.js';

const router = express.Router();

router.post('/', createFile);       // 폴더 & 파일 업로드
router.get('/item', findItem);      // 폴더 & 파일 조회
router.patch('/item', updateItem);  // 폴더 & 파일 수정

export default router;
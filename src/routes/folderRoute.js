import express from 'express';
import {
  createFolder,
  updateFolder,
} from '../controllers/folderController.js';

const router = express.Router();

// 김태영 - 폴더 생성 / 삭제 / 이름수정
router.post('/', createFolder);   // 폴더 생성
router.patch('/', updateFolder);  // 폴더 이름 수정

export default router;
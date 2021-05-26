import express from 'express';
import {
  moveFolder,
  createFolder,
  updateFolder,
  deleteFolder,
} from '../controllers/folderController.js';

const router = express.Router();

// 김태영 - 폴더 생성 / 삭제 / 이름수정
router.post('/', createFolder); // 폴더 생성
router.patch('/', updateFolder); // 폴더 이름 수정
router.patch('/move', moveFolder); // 폴더 이동
router.delete('/', deleteFolder);
export default router;

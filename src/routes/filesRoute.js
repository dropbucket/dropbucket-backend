import express from 'express';
import {
  findItem,
  updateItem,
  createFolder,
  updateFolder,
} from '../controllers/filesController.js';

const router = express.Router();

router.get('/item', findItem); // 폴더 & 파일 조회
router.patch('/item', updateItem); // 폴더 & 파일 수정

// 김태영 - 폴더 생성 / 삭제 / 이름수정
router.post('/folder', createFolder); // 폴더 생성
router.patch('/folder', updateFolder); // 폴더 생성
export default router;

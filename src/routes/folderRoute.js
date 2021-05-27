import express from 'express';
import {
  moveFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  restoreFolder,
  getTrash,
} from '../controllers/folderController.js';

const router = express.Router();

// 김태영 - 폴더 생성 / 삭제 / 이름수정
router.post('/', createFolder); // 폴더 생성
router.patch('/', updateFolder); // 폴더 이름 수정
router.patch('/move', moveFolder); // 폴더 이동
router.delete('/', deleteFolder);
router.patch('/trash', restoreFolder);

router.get('/trash', getTrash); // 쓰레기통에 있는 폴더 & 파일 조회
export default router;

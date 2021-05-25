import express from 'express';
import { uploadFile, downloadFile, findFile, updateFile } from '../controllers/fileController.js';
import { uploadS3 } from '../services/fileService.js';

const router = express.Router();
const uploadToS3 = await uploadS3();

// file 관련 router
router.post('/', uploadToS3.single('img'), uploadFile); // 파일 업로드
router.get('/download', downloadFile);                  // 파일 다운로드
router.get('/', findFile);                              // 현 폴더 내의 파일들 정보 조회
router.patch('/', updateFile);                          // 파일 수정
// router.delete('/', deleteFile);     // 파일 삭제인데 안쓸 예정

export default router;
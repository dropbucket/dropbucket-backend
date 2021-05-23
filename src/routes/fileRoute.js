import express from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

import { uploadFile, deleteFile } from '../controllers/fileController.js';
import { uuidID } from '../services/fileService.js';

dotenv.config();

const router = express.Router();

// AWS-S3 업로드관련 코드
const awsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  sessionToken: process.env.DYNAMODB_SESSION_TOKEN
};
AWS.config.update(awsConfig);

const s3 = new AWS.S3({ endpoint: "https://s3.us-east-1.amazonaws.com" });

const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'dropbucket-file',
    key(req, file, cb) {
      cb(null, uuidID)
    }
  })
});
//

// file 관련 router
router.post('/', uploadToS3.single('img'), uploadFile);   // 파일 업로드
// router.get('/item', findItem);      // 파일 조회
// router.patch('/item', updateItem);  // 파일 수정
router.delete('/', deleteFile);     // 파일 삭제

export default router;
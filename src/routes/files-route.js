var express = require('express');
var router = express.Router();
const FileController = require('../controllers/files-controller');

router.get('/item', FileController.findItem); // 폴더/파일 조회
router.patch('/item', FileController.updateItem); // 폴더/파일 수정

module.exports = router;

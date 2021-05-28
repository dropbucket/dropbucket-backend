import {
  uploadFile2,
  downloadFile2,
  findFile2,
  updateFile2,
  getTrash2,
  deleteFile2,
  restoreFile2,
} from '../services/fileService.js';

export const uploadFile = async (req, res, next) => {
  try {
    const rows = await uploadFile2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const rows = await downloadFile2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const findFile = async (req, res, next) => {
  try {
    const rows = await findFile2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateFile = async (req, res, next) => {
  try {
    let rows = await updateFile2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// 김태영 file 삭제, 휴지통 조회, 복원

export const getTrash = async (req, res, next) => {
  try {
    let rows = await getTrash2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    let rows = await deleteFile2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const restoreFile = async (req, res, next) => {
  try {
    let rows = await restoreFile2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

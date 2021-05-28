import {
  createFolder2,
  updateFolder2,
  moveFolder2,
  deleteFolder2,
  restoreFolder2,
} from '../services/folderService.js';

export const createFolder = async (req, res, next) => {
  try {
    let rows = await createFolder2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    let rows = await updateFolder2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const moveFolder = async (req, res, next) => {
  try {
    let rows = await moveFolder2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    let rows = await deleteFolder2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const restoreFolder = async (req, res, next) => {
  try {
    let rows = await restoreFolder2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

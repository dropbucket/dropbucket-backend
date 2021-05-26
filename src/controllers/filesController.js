import {
  findItem2,
  updateItem2,
  createFolder2,
  updateFolder2,
  moveFolder2,
} from '../services/filesService.js';

export const findItem = async (req, res, next) => {
  try {
    let rows = await findItem2(req.body);
    console.log(rows.me);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    let rows = await updateItem2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const createFolder = async (req, res, next) => {
  try {
    let rows = await createFolder2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    let rows = await updateFolder2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const moveFolder = async (req, res, next) => {
  try {
    let rows = await moveFolder2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

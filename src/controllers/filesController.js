import { createFile2, findItem2, updateItem2 } from '../services/filesService.js';

export const createFile = async (req, res, next) => {
  try {
    let rows = await createFile2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};


export const findItem = async (req, res, next) => {
  try {
    let rows = await findItem2(req.body);
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
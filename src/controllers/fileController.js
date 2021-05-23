// import { createFile2, findItem2, updateItem2, deleteItem2 } from '../services/fileService.js';
import { uploadFile2, deleteFile2 } from '../services/fileService.js';

export const uploadFile = async (req, res, next) => {
  try {
    let rows = await uploadFile2(req);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// export const findItem = async (req, res, next) => {
//   try {
//     let rows = await findItem2(req.body);
//     return res.json(rows);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// };

// export const updateItem = async (req, res, next) => {
//   try {
//     let rows = await updateItem2(req.body);
//     return res.json(rows);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// };

export const deleteFile = async (req, res, next) => {
  try {
    const rows = await deleteFile2(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};
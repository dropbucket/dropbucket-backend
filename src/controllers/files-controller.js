const FileService = require('../services/files-service');

exports.findItem = async (req, res, next) => {
  try {
    let rows = await FileService.findItem(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    let rows = await FileService.updateItem(req.body);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ success: true, fileUrl, fileName: req.file.originalname });
});

module.exports = router;
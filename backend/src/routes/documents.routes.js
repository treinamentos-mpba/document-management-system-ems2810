// Rotas de documentos: definem os endpoints e delegam ao controller.
// Uploads são gravados no filesystem local (backend/storage) via multer com
// diskStorage. Não utilize provedores externos.

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const express = require('express');
const multer = require('multer');

const documentsController = require('../controllers/documents.controller');

const STORAGE_DIR = path.resolve(__dirname, '..', '..', 'storage');

// Garante que a pasta de armazenamento exista antes de receber uploads.
fs.mkdirSync(STORAGE_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    // Nome único no disco para evitar colisões entre uploads.
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;

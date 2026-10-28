// Serviço de documentos: concentra as regras de negócio.

const crypto = require('node:crypto');
const fs = require('node:fs');

const documentsRepository = require('../repositories/documents.repository');

function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype,
    owner: owner || 'anonymous',
    uploadedAt: new Date().toISOString(),
  };

  return documentsRepository.save(document);
}

function listDocuments() {
  // Não expõe detalhes internos de armazenamento (caminho/nome no disco).
  return documentsRepository.findAll().map((document) => ({
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    mimeType: document.mimeType,
    owner: document.owner,
    uploadedAt: document.uploadedAt,
  }));
}

function getDocumentForDownload(id) {
  const document = documentsRepository.findById(id);

  if (!document || !fs.existsSync(document.path)) {
    return null;
  }

  return document;
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};

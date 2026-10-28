// Serviço de documentos: concentra as regras de negócio.

const crypto = require('node:crypto');

const documentsRepository = require('../repositories/documents.repository');

// Mapeia um documento para o formato público exposto pela API.
// Não expõe detalhes internos de armazenamento (caminho/nome no disco).
function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    mimeType: document.mimeType,
    owner: document.owner,
    uploadedAt: document.uploadedAt,
  };
}

function createDocument(file, owner) {
  const document = documentsRepository.save({
    id: crypto.randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype,
    owner: owner || 'anonymous',
    uploadedAt: new Date().toISOString(),
  });

  return toPublicDocument(document);
}

function listDocuments() {
  return documentsRepository.findAll().map(toPublicDocument);
}

function getDocumentForDownload(id) {
  const document = documentsRepository.findById(id);

  if (!document || !documentsRepository.fileExists(document)) {
    return null;
  }

  return document;
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};

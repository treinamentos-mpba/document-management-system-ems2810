// Controller de documentos: trata entrada/saída HTTP e validação básica.

const documentsService = require('../services/documents.service');

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "file".' });
  }

  // O service já devolve o formato público do documento (sem dados internos).
  const document = documentsService.createDocument(req.file, req.body.owner);

  return res.status(201).json(document);
}

function listDocuments(req, res) {
  return res.json(documentsService.listDocuments());
}

function downloadDocument(req, res, next) {
  const document = documentsService.getDocumentForDownload(req.params.id);

  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.download(document.path, document.originalName, (err) => {
    if (err && !res.headersSent) {
      next(err);
    }
  });
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};

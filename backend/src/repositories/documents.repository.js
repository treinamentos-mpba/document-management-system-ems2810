// Repositório de documentos: persistência dos metadados em memória.
// Nesta fase inicial os metadados vivem apenas durante a execução do processo.

const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findAll() {
  return Array.from(documents.values());
}

function findById(id) {
  return documents.get(id) || null;
}

module.exports = {
  save,
  findAll,
  findById,
};

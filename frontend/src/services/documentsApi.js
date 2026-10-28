// Cliente de API dos documentos. Toda comunicação com o backend passa pelo
// prefixo /api (proxy configurado no Vite).

const API_PREFIX = '/api';

async function parseJsonOrThrow(response) {
  if (!response.ok) {
    let message = `Erro na requisição (HTTP ${response.status}).`;

    try {
      const body = await response.json();
      if (body && body.error) {
        message = body.error;
      }
    } catch {
      // Resposta sem corpo JSON: mantém a mensagem padrão.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });

  return parseJsonOrThrow(response);
}

export async function listDocuments() {
  const response = await fetch(`${API_PREFIX}/documents`);

  return parseJsonOrThrow(response);
}

export function getDownloadUrl(documentId) {
  return `${API_PREFIX}/documents/${encodeURIComponent(documentId)}/download`;
}

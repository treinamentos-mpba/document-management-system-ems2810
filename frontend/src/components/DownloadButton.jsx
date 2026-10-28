import { getDownloadUrl } from '../services/documentsApi.js';

// Botão de download de um documento. Usa um link direto para o endpoint do
// backend, deixando o navegador cuidar do download do arquivo.
export default function DownloadButton({ documentId }) {
  return (
    <a href={getDownloadUrl(documentId)} download>
      <button type="button">Baixar</button>
    </a>
  );
}

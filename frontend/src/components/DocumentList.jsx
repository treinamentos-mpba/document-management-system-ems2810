import DownloadButton from './DownloadButton.jsx';

// Formata o tamanho do arquivo em unidades legíveis.
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Formata a data de upload no padrão local do navegador.
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString();
}

// Lista de documentos com ação de download por item.
export default function DocumentList({ documents, loading, error }) {
  if (loading) {
    return <p>Carregando documentos...</p>;
  }

  if (error) {
    return <p style={{ color: 'crimson' }}>{error}</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nome</th>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tamanho</th>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Dono</th>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Enviado em</th>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id} style={{ borderTop: '1px solid #ddd' }}>
            <td style={{ padding: '0.5rem' }}>{document.originalName}</td>
            <td style={{ padding: '0.5rem' }}>{formatSize(document.size)}</td>
            <td style={{ padding: '0.5rem' }}>{document.owner}</td>
            <td style={{ padding: '0.5rem' }}>{formatDate(document.uploadedAt)}</td>
            <td style={{ padding: '0.5rem' }}>
              <DownloadButton documentId={document.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi.js';

// Formulário de upload de documentos. Após o envio bem-sucedido, notifica o
// componente pai via onUploaded para que a listagem seja atualizada.
export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadDocument(file, owner.trim());
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploaded) {
        onUploaded();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Enviar documento</h2>

      <div style={{ marginBottom: '0.5rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={(event) => setFile(event.target.files[0] ?? null)}
          disabled={uploading}
        />
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="Dono do documento (opcional)"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          disabled={uploading}
        />
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Enviando...' : 'Enviar'}
      </button>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}

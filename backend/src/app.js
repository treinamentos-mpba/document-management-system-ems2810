// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const multer = require('multer');

const documentsRouter = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota raiz informativa: a interface web é servida pelo frontend (Vite).
app.get('/', (req, res) => {
  res.json({
    name: 'DMS backend',
    message: 'API do Document Management System. A interface web roda no frontend (http://localhost:5173).',
    endpoints: ['GET /health', 'POST /upload', 'GET /documents', 'GET /documents/:id/download'],
  });
});

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas de documentos: /upload, /documents e /documents/:id/download.
app.use('/', documentsRouter);

// Tratamento de erros nos limites do sistema (upload e demais rotas).
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Falha no upload: ${err.message}` });
  }

  console.error('Erro inesperado:', err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;

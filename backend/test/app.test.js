const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { after, test } = require('node:test');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-backend-test-'));
process.env.STORAGE_DIR = storageDir;

const app = require('../src/app');

let server;

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  fs.rmSync(storageDir, { recursive: true, force: true });
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento', async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const content = 'Conteúdo de teste do endpoint de documentos.';
  const formData = new FormData();
  formData.append('file', new Blob([content], { type: 'text/plain' }), 'ci-document.txt');
  formData.append('owner', 'ci-owner');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.equal(uploadResponse.status, 201);
  const uploadedDocument = await uploadResponse.json();
  assert.equal(uploadedDocument.originalName, 'ci-document.txt');
  assert.equal(uploadedDocument.size, Buffer.byteLength(content));
  assert.equal(uploadedDocument.mimeType, 'text/plain');
  assert.equal(uploadedDocument.owner, 'ci-owner');
  assert.ok(uploadedDocument.id);
  assert.ok(uploadedDocument.uploadedAt);
  assert.equal('path' in uploadedDocument, false);
  assert.equal('storedName' in uploadedDocument, false);

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.equal(listResponse.status, 200);
  const documents = await listResponse.json();
  assert.ok(documents.some((document) => document.id === uploadedDocument.id));

  const downloadResponse = await fetch(
    `${baseUrl}/documents/${uploadedDocument.id}/download`,
  );
  assert.equal(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /attachment/);
  assert.equal(await downloadResponse.text(), content);

  const missingDownloadResponse = await fetch(
    `${baseUrl}/documents/nonexistent-document/download`,
  );
  assert.equal(missingDownloadResponse.status, 404);
});

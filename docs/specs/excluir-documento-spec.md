# Especificação - Excluir documento

> Especificação da funcionalidade de exclusão de documentos, elaborada a partir
> do modelo em `spec-template.md`. Complementa a `dms-spec.md`, que passa a ter
> a exclusão **dentro** do escopo (antes listada como fora do escopo).

## 1. Objetivo

Permitir que o usuário exclua um documento pelo identificador, removendo o arquivo do filesystem local e os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Exclusão de um documento pelo identificador (`id`).
- Remoção do arquivo físico em `backend/storage`.
- Remoção dos metadados do documento em memória.
- Ação de exclusão por item na lista de documentos do frontend, com confirmação.
- Atualização da lista no frontend após a exclusão.

### Fora do escopo

- Lixeira, recuperação ou exclusão lógica (soft delete).
- Exclusão em lote (múltiplos documentos por requisição).
- Autorização por usuário (não há autenticação nesta fase; o `owner` é apenas informativo).
- Auditoria ou histórico de exclusões.

## 3. Requisitos funcionais

| ID    | Requisito                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------- |
| RF-09 | O sistema deve excluir um documento pelo identificador via `DELETE /documents/:id`.                 |
| RF-10 | A exclusão deve remover o arquivo físico de `backend/storage` e os metadados em memória.            |
| RF-11 | O sistema deve responder `204 No Content` quando a exclusão for concluída com sucesso.              |
| RF-12 | O sistema deve responder `404` com erro JSON quando o identificador não corresponder a um documento.|
| RF-13 | O frontend deve exibir uma ação de exclusão por documento na lista, com confirmação do usuário.     |
| RF-14 | Após a exclusão, o frontend deve atualizar a lista de documentos e exibir feedback ao usuário.      |

> A numeração continua a sequência da `dms-spec.md` (RF-01 a RF-08).

## 4. Requisitos não funcionais

| ID     | Requisito                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------- |
| RNF-09 | A remoção do arquivo deve usar apenas o caminho registrado nos metadados, nunca entrada do usuário.  |
| RNF-10 | Se o arquivo físico já não existir, a exclusão dos metadados deve prosseguir (idempotência parcial). |
| RNF-11 | Erros de filesystem na exclusão devem ser tratados no limite do sistema e responder erro JSON 500.   |
| RNF-12 | A solução deve respeitar o fluxo `routes -> controllers -> services -> repositories`.                |

## 5. Modelo de dados

Nenhum campo novo. A exclusão opera sobre o modelo existente de documento
(`id`, `originalName`, `storedName`, `path`, `size`, `mimeType`, `owner`,
`uploadedAt`), removendo o registro do `Map` em memória.

## 6. Contratos de API

### DELETE /documents/:id

- Entrada: `id` do documento no caminho da URL.
- Saída (sucesso): `204 No Content`, sem corpo.
- Saída (não encontrado): `404` com `{ "error": "Documento não encontrado." }`.
- Saída (falha de filesystem): `500` com `{ "error": "Erro interno do servidor." }`.

## 7. Decisões arquiteturais

- Novo método `remove(id)` no `documents.repository.js` (remove do `Map`).
- Regra de negócio no `documents.service.js`: busca o documento, remove o
  arquivo físico (`fs.promises.unlink`, tolerando `ENOENT`) e depois os metadados.
- Controller valida existência e traduz resultado em `204`/`404`.
- Rota `DELETE /documents/:id` registrada em `documents.routes.js`.
- Frontend: botão "Excluir" na coluna de ações de `DocumentList.jsx`
  (novo componente `DeleteButton.jsx`, reutilizando o padrão de `DownloadButton.jsx`),
  chamada via `fetch` no cliente de API com prefixo `/api`.
- Confirmação simples com `window.confirm` nesta fase (KISS).

### Riscos

- Exclusão é definitiva: sem lixeira, o arquivo não pode ser recuperado.
- Sem autenticação, qualquer usuário pode excluir qualquer documento (aceito nesta fase).
- Reinício do processo já descarta metadados; arquivos órfãos pré-existentes em
  `backend/storage` não são afetados por esta funcionalidade.

## 8. Plano de execução

1. Repositório: adicionar `remove(id)` em `backend/src/repositories/documents.repository.js`.
2. Serviço: criar `deleteDocument(id)` em `backend/src/services/documents.service.js` (unlink do arquivo + remoção dos metadados).
3. Controller: criar `deleteDocument` em `backend/src/controllers/documents.controller.js` (`204`/`404`).
4. Rota: registrar `DELETE /documents/:id` em `backend/src/routes/documents.routes.js`.
5. Testes: cobrir sucesso, id inexistente e arquivo ausente em `backend/test` com `node:test`.
6. Frontend: criar `DeleteButton.jsx`, adicionar função `deleteDocument(id)` no cliente de API e integrar em `DocumentList.jsx` com atualização da lista.
7. Atualizar a `dms-spec.md`: mover exclusão de "fora do escopo" para "dentro do escopo".

## Critérios de aceite

- `DELETE /documents/:id` remove arquivo e metadados e responde `204`.
- `DELETE` com id inexistente responde `404` com erro JSON.
- Documento excluído não aparece mais em `GET /documents` nem pode ser baixado.
- Na interface, excluir um documento pede confirmação e atualiza a lista.

# Especificação - Document Management System

## 1. Objetivo

Permitir que o usuário envie, liste e baixe documentos, armazenados no filesystem local da aplicação, com metadados mantidos em memória nesta fase.

## 2. Escopo

### Dentro do escopo

- Envio de documentos por upload.
- Listagem dos documentos do usuário.
- Download de um documento pelo identificador.
- Associação de documentos a um identificador de usuário.
- Armazenamento de arquivos local com Multer e `diskStorage`.
- Armazenamento temporário dos metadados em memória.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Versionamento, edição ou exclusão de documentos.
- Persistência de metadados em banco de dados.
- Cadastro, autenticação ou administração de usuários.
- Busca avançada, compartilhamento e permissões configuráveis.
- Restrições por tipo de arquivo, além do limite de tamanho.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o envio de um arquivo por requisição `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve atribuir ao documento um identificador único e um nome de armazenamento interno que não dependa do nome enviado pelo usuário. |
| RF-03 | O sistema deve armazenar o arquivo no diretório local configurado, usando Multer com `diskStorage`. |
| RF-04 | O sistema deve registrar os metadados do documento em memória após o armazenamento do arquivo. |
| RF-05 | O sistema deve listar somente documentos associados ao usuário atual, em ordem decrescente de data de envio. |
| RF-06 | O sistema deve permitir o download de um documento pelo identificador, somente quando associado ao usuário atual. |
| RF-07 | O sistema deve retornar erro compreensível quando o arquivo estiver ausente, for inválido ou exceder o tamanho permitido. |
| RF-08 | O sistema deve manter o endpoint de saúde `GET /health` para verificação do backend. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem permanecer exclusivamente no filesystem local da aplicação, em `backend/storage` por padrão. |
| RNF-02 | O upload deve usar Multer com `diskStorage`; não usar armazenamento em memória nem provedores externos. |
| RNF-03 | Os metadados devem permanecer em memória nesta fase e podem ser perdidos ao reiniciar o processo. |
| RNF-04 | Configurações operacionais devem ser obtidas por variáveis de ambiente. |
| RNF-05 | O nome original do arquivo não deve ser usado como caminho de armazenamento. |
| RNF-06 | O caminho físico e o nome interno de armazenamento não devem ser expostos nas respostas da API. |
| RNF-07 | Erros da API devem usar respostas JSON consistentes, exceto respostas de download. |
| RNF-08 | A solução deve respeitar as dependências arquiteturais `routes -> controllers -> services -> repositories`. |

## 5. Modelo de dados

### Documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | API | Identificador único, preferencialmente UUID. |
| `originalName` | string | API | Nome original fornecido no upload. |
| `size` | number | API | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | API | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | API | Identificador do usuário proprietário. |
| `storageName` | string | Interno | Nome gerado para localizar o arquivo no diretório local. |

`storageName` é um dado interno do repositório e não deve ser incluído no DTO público. O caminho completo deve ser resolvido a partir do diretório de armazenamento configurado, nunca a partir de entrada do cliente.

### Identidade do usuário

Autenticação e cadastro não fazem parte desta fase. Para manter o comportamento determinístico sem aceitar um proprietário arbitrário enviado pelo cliente, o serviço deve associar documentos ao identificador configurado por `DEFAULT_OWNER_ID`, cujo valor padrão é `local-user`. A listagem e o download devem usar essa mesma identidade.

Essa decisão limita o MVP a um proprietário configurado por execução. Suporte a múltiplos usuários depende de uma futura definição de autenticação.

### Persistência e ciclo de vida

- O arquivo permanece no filesystem local.
- O registro de metadados existe apenas enquanto o processo estiver ativo.
- Após reiniciar o backend, os arquivos podem permanecer no disco sem registros correspondentes em memória.
- Não faz parte desta fase reconciliar arquivos órfãos nem restaurar metadados.

## 6. Contratos de API

As rotas do backend usam os caminhos abaixo. No desenvolvimento, o frontend pode chamá-las pelo prefixo `/api`; a configuração existente do Vite remove esse prefixo antes de encaminhar a requisição.

### `POST /upload`

Envia um documento.

**Entrada**

- Content-Type: `multipart/form-data`
- Campo obrigatório: `file`
- Tamanho máximo padrão: 10 MiB, configurável por `MAX_FILE_SIZE_BYTES`.
- Outros tipos de arquivo são aceitos nesta fase.

**Sucesso: `201 Created`**

```json
{
  "id": "d0cfa2b8-52e1-4f4a-bfe5-f6108de80a11",
  "originalName": "relatorio.pdf",
  "size": 153600,
  "uploadedAt": "2026-10-28T12:00:00.000Z",
  "owner": "local-user"
}
---
description: "Gera uma especificação de funcionalidade em docs/specs a partir do template do projeto, pronta para o agente planner."
name: nova-spec
argument-hint: nome da funcionalidade (ex. excluir documento)
agent: agent
tools: ['search', 'codebase', 'editFiles']
---

# Nova especificação de funcionalidade

Crie a especificação da funcionalidade `${input:funcionalidade:nome da funcionalidade}` seguindo o desenvolvimento guiado por especificação (Spec Driven Development) do projeto.

## Passos

1. Leia o modelo em [spec-template.md](../../docs/specs/spec-template.md) e a spec principal em [dms-spec.md](../../docs/specs/dms-spec.md) para entender o formato e o estado atual do sistema.
2. Pesquise o codebase (`backend/src` e `frontend/src`) para entender o que já existe e como a funcionalidade se encaixa.
3. Crie o arquivo `docs/specs/<nome-kebab-case>-spec.md` preenchendo todas as seções do template:
   - Objetivo (uma frase)
   - Escopo (dentro e fora)
   - Requisitos funcionais (tabela com IDs `RF-xx`)
   - Requisitos não funcionais (tabela com IDs `RNF-xx`)
   - Modelo de dados (apenas campos novos ou alterados)
   - Contratos de API (endpoints, entrada e saída)
   - Decisões arquiteturais
   - Plano de execução (etapas em ordem)

## Restrições

- NÃO implemente código; esta tarefa produz apenas a especificação.
- Respeite as restrições do projeto: armazenamento local via multer com diskStorage, metadados em memória, Clean Architecture simples (`routes -> controllers -> services -> repositories`).
- Novos endpoints devem seguir o padrão REST dos existentes (`/upload`, `/documents`, `/documents/:id/download`).
- Marque como "fora do escopo" tudo que depender de serviços externos ou persistência em banco.

## Próximo passo sugerido

Ao final, sugira ao usuário acionar o agente `planner` apontando para a spec criada, para gerar o plano de implementação detalhado.

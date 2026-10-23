# Agenda / BR

Workspace inicial do MVP brasileiro de agendamento. Marca provisória. A BK-002 entrega a estrutura executável; reservas, autenticação, banco, filas, Pix e WhatsApp serão implementados nos respectivos cartões.

## Requisitos

- Node **24.22.1** e npm **12.2.1**, conforme ADR00, `.nvmrc`, `.node-version` e `packageManager`.
- Preparar essas versões com seu gerenciador de runtime ou instalação isolada. O bootstrap desta entrega usou `/tmp`, sem alterar Node/npm globais; os caminhos e checksum estão na [evidência](docs/evidence/bk-002/README.md).
- Docker não é necessário nesta etapa. Nenhum banco ou provedor precisa de credencial para compilar e verificar a fundação.

A instalação recusa engines diferentes. Não usar `--force`, `--legacy-peer-deps` ou editar o lockfile manualmente para contornar incompatibilidade.

## Instalação e verificação

Na raiz, com o runtime correto:

```sh
node --version
npm --version
npm ci
npm run check
npm run typecheck
```

`check` executa testes positivos/negativos das fronteiras, build dos oito workspaces e smoke real: API HTTP, injeção Nest/metadata ESM, worker e aplicação web compilada. O endpoint `/health` prova apenas o processo de fundação; não indica prontidão de banco, fila ou negócio.

```sh
npm run check:boundaries
npm run test:boundaries
npm run build
npm run smoke
npm run verify:clean
```

`smoke` requer build prévio e portas loopback disponíveis. `verify:clean` copia apenas fontes/configurações necessárias para um diretório temporário, exclui `node_modules`, `dist` e `.next`, executa `npm ci --offline`, `check` e `typecheck`, e confere que o lock não mudou. Precisa do cache preenchido pela instalação inicial. O relatório fica em `docs/evidence/bk-002/clean-verification.json`; a cópia temporária é conservada para inspeção.

## Execução local

Após o build, em terminais separados:

```sh
npm run dev:web
npm run start:api
npm run start:worker
```

- Web: `http://127.0.0.1:3000`.
- API de diagnóstico: `http://127.0.0.1:3001/health`.
- Worker: inicializa o contexto Nest, executa o mesmo caso de uso de diagnóstico da API e termina. Ainda não há consumidor de fila; isso pertence à BK-031.

A página web é somente a entrada mínima do scaffold, sem reservas simuladas ou integração fictícia. Componentes/tokens do DS entram na BK-008. Lint, CI, contratos OpenAPI e migrações ainda não estão implementados; não há comandos fictícios para essas capacidades.

## Organização e fronteiras

| Caminho | Responsabilidade |
| --- | --- |
| apps/web | Next App Router, React e composição web |
| apps/api | Nest HTTP e composição dos casos de uso |
| apps/worker | Processo Nest independente usando a mesma aplicação backend |
| packages/backend | Domínio, aplicação, portas e infraestrutura por módulo; exporta somente `@agenda/backend/application` |
| packages/contracts | DTOs públicos sem persistência ou segredos; OpenAPI é BK-005 |
| packages/ui | Composição React compartilhada; biblioteca DS é BK-008 |
| packages/config | Vocabulário server-side; validação e segredos são BK-003 |
| packages/testkit | Fixtures sintéticas exclusivas de verificação |
| database / infra | Locais reservados para tarefas de migração e infraestrutura |

Backend usa ESM/NodeNext; web usa resolução Bundler. Build compila pacotes compartilhados antes dos consumidores. A API e o worker importam a mesma classe `GetWorkspaceInfo`; não existe um segundo motor de agenda nem um motor fictício no bootstrap.

A guarda de arquitetura analisa imports TS/TSX, exports públicos, aliases resolvidos, chamadas literais `import`/`require`, caminhos relativos e dependências transitivas entre workspaces. Rejeita import dinâmico não literal. Domínio não importa dependências externas; aplicação não importa infraestrutura; web/UI não importam backend/config/testkit nem drivers conhecidos de servidor. É uma guarda de arquitetura, não sandbox ou substituto de revisão de segurança.

## Documentação e Git

Comece por [AGENTS.md](AGENTS.md), [decisões](docs/decisions/README.md), [baseline](docs/planning/bk-001-baseline.md) e [coordenação](docs/planning/coordination.md).

**Por decisão explícita do usuário, `plans/` permanece fora do Git.** As fontes funcionais, técnicas, DS e backlog continuam disponíveis localmente nessa pasta, mas um futuro clone não as recupera automaticamente. Para trabalhar em outra máquina, fornecer essas fontes por canal autorizado e preservar suas versões; não recriar regras a partir de documentos ausentes. Os links locais para `plans/` funcionam no workspace atual.

Git foi inicializado na branch `feat/bk-002-workspace`. Esta entrega não cria commit, remoto, push, merge ou deploy. Relatórios de evidência descrevem exatamente os checks executados e suas limitações.

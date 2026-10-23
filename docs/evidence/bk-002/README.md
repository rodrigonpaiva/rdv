# Evidência BK-002 — Workspace executável

Data: 23 de outubro de 2026. Dependência: BK-001 aceita documentalmente. Estado: concluída, com [revisão independente aceita](review.md). Registro: [coordenação](../../planning/coordination.md).

## Entrega

- Oito npm workspaces: web, API, worker, backend, contracts, UI, config e testkit.
- Node 24.22.1, npm 12.2.1 e TypeScript 6.0.3, com pins exatos, lockfile v3 único e exports explícitos.
- Web Next 16.4.3/React 19.3.1; API e worker Nest 12.2.0 ESM.
- Caso de uso de diagnóstico compartilhado entre API/worker; domínio puro e infraestrutura não exportada. Nenhum comportamento de agendamento implementado por antecipação.
- Guarda estática de arquitetura e testes negativos, inclusive aliases reais TS, imports relativos, re-exports, imports computados e fechamento transitivo de pacotes web.

## Critérios de aceite

| Critério BK-002 | Evidência |
| --- | --- |
| API/worker compartilham casos de uso | Ambos importam `@agenda/backend/application`; smoke verifica identidade da classe, Nest DI e o mesmo DTO na API HTTP e worker |
| Domain não importa ORM/framework/SDK | Guarda AST executada no build e testes negativos de import externo/type-only; fontes do domínio não têm dependências externas |
| Web não importa persistência/segredo | Dependências e imports web/UI verificados; exports backend privados; ausência de ambiente secreto no scaffold |
| Instalação limpa/build/imports | [clean-verification.json](clean-verification.json): cópia sem artefatos, npm ci offline, build, smoke e typecheck, lock hash inalterado |

A guarda de arquitetura não é sandbox nem prova universal de ausência de exfiltração. Padrões novos de import/configuração devem receber revisão e cobertura proporcional. Isolamento de tenant, concorrência, dinheiro e provedores não existem ainda e não são aprovados por este smoke.

## Runtime e dependências

O runtime oficial foi obtido em prefixo temporário com `curl` do sistema usando TLS e comparado com SHA256 do distribuidor: [runtime-download.json](runtime-download.json). A primeira tentativa pelo Python falhou por certificado raiz local ausente; não se desabilitou verificação TLS. npm 12.2.1 foi instalado somente em `/tmp/rdv-bk002-npm`, sem alteração global.

Prefixos usados nesta sessão:

```sh
export PATH="/tmp/rdv-bk002-npm/node_modules/.bin:/tmp/rdv-bk002-toolchain/node-v24.22.1-darwin-arm64/bin:$PATH"
export npm_config_cache=/tmp/rdv-bk002-npm-cache
export NEXT_TELEMETRY_DISABLED=1
```

Esses caminhos são locais/temporários, não pré-requisito portátil. Em outra máquina, preparar as mesmas versões e usar os comandos do README. Os tipos Node/React foram consultados antes de instalar, com versões exatas preservadas em [type-versions.json](type-versions.json). CLI/schematics Nest não foram instalados porque a estrutura mínima foi escrita diretamente; Prisma, banco e fila seguem nas tarefas próprias.

## Comandos e resultados

- `git init -b feat/bk-002-workspace`: sucesso com permissão de escrita local concedida; sandbox inicial negou criar `.git`. Sem commit, branch-base ou remoto anterior.
- `npm install --cache /tmp/rdv-bk002-npm-cache --no-audit --no-fund`: sucesso, 130 pacotes; gerou package-lock.json com preinstall/engines aprovados. Audit de vulnerabilidades não foi executado nem declarado aprovado.
- `npm run check`: build de todos os pacotes/apps passou; primeiro smoke no sandbox falhou por `listen EPERM` em loopback. Nenhuma alteração de lógica foi usada para ocultar a restrição; repetição do smoke com permissão de rede local passou.
- `npm run test:boundaries`: nove cenários passaram após fortalecer a verificação de alias e escape entre pacotes.
- `npm run verify:clean`: sucesso em cópia temporária sem node_modules/dist/.next; executou `npm ci --offline`, `npm run check` e `npm run typecheck` com as versões alvo. Saídas reais completas, hash do lock e resultados em clean-verification.json. Sem mensagens, cobrança, banco, Docker ou provedor.
- `git diff --check`: passou para arquivos rastreados; como ainda não há commit, fontes novas são verificadas adicionalmente antes da entrega e não se alega revisão de diff entre commits.

## Estado do Git e fontes locais

O usuário confirmou durante a execução que `plans/` deve permanecer no `.gitignore`. Essa alteração foi preservada. A pasta continua acessível no workspace, mas não estará em um clone futuro; nenhum `git add -f` foi executado. Documentação de coordenação/ADRs em docs/ e AGENTS permanecem fora dessa exclusão.

As evidências da BK-001 são históricas: seu script tinha uma asserção de que BK-002 ainda não existia. Não executar ou reescrever aquela evidência para fingir que a condição continua verdadeira. Para a entrega atual, usar os checks desta tarefa.

## Não executado

Reservas, regras de agenda, autenticação, migrações/RLS, banco, Redis/BullMQ, integrações Pix/WhatsApp/SaaS, ferramentas/modelo IA, CI e deploy. Não existe aprovação de segurança/financeiro ou comercial nesta tarefa. A falta do Docker daemon não bloqueia o bootstrap sem serviços, mas segue pendente para as tarefas de banco.

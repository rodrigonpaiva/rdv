# Evidência de execução — BK-001

Data: 23 de outubro de 2026. Tarefa documental/de decisão; nenhum recurso produtivo foi ativado.

## Entregáveis e critérios

| Critério | Evidência |
| --- | --- |
| 1. Runtime, lockfile, arquitetura e compatibilidades | [Matriz](../../planning/bk-001-baseline.md), [ADRs 00–08](../../decisions/README.md), [metadados npm](npm-metadata.json) e engine-peer-checks.json |
| 2. Fontes e precedência preservando MVP | Matriz §1–2, manutenção PT/EN nas quatro fontes, AGENTS.md e inventário de hashes anterior source-inventory.json |
| 3. Decisões externas e parâmetros por papel | [Registro de pendências](../../planning/open-decisions.md) com tarefas-gate e limites de ativação |

Os identificadores, dependências e links existentes são verificados por verify.py, sem reclassificar software não implementado como testado. Revisão independente aceita documentalmente, registrada em [review.md](review.md); o revisor leu código e resultados sem reexecutar scripts de escrita. Estado oficial: [coordenação](../../planning/coordination.md).

## Comandos efetivamente executados e resultados

- pwd / rg --files --hidden: diretório confirmado; inicialmente apenas AGENTS.md e oito documentos PT/EN em plans/.
- git rev-parse --show-toplevel: falhou porque não há Git inicializado; não existe commit/PR/diff Git desta entrega. Inicialização fica na BK-002.
- node --version: v22.22.2; npm --version: 10.9.7. Diferentes da baseline alvo 24.22.1/12.2.1.
- pnpm --version e psql --version: comandos ausentes. pnpm não foi escolhido; não há prova local de PostgreSQL.
- docker --version: 29.6.2; docker compose version: v5.3.1; uname -sm: Darwin arm64.
- docker info --format '{{.ServerVersion}}': falhou, socket do daemon ausente. Não iniciou Docker nem contêineres; disponibilidade do cliente não é disponibilidade do serviço.
- npm view next@16.4.3 version engines peerDependencies --json --cache /tmp/rdv-bk001-npm-cache --fetch-retries=0 --fetch-timeout=15000: tentativa no sandbox falhou ENOTFOUND. Consulta pública somente leitura com rede autorizada teve sucesso.
- Consultas npm view dos demais pacotes: bem-sucedidas com rede autorizada, sem instalação, preservadas em npm-metadata.json. O campo query conserva se a descoberta usou latest ou uma linha major; metadata.version contém o pin efetivamente decidido. Não usar esses aliases em manifests.
- Fontes primárias web abertas: Node, Next, Nest, Prisma v7, PostgreSQL e Redis/BullMQ, listadas na matriz §6. Verificação documental de suporte, sem conta de provedor.
- node docs/evidence/bk-001/check-engines.cjs: validação semver usando o módulo semver já incluído no npm local, sem instalar dependências; de engines/peers selecionados: engine-peer-checks.json. Mede requisitos declarados; não resolve todas as transitivas nem executa o conjunto.
- Verificação local: python3 docs/evidence/bk-001/verify.py. Saída persistida em verification.json; resultado deve ser lido no arquivo, não presumido.

## Não executado e limites

Instalação do runtime alvo, geração do package-lock.json, npm install/ci, build, testes de aplicação, migrações, SQL de exclusão/RLS, Redis/BullMQ conjunto, testes de contrato sandbox, chamadas de modelo, revisão Figma ao vivo e deploy: não executados. Pertencem a BK-002 e tarefas seguintes. A compatibilidade aqui é declarativa/documental; execução ainda precisa de evidência própria.

Hashes de entrada permitem identificar os insumos antes das correções; não são uma cópia de segurança nem substituem Git. Os arquivos atuais serão versionados no bootstrap. A evidência não inclui .env, tokens, dados de clientes ou instruções Pix.

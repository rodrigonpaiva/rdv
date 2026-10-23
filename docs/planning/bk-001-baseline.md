# BK-001 — Baseline técnica e matriz de compatibilidade

Data da decisão: 23 de outubro de 2026. Responsável: coordenação técnica. Estado de execução e revisão: [coordenação](coordination.md). Esta entrega encerra decisões iniciais de engenharia, não BK-002, homologação de provedor ou aceite de software.

## 1. Fontes, precedência e idioma

| Fonte local canônica | Autoridade | Revisão lida |
| --- | --- | --- |
| [Spec funcional](../../plans/spec-general.md) | Escopo, RF01–RF18, CA01–CA30, regras comerciais e limites | v1.0, §§1–16,17–29 |
| [Especificação técnica](../../plans/ESPECIFICACAO_TECNICA_MVP_v1.md) | Decomposição, I01–I15, modelo, transações, contratos e verificação | v1.0, §§1–27 e apêndices |
| [Design system](../../plans/DESIGN_SYSTEM_MVP_v1.md) | Direção visual, interação, acessibilidade, 26 jornadas e 102 vistas | conteúdo v2.0, §§1–16 e apêndices A–D |
| [Backlog](../../plans/BACKLOG_TECNICO_MVP_v1.md) | Sequência e dependências das 99 tarefas | v1.0, estrutura, cartão BK-001 e tarefas dependentes |
| [AGENTS.md](../../AGENTS.md) | Procedimento operacional e limites dos agentes | guia inicial com atualização da BK-001 |
| [ADRs](../decisions/README.md) | Decisões de engenharia adotadas e histórico de substituição | ADR00–ADR08 nesta entrega |

Português é a fonte normativa dos documentos existentes; arquivos .en.md são traduções sincronizadas, sem autoridade para alterar regras. Novos identificadores de código continuam em inglês. Interface do produto continua pt-BR, BRL e fuso IANA da unidade. Correções de manutenção documental são aplicadas nas duas versões e registradas, sem reescrever histórico como implementação entregue.

Precedência por assunto: regra comercial/escopo na SP; comportamento e visual no DS subordinados à SP; engenharia na ET/ADRs sem revogar negócio; backlog somente organiza execução. AGENTS define como trabalhar, sem substituir autorização do usuário. Conflito material deve ser registrado e resolvido na fonte responsável antes do trecho afetado; trabalho independente pode continuar.

O nome antigo SPEC_Plataforma_Agendamento_BR_v1.md passa a apontar para o arquivo real spec-general.md; não foi criada cópia paralela. O arquivo MAPA_PAGINAS_E_WIREFRAMES_MVP_v1.md não está disponível localmente. Adotar explicitamente os apêndices A–D do DS como inventário local para esta fase: 26 jornadas, 102 vistas, rotas conceituais, links e RF/CA. Não foi alegada recuperação do mapa original nem revisão ao vivo do Figma. Antes de implementar uma tela, conferir o frame correspondente e suas diferenças com a documentação.

## 2. Arquitetura e contratos preservados

Monólito modular TypeScript; web Next.js, API NestJS e worker separado compartilhando packages/backend. Estrutura da ET §4 será criada na BK-002. Domínio puro, aplicação com unidade de trabalho, portas e adaptadores de infraestrutura. Web e modelo não escrevem tabelas nem decidem liquidação/permissão.

PostgreSQL é autoridade de ocupação e registros financeiros; exclusão GiST com btree_gist/tstzrange e active explícito, FKs por tenant e RLS transacional com runtime sem propriedade/BYPASSRLS. O tenant usa contexto da mesma conexão/transação (por exemplo SET LOCAL nas implementações futuras), nunca estado de sessão vazando por pooling. Prisma não substitui constraints, SQL versionado ou testes reais. A configuração exata de pooling ainda deve ser provada na BK-009.

Um motor para web/recepção/WhatsApp; quotes não reservam nem cobram; snapshots/aceites versionados; troca atômica; locks na ordem da ET §10.3; nenhum acesso externo com transação aberta. Outbox/inbox e idempotência antes de efeitos externos; entrega pelo menos uma vez e reconciliação de resultados incertos. BullMQ será configurado com Redis, não com um novo backend de fila por conveniência.

Uma unidade na UI inicial, um serviço/profissional por reserva. Preservados I01–I15, RF01–RF18 e CA01–CA30. Pix e SaaS separados, sem custódia própria; proposta do piloto com devolução integral, sem retenção automática por falta. Sem marketplace nacional, app nativo, estoque, comissões, prontuário, recursos compartilhados, serviços encadeados, RAG vetorial ou fine-tuning.

## 3. Toolchain congelada para o bootstrap

As versões abaixo são decisões desta tarefa, verificadas em documentação primária e metadados públicos. “Declarada compatível” significa que requisitos de engine/peer e suporte documental não conflitam; não significa instalação, execução conjunta ou auditoria de segurança aprovadas. Os metadados completos estão em [npm-metadata.json](../evidence/bk-001/npm-metadata.json).

| Componente | Pin de bootstrap | Evidência / condição |
| --- | --- | --- |
| Node.js | 24.22.1 LTS | Página oficial de download e política LTS; atende Next, Prisma, npm e schematics Nest selecionados |
| npm | 12.2.1 | engine ^22.22.2 ou ^24.15.0 ou >=26; Node 24.22.1 atende |
| Workspace/lock | npm workspaces; package-lock.json, lockfileVersion 3 | Decisão ADR00; arquivo ainda não existe e será gerado pelo npm na BK-002 |
| TypeScript | 6.0.3 | peer schematics >=6.0.0; Prisma >=5.4; Next mínimo 5.1; não adotar TS7 nesta baseline |
| Next.js | 16.4.3 | engine >=20.9; peer React/ReactDOM ^19.0.0 aceito |
| React / ReactDOM | 19.3.1 / 19.3.1 | ReactDOM exige React ^19.3.1; par alinhado ao Next |
| Nest core/common/platform-express | 12.2.0 / 12.2.0 / 12.2.0 | Mesmo major; Node >=20; ESM conforme guia de migração |
| Nest CLI / schematics | 12.0.10 / 12.0.10 | Schematics exige ^22.22.3 ou ^24.15.0 ou >=26; o Node local atual não atende |
| rxjs / reflect-metadata | 7.8.2 / 0.2.2 | Atendem peers declarados de Nest; decorator metadata deve ser provado no build real |
| Prisma CLI / client / adapter-pg | 7.10.1 / 7.10.1 / 7.10.1 | Linha v7 estável, conjunto alinhado; Node24 e PostgreSQL18 constam no suporte; v8 RC não adotada |
| pg | 8.23.1 | Satisfaz dependência adapter-pg ^8.16.3; driver em infrastructure |
| PostgreSQL | 18.6 | Minor corrente da linha 18 na fonte oficial; extensão btree_gist; RLS/exclusão documentados |
| BullMQ | 6.4.0 | engine >=14.17; ioredis >=5; selecionar explicitamente backend Redis |
| ioredis | 6.0.0 | engine >=20; satisfaz peer BullMQ; não confundir cliente Redis com servidor Redis |
| Redis Open Source | 8.2.10 | Série extended com suporte declarado até 2030; patch presente no índice oficial; replay/conexão exigem prova futura |

Fixar packageManager, engines e versão de runtime ao criar o projeto. Pins exatos nos manifests; transitivas/integridades no único lockfile. Atualizações por mudança coesa com motivo e checks; não usar force/legacy-peer-deps para esconder conflito. Licenças de dependências e escolha de hospedagem são revisadas antes da distribuição/ativação comercial; escolha de Redis OSS não contrata um serviço.

Imagens: baseline Linux Debian/glibc para evitar introduzir diferenças musl/OpenSSL sem necessidade. Variante de imagem e digest de Node/PostgreSQL/Redis ainda devem ser consultados e registrados nas BK-002/BK-004/BK-090 antes de criar Compose/deploy; números acima não alegam existência de uma tag específica. Extensão PostgreSQL btree_gist deve ser provada com papel de migração, não concedendo esse privilégio ao runtime. Sem tags flutuantes de produção.

Ferramentas de testes, lint, autenticação e SDKs de provedores não são escolhidas por suposição aqui: fixar versões/compatibilidade no respectivo cartão antes de adicionar dependências. Nenhum fornecedor de nuvem, IA, WhatsApp ou Pix foi selecionado.

## 4. Ambiente observado e lacunas de execução

| Inspeção | Resultado |
| --- | --- |
| Diretório inicial | AGENTS.md e plans/; sem app, package.json, lockfile, scripts ou Git |
| node --version | v22.22.2 |
| npm --version | 10.9.7 |
| pnpm --version | comando ausente; não necessário ao gerenciador escolhido |
| docker --version / compose / info | Cliente 29.6.2, Compose v5.3.1; daemon indisponível (socket ausente); nenhum contêiner iniciado |
| psql --version | comando ausente; testes de banco poderão usar contêiner na tarefa própria |
| npm view no sandbox | falha ENOTFOUND; consulta pública somente leitura repetida com rede autorizada e bem-sucedida |

O runtime alvo não foi instalado globalmente. Próxima tarefa deve preparar Node/npm alvo sem sobrescrever ambiente pessoal por suposição. Não há comando de aplicação validado nesta entrega. Nenhum build, instalação de dependências, migração, chamada Pix, envio WhatsApp, avaliação de modelo ou teste E2E foi executado.

## 5. Aceite da BK-001 e passagem para BK-002

| Critério do cartão | Entrega verificável |
| --- | --- |
| Runtime, lockfile, arquitetura e compatibilidades | ADR00–ADR03/ADR05, pins acima, engines/peers capturados e fontes primárias; decisão de lockfile separada da criação futura |
| Fontes e precedência, sem ampliar MVP | §1–2 e correções PT/EN; inventário local do DS formalizado |
| Decisões externas e parâmetros com responsáveis | Registro de decisões/parametrização e tarefas-gate em open-decisions.md |

BK-002 recebe: runtime/gerenciador/pins, árvore ET §4, regras de imports e fontes corrigidas. Seu aceite continua sendo instalação limpa, build reproduzível e fronteiras verificadas; não está concluído pela presente documentação. A BK-007 permanece pendente porque o guia existente ainda precisa de comandos reais testados. Privacidade/produto BK-089 pode começar após esta baseline; Pix BK-048 e WhatsApp BK-061 dependem também dos contratos BK-005.

## 6. Fontes públicas consultadas

Consulta em 23 de outubro de 2026. Revalidar se houver mudança de versão antes do bootstrap; não interpretar esta lista como homologação do conjunto instalado.

- [Node.js download](https://nodejs.org/en/download) e [política de releases](https://nodejs.org/en/about/previous-releases).
- [Next instalação](https://nextjs.org/docs/app/getting-started/installation).
- [Nest migração e requisitos Node/ESM](https://docs.nestjs.com/migration-guide).
- [Prisma v7 requisitos](https://www.prisma.io/docs/orm/v7/reference/system-requirements), [bancos suportados](https://www.prisma.io/docs/orm/v7/reference/supported-databases) e [migrações customizadas](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/unsupported-database-features).
- [PostgreSQL versões](https://www.postgresql.org/support/versioning/), [ranges](https://www.postgresql.org/docs/18/rangetypes.html) e [RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html).
- [BullMQ conexões](https://docs.bullmq.io/guide/connections).
- [Redis suporte de versões](https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/) e [índice oficial de releases](https://download.redis.io/releases/).
- [npm workspaces](https://docs.npmjs.com/cli/v12/using-npm/workspaces/) e [package-lock.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-lock-json/): gerenciador/workspace e formato de lock escolhidos.
- [npm registry](https://registry.npmjs.org/): engines, peers, dependências e integridades das versões selecionadas, preservados no JSON de evidência.

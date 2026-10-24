# Coordenação de execução

## BK-001 — Baseline, versões e ADRs iniciais

- Estado: Concluída (aceite documental da BK-001).
- Responsável: agente principal, papel de coordenador técnico.
- Revisor: agente /root/bk001_review, papel independente backend/QA, somente leitura.
- Branch/worktree/commit-base: não aplicável; Git ainda não inicializado. Bootstrap de Git fica na BK-002.
- Dependências: nenhuma; quatro fontes PT e traduções EN disponíveis; mapa separado ausente, inventário disponível no DS.
- Objetivo: cumprir os três critérios de BK-001 sem alterar política comercial ou ativar serviços.
- Fontes: spec-general §§1,3,6–16,24–28; ET §§1–14,21–26; DS §§1,3–8,13–16 e apêndices; backlog §§1–5/BK-001–008; AGENTS.md.
- Propriedade: coordenador escreve docs/decisions, docs/evidence/bk-001, docs/planning e correções documentais correlatas. Revisor somente lê e reporta.
- Contratos/migrações: nenhum contrato de domínio alterado; nenhuma migração criada.
- Limites: não implementar BK-002, instalar stack global, iniciar Git, contratar provedores, enviar mensagens, cobrar ou fazer deploy.
- Evidência esperada: matriz de versões e requisitos, metadados públicos, decisões arquiteturais, pendências por papel e verificação documental.
- Bloqueios: nenhum para BK-001. Node/npm locais diferem da baseline e Docker daemon está indisponível; provas de instalação/build/banco pertencem às próximas tarefas.
- Próximo responsável: coordenação/arquitetura na BK-002; execução registrada abaixo.

## Evidência e histórico da BK-001

- 23/10/2026 — fontes e ambiente inventariados; ausência do mapa separado registrada; nenhuma aplicação/Git preexistente.
- 23/10/2026 — metadados públicos e requisitos oficiais consultados; ADR00–08, matriz e registro de pendências preparados. Referências PT/EN e AGENTS corrigidos sem alterar RF/CA.
- 23/10/2026 — node docs/evidence/bk-001/check-engines.cjs: 30 verificações selecionadas passaram; pares opcionais fora do conjunto registrados. python3 docs/evidence/bk-001/verify.py: 129 checks documentais passaram.
- 23/10/2026 — /root/bk001_review aceitou documentalmente os critérios 1–3 após revisão independente somente leitura; [parecer](../evidence/bk-001/review.md). Coordenação encerra BK-001; BK-002 não executada.
- Entregas: [baseline](bk-001-baseline.md), [ADRs](../decisions/README.md), [pendências](open-decisions.md), [evidência](../evidence/bk-001/README.md).
- Commit/PR: não existem; Git permanece não inicializado até BK-002.

## BK-002 — Workspace e fronteiras

- Estado: Concluída (aceite técnico independente BK-002).
- Responsável: agente principal, coordenação/arquitetura; único escritor do bootstrap.
- Revisor: agente /root/bk002_review, backend/QA independente; somente leitura, sem editar ou reconstruir simultaneamente.
- Branch/worktree: feat/bk-002-workspace; base sem commits/Git a inicializar, documentos preexistentes preservados.
- Dependência: BK-001 concluída com aceite independente e matriz de pins disponível.
- Objetivo: web/API/worker reproduzíveis, aplicação backend compartilhada, domínio sem dependências externas e web sem persistência/segredos.
- Fontes: cartão BK-002; ET §§2–6,21,23; ADR00/01; AGENTS §§2–6,10–12.
- Propriedade: apps/, packages/, scripts/, manifestos, lockfile, configurações de bootstrap, README e evidência BK-002; correções de estado PT/EN e comandos AGENTS pelo coordenador.
- Contratos/migrações: apenas contrato de diagnóstico da fundação, sem endpoint de negócio, banco ou migração.
- Limites: não executar BK-003–008, integrar provedores, publicar, enviar mensagens ou cobrar. Runtime isolado, sem instalação global no ambiente pessoal.
- Verificações: instalação limpa pelo lock, tipos/build, imports positivos/negativos e smoke real de ESM/Nest/web/worker.
- Bloqueio inicial resolvido: Node 24.22.1/npm 12.2.1 em prefixos temporários; Docker não necessário a este cartão.
- Próximo responsável: coordenação/arquitetura na BK-003 e BK-005; BK-004 aguarda BK-003. Nenhum desses cartões foi iniciado.

## Evidência e histórico da BK-002

- Runtime oficial em /tmp com SHA256 conferido; npm12 isolado, sem alteração global. Git inicializado na branch feat/bk-002-workspace; nenhum commit/PR ou remoto.
- Construídos oito workspaces com exports públicos e árvore da ET. API e worker usam GetWorkspaceInfo da mesma aplicação backend. Endpoint de diagnóstico não implementa reserva nem prontidão de integrações.
- Build completo aprovado. Smoke inicialmente negado por sandbox em listen loopback; execução local autorizada passou sem enfraquecer verificações.
- Nove cenários de arquitetura aprovados, incluindo alias TS real e dependência transitiva. Cópia limpa executou npm ci offline, check e typecheck; lock SHA256 inalterado. [Resultado](../evidence/bk-002/clean-verification.json).
- Usuário confirmou explicitamente manter plans/ fora do Git. Alteração externa no .gitignore preservada; fontes locais não virão em clone futuro. README e AGENTS registram o limite.
- README e comandos operacionais atualizados; BK-003–008 não executadas. Revisão final independente aceita sem achados materiais; [parecer](../evidence/bk-002/review.md).

- Encerramento BK-002: critérios 1–3 aceitos, instalação/build/imports reproduzidos. Branch feat/bk-002-workspace, sem commit/PR/remoto. Diferenças preexistentes do usuário preservadas. Comandos e limitação de plans/ registrados no README e AGENTS.

## BK-003 — Runtime configuration, secret references, and tenant flags

- Status: In progress.
- Owner: root agent, backend/configuration and coordination.
- Dependency: BK-002 accepted; base commit b9c888f.
- Branch: feat/bk-003-configuration.
- Sources: English BACKLOG BK-003; technical specification sections 7–8, 17–18, 21, 23; functional specification and DS English editions as needed.
- Repository language: the user requires English for every new or updated repository entry and all README files; English planning documents govern this task. Existing product localization remains a product decision.
- Ownership: root edits config, API/worker composition, scripts/tests, lock and BK-003 evidence; translation agent owns repository README files and AGENTS.md until handoff; independent reviewer /root/bk003_review is read-only.
- Acceptance: fail-closed boot with explicit environment/providers; scoped protected secret references excluded from web; tenant gates stop new bot/Pix operations without stopping resolution of existing obligations.
- Exclusions: no live providers, tenant authorization/persistence, database connections, production vault contract, deployment, commit or push.
- Verification: negative configuration/secret/environment tests, real API/worker boot checks, architecture checks, web artifact secret-canary check, builds and types.

### BK-003 completion

Status: complete for the configuration foundation. Independent QA found no blocking issue; both suggested missing-secret scenarios were implemented and passed (18/18 final configuration tests). Full clean reproduction passed offline installation, integrated build/boundary/config/smoke/client-canary checks and typecheck with unchanged lockfile. The clean copy ran the original 16 tests; final two scenarios passed separately. Evidence: [BK-003](../evidence/bk-003/README.md). All repository-owned READMEs are English only, and AGENTS records the continuing English writing policy. No live vault/provider/database activation, commit or push. Next owner: BK-004 database implementation; retain existing-obligation resolution when consuming tenant switches.

## BK-004 — Real database, migrations, and synthetic fixtures

- Status: complete for the BK-004 foundation scope; independently accepted on October 24, 2026.
- Owner/integration owner: root agent, architecture/infrastructure.
- Reviewer: /root/bk004_review, independent QA/security, read-only; assigned at the user’s explicit request on October 24, 2026. Root remains the sole integration writer. Review covers the current combined diff and acceptance evidence; no shared builds run concurrently.
- Branch/base: feat/bk-004-database, b99cb68; clean starting worktree.
- Dependency: BK-003 completed with evidence in docs/evidence/bk-003.
- Sources: English backlog BK-004; ET sections 6–8, 20–21, 23; ADR00/02; cross-cutting RF/CA, no dedicated wireframe.
- Goal: versioned migrations on an empty real PostgreSQL database, repeatable disposable reset, two synthetic tenants, controllable test clock, separate migration/application roles.
- Ownership: database/, scripts/database/, testkit clock, root manifest/lockfile, database documentation and BK-004 evidence.
- Contracts: tenant root anchor only; no business API, provider, scheduling or financial contract. Full tenancy, composite business FKs and pooling authorization remain BK-009.
- Limits: local disposable database only; no remote database, production activation, push, commit, or deployment.
- Checks: empty and populated migration deploy, recreated database, least-privilege failures, tenant fixture isolation, transaction context reset, clock tests, existing integrated checks/types.
- Environment: Docker initially stopped; started installed Docker Desktop. Node/npm use isolated BK-002 pins.
- Next owner: root implementation, then independent review before final acceptance.

### BK-004 delivery

- Status: complete for the stated foundation scope; accepted by independent reviewer /root/bk004_review. See [review](../evidence/bk-004/review.md).
- All three foundation criteria have executed evidence: two empty-database cycles, deterministic two-tenant fixtures and clock checks, separate least-privilege migration/application connections. Populated redeploy preserves data.
- `npm run verify:clean -- bk-004 --database` passed offline installation, integrated checks (9 boundary, 18 config, 2 clock/target tests, build, real smoke, secret canaries), types and real PostgreSQL migration tests; lock unchanged. Test containers were removed.
- Evidence: [BK-004](../evidence/bk-004/README.md); instructions: [database](../../database/README.md).
- No business endpoints, production connection, provider activation, commit or push. Tenant root defense does not complete BK-009 authorization/pooling/business FKs.
- Next owner: independent reviewer/coordinator for acceptance, followed by ready dependent work such as BK-009 and CI integration in BK-006.

### BK-004 independent acceptance

- October 24, 2026 — /root/bk004_review reviewed all tracked/untracked implementation changes and the source criteria, then independently reproduced offline installation, real PostgreSQL tests, clock tests and Prisma schema validation in an artifact-free copy. No blocking findings or required changes.
- Source/copy hashes matched; no test containers remained. Broader check/typecheck results were inspected rather than rerun. Populated redeployment does not prove a future schema-version upgrade.
- Coordination accepts BK-004 for its three foundation criteria. Next owner: coordinator for ready dependent tasks; BK-009 and BK-006 retain their documented authorization/CI scope. No commit, push, merge or deployment performed.

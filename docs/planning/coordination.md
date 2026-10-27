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

## BK-005 — REST, OpenAPI, safe errors and generated client

- Status: complete for the stated BK-005 scope; independently accepted after one P2 correction.
- Owner/integration owner: root agent, architecture/backend; sole implementation writer. Reviewer: /root/bk005_review, independent QA/security, read-only, assigned at the user’s explicit request on October 24, 2026. Root owns integration and review records; no shared builds run concurrently.
- Branch/base: feat/bk-005-api-contracts, c8f2004; clean starting worktree.
- Verified dependency: BK-002 accepted, workspace/build/boundaries established; BK-003 runtime configuration and BK-004 database foundation preserved.
- Sources: all four local English planning documents, version 1.0 (DS content 2.0), with emphasis on SP sections 4, 13–20; ET sections 3–6, 12–13, 18–23; DS sections 7–13 and appendices; full backlog task/dependency inventory and BK-005 criteria. Cross-cutting RF/CA enabler, no dedicated view.
- Goal/criteria: consistent /v1 and public snake_case DTOs, strict reusable input validation, safe code/correlation_id errors, bounded cursor pagination schemas and reproducible browser-safe client generated from OpenAPI.
- Ownership: API HTTP composition, contracts package, generator/tests, affected consumers/smoke, manifest/lockfile, contract decision/documentation and BK-005 evidence; no database/schema changes.
- Shared contracts: existing foundation diagnostic becomes /v1/health; /health retained as explicit liveness compatibility alias. OpenAPI lists only implemented routes, future booking schemas do not activate booking endpoints.
- Limits: no identity, role/tenant resolution, persistence, bookings, external providers, live messages/charges, deployment, commit or push.
- Expected checks: OpenAPI lint/schema validation, deterministic regeneration/drift detection, invalid/unknown inputs, safe framework/unexpected/parser errors, trusted correlation policy, bounded pagination, generated client HTTP and compile-time checks, boundaries/build/types/config/smoke/secrets and clean reproduction.
- Next owner: root implementation; reviewer/coordinator after evidence is ready.

### BK-005 delivery

- Status: independently accepted by /root/bk005_review after one resolved P2 transport-mapping finding. See the review record.
- Delivered: canonical OpenAPI 3.1 with generated public operation/schema types, browser-safe client, v1 URI default plus explicit legacy liveness alias, strict input/pagination primitives, safe closed errors and correlation installed before parsing.
- All three criteria have author evidence. `npm run verify:clean -- bk-005` passed offline installation, OpenAPI/drift checks, 9 boundary tests, full build, 7 contract tests, 18 configuration tests, 2 clock/target tests, real API/worker/web smoke, client canaries and typecheck; lock unchanged. Negative drift test found and verified the correction for macOS temporary path aliases.
- Planning analysis: [BK-005 contracts](bk-005-contracts.md); decision: [ADR15](../decisions/ADR15-rest-openapi.md); actual commands/results/limits: [evidence](../evidence/bk-005/README.md).
- No database, domain authority, product UI, provider activation, commit, push or deployment changes. Future schemas/error vocabulary do not activate proposed business routes.
- Next owner: independent reviewer/coordinator for acceptance, then ready dependent tasks including BK-006. Full domain authorization, scoped cursor repositories and idempotency recovery remain their own tasks.

### BK-005 review and publication authorization

- User explicitly requested independent review, TypeScript version confirmation, then commit and push of BK-005. The prior no-commit/no-push limit is superseded for this delivery; no merge or deployment is authorized. Reviewer scope: all tracked/untracked task changes, source criteria and isolated contract/HTTP/type checks.

### BK-005 independent acceptance and handoff

- /root/bk005_review independently accepted BK-005 after reproducing and rechecking the unsupported charset/encoding correction (500 to safe 415). No remaining blockers. [Review](../evidence/bk-005/review.md).
- Independent offline installation, isolated builds/types, final 7/7 contract tests and production probes passed. All 75 source files and lock matched the reviewed copy; TypeScript compiler confirmed 6.0.3.
- Integration owner repeated `npm run verify:clean -- bk-005` after the correction: offline install, integrated checks/build/smoke, 36 tests, client canaries and all-workspace types passed; lock unchanged.
- User-authorized next action: commit and push only this reviewed delivery to origin/feat/bk-005-api-contracts. Git history records the resulting commit. No merge or deployment. Next task owner: coordinator for BK-006 or another dependency-ready slice.

## BK-006 — Quality CI and versioned artifacts

- Status: in progress; remote execution and independent review pending.
- Owner/integration owner: root, architecture/infrastructure; sole writer.
- Reviewer: not yet assigned; author verification is not independent acceptance.
- Branch/base: feat/bk-006-quality-ci, 3d693d0; clean starting worktree.
- Verified dependencies: BK-004 real PostgreSQL foundation and BK-005 contracts independently accepted.
- Sources: English backlog BK-006 criteria 1–3; ET sections 20–21 and 23; functional specification v1.0 and DS v2.0 for scope. Cross-cutting RF/CA enabler; no dedicated view.
- Goal: locked installation, lint/types/unit/contracts/database/build gates; failed checks prevent artifact creation/upload; checksummed build outputs and migrations tied to commit and lock.
- Ownership: .github/workflows, scripts/ci, lint configuration, manifest/lock, clean verifier, CI documentation and BK-006 evidence; no application/domain/schema changes.
- Shared contracts/migrations: package scripts only; existing SQL and OpenAPI bundled without modification.
- Limits: no production credentials, deployment, provider activation, branch protection changes or remote publication without authorization. BK-090 owns deployment/runtime images.
- Checks: lint negative probe, unit/contract/boundary/config/clock tests, real PostgreSQL, build/types/smoke/canaries, artifact integrity and failure/stale receipt tests, clean reproduction; remote success/failure workflow evidence remains required.
- Next owner: root implementation, then independent reviewer/coordinator.

### BK-006 local delivery

- Implementation and local evidence ready. Clean offline reproduction passed lint, 3 CI regression tests, existing 36 tests, real PostgreSQL, build/types/smoke/canaries; lock unchanged. Exact CI entry point and artifact packaging also passed in a committed temporary snapshot, including a fresh run without prior outputs.
- A controlled lint regression on a temporary test branch failed before later gates and left no receipt/artifact. Archive manifest independently verified for all 230 payload files, including migration SQL. See [evidence](../evidence/bk-006/README.md).
- Status remains pending independent review and actual GitHub success/failure workflow evidence. No commit or push in the task checkout. Next owner: user authorization for remote publication/test branch, reviewer and coordinator for final acceptance.

### BK-006 review and remote publication authorization

- October 25, 2026: user explicitly authorized independent review, then commit/push of the implementation and controlled-failure branches to prove the GitHub pipeline. No merge, deployment or branch-protection change authorized.
- Reviewer: /root/bk006_review, independent QA/infrastructure, read-only task scope; may use an isolated temporary copy for verification. Root remains sole integration writer. Review includes all current tracked/untracked task changes, source criteria, failure gating, provenance and credential exclusion. No concurrent builds in the shared checkout.

### BK-006 independent implementation acceptance

- `/root/bk006_review` accepted publication without blocking findings after independent fresh offline installation, exact quality/artifact commands, PostgreSQL integration and all 230 payload hashes. Real modified-output, wrong-commit and committed-lint failure probes were rejected. See [review](../evidence/bk-006/review.md).
- Root proceeds with user-authorized scoped commit/push and actual GitHub success/failure evidence. Final task acceptance remains pending those remote checks; no merge or deployment.

### BK-006 remote evidence and completion

- Status: complete for all three BK-006 criteria. Implementation commit `57248ae8af969b55d45075683a671e6ddcf53077` published to `origin/feat/bk-006-quality-ci` under explicit user authorization.
- GitHub run [40180923057](https://github.com/rodrigonpaiva/rdv/actions/runs/40180923057) succeeded on Ubuntu 24.04: locked install, lint/types, 40 tests including real PostgreSQL, build/smoke/canaries, packaging and upload.
- Controlled-failure branch `test/bk-006-controlled-lint-failure`, commit `9f82155636fdc09aa8d1d2d918a88a56457dd397`, run [40180936823](https://github.com/rodrigonpaiva/rdv/actions/runs/40180936823): expected lint failure, package/upload skipped and zero artifacts. Branch retained as explicit test evidence; no deliberate regression on the implementation branch.
- `/root/bk006_review` independently accepted implementation and remote gate behavior. Root downloaded successful artifact `12593993605`: GitHub ZIP digest, tar checksum, all 230 payload file hashes, all 142 source hashes, lock and migration bytes matched the published commit. [Evidence](../evidence/bk-006/README.md).
- This final evidence publication changes documentation only; its exact head receives the normal CI workflow as well. No merge, deployment, production credentials or branch-protection changes. Next owner: coordinator for BK-007 or another dependency-ready task; BK-090 retains runtime/deployment work.

## BK-006 audit follow-up — P2/P3 foundation corrections

- Status: in progress; user requested correction of all five audit findings.
- Owner/integration owner: root, architecture/infrastructure; sole writer. Reviewer: author checks only for this follow-up; no independent acceptance claimed.
- Branch/base: fix/bk-006-foundation-audit, 6c85c454822d3695b42cebf3c0cb20a01bae61df; clean starting checkout.
- Dependencies/sources: accepted BK-002/004/006; English backlog criteria for boundaries, migrations and artifact provenance; ET sections 3–4, 20–21 and 23. Cross-cutting enabler, no dedicated wireframe or business-rule change.
- Goal: remove obsolete compiled files before builds, execute migration CLI through symlinks, reject equivalent Node builtin imports, preserve historical verification reports, correct outdated lint/CI guidance.
- Ownership: scripts/workspaces.mjs, scripts/check-boundaries.mjs and tests, scripts/database/migrate.mjs and CLI tests, scripts/verify-clean.mjs/report helper and tests, root/CI documentation and follow-up evidence. No manifest/lock, application, contract or migration SQL changes.
- Checks: regression probes, full lint/types/tests/build/smoke/PostgreSQL, isolated committed exact quality/artifact pipeline seeded with stale outputs, historical evidence/lock preservation and diff checks.
- Limits: no new domain work, production connection, provider activation, merge or deployment. Remote publication is not part of this correction request.

### BK-006 audit follow-up delivery

- Status: all five P2/P3 corrections implemented and author-verified. New regressions cover obsolete outputs, migration symlink/stdin entry behavior, builtin aliases and non-overwriting verification reports. README/AGENTS/CI guidance updated.
- Actual default clean verification with PostgreSQL passed; historical report and lock hashes unchanged. Exact quality/artifact commands in a committed temporary snapshot passed 44 tests and all other gates after removing obsolete binaries seeded in all eight workspaces; all 230 payload hashes verified. Working checkout rebuild also removes the previously observed obsolete SDK output.
- [Follow-up evidence](../evidence/bk-006/audit-follow-up/README.md). No business code, schema/SQL migration, OpenAPI, dependency or lock changes. No task-checkout commit/push, remote workflow, merge or deployment; no independent acceptance claimed for these new changes. Next owner: reviewer/coordinator for this correction slice.

### BK-006 second audit corrections — verification isolation and report retention

- User requested correction of the additional P2/P3 findings. Existing branch/base and sole integration owner remain unchanged; previous user changes and evidence are preserved.
- Ownership extends to the source-copy helper, quality artifact invalidation, regression tests and related instructions. Goal: exclude nested local dotenv files before copying, preserve safe example templates, and retain default verification reports even if CI rejects the checkout while still invalidating stale build bundles/receipts.
- Expected checks: isolated synthetic environment-file/symlink fixtures, actual quality CLI rejection with report preservation, full clean verification with disposable PostgreSQL and exact committed-snapshot quality/artifact checks. No business changes, new dependencies, remote publication or deployment.

### BK-006 source-copy link isolation correction

- User authorized correcting the reproduced P2 `.env.example -> .env.local` bypass. Root remains sole writer on fix/bk-006-foundation-audit; existing local changes are preserved.
- Owned scope: verification-source helper, source-copy regressions, related guide/evidence. Included symbolic links now fail closed, including internal, external, directory and dangling links; excluded dotenv/output entries remain skipped without following targets. This intentionally requires regular source files/directories for a self-contained verification copy.
- Expected checks: synthetic alias regressions, lint, CI tests and clean reproduction. No domain, dependency, migration, commit/push or deployment changes.

- P2 result: fail-closed source-link correction passed lint, 8/8 CI regressions and actual clean reproduction (46 tests plus build/types/smoke/canaries); lock unchanged. Regular templates preserved; all included symlinks rejected. [Evidence](../evidence/bk-006/audit-follow-up/source-link-isolation.md). No independent acceptance, database rerun, artifact promotion or remote publication claimed for this narrow change.

### BK-006 final local consolidation

- Current request: execute BK-006 according to the English planning sources. The original BK-006 is already independently accepted with remote success/failure evidence; this continuation consolidates its uncommitted audit corrections rather than recreating the workflow or starting BK-007.
- Owner: root, sole integration writer. Branch/base remain fix/bk-006-foundation-audit / 6c85c45. Existing user/local changes preserved. Independent review of the correction slice remains unassigned.
- Scope: verify the exact final quality/artifact entry points in an isolated, locally committed source snapshot; compare source/lock/migration/payload hashes; exercise committed controlled lint failure and stale-artifact invalidation while preserving verification reports. Use synthetic data and disposable PostgreSQL only.
- No application, contract, dependency or schema change is required. No task-checkout commit, remote push/test branch, merge or deployment is authorized by this continuation. Historical remote evidence applies only to its original commits.
- Expected evidence: complete local quality pipeline, fresh artifact manifest/hash verification and controlled failure with no receipt/archive. New uniquely named consolidation evidence will preserve historical reports. Next owner: reviewer/coordinator for correction-slice acceptance and publication decision.

- Final consolidation found platform metadata sidecars in the local macOS tar archive, absent from its verified manifest. Ownership extends to scripts/ci/artifact.mjs and its real archive regression. Packaging now suppresses AppleDouble metadata with COPYFILE_DISABLE while preserving payload bytes; Linux tar ignores this environment setting. The final snapshot must prove exact archive membership as well as every file hash. This is a packaging correction within BK-006 criterion 3, with no runtime or business change.

### BK-006 final local consolidation result

- All local corrections are now verified together through exact `ci:quality` / `ci:artifact` commands on isolated snapshot `4df776fdd009291e098b2bf87cb0f80bacc1c6eb`, base `6c85c45`. Offline installation and 48 tests passed, including disposable PostgreSQL; build/types/smoke/client canaries passed.
- Exact tar membership and all 230 payload hashes, 155 source hashes, lock and migration bytes matched. Eight seeded obsolete binaries were removed. Changed compiled output was rejected; a separately committed local lint failure stopped the pipeline, invalidated receipts/bundles and preserved verification reports.
- macOS metadata-sidecar correction passed its real archive regression and the repeated full pipeline. [New evidence](../evidence/bk-006/audit-follow-up/final-consolidation/README.md) preserves all historical reports.
- Status: correction slice ready for independent review/integration. Original BK-006 remains historically accepted; no new task-checkout commit/push, GitHub workflow, independent approval, merge or deployment is claimed. Next owner: reviewer/coordinator for acceptance and publication decision. BK-007 remains a separate ready task.

### BK-006 correction publication authorization and pre-commit review

- User explicitly requested repository/fix analysis, then commit and push before the next BK. This supersedes the prior local-only publication limit for the current fix branch; no merge, deployment or next-BK implementation is authorized here.
- Root reviewed the combined tracked/untracked correction slice: stale output cleanup, migration CLI aliases, Node builtin boundaries, non-overwriting verification reports, dotenv/symlink isolation, report retention, exact archive membership and updated commands/evidence. No new blocking finding.
- Executable sources match the final verified snapshot receipt; differences since that proof are documentation/evidence only. The lock and dependencies are unchanged. Earlier full 48-test/230-payload proof remains applicable to the executable sources.
- Pre-commit focused checks passed: lint, 9 CI tests, 10 boundary tests, 3 clock/target/CLI tests, OpenAPI/generated drift and diff whitespace. New versionable files were checked to exclude local dotenv files and symlinks. No independent approval is claimed for this author review.
- Integration owner proceeds with scoped commit/push to origin/fix/bk-006-foundation-audit. Git history records the resulting commit. The normal workflow will receive the published head; no new remote success is claimed in advance.

## BK-007 — Executable agent guide and task template

- Status: implemented and author-verified; independent review pending.
- Owner/integration owner: root, architecture/documentation; sole writer. Reviewer: not assigned; author verification is not independent acceptance.
- Branch/base: docs/bk-007-agent-guide, e0aef5c; clean starting checkout.
- Verified dependency: BK-006 original implementation independently accepted with remote gate evidence; published audit corrections reviewed locally and verified through the exact final quality/artifact commands (48 tests, 230 payload files). No new independent approval of those corrections is inferred.
- Sources: English backlog BK-007 criteria 1–3; technical specification sections 3–4, 20–23; functional specification scope/security and DS 2.0 limits; current AGENTS, scripts/manifests, ADR00 and CI/database/contract instructions. Cross-cutting enabler; no dedicated RF/CA or wireframe implementation.
- Objective: formalize the current root guide, a reusable task package and a first-checkout workflow, then follow them in a real clean local clone with a low-risk documentation-only rehearsal.
- Ownership: AGENTS.md, README onboarding link, docs/engineering guide/template, directly affected stale foundation instructions, coordination and BK-007 evidence. No application, dependency/lock, migration, CI gate or provider changes.
- Contracts: none changed. Limits: no business behavior, live integrations, task-checkout commit/push, merge/deployment or BK-008 work. Local-only commits in the disposable rehearsal clone are verification evidence, not publication.
- Expected checks: exact runtime, clean clone/locked install, source availability and ignored plans, documented quality/artifact commands, selected dev/start commands on isolated loopback ports, filled task template and comment-only rehearsal with focused lint/types/clock checks, source/lock preservation and final diff.
- Next owner: root guide preparation and walkthrough; reviewer/coordinator after evidence.

### BK-007 walkthrough and delivery

- Root AGENTS 1.1 links an operational first-checkout guide and required task/handoff package, with exact current command prerequisites and preserved business/security rules. Root README and the stale database CI note are aligned. Main-checkout scope is documentation only.
- Followed the guide in a real clean local clone, supplied ignored English planning sources with hashes, installed from lock offline and ran exact quality/artifact commands: 48 tests, all builds/types/smoke/canaries and real disposable PostgreSQL passed. Node 24.22.1/npm 12.2.1/TypeScript 6.0.3 confirmed.
- Started/stopped worker, API and web dev on task-owned loopback processes; corrected nested-npm port guidance to the tested PORT override and documented Next's generated type-reference refresh/production-build recovery. Final guide walkthrough passed with a clean pre-task diff.
- Filled the task template, made only a JSDoc comment in the disposable clone, passed focused lint/types/3 clock/CLI tests and completed the handoff. Root application and lock unchanged; no rehearsal code entered the product checkout.
- [Completed checklist, logs and limitations](../evidence/bk-007/README.md). Status: all three criteria have author evidence; independent review remains pending. No new dependencies/scripts/migrations/contracts, task-checkout commit/push, remote workflow, deployment or subsequent BK work. Next owner: reviewer/coordinator.

### BK-007 publication review and authorization

- User explicitly requested review, followed by commit/push if no problems existed. This supersedes the prior no-publication limit for the BK-007 delivery; no merge, deployment or next BK is authorized.
- Root pre-publication author review found no blockers: guide/template/criteria and new evidence inspected; 23 referenced scripts exist, local links resolve, every walkthrough command/result is consistent, current lock matches the report, and main application/contracts/migrations/pipeline remain unchanged. Whitespace check passed. [Review](../evidence/bk-007/review.md).
- Broad runtime checks were not repeated for this documentation-only publication review; actual clean-clone quality/artifact execution and the low-risk rehearsal remain the recorded evidence. This is not an independent approval or a new remote CI result.
- Root proceeds with scoped commit/push to origin/docs/bk-007-agent-guide. Git history records the resulting commit. Next task selection remains separate.

## BK-008 — DS 2.0 tokens and basic components

- Status: implemented and author-verified; independent review pending.
- Owner/integration owner: root, frontend/accessibility; sole writer. Reviewer: unassigned; author verification is not independent acceptance.
- Branch/base: feat/bk-008-design-system, c0b8380; clean starting checkout.
- Verified dependency: BK-002 executable workspace/boundaries accepted. BK-005 browser contracts and BK-006 verification remain preserved; BK-007 operational guide available.
- Objective/criteria: approved dark header and light bordered panels, contextual secondary sample title/price, reusable buttons/fields/feedback/modal with focus/error/loading and 16 px fields. Cross-cutting enabler, no dedicated business route/wireframe implementation.
- Sources: English backlog BK-008; DS 2.0 sections 2–8 and 10–13 plus inventory scope; ET 16/20/23; functional scope/authority restrictions; AGENTS frontend/security/verification rules.
- Ownership: packages/ui components/tokens/styles/local font assets and build copy; minimal web composition/global styles and development-only internal demonstration; exact font dependency/lock under one writer; UI documentation and evidence. No backend/API/schema/provider work or Figma publication.
- Contracts: public UI exports only, with no financial/permission authority. Internal sample actions are local visual demonstrations, never booking/payment state.
- Limits: no auth/navigation/business journeys, live requests, marketplace, domain mutations, commit/push, deployment or subsequent BK. Demo must not become a production simulation route.
- Checks: types/lint/boundaries/build/clean reproduction; browser visual comparison at 320/375/768/1024/1440, keyboard/focus/errors/loading/dialog dismissal and return, reduced motion/light theme, local font loading and production demo absence. Evidence is proportional to reusable interaction; automated checks alone are not WCAG certification.
- Next owner: root implementation, then reviewer/coordinator with actual visual/interaction evidence.

### BK-008 delivery

- Delivered semantic tokens/styles, locally built Inter/OFL assets, dark header/light panel composition, button variants, labeled text/select/checkbox, feedback/empty/loading primitives and a controlled accessible dialog. Demo remains development-only; public root retains existing pt-BR copy without simulation controls.
- Visual/browser evidence at all five widths passed; 16 px fields, 44 px controls, specified borders/colors, local fonts, errors/loading, keyboard focus containment/return, dark-host light theme and 200% text reflow verified. Focus escape and intrinsic grid overflow found during probes were corrected.
- Actual clean reproduction passed offline installation, lint, 47 existing tests, complete build/types, contracts/boundaries/config/clock, process smoke and secret canaries. Production demo returns 404 and is absent from the manifest; font/styles/license appear in build inventory. No previous locked package version changed; font pin 5.3.0 added.
- [Evidence and limitations](../evidence/bk-008/README.md), [component contract](../../packages/ui/README.md). No domain/API/SQL/provider/Figma write, commit/push or deployment. Independent review, real screen-reader/mobile keyboard and broader browser matrix remain unexecuted. Next owner: reviewer/coordinator.

### BK-008 pre-publication review and authorization

- User authorized review and commit/push if no blocking issues remained. This supersedes the earlier no-publication limit; merge/deployment and subsequent BK remain excluded.
- Author review reproduced and corrected an initially-open Dialog closing under React Strict Mode. The close event now checks native open state to ignore stale cleanup events. Initial-open/Escape reproduction and the complete five-width browser/keyboard/recovery probe passed after the fix.
- [Review and task-package supplement](../evidence/bk-008/pre-publication-review.md) record scope, scenarios, authorization and limitations. Independent acceptance remains pending; no independent reviewer approval is claimed.
- Publication target: origin/feat/bk-008-design-system. Runtime checks and actual clean reports remain in the evidence directory; Git records the commit. Next owner: reviewer/coordinator.

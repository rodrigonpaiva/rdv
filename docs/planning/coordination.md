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

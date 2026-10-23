# ADR00 — Toolchain, versões e workspace

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

A ET §§2–4 exige TypeScript e processos web/API/worker, mas ainda não existe manifesto ou lockfile. É preciso escolher uma base reproduzível antes de BK-002.

## Alternativas consideradas

Node 22 já instalado versus Node 24 LTS; npm workspaces versus pnpm/Turborepo; instalação de versões flutuantes versus pins exatos.

## Decisão

Adotar Node 24.22.1, npm 12.2.1 e npm workspaces. O único lockfile será package-lock.json na raiz, lockfileVersion 3. BK-002 criará o manifesto e gerará o lock pelo npm escolhido; BK-006 usará npm ci. Não escrever lockfile à mão. Usar os pins da matriz, sem ^, ~ ou latest nos manifests. A consulta latest foi somente descoberta pública e seus resultados foram congelados na evidência. Backend novo em ESM/NodeNext; web em configuração de módulos compatível com Next/bundler, sem impor um tsconfig único a todos os pacotes.

## Consequências e verificação

Evita instalar um segundo gerenciador e um orquestrador antes de haver necessidade. O Node local 22.22.2/npm 10.9.7 não satisfaz a baseline escolhida nem o mínimo atual dos schematics do Nest. BK-002 deve preparar o runtime correto e provar instalação/build e imports ESM, inclusive decorators/metadata; não ocultar incompatibilidade com flags de força. TypeScript 6.0.3 atende o peer dos schematics; não adotar TypeScript 7 só por ser latest. Banco/fila serão introduzidos nas tarefas próprias.

## Fontes e evidência

ET §§2–4,21; BK-001/BK-002/BK-004/BK-006; matriz de versões e npm-metadata.json. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

## Evidência posterior — BK-002

Bootstrap implementado em 23 de outubro de 2026. Instalação limpa por package-lock v3, build dos oito workspaces, ESM/Nest metadata/DI, fronteiras e smoke web/API/worker passaram. Consulte a [evidência BK-002](../evidence/bk-002/README.md). Isso não substitui testes de agenda, banco, filas ou provedores das próximas tarefas. A decisão inicial acima é preservada como histórico.

# ADR01 — Monólito modular com API e worker separados

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

O piloto precisa de transações locais entre agenda e financeiro, com custo operacional controlado.

## Alternativas consideradas

Microserviços desde o início; aplicação sem fronteiras; monólito modular com processos separados.

## Decisão

Manter web Next.js, API NestJS e worker independente, com casos de uso em packages/backend. Separar domain, application, ports e infrastructure por módulo. Domain não importa Nest, Prisma, fila ou SDK externo. Operações atômicas de Scheduling/Payments podem compartilhar uma unidade de trabalho. Não criar microserviços nem event sourcing no MVP.

## Consequências e verificação

API/worker podem escalar separadamente sem duplicar motor. Requer testes de fronteiras e coordenação de migrações. A web não importa persistência nem segredos. BK-002 comprova estrutura/imports; não há código entregue nesta decisão.

## Fontes e evidência

SP §13 e ADR01; ET §§3–5,22; AGENTS §6. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

## Evidência posterior — BK-002

Bootstrap implementado em 23 de outubro de 2026. Instalação limpa por package-lock v3, build dos oito workspaces, ESM/Nest metadata/DI, fronteiras e smoke web/API/worker passaram. Consulte a [evidência BK-002](../evidence/bk-002/README.md). Isso não substitui testes de agenda, banco, filas ou provedores das próximas tarefas. A decisão inicial acima é preservada como histórico.

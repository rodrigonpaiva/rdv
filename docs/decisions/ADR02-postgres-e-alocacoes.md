# ADR02 — PostgreSQL como autoridade de ocupação e registros financeiros

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

I01 exige ausência de sobreposição mesmo sob concorrência entre canais; cache e validação de UI não fornecem essa garantia.

## Alternativas consideradas

Locks só em Redis; validação só no ORM; constraints e transações no PostgreSQL.

## Decisão

Adotar PostgreSQL 18.6, timestamptz/UTC e IANA por unidade. Usar tstzrange semiaberto com buffers, GiST/btree_gist, active explícito e no máximo uma alocação ativa por reserva. Não usar NOW() no predicado da exclusão. Dinheiro em centavos inteiros, snapshot aceito e FKs compostas por tenant. Prisma 7.10.1 com adapter-pg/pg é acesso de infraestrutura; SQL versionado preserva exclusion/RLS quando não representados pelo schema.

## Consequências e verificação

Documentação suporta mecanismos e versão de banco; BK-004/BK-009/BK-021 devem demonstrar migração, papéis, RLS, SQL e concorrência reais. Imagem de contêiner ainda precisa de variante e digest verificáveis antes do uso. SQLite não substitui esses testes.

## Fontes e evidência

SP §§7–8; ET §§6–10; PostgreSQL ranges/RLS e suporte Prisma, fontes na matriz. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

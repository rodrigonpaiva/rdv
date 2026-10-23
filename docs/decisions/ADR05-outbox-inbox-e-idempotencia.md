# ADR05 — Outbox/inbox e efeitos idempotentes

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

Falhas entre commit, publish e chamadas externas podem perder trabalho ou duplicar efeitos.

## Alternativas consideradas

Publicar somente na memória/fila; promessa exactly-once; trabalho durável em PostgreSQL e consumidores idempotentes.

## Decisão

Outbox na mesma transação da mutação; inbox autenticada/deduplicada antes do reconhecimento. BullMQ 6.4.0 com backend Redis 8.2.10 e cliente ioredis 6.0.0 somente transporta trabalho; não substituir autoridade de ocupação por Redis nem migrar a fila ao backend PostgreSQL por conveniência. Semântica pelo menos uma vez, chave por consumidor/evento, leases recuperáveis, intenção externa estável e reconciliação de incerteza.

## Consequências e verificação

Publicação não significa conclusão; perda de Redis deve ser recuperável a partir do banco. A combinação exata BullMQ/ioredis/Redis requer prova em BK-031, inclusive conexão, shutdown, replay e recuperação; peer semver não comprova integração. Nenhum serviço foi iniciado.

## Fontes e evidência

SP §13.2; ET §12; BK-030/BK-031; metadados npm e documentação BullMQ/Redis. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

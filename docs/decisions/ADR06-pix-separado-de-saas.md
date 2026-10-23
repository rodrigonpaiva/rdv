# ADR06 — Pix separado da assinatura SaaS e sem custódia própria

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

Sinal pertence ao atendimento do estabelecimento e não à receita de assinatura da plataforma.

## Alternativas consideradas

Carteira/split próprio; fluxo financeiro único; contas de estabelecimento em provedor e billing separado.

## Decisão

Manter integração Pix associada à conta recebedora verificada por tenant e cobrança SaaS em contexto Billing separado. Não selecionar provedor nesta tarefa. Recebimento só confirma após evidência externa e elegibilidade; tardio não reativa. Reserva cancelada e refund em processamento são dimensões válidas. Preservar proposta de devolução integral do piloto, sem retenção automática por falta. Suspensão bloqueia novas reservas e mantém resolução das existentes.

## Consequências e verificação

BK-048/BK-061/BK-078/BK-089 exigem contratos e decisões próprias; o ADR não autoriza cobrança, mensagem ou aprovação jurídica. Prazo de 30 minutos é condicional à homologação; não prometer compatibilidade universal.

## Fontes e evidência

SP §§8,19,23; ET §§11,17; DS §§9.3,9.7. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

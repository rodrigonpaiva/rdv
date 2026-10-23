# ADR03 — Motor comum e ordem de locks

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

Web, recepção e WhatsApp disputam a mesma disponibilidade e configuração.

## Alternativas consideradas

Motores por canal; locks finos sem protocolo; serialização inicial por unidade.

## Decisão

Aplicar um único domínio para disponibilidade, quotes, criação, troca, cancelamento e bloqueio. Ordem: idempotência no início; conversa primeiro quando aplicável; unidade; profissionais ordenados; reservas ordenadas; pagamento/recebimento depois da reserva. Nenhuma operação de agenda espera conversa depois dessa ordem. Não executar rede dentro da transação. Alteração de entitlement coordena com locks das unidades e criação revalida após lock.

## Consequências e verificação

Serialização por unidade limita paralelismo de escrita, aceita no piloto até medição em BK-093. Troca atômica preserva anterior em falha. Consulta não garante slot; qualquer disponível fixa profissional no quote. BK-021/BK-036 devem demonstrar corridas, rollback e retries limitados, sem dispensar exclusão.

## Fontes e evidência

SP §§7,9; ET §10; I01,I05,I08,I12; BK-021/BK-036. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

# ADR08 — Snapshots, política e aceite versionados

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

Preço, serviço, horário e política podem mudar entre consulta, aceite e execução.

## Alternativas consideradas

Ler sempre o catálogo mutável; aceitar texto livre sem contexto; quote e aceite versionados.

## Decisão

Quote registra ator, profissional concreto, snapshot, hash, política e validade; não ocupa agenda nem cobra. Consumo único, idempotência e criação compartilham commit. Snapshot aceito não muda retroativamente. Mudança antes do aceite exige revisão; reagendamento recebe expected_version e quote de troca. Revogar referências antigas conforme booking_access_version e renovar acesso seguro.

## Consequências e verificação

Requer histórico e retenção por categoria, sem definir prazo legal nesta tarefa. Falha na troca mantém reserva anterior; mudança de serviço/preço exige humano no MVP. Contratos serão executados em BK-029/BK-032/BK-041/BK-042, com provas futuras.

## Fontes e evidência

SP §§7.3,8.1,9; ET §§7,9,10.4–10.5,13; I04,I07,I08. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

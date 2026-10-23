# Registro de decisões

A fonte comercial permanece plans/spec-general.md. ADRs refinam engenharia sem alterar regras de produto. Estado “adotado como baseline” autoriza orientar implementação; não comprova execução, integração ou homologação.

| ADR | Decisão | Estado |
| --- | --- | --- |
| [ADR00](ADR00-toolchain-e-workspace.md) | Toolchain, versões e workspace | Baseline adotada |
| [ADR01](ADR01-monolito-modular.md) | Monólito modular com API e worker separados | Baseline adotada |
| [ADR02](ADR02-postgres-e-alocacoes.md) | PostgreSQL como autoridade de ocupação e registros financeiros | Baseline adotada |
| [ADR03](ADR03-motor-comum-e-locks.md) | Motor comum e ordem de locks | Baseline adotada |
| [ADR04](ADR04-ia-com-ferramentas.md) | IA restrita a interpretação e ferramentas autorizadas | Baseline adotada |
| [ADR05](ADR05-outbox-inbox-e-idempotencia.md) | Outbox/inbox e efeitos idempotentes | Baseline adotada |
| [ADR06](ADR06-pix-separado-de-saas.md) | Pix separado da assinatura SaaS e sem custódia própria | Baseline adotada |
| [ADR07](ADR07-web-e-design-system.md) | Web responsiva e design system 2.0 | Baseline adotada |
| [ADR08](ADR08-snapshot-e-aceite.md) | Snapshots, política e aceite versionados | Baseline adotada |

ADRs 09–14 da ET permanecem a detalhar nas tarefas de identidade, RLS, provedores e infraestrutura. Não são aprovações implícitas pela criação deste índice. O ADR00 acrescenta somente a decisão de toolchain, preservando os IDs 01–14 existentes.

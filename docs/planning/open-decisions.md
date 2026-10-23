# Decisões externas, parâmetros e condições de ativação

Registro inicial da BK-001 • 23 de outubro de 2026. Responsáveis abaixo são papéis propostos; somente Rodrigo já é identificado como responsável de produto. Nenhuma contratação, aprovação jurídica ou homologação é declarada. Estado inicial de todas as decisões desta tabela: em aberto.

## Decisões externas

| ID | Decisão / prova pendente | Responsável por papel | Tarefa / condição para liberar |
| --- | --- | --- | --- |
| EXT01 | Nome final, segmento e cidade do piloto; entrevistas e validação da jornada | Rodrigo / produto | SP E0/P01; registrar evidência antes de piloto BK-098/BK-099; não bloqueia bootstrap |
| EXT02 | Provedor Pix, onboarding e merchant por tenant, conta sandbox, assinatura de webhook e limites | Engenharia de integrações + produto + provedor | BK-048/049, ADR11; contrato e prova sandbox antes de ativar cobranças |
| EXT03 | Compatibilidade pay_by/hold_deadline com validade mínima externa e atraso do worker; resolução de timeout | Engenharia de pagamentos | BK-048/052/054; sem prova, bloquear instrução Pix real e continuar sandbox/sem sinal autorizado |
| EXT04 | Provedor WhatsApp oficial, número, coexistência/migração, templates, opt-in e janela | Integrações + responsável pelo canal + produto | BK-061/062/067, ADR12; conta/número e envio incerto comprovados |
| EXT05 | Modelo/fornecedor IA, termos de dados, custo, latência e resultado em português | Engenharia de IA + privacidade | BK-069/076/077, ADR13; contrato e avaliações críticas antes da flag do bot |
| EXT06 | Política de cancelamento/falta/devolução e informação prévia | Rodrigo / produto + jurídico | BK-089; preservar proposta integral do piloto, sem reter valores automaticamente |
| EXT07 | Finalidades, controlador/operador, suboperadores e transferências internacionais | Responsável de privacidade + jurídico + produto | BK-089; revisar anexos de cada provedor na homologação correspondente |
| EXT08 | Retenção por categoria: financeiro, reservas, aceites, mensagens, logs, backups e tombstones | Privacidade/jurídico + engenharia/operação | BK-083/089/092; nenhuma exclusão produtiva automática com prazo ainda não aprovado |
| EXT09 | Preço/plano/franquia/excedentes e tolerância comercial SaaS | Rodrigo / produto + billing | BK-078; regras explícitas antes de checkout/suspensão BK-079/080 |
| EXT10 | Provedor SaaS, eventos, consulta, idempotência, conta sandbox e taxas | Billing + produto + provedor | BK-078/079; separado de Pix consumidor |
| EXT11 | Nuvem, região, serviços, orçamento, contratos, RPO/RTO e armazenamento privado | Infraestrutura + produto + privacidade | ADR14/BK-090/092; preparar IaC não autoriza serviço pago ou deploy |
| EXT12 | Equipe real de suporte, horários, escalonamento, plantão e donos de incidentes | Operação + Rodrigo | BK-091/098/099; não inventar equipe disponível ou atendimento 24/7 |
| EXT13 | Variante/digest de imagens Linux, extensão btree_gist e viabilidade de runtime/DB/fila no ambiente alvo | Infraestrutura + backend | BK-002/004/031/090; provas de pull/build/SQL/recuperação antes de declarar compatibilidade executada |
| EXT14 | Biblioteca de autenticação, mecanismo MFA/OTP e regras de sessão/recuperação | Backend/segurança + produto para UX | ADR09/BK-011–013; biblioteca mantida, limites e testes sem criptografia própria |
| EXT15 | Estratégia exata RLS/pooling, papéis e execução de SQL no mesmo contexto transacional | Backend/segurança + QA | ADR10/BK-009/017/021; testes de contexto ausente e conexão reutilizada, runtime sem bypass |
| EXT16 | Licenças de dependências/ativos e permissões aplicáveis à distribuição e hospedagem escolhidas | Engenharia + produto + jurídico quando necessário | Conferir no lock e nos contratos antes de distribuir/ativar; sem assumir que licença da biblioteca equivale à de serviço |

## Parâmetros iniciais não homologados

Valores herdados da SP/ET; não são métricas medidas, SLA contratado ou promessa comercial. Mudança de parâmetro não deve alterar retroativamente aceites existentes.

| Parâmetro | Proposta inicial | Responsável / prova |
| --- | --- | --- |
| Grade, antecedência e horizonte | 15 min, 60 min e 60 dias; uma reserva = um serviço/profissional | Produto + Scheduling; BK-028/036 |
| Validade de quote | 120 s, independente do prazo de pagamento | Scheduling; BK-029; sem ocupação até criação |
| Hold/pagamento Pix | 30 min somente se compatível com API/contrato | Pagamentos; EXT02/03 e BK-048; exibir data/hora absoluta |
| Tolerância por incerteza financeira | Máximo adicional proposto de 5 min | Pagamentos/operação; BK-054; após liberar, continuar reconciliação |
| Reconciliação | 5 min para pendências recentes + conferência diária | Pagamentos/operação; BK-052; respeitar rate limits do provedor |
| Idempotência | Respostas de mutação por pelo menos 7 dias; IDs financeiros durante retenção financeira | Backend + privacidade; BK-030/089 |
| OTP | 10 min, até 5 tentativas, intervalo mínimo entre envios de 60 s | Segurança/canal; BK-013; ajustar por abuso, sem registrar segredo |
| Sessão conversacional | Expirar após 24 h sem atividade; recarregar fatos atuais | Conversations + privacidade; BK-075/089; não confundir com sessão web ou janela do canal |
| Ferramentas IA | Até 5 chamadas/turno e 2 correções/recuperações | Engenharia IA; BK-070/076; orçamento total de tempo/tokens ainda a definir |
| Lembretes | 24 h e 2 h antes, quando futuros e permitidos | Produto + Notifications; BK-037/067; dedupe/versão/opt-out |
| Retenção de mensagens/logs | 90 dias de mensagens brutas e 30 dias de logs sanitizados, sujeitos a revisão | Privacidade/jurídico; BK-089; financeiro e backups separados |
| API listas e disponibilidade | Padrão 25/máximo 100; disponibilidade até 7 dias por consulta dentro do horizonte | Backend; BK-005/028 |
| Limites de abuso/holds e retries | Ainda sem limiares finais por ator/tenant/origem/categoria | Segurança + operação; BK-003/031/094; não tratar retry idempotente como nova intenção |
| Sessões web, links, MFA e tolerância de falta | Valores finais ainda abertos | Segurança + produto; BK-011/012/034/041; não adotar as 24 h de conversa por analogia |
| Metas de desempenho/recuperação | SP §17/ET §20.2: 99,5%; p95 1s/2s/10s/30s; RPO15min/RTO4h | QA + infra; BK-092/093; medir no ambiente representativo, sem SLA comercial |
| Avaliação de IA | Zero mutação não autorizada/confirmar sem backend; financeiro antes de cobrar; meta proposta >=90% nas conversas roteirizadas | QA + engenharia IA; BK-076; média não compensa erro crítico |

Estas pendências não impedem BK-002. Elas bloqueiam apenas a decisão/ativação correspondente; contratos de teste e dados sintéticos devem declarar suas limitações. Não marcar uma decisão externa como aprovada para fechar uma tarefa dependente.

# ADR04 — IA restrita a interpretação e ferramentas autorizadas

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

Conversas contêm dados não confiáveis; autorização, disponibilidade e dinheiro exigem respostas determinísticas do domínio.

## Alternativas consideradas

Modelo com acesso direto ao banco; agentes autônomos financeiros; harness com ferramentas fechadas.

## Decisão

Modelo interpreta intenção; harness injeta ator/tenant/capabilities, valida schema e executa serviços autorizados. Aceite associa resumo atual e versão, com chave lógica estável. HUMAN_QUEUED/HUMAN_ACTIVE impedem novas mutações do bot. Sem SQL, filesystem, segredos, URLs arbitrárias ou operações administrativas no modelo. Fornecedor/modelo continuam em aberto.

## Consequências e verificação

Prompt não é fronteira de segurança. Exige avaliação em português, tool/version tracing sanitizado, fallback e handoff. RAG vetorial, fine-tuning e memória entre empresas ficam fora da baseline. BK-069–077 fornecem escolha contratual e provas; números de chamadas são parâmetros de avaliação.

## Fontes e evidência

SP §11; ET §14; I06,I11,I14; DS §9.6. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

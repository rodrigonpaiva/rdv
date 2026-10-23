# ADR07 — Web responsiva e design system 2.0

- Data: 23 de outubro de 2026.
- Estado: adotado como baseline de implementação da BK-001; não homologação nem prova executada.
- Responsável: coordenação técnica; revisão independente registrada na evidência da BK-001.
- Histórico: registro inicial; substituição futura requer novo ADR com referência a este.

## Contexto

DS v2.0 consolida decisões visuais e 102 vistas que incluem estados e variantes.

## Alternativas consideradas

Apps nativos; 102 páginas independentes; web responsiva por componentes e padrões.

## Decisão

Usar Next App Router, React e TypeScript, com packages/ui sem regras financeiras. Preservar tema claro, cabeçalho #202020, painéis #F7F8F9, bordas Divisores #D9DDE1 de 1 px e amostras secundárias #4E5860. Aplicar escala de produção: campos 16 px, alvos 44 px, teclado/foco/reflow e cinco larguras do DS. Navegação por papel, com autorização real no servidor.

## Consequências e verificação

Não redesenhar Figma nem copiar sua escala compacta literalmente. Sem confirmação otimista de reserva/dinheiro. Wireframes não são prova de implementação. O inventário local canônico está nos apêndices A–D do DS; arquivos Figma não foram inspecionados ao vivo nesta tarefa.

## Fontes e evidência

DS §§1,3–8,12–14 e apêndices; SP §3; ET §16; BK-008/BK-045/BK-095. Consulte a [matriz](../planning/bk-001-baseline.md) e a [evidência](../evidence/bk-001/README.md).

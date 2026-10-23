"""Verificação documental da BK-001; não executa instalação ou testes de aplicação."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
checks = []

def check(name, condition, detail):
    checks.append({'check': name, 'passed': bool(condition), 'detail': detail})

sources = ['spec-general', 'DESIGN_SYSTEM_MVP_v1', 'ESPECIFICACAO_TECNICA_MVP_v1', 'BACKLOG_TECNICO_MVP_v1']
ids = r'\b(?:BK-\d{3}|(?:RF|CA|UC|ADR|[AGCXWPBSRIF])\d{2})\b'
for stem in sources:
    pt = (ROOT / 'plans' / (stem + '.md')).read_text()
    en = (ROOT / 'plans' / (stem + '.en.md')).read_text()
    check(stem + ': IDs PT/EN', re.findall(ids, pt) == re.findall(ids, en), 'Mesmos identificadores e ordem')
    check(stem + ': links PT/EN', re.findall(r'\]\(([^)]+)\)', pt) == re.findall(r'\]\(([^)]+)\)', en), 'Mesmos destinos, incluindo links Figma e tarefas')

backlog = (ROOT / 'plans/BACKLOG_TECNICO_MVP_v1.md').read_text()
cards = list(re.finditer(r'^### BK-(\d{3}) — (.*?)\n(.*?)(?=^<a id=|^## |\Z)', backlog, re.M | re.S))
check('99 cartões únicos', len(cards) == 99 and len({m[1] for m in cards}) == 99, len(cards))
graph = {}
for m in cards:
    dep = re.search(r'\*\*Dependências:\*\*([^\n]+)', m[3])
    graph[m[1]] = re.findall(r'BK-(\d{3})', dep[1]) if dep else []
    check('BK-' + m[1] + ': três critérios', len(re.findall(r'^[123]\. ', m[3], re.M)) == 3, 'Critérios do cartão preservados')
visited, active = set(), set()
def visit(n):
    if n not in graph or n in active:
        raise ValueError('Predecessor ausente ou ciclo: ' + n)
    if n in visited:
        return
    active.add(n)
    for parent in graph[n]:
        visit(parent)
    active.remove(n)
    visited.add(n)
try:
    for n in graph:
        visit(n)
    valid_graph = True
except ValueError:
    valid_graph = False
check('Dependências válidas e acíclicas', valid_graph, 'Raízes: ' + ', '.join(n for n, ds in graph.items() if not ds))

en_backlog = (ROOT / 'plans/BACKLOG_TECNICO_MVP_v1.en.md').read_text()
pt_dep = re.findall(r'\*\*Dependências:\*\*([^\n]+)', backlog)
en_dep = re.findall(r'\*\*Dependencies:\*\*([^\n]+)', en_backlog)
check('Dependências PT/EN', len(pt_dep) == len(en_dep) == 99 and all(re.findall(r'BK-\d{3}', a) == re.findall(r'BK-\d{3}', b) for a, b in zip(pt_dep, en_dep)), '99 listas correspondentes')

ds = (ROOT / 'plans/DESIGN_SYSTEM_MVP_v1.md').read_text()
views = re.findall(r'\[([AGCXWPBSR]\d{2}) [^\]]+\]\(https://www.figma.com/', ds)
journeys = re.findall(r'^\| (UC\d{2}) \|', ds, re.M)
check('Inventário local completo', len(views) == len(set(views)) == 102 and len(journeys) == len(set(journeys)) == 26, {'views': len(views), 'journeys': len(journeys)})
for prefix, stem, expected in [('RF', 'spec-general', 18), ('CA', 'spec-general', 30), ('I', 'ESPECIFICACAO_TECNICA_MVP_v1', 15)]:
    text = (ROOT / 'plans' / (stem + '.md')).read_text()
    found = set(re.findall(r'^\| (' + prefix + r'\d{2}) \|', text, re.M))
    check('Definições ' + prefix, found == {f'{prefix}{i:02}' for i in range(1, expected + 1)}, len(found))

for n in range(9):
    paths = list((ROOT / 'docs/decisions').glob(f'ADR{n:02}-*.md'))
    headings = ['## Contexto', '## Alternativas consideradas', '## Decisão', '## Consequências e verificação', '## Fontes e evidência']
    check(f'ADR{n:02}: estrutura', len(paths) == 1 and all(h in paths[0].read_text() for h in headings), 'Data, estado e alternativas explícitos')

md_files = [ROOT / 'AGENTS.md', *sorted((ROOT / 'plans').glob('*.md')), *sorted((ROOT / 'docs').rglob('*.md'))]
broken = []
for path in md_files:
    text = re.sub(r'```.*?```', '', path.read_text(), flags=re.S)
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if target.startswith(('https:', 'http:', '#', 'mailto:')):
            continue
        local = target.split('#', 1)[0]
        if local and not (path.parent / local).resolve().exists():
            broken.append({'file': str(path.relative_to(ROOT)), 'target': target})
check('Links locais existentes', not broken, broken)
check('Referências antigas removidas das fontes', all('SPEC_Plataforma_Agendamento_BR_v1.md' not in p.read_text() and 'MAPA_PAGINAS_E_WIREFRAMES_MVP_v1.md' not in p.read_text() for p in [ROOT/'AGENTS.md', *sorted((ROOT/'plans').glob('*.md'))]), 'Sem referências a arquivos ausentes nas fontes operacionais')
metadata = json.loads((HERE / 'npm-metadata.json').read_text())
check('Metadados npm completos', all('metadata' in r and 'version' in r['metadata'] and 'dist.integrity' in r['metadata'] for r in metadata['results']), len(metadata['results']))
peer = json.loads((HERE / 'engine-peer-checks.json').read_text())
check('Engines/peers selecionados', peer['passed'] and all(c['pass'] for c in peer['checks']), {'checks': len(peer['checks']), 'scope': peer['scope']})
check('Sem peers obrigatórios omitidos', all(p['optional'] for p in peer['deferred_peers']), 'Peers opcionais ainda não selecionados; grafo transitivo não verificado')
check('BK-002 não executada', not (ROOT / 'package.json').exists() and not (ROOT / 'package-lock.json').exists() and not (ROOT / 'apps').exists() and not (ROOT / '.git').exists(), 'Somente documentação/evidência da decisão')

before = json.loads((HERE / 'source-inventory.json').read_text())
changed = [item['path'] for item in before if hashlib.sha256((ROOT / item['path']).read_bytes()).hexdigest() != item['sha256_before']]
result = {'scope': 'Verificação documental; não testes de aplicação ou homologação', 'passed': all(c['passed'] for c in checks), 'checks': checks, 'source_files_changed': changed}
(HERE / 'verification.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({'passed': result['passed'], 'checks': len(checks), 'failures': [c for c in checks if not c['passed']], 'source_files_changed': changed}, ensure_ascii=False, indent=2))
raise SystemExit(0 if result['passed'] else 1)

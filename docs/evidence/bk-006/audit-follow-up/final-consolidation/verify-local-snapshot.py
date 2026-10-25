from pathlib import Path
import os, subprocess, tempfile, shutil, hashlib, json, tarfile, re
root=Path.cwd()
snapshot=Path(tempfile.mkdtemp(prefix='rdv-bk006-final-snapshot-',dir='/tmp')).resolve()
proof=Path(tempfile.mkdtemp(prefix='rdv-bk006-final-proof-',dir='/tmp')).resolve()
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def run(args,cwd=snapshot,log=None,expected=0):
 with open(proof/(log or 'setup.log'),'a') as output:
  result=subprocess.run(args,cwd=cwd,env=env,stdout=output,stderr=subprocess.STDOUT)
 if result.returncode!=expected: raise RuntimeError(f'{args[0:3]} returned {result.returncode}; see {proof}')
 return result.returncode
env=os.environ.copy();env['PATH']='/tmp/rdv-toolchain/bin:'+env['PATH'];env['NEXT_TELEMETRY_DISABLED']='1';env.pop('GITHUB_SHA',None)
paths=sorted(set(subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0'))-{''})
sources={}
for name in paths:
 p=root/name
 if p.is_symlink() or not p.is_file(): raise RuntimeError('Snapshot requires regular versionable source files')
 if any(part=='.env' or (part.startswith('.env.') and part!='.env.example') for part in Path(name).parts):raise RuntimeError('Refusing local environment input')
 target=snapshot/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);sources[name]=sha(p)
run(['git','init','--quiet','-b','verification'])
run(['git','config','user.name','BK-006 Local Verification'])
run(['git','config','user.email','bk006-verification@example.invalid'])
run(['git','add','--all']);run(['git','commit','--quiet','-m','test: final BK-006 correction snapshot'])
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=snapshot,text=True).strip()
print('Snapshot:',snapshot,'proof:',proof,flush=True)
run(['npm','ci','--offline','--no-audit','--no-fund'],log='install.log')
stale=[]
for directory in ['apps/api/dist','apps/worker/dist','apps/web/.next']+[f'packages/{n}/dist' for n in ['contracts','backend','config','testkit','ui']]:
 p=snapshot/directory/'obsolete-final-probe.js';p.parent.mkdir(parents=True,exist_ok=True);p.write_text('synthetic obsolete output');stale.append(str(p.relative_to(snapshot)))
sentinel=snapshot/'.artifacts/verification/consolidation-sentinel.json';sentinel.parent.mkdir(parents=True,exist_ok=True);sentinel.write_text('{"synthetic":true}\n')
run(['npm','run','ci:quality'],log='quality.log');run(['npm','run','ci:artifact'],log='artifact.log')
receipt=json.loads((snapshot/'.artifacts/quality.json').read_text())
assert receipt['commit']==commit and receipt['sources']==sources
assert receipt['lock_sha256']==sha(root/'package-lock.json')
assert all(not (snapshot/name).exists() for name in stale)
assert sentinel.read_text()=='{"synthetic":true}\n'
archive=next((snapshot/'.artifacts').glob('rdv-*.tar.gz'))
assert (Path(str(archive)+'.sha256').read_text().split()[0])==sha(archive)
with tarfile.open(archive,'r:gz') as tar:
 members={m.name.removeprefix('./'):m for m in tar.getmembers() if m.isfile()}
 assert set(members)==set(receipt['files'])|{'manifest.json'}
 for name,digest in receipt['files'].items():
  assert hashlib.sha256(tar.extractfile(members[name]).read()).hexdigest()==digest
  if name.startswith('database/migrations/'):assert digest==sha(root/name)
 assert json.load(tar.extractfile(members['manifest.json']))==receipt
archive_hash=sha(archive);file_count=len(receipt['files'])
(proof/'verified-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
shutil.copy2(archive,proof/archive.name)
shutil.copy2(Path(str(archive)+'.sha256'),proof/(archive.name+'.sha256'))
# A changed compiled output cannot reuse the valid receipt/archive.
compiled=snapshot/'apps/api/dist/main.js';original=compiled.read_bytes();compiled.write_bytes(original+b'\n// synthetic modification\n')
run(['npm','run','ci:artifact'],log='changed-output-rejected.log',expected=1);compiled.write_bytes(original)
# A real, separately committed lint regression must stop the exact quality CLI.
run(['git','switch','--quiet','-c','controlled-lint-failure'])
probe=snapshot/'scripts/ci/controlled-final-probe.mjs';probe.write_text('const unusedFinalRegression = 1;\n')
run(['git','add','scripts/ci/controlled-final-probe.mjs']);run(['git','commit','--quiet','-m','test: controlled BK-006 lint failure'])
run(['npm','run','ci:quality'],log='controlled-failure.log',expected=1)
failure=(proof/'controlled-failure.log').read_text();assert 'no-unused-vars' in failure and 'Quality gate failed: lint' in failure
assert not (snapshot/'.artifacts/quality.json').exists()
assert not list((snapshot/'.artifacts').glob('rdv-*.tar.gz*'))
assert not (snapshot/'.artifacts/payload').exists() and sentinel.exists()
run(['git','switch','--quiet','verification'])
assert not subprocess.check_output(['git','status','--porcelain'],cwd=snapshot,text=True).strip()
assert all(sha(root/name)==digest for name,digest in sources.items())
summary={'scope':'Final BK-006 corrections; local isolated snapshot, no remote workflow or task-checkout commit', 'snapshot':str(snapshot),'proof_directory':str(proof),'base_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'snapshot_commit':commit,'source_files_verified':len(sources),'lock_sha256':sha(root/'package-lock.json'),'quality_passed':True,'artifact_passed':True,'payload_files_verified':file_count,'all_source_and_payload_hashes_match':True,'migration_bytes_match':True,'seeded_obsolete_outputs_removed':len(stale),'archive_sha256':archive_hash,'changed_output_rejected':True,'committed_lint_failure_blocks_receipt_and_artifact':True,'default_verification_report_preserved':True,'test_counts':list(map(int,re.findall(r'ℹ tests (\d+)',(proof/'quality.log').read_text()))),'root_sources_unchanged':True,'passed':True}
(proof/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2),flush=True)

import sys,pathlib,zipfile,tarfile,io,json,hashlib,subprocess
zip_path=pathlib.Path(sys.argv[1]); expected_commit=sys.argv[2]
sha=lambda b:hashlib.sha256(b).hexdigest()
with zipfile.ZipFile(zip_path) as z:
 archives=[n for n in z.namelist() if n.endswith('.tar.gz')]; assert len(archives)==1,archives
 archive=z.read(archives[0]); checksum=z.read(archives[0]+'.sha256').decode().split()[0];assert sha(archive)==checksum
 with tarfile.open(fileobj=io.BytesIO(archive),mode='r:gz') as t:
  m=json.load(t.extractfile('./manifest.json'));assert m['commit']==expected_commit
  assert m['node']=='v24.22.1' and m['npm'].startswith('npm/12.2.1 ')
  assert m['gates']==['lint','typecheck','test:ci','check','test:database']
  actual={x.name.removeprefix('./') for x in t.getmembers() if x.isfile()};assert actual==set(m['files'])|{'manifest.json'}
  for f,h in m['files'].items():assert sha(t.extractfile('./'+f).read())==h,f
  tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',expected_commit],text=True).splitlines();assert sorted(tracked)==sorted(m['sources'])
  for f,h in m['sources'].items():assert sha(subprocess.check_output(['git','show',expected_commit+':'+f]))==h,f
  lock=subprocess.check_output(['git','show',expected_commit+':package-lock.json']);assert sha(lock)==m['lock_sha256']==m['files']['package-lock.json']
  migrations=[f for f in tracked if f.startswith('database/migrations/')];assert migrations
  for f in migrations:assert m['files'][f]==m['sources'][f]
  assert not any('/node_modules/' in n or '/cache/' in n or n.endswith('/.env') or n.startswith('plans/') for n in actual)
report={'commit':expected_commit,'node':m['node'],'npm':m['npm'],'lock_sha256':m['lock_sha256'],'gates':m['gates'],'archive_sha256':sha(archive),'zip_sha256':sha(zip_path.read_bytes()),'payload_files_verified':len(m['files']),'tracked_sources_verified':len(tracked),'migration_files_verified':migrations,'archive_checksum_passed':True,'all_payload_hashes_passed':True,'all_source_hashes_match_published_commit':True,'excluded_cache_secrets_and_plans':True}
print(json.dumps(report,indent=2))

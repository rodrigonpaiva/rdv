const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const npmRoot = execFileSync('npm', ['root', '-g'], {encoding:'utf8'}).trim();
const semver = require(path.join(npmRoot, 'npm/node_modules/semver')); // bundled with the installed npm; no installation
const snapshot = JSON.parse(fs.readFileSync('docs/evidence/bk-001/npm-metadata.json','utf8'));
const selected = {'typescript':'6.0.3','rxjs':'7.8.2','reflect-metadata':'0.2.2','next':'16.4.3','react':'19.3.1','react-dom':'19.3.1','@nestjs/core':'12.2.0','@nestjs/common':'12.2.0','@nestjs/platform-express':'12.2.0','@nestjs/cli':'12.0.10','@nestjs/schematics':'12.0.10','npm':'12.2.1','prisma':'7.10.1','@prisma/client':'7.10.1','@prisma/adapter-pg':'7.10.1','pg':'8.23.1','bullmq':'6.4.0','ioredis':'6.0.0'};
const checks=[]; const deferred=[];
for (const entry of snapshot.results) {
 if(entry.error) throw Error(entry.error);
 const name=entry.query.slice(0,entry.query.lastIndexOf('@'));
 const m=entry.metadata;
 if(selected[name]!==m.version) continue;
 const engine=m.engines?.node;
 if(engine) checks.push({package:name,requirement:'node',range:engine,selected:'24.22.1',pass:semver.satisfies('24.22.1',engine)});
 for(const [peer,range] of Object.entries(m.peerDependencies||{})) {
  if(selected[peer]) checks.push({package:name,requirement:peer,range,selected:selected[peer],pass:semver.satisfies(selected[peer],range)});
  else deferred.push({package:name,peer,range,optional:m.peerDependenciesMeta?.[peer]?.optional===true,note:'Não selecionado na baseline; resolver somente ao adicionar a capacidade/ferramenta correspondente. Não comprova grafo completo.'});
 }
 if(name==='@prisma/adapter-pg') checks.push({package:name,requirement:'pg dependency',range:m.dependencies.pg,selected:selected.pg,pass:semver.satisfies(selected.pg,m.dependencies.pg)});
}
const result={scope:'Somente engines e pares explicitamente selecionados; não instalação, grafo transitivo, build ou segurança',target_node:'24.22.1',selected,checks,deferred_peers:deferred,passed:checks.every(x=>x.pass)};
fs.writeFileSync('docs/evidence/bk-001/engine-peer-checks.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checks:checks.length,all_pass:result.passed,deferred_peers:deferred.length,required_deferred:deferred.filter(x=>!x.optional).map(x=>x.peer)}));
if(!result.passed) process.exit(1);

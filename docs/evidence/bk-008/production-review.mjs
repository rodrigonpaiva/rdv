import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import net from 'node:net';
const root=process.cwd();
const report=JSON.parse(await fs.readFile(path.join(root,'docs/evidence/bk-008/clean-verification-8f4c49ec-561d-4f8d-be66-213fc308d796.json'),'utf8'));
assert.equal(report.passed,true);
const clean=report.temporary_directory;
const reservation=net.createServer();await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
let log='';const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','apps/web','--port',String(port),'--hostname','127.0.0.1'],{cwd:clean,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',chunk=>{log+=chunk});server.stderr.on('data',chunk=>{log+=chunk});
let browser;
try {
  for(let i=0;i<80;i++){try{const response=await fetch(`http://127.0.0.1:${port}`,{signal:AbortSignal.timeout(500)});if(response.status===200)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
  const appPaths=JSON.parse(await fs.readFile(path.join(clean,'apps/web/.next/server/app-paths-manifest.json'),'utf8'));
  assert.equal(Object.keys(appPaths).some(route=>route.includes('internal')),false);
  const absent=await fetch(`http://127.0.0.1:${port}/internal/design-system`);assert.equal(absent.status,404);
  process.chdir(clean);const {buildFiles}=await import(pathToFileURL(path.join(clean,'scripts/ci/provenance.mjs')).href);const inventory=buildFiles();process.chdir(root);
  for(const file of ['packages/ui/dist/styles.css','packages/ui/dist/tokens.css','packages/ui/dist/fonts/inter-latin-wght-normal.woff2','packages/ui/dist/fonts/OFL.txt'])assert.ok(inventory[file],file);
  browser=await chromium.launch({executablePath:'/Users/rodrigopaiva/Library/Caches/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-mac-arm64/chrome-headless-shell',headless:true});
  const page=await browser.newPage({viewport:{width:375,height:812}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}`);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'),'pt-BR');
  assert.equal(await page.getByRole('heading',{name:'Seu próximo cuidado.',exact:true}).count(),1);
  assert.equal(await page.getByText('Internal preview',{exact:true}).count(),0);
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert.equal(await page.locator('main').evaluate(element=>element===document.activeElement),true);
  await page.screenshot({path:'/tmp/rdv-bk008-browser/evidence/production-home-375.png'});
  const colors=await page.evaluate(()=>{
    const s=getComputedStyle(document.documentElement);const out={};
    for(const name of ['content-secondary','surface-base','surface-canvas','surface-soft','success','success-bg','warning','warning-bg','error','error-bg','info','info-bg','border-control','focus'])out[name]=s.getPropertyValue('--color-'+name).trim();return out;
  });
  const lum=hex=>{let digits=hex.replace('#','');if(digits.length===3)digits=digits.split('').map(value=>value+value).join('');const values=digits.match(/.{2}/g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const contrast={};for(const [name,front,back,minimum] of [['secondary/base','content-secondary','surface-base',4.5],['secondary/canvas','content-secondary','surface-canvas',4.5],['disabled/soft','content-secondary','surface-soft',4.5],['success','success','success-bg',4.5],['warning','warning','warning-bg',4.5],['error','error','error-bg',4.5],['info','info','info-bg',4.5],['control border','border-control','surface-base',3],['focus','focus','surface-base',3]]){contrast[name]=ratio(colors[front],colors[back]);assert.ok(contrast[name]>=minimum,`${name}=${contrast[name]}`);}
  assert.equal(errors.length,0);
  await fs.writeFile('/tmp/rdv-bk008-browser/evidence/production.json',JSON.stringify({cleanSourceCopy:clean,productionRootStatus:200,demoStatus:absent.status,demoAbsentFromRouteManifest:true,fontStylesAndLicenseInBuildInventory:true,rootLanguage:'pt-BR',skipLinkFocusesMain:true,contrast,pageErrors:errors,passed:true},null,2)+'\n');
  console.log('Production root, skip link, demo 404/manifest absence, asset inventory and contrast checks passed.');
}finally{
  process.chdir(root);if(browser)await browser.close();if(server.exitCode===null){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}
  await fs.writeFile('/tmp/rdv-bk008-browser/evidence/production-server.txt',log);
}

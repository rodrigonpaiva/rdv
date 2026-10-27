import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
const root=process.cwd();const dir=root+'/apps/web/src/app/internal/review';
mkdirSync(dir,{recursive:true});
writeFileSync(dir+'/page.demo.tsx',`'use client';
import {useState} from 'react';import {Dialog} from '@agenda/ui';
export default function Review(){const [open,setOpen]=useState(true);return <><p id="state">{open?'open':'closed'}</p><Dialog open={open} onClose={()=>setOpen(false)} title="Initial modal" closeLabel="Close" /></>}
`);
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','apps/web','--hostname','127.0.0.1','--port','3138'],{cwd:root,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser;
try {for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,300));try{if((await fetch('http://127.0.0.1:3138/internal/review')).ok)break;}catch{}}
browser=await chromium.launch({executablePath:'/Users/rodrigopaiva/Library/Caches/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const page=await browser.newPage();await page.goto('http://127.0.0.1:3138/internal/review');await page.waitForTimeout(1500);assert.equal(await page.locator('#state').textContent(),'open');await page.getByRole('dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.locator('#state').textContent(),'closed');console.log('PASS: initial-open Strict Mode modal remains open; Escape updates controlled state and closes.')
}finally{await browser?.close();server.kill('SIGTERM');rmSync(dir,{recursive:true});}

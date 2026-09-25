'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'duplicate DOM id');
function localPath(url){const u=String(url).split(/[?#]/)[0];if(!u.startsWith('/')) return null;return u==='/'?'index.html':u.slice(1);}
const refs=[];
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){const p=localPath(m[1]);if(p) refs.push(p);}
for(const p of refs){if(/^https?:/.test(p))continue;assert(fs.existsSync(path.join(root,p)),`missing HTML local path ${p}`);}
const coreBlock=(sw.match(/const CORE_PRECACHE = \[([\s\S]*?)\];/)||[])[1]||'';
const core=[...coreBlock.matchAll(/"([^"]+)"/g)].map(m=>m[1]);assert(core.length>10,'core precache list');
for(const u of core){const p=localPath(u);assert(p&&fs.existsSync(path.join(root,p)),`missing SW precache path ${u}`);}
assert.equal(manifest.name,'CurriLoop');assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons||[]){const p=localPath(icon.src);assert(p&&fs.existsSync(path.join(root,p)),`manifest icon ${icon.src}`);const b=fs.readFileSync(path.join(root,p));assert.equal(b.toString('ascii',1,4),'PNG',`${p}: png`);const w=b.readUInt32BE(16),h=b.readUInt32BE(20);const [ew,eh]=icon.sizes.split('x').map(Number);assert.equal(w,ew,`${p}: width`);assert.equal(h,eh,`${p}: height`);}
assert(html.includes('v7.8.1'));assert(sw.includes('curriloop-v7-8-1-red-team-freeze-20260924'));
assert(html.includes('/data/learning-aids/gap-intensity.js?v=7.8.1'));assert(html.includes('/js/engines/intensity-engine.js?v=7.8.1'));
console.log(JSON.stringify({staticPackage:'OK',domIds:ids.length,htmlLocalRefs:refs.length,corePrecache:core.length,manifestIcons:(manifest.icons||[]).length},null,2));

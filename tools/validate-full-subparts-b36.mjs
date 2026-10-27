import assert from 'node:assert/strict';
import fs from 'node:fs';
const r=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-36-reliability-ledger.json','utf8'));
assert.equal(r.cumulative_A_count,18);assert.equal(new Set(r.all_A_ids).size,18);
assert.deepEqual(r.partial_B_ids,['2026-A-05']);
const ops=[['T1','r','X'],['T1','w','X'],['T2','r','X'],['T3','r','Y'],['T2','r','Z'],['T3','w','Y'],['T1','r','Y'],['T2','w','X'],['T1','w','Y'],['T2','w','Z'],['T3','r','Z'],['T3','w','Z']];
const edges=new Set();for(let i=0;i<ops.length;i++)for(let j=i+1;j<ops.length;j++){const [t,a,x]=ops[i],[u,b,y]=ops[j];if(t!==u&&x===y&&(a==='w'||b==='w'))edges.add(`${t}->${u}(${x})`)}
assert.deepEqual([...edges].sort(),r.new_checks[0].components.conflict_edges);
const g=new Map();for(const e of edges){const [a,b]=e.split('(')[0].split('->');g.set(a,[...(g.get(a)||[]),b]);}
assert.ok(g.get('T1').includes('T2')&&g.get('T2').includes('T3')&&g.get('T3').includes('T1'));
const locks=['lock(X)','read(X)','write(X)','lock(Y)','unlock(X)','read(Y)','write(Y)','unlock(Y)'];assert.ok(locks.indexOf('lock(Y)')<locks.indexOf('unlock(X)'));
const q=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;const z=Object.fromEntries(q.map(x=>[x.id,x.answer]));assert.match(z['2026-A-12'],/T1→T2/);assert.match(z['2026-A-05'],/list\[i\] = list\[least\]/);
console.log('Build36 graph/2PL A and partial sorting B PASS');

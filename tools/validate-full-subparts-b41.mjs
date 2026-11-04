import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/audits/2026-10-26-build-41-memory-tree-independent.json',import.meta.url),'utf8'));
assert.equal(d.build,'2026.10.26-41'); assert.equal(d.items.length,3);
const l=d.items.find(x=>x.id==='2016-A-14').evidence;
let f=[],last=[],faults=[];for(const a of [212,36,48,256,128,365,24,400]) {const p=Math.floor(a/100);if(!f.includes(p)){faults.push(a);if(f.length<3)f.push(p);else {const victim=last.shift(); f[f.indexOf(victim)]=p;}}last=last.filter(x=>x!==p);last.push(p);}
assert.deepEqual(faults,l.faultAddresses);assert.deepEqual([...f].sort((a,b)=>a-b),l.finalResidentPages);
const m=d.items.find(x=>x.id==='2018-B-04').evidence.accesses;
for(const [i,a] of [5156,4096].entries()){assert.equal(m[i].offset,a%1024);assert.equal(m[i].physical,m[i].frame*1024+a%1024);} assert.deepEqual(m.map(x=>x.fault),[true,false]);
const t=d.items.find(x=>x.id==='2017-A-11').evidence;
assert.equal(t.unbalancedAfter5.bf,-2);assert.equal(t.after5.key,3);assert.equal(t.after8.right.key,8);assert.equal(t.after8.right.left.key,5);assert.equal(t.after8.right.right.key,9);assert.deepEqual(t.rotations.map(x=>x.type),['left','right','left']);
console.log('Build 41: 3 independent state-trace checks PASS');

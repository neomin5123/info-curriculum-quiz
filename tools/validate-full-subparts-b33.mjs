import fs from 'node:fs';
import assert from 'node:assert/strict';
const questions=JSON.parse(fs.readFileSync(new URL('../data/exams/major-exams-2014-2026.json',import.meta.url),'utf8')).questions;
const get=id=>questions.find(q=>q.id===id);
for(const id of ['2025-A-03','2026-A-06','2026-A-10','2026-A-11'])assert.equal(get(id).solutionStatus,'solved');
const a03=get('2025-A-03').answer; assert(a03.includes('w[i] * input_v[i]')&&a03.includes('input_v'));
const a=[[1,0,0],[1,0,1],[0,1,1]], b=[[0,0,1],[1,1,0],[0,1,0]];
const bp=(x,y)=>x.map(row=>[0,1,2].map(j=>Number([0,1,2].some(k=>row[k]&&y[k][j]))));
for(const [x,y,needle] of [[a,b,'0 1'],[b,a,'0 1']]){const m=bp(x,y);assert.equal(`${m[0][0]} ${m[0][2]}`,needle)}
assert(get('2026-A-06').answer.includes('des[i][j] = 0;'));
assert(get('2026-A-06').answer.includes('arr1[i][k] && arr2[k][j]'));
const freq=24000/6/2/2; assert.equal(freq,1000);
const network=ip=>(Math.floor(ip/64)*64);
assert.equal(network(126),64); assert.equal(network(130),128); assert.equal(network(180),128);assert.equal(network(150),128);
assert.equal(2**(32-26)-2,62);
const ans10=get('2026-A-10').answer;
for(const s of ['1,000','255.255.255.192','PC1','200.10.1.64'])assert(ans10.includes(s),s);
const codes=[89,15,12,13,4,25,30,9,2,5,21,72,45];
function probe(mode){const slots=Array(13).fill(null),collisions=[]; let pos25, collisions25;
for(const k of codes){let placed=false;for(let i=0;i<13;i++){const pos=(mode==='reverse'?k-i:k+i*i)%13;if(slots[pos]===null){slots[pos]=k;collisions.push(i);if(k===25){pos25=pos;collisions25=i}placed=true;break}}assert(placed)}return {slots,collisions,pos25,collisions25}}
const rev=probe('reverse'),quad=probe('quadratic');assert.equal(rev.pos25,10);assert.equal(rev.collisions25,2);
assert.equal(quad.collisions.reduce((a,b)=>a+b,0),10);assert.equal(quad.slots[3],25);
const ans11=get('2026-A-11').answer;assert(ans11.includes('2회')&&ans11.includes('10회')&&ans11.includes('코드 25'));
const report=JSON.parse(fs.readFileSync(new URL('../data/audits/2026-10-26-build-33-four-independent-verifications.json',import.meta.url),'utf8'));
assert.equal(report.questions.length,4);
console.log('Build33 independent full-subpart checks PASS (4): '+report.questions.map(q=>q.id).join(', '));

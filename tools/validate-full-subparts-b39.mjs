import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const byId=new Map(base.questions.map(q=>[q.id,q]));
const bits=x=>parseInt(x,2);
const xor=(...args)=>args.map(bits).reduce((a,b)=>a^b,0).toString(2).padStart(6,'0');
assert.equal(xor('101001','100011','001110'),'000100');
assert.equal(xor('000001','110001','010111'),'100111');
let x=6,y=4,carry=0,sum=0,cs=[0];
for(let i=0;i<4;i++){const a=(x>>i)&1,b=(y>>i)&1;sum|=(a^b^carry)<<i;carry=(a&b)|(a&carry)|(b&carry);cs.push(carry)}
assert.equal(sum.toString(2),'1010');assert.equal(cs[3]^cs[4],1);
assert.match(byId.get('2025-B-02').answer,/000100/);assert.match(byId.get('2025-B-02').answer,/100111/);
assert.match(byId.get('2026-B-08').answer,/1010/);assert.match(byId.get('2026-B-08').answer,/C3 ⊕ C4/);
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-39-two-full-checks.json','utf8'));
assert.equal(audit.A_count,23);assert.equal(new Set(audit.all_A_ids).size,23);
console.log('Build 39: RAID5 XOR and 4-bit datapath independent checks PASS');

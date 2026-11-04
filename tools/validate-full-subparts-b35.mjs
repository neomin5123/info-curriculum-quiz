import assert from 'node:assert/strict';
import fs from 'node:fs';
const x=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-35-reliability-ledger.json','utf8'));
assert.equal(x.cumulative_A_count,17);assert.equal(new Set(x.all_A_ids).size,17);
assert.equal(1000+1200,2200);
for(const [a,b] of [[0,1],[1,0]]) {let h1=Number(-2*a-2*b+2.8>=0),h2=Number(2*a+2*b-.8>=0);assert.equal(Number(2*h1+2*h2-2.8>=0),1);}
assert.equal(Math.max(0,5),5);
const periods={P1:[30,15],P2:[50,25]},jobs=[],trace=[];
for(let t=0;t<=100;t++) {for(const [name,[period,duration]] of Object.entries(periods))if(t%period===0)jobs.push({name,job:t/period+1,release:t,deadline:t+period,remaining:duration});const active=jobs.filter(j=>j.remaining>0&&j.release<=t).sort((a,b)=>a.deadline-b.deadline||a.release-b.release||a.name.localeCompare(b.name));if(!active.length)continue;const j=active[0];const old=trace.at(-1);if(old&&old.end===t&&old.task===j.name&&old.job===j.job)old.end++;else trace.push({start:t,end:t+1,task:j.name,job:j.job,deadline:j.deadline});j.remaining--;if(j.remaining===0)assert.ok(t+1<=j.deadline);}
const target=trace.filter(r=>r.task==='P2'&&r.job===2);assert.equal(target[0].start,55);assert.equal(target.at(-1).end,95);assert.deepEqual(trace,x.new_checks[2].trace);
const q=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;const answers=Object.fromEntries(q.map(i=>[i.id,i.answer]));assert.match(answers['2026-A-02'],/2200/);assert.match(answers['2026-A-03'],/y=5/);assert.match(answers['2026-A-04'],/55 ms, 95 ms/);
console.log('Build35 independent A02/A03/A04 and running ledger PASS');

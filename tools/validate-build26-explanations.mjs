import fs from 'node:fs'; import assert from 'node:assert/strict';
const d=JSON.parse(fs.readFileSync('data/generated/third-pass-explanations.js','utf8').replace(/^window\.CURRILOOP_THIRD_PASS_EXPLANATIONS = /,'').replace(/;\s*$/,''));
const a=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-26-explanation-backfill.json','utf8'));
const qs=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
assert.equal(a.ids.length,30); assert.equal(Object.keys(d).length,234);
for(const id of a.ids){const q=qs.find(x=>x.id===id); assert(q); assert.equal(q.solutionStatus,'solved'); assert(d[id].explanation.includes(q.answer)); assert(d[id].explanation.includes(q.solution)); assert(d[id].level.includes('독립검증 미완료'));}
assert.equal(qs.filter(x=>x.solutionStatus!=='solved').length,1);console.log('Build26 new draft explanations PASS');

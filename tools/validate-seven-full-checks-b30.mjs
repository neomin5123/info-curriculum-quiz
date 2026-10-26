import assert from 'node:assert/strict';import fs from 'node:fs';
const x=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-30-seven-full-checks.json','utf8'));
const q=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
assert.equal(x.full_checks.length,7);assert.equal(new Set(x.full_checks.map(v=>v.id)).size,7);
for(const v of x.full_checks){const z=q.find(y=>y.id===v.id);assert(z&&z.answer&&v.derivation.length>=2);assert.equal(v.status,'complete_independent_source_check');}
assert.equal(q.filter(z=>z.answer?.trim()).length,268);assert.equal(q.find(z=>z.id==='2024-B-07').solutionStatus,'pending');
console.log('Build30 seven source checks PASS');

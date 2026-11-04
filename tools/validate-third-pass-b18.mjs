import fs from 'node:fs';import assert from 'node:assert/strict';
const a=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-18-batch30.json','utf8'));
const d=JSON.parse(fs.readFileSync('data/generated/third-pass-explanations.js','utf8').replace(/^window\.CURRILOOP_THIRD_PASS_EXPLANATIONS = /,'').replace(/;\s*$/,''));
const qs=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
assert.equal(a.records.length,30);assert(Object.keys(d).length>=204);
for(const r of a.records){const q=qs.find(x=>x.id===r.id);assert(q);assert.equal(q.answer,r.answer);assert(d[r.id].explanation.length>250);assert.equal(r.officialRubricChecked,false);}
assert.equal(a.newWholeQuestionIndependentVerifications,0);assert.equal(a.partialSpotChecks,3);
console.log('Build18 explanation data integrity PASS');

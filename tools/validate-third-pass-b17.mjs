import fs from 'node:fs';import assert from 'node:assert/strict';
const a=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-17-batch30.json','utf8'));
const d=JSON.parse(fs.readFileSync('data/generated/third-pass-explanations.js','utf8').replace(/^window\.CURRILOOP_THIRD_PASS_EXPLANATIONS = /,'').replace(/;\s*$/,''));
const qs=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
assert.equal(a.records.length,30);assert(Object.keys(d).length>=166);
for(const item of a.records){const q=qs.find(x=>x.id===item.id);assert(q);assert.equal(q.answer,item.answer);assert(d[item.id].explanation.length>250);assert(d[item.id].level);assert.equal(item.independentVerification,'not-completed-in-this-batch');}
console.log('Build 17: 30 source-grounded explanation drafts PASS');

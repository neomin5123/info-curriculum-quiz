import fs from 'node:fs';import assert from 'node:assert/strict';
const q=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
const d=JSON.parse(fs.readFileSync('data/generated/third-pass-explanations.js','utf8').replace(/^window\.CURRILOOP_THIRD_PASS_EXPLANATIONS = /,'').replace(/;\s*$/,''));
const a=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-16-content-explanations.json','utf8'));
assert.equal(a.count,20);assert.equal(a.entries.length,20);assert.equal(a.conditional_count,10);
for(const e of a.entries){assert(d[e.id]?.explanation?.length>120,e.id);assert(q.find(x=>x.id===e.id)?.answer,e.id);assert.equal(d[e.id].level,e.level);}
assert(Object.keys(d).length>=166);console.log('Build 16 explanations/metadata PASS: 20 items');

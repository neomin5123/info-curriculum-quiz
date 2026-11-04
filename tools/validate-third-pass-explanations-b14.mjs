import fs from 'node:fs'; import assert from 'node:assert/strict';
const text=fs.readFileSync('data/generated/third-pass-explanations.js','utf8');const d=JSON.parse(text.replace(/^window\.CURRILOOP_THIRD_PASS_EXPLANATIONS = /,'').replace(/;\s*$/,''));
const ids=["2016-A-08", "2016-A-11", "2016-A-12", "2016-A-13", "2016-A-14", "2016-B-02", "2016-B-03", "2016-B-04", "2016-B-05", "2016-B-06", "2016-B-07", "2017-A-04", "2017-A-05", "2017-A-06", "2017-A-07", "2017-A-08", "2017-A-11", "2017-A-12", "2017-A-13", "2017-A-14"];const exam=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
for(const id of ids){assert(d[id]?.explanation.length>150,id+' explanation short');assert(exam.questions.find(q=>q.id===id)?.solutionStatus==='solved',id+' answer missing');}
for(const id of ['2016-B-06','2017-A-05','2017-A-11'])assert(d[id].level.includes('조건부'));
assert(ids.length===20);console.log('Build 14 explanation integration PASS: 20 items');

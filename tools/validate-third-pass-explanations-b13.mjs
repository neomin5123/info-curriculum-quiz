import fs from 'node:fs'; import assert from 'node:assert/strict';
const s=fs.readFileSync('data/generated/third-pass-explanations.js','utf8'); const d=JSON.parse(s.replace(/^window\.CURRILOOP_THIRD_PASS_EXPLANATIONS = /,'').replace(/;\s*$/,''));
const ids=["2014-A-04", "2014-A-05", "2014-A-06", "2014-A-07", "2014-A-08", "2014-A-09", "2014-A-10", "2014-A-13", "2014-A-14", "2014-B-01", "2014-B-02", "2014-B-03", "2014-B-04", "2014-B-06", "2016-A-02", "2016-A-03", "2016-A-04", "2016-A-05", "2016-A-06", "2016-A-07"];const exam=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
for(const id of ids){assert(d[id]?.explanation.length>150,id+' explanation short');assert(exam.questions.find(q=>q.id===id)?.solutionStatus==='solved',id+' no answer');}
for(const id of ['2014-A-05','2014-A-06','2014-B-06']) assert(d[id].level.includes('조건부'));
assert(ids.length===20);console.log('Build 13 explanation integration PASS: 20 items');

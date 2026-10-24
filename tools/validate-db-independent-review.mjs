import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const questions=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
const report=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-09-db-independent-review.json','utf8'));
const byId=new Map(questions.map(q=>[q.id,q]));
assert.equal(report.buildId,'2026.10.20-09');
assert.equal(report.reviewEntries.length,30);
assert.equal(questions.filter(q=>q.subject==='디비').length,30);
assert.equal(questions.filter(q=>q.solutionStatus==='solved').length,268);
assert.equal(questions.filter(q=>q.solutionStatus==='pending').length,1);
const reviewed=new Set();
for(const r of report.reviewEntries){
 assert(!reviewed.has(r.id),`duplicate ${r.id}`); reviewed.add(r.id);
 const q=byId.get(r.id);assert(q&&q.subject==='디비',`not a DB item: ${r.id}`);
 assert.equal(r.answerSha256,sha(q.answer),`DB answer changed: ${r.id}`);
 assert.equal(r.solutionSha256,sha(q.solution),`DB solution changed: ${r.id}`);
 assert.equal(r.solutionStatus,q.solutionStatus);
 assert.equal(r.sourceSegments,q.images.length);
 assert(r.independentReasoning.length>40,`weak independent reason: ${r.id}`);
 assert.equal(r.officialAnswerVerified,false);
}
const p=byId.get('2024-B-07');assert.equal(p.solutionStatus,'pending');assert.equal(p.answer,'');
assert.equal(p.solution,'');
const q=byId.get('2021-B-02');assert(q.solution.includes('(A,E)'),'contradiction note missing');
const r=report.reviewEntries.find(x=>x.id==='2024-B-07');
assert(r.warnings.length>=2&&r.reviewStatus==='conditional-underdetermined');
console.log(JSON.stringify({status:'PASS',reviewed:reviewed.size,solved:29,pending:1,priorAnswerChanges:0,officialVerified:false}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const questions=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
const review=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-10-network-independent-review.json','utf8'));
assert.equal(review.buildId,'2026.10.20-10');
assert.equal(review.reviewEntries.length,28);
assert.equal(questions.length,269);
assert.equal(questions.filter(q=>q.solutionStatus==='solved').length,268);
assert.equal(questions.filter(q=>q.subject==='데통네트웤').length,28);
const byId=new Map(questions.map(q=>[q.id,q]));
const ids=new Set();
for(const row of review.reviewEntries){
  assert(!ids.has(row.id),`duplicate ${row.id}`);ids.add(row.id);
  const q=byId.get(row.id);
  assert(q && q.subject==='데통네트웤' && q.solutionStatus==='solved',`unmatched ${row.id}`);
  assert.equal(q.answer&&sha(q.answer),row.storedAnswerSha256,`answer changed ${row.id}`);
  assert.equal(sha(q.solution),row.storedSolutionSha256,`solution changed ${row.id}`);
  assert.equal(row.sourceSegments,q.images.length);
  assert(row.independentReasoning.length>=20,`missing real explanation ${row.id}`);
  assert.equal(row.officialAnswerVerified,false);
}
assert.equal(ids.size,28);
assert.equal(review.reviewEntries.reduce((n,x)=>n+x.sourceSegments,0),29);
assert.deepEqual(review.reviewEntries.filter(r=>r.warnings.length).map(r=>r.id).sort(),['2014-A-14','2021-A-01','2025-A-09','2026-A-08']);
assert.equal(review.officialAnswerVerified,false);
console.log(JSON.stringify({status:'PASS',subject:'데통네트웤',reviewed:ids.size,solved:28,officialAnswerVerified:false}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const report=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-11-os-independent-review.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-05-231-second-pass-audit.json','utf8'));
const qs=new Map(db.questions.map(x=>[x.id,x]));
assert.equal(report.buildId,'2026.10.20-11');assert.equal(report.entries.length,27);
assert.equal(db.questions.length,269);assert.equal(db.questions.filter(q=>q.solutionStatus==='solved').length,268);
assert.equal(db.questions.filter(q=>q.subject==='운체').length,27);
const allowed=report.changeAllowlist,ids=new Set();assert.deepEqual(Object.keys(allowed),['2019-B-05']);
for(const row of report.entries){
 assert(!ids.has(row.id),`duplicate OS item ${row.id}`);ids.add(row.id);
 const q=qs.get(row.id);assert(q?.subject==='운체'&&q.solutionStatus==='solved',`invalid ${row.id}`);
 assert.deepEqual(row.originalPdfPages,q.source.pages);assert.equal(row.imageSegments,q.images.length);
 assert(row.independentReasoning.length>=45,`weak review note ${row.id}`);
 assert.equal(row.currentAnswerSha256,sha(q.answer));assert.equal(row.currentSolutionSha256,sha(q.solution));
 assert.equal(row.officialAnswerVerified,false);
 if(allowed[row.id]){
  const c=allowed[row.id];assert.equal(sha(c.oldAnswer),row.oldAnswerSha256);assert.equal(sha(c.oldSolution),row.oldSolutionSha256);
  assert.equal(c.newAnswerSha256,sha(q.answer));assert.equal(c.newSolutionSha256,sha(q.solution));
  assert.equal(row.reviewOutcome,'corrected-answer');
 }else{
  assert.equal(row.oldAnswerSha256,row.currentAnswerSha256,`unannounced answer change ${row.id}`);
  assert.equal(row.oldSolutionSha256,row.currentSolutionSha256,`unannounced explanation change ${row.id}`);
 }
}
assert.equal(ids.size,27);assert.deepEqual(report.entries.filter(r=>r.warnings.length).map(r=>r.id),['2021-B-10','2026-B-06']);
assert(qs.get('2019-B-05').answer.includes('C')&&qs.get('2019-B-05').answer.includes('15초')&&qs.get('2019-B-05').solution.includes('유휴(18~19)'));
assert.equal(qs.get('2019-B-05').verification.officialAnswerConfirmed,false);
const baselineById=new Map(baseline.records.map(q=>[q.id,q.answerSha256]));
for(const q of db.questions.filter(q=>q.solutionStatus==='solved'&&baselineById.has(q.id))){
 if(q.id==='2019-B-05')assert.equal(sha(allowed[q.id].oldAnswer),baselineById.get(q.id));
 else if(q.id==='2017-B-06'||q.id==='2019-B-03'||q.id==='2021-A-08'||q.id==='2025-A-02')continue; // documented Build08 logic additions
 else assert.equal(sha(q.answer),baselineById.get(q.id),`undocumented baseline drift ${q.id}`);
}
console.log(JSON.stringify({status:'PASS',independentOSReview:ids.size,corrected:['2019-B-05'],conditional:['2021-B-10','2026-B-06'],otherPriorAnswersPreserved:true,officialAnswerVerified:false}));

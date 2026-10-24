import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const exam=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-21-build-04-third-pass-2014-pedagogy.json','utf8'));
const ids=['2014-A-01','2014-A-02','2014-A-03','2014-A-11','2014-A-12','2014-B-05'];
assert.equal(audit.metadata.buildId,'2026.10.21-04');
assert.equal(exam.questions.length,269);
assert.equal(exam.questions.filter(q=>q.solutionStatus==='solved').length,268);
assert.equal(exam.questions.filter(q=>q.solutionStatus==='pending').length,1);
assert.deepEqual(audit.entries.map(e=>e.id),ids);
assert.equal(Object.keys(audit.baselineAnswerSha256).length,268);
for(const q of exam.questions.filter(q=>q.solutionStatus==='solved')){assert.equal(hash(q.answer),audit.baselineAnswerSha256[q.id],'baseline answer was modified '+q.id);}
for(const e of audit.entries){
 const q=exam.questions.find(x=>x.id===e.id);
 assert(q);assert.equal(q.subject,'교교론');
 assert.equal(hash(q.solution),e.storedSolutionSha256,'existing explanation was modified '+e.id);
 assert.equal(hash(q.answer),e.storedAnswerSha256);
 assert.equal(e.officialAnswerConfirmed,false);
 assert.equal(e.answerEdited,false);assert.equal(e.appSolutionEdited,false);
 assert(e.workedExplanation.length>100 && e.limitations.length>15);
 assert.deepEqual(e.sourcePages,q.source.pages);
 assert.equal(e.questionImageCount,q.images.length);
 for(const s of e.externalSources){assert(/^https:\/\//.test(s.url));assert(s.supports && s.class);}
}
assert.equal(audit.metadata.officialAnswerConfirmed,0);
assert.equal(audit.metadata.independentExternalExamKeyCompared,0);
console.log(JSON.stringify({status:'PASS',thirdPass2014:6,officialVerified:0,existingAnswersPreserved:268,appSolutionModified:0,reportExplanations:6}));

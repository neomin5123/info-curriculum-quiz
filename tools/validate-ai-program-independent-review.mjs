import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const root=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-21-build-01-ai-program-independent-review.json','utf8'));
const qmap=new Map(root.questions.map(q=>[q.id,q]));
assert.equal(audit.buildId,'2026.10.21-01');
assert.equal(audit.coverage.reviewed,21);assert.equal(audit.coverage.corrected,0);
assert.equal(root.questions.length,269);assert.equal(root.questions.filter(x=>x.solutionStatus==='solved').length,268);
const ids=new Set();const subjectCounts={인지머러:0,프로그래밍:0};
for(const e of audit.entries){
 assert(!ids.has(e.id),`duplicate ${e.id}`);ids.add(e.id);
 const q=qmap.get(e.id);assert(q && q.subject===e.subject && q.solutionStatus==='solved',e.id);
 assert.deepEqual(e.pdfPages,q.source.pages);assert.equal(e.atlasSegments,q.images.length);
 assert(e.independentReasoning.length>=70,`reasoning too short ${e.id}`);
 assert.equal(e.answerSha256,sha(q.answer),`answer changed since independent check: ${e.id}`);
 assert.equal(e.solutionSha256,sha(q.solution),`solution changed since independent check: ${e.id}`);
 assert.equal(e.officialAnswerVerified,false);
 assert.equal(e.recheckOutcome,'core-answer-matched');subjectCounts[e.subject]++;
}
assert.deepEqual(subjectCounts,{인지머러:6,프로그래밍:15});
assert.deepEqual(root.questions.filter(q=>q.subject==='인지머러'&&q.solutionStatus==='solved').map(q=>q.id).sort(),audit.entries.filter(e=>e.subject==='인지머러').map(e=>e.id).sort());
assert.deepEqual(audit.entries.filter(e=>e.subject==='프로그래밍').map(e=>e.id).sort(),root.questions.filter(q=>q.subject==='프로그래밍'&&q.solutionStatus==='solved'&&audit.entries.some(e=>e.id===q.id)).map(q=>q.id).sort());
assert.equal(root.questions.filter(q=>q.subject==='프로그래밍'&&q.solutionStatus==='pending').length,0);
console.log(JSON.stringify({status:'PASS',reviewed:21,aiMachineLearning:6,programming:15,pendingProgramming:0,historicalReviewedAnswerTextsUnchanged:15,officialAnswerKeyVerified:false}));

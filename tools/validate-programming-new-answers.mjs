import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-21-build-02-programming-answers.json','utf8'));
const map=new Map(db.questions.map(q=>[q.id,q]));
assert.equal(audit.buildId,'2026.10.21-02');
assert.equal(audit.officialAnswerKeyVerified,false);
assert.equal(db.questions.length,269);
assert.equal(db.questions.filter(q=>q.solutionStatus==='solved').length,268);
assert.equal(db.questions.filter(q=>q.solutionStatus==='pending').length,1);
assert.equal(db.questions.filter(q=>q.subject==='프로그래밍'&&q.solutionStatus==='solved').length,46);
assert.equal(db.questions.filter(q=>q.subject==='프로그래밍'&&q.solutionStatus==='pending').length,0);
assert.equal(audit.newIds.length,31);
assert.equal(Object.keys(audit.existingAnswerHashes).length,231);
assert.equal(Object.keys(audit.newAnswerHashes).length,31);
const newIds=new Set(audit.newIds);
assert.equal(newIds.size,31);
for(const [id,expected] of Object.entries(audit.existingAnswerHashes)){
 const q=map.get(id);
 assert(q&&q.solutionStatus==='solved',`baseline answer missing ${id}`);
 assert.equal(sha(`${q.answer}\0${q.solution}`),expected,`baseline answer altered ${id}`);
}
for(const [id,expected] of Object.entries(audit.newAnswerHashes)){
 const q=map.get(id);
 assert(newIds.has(id)&&q?.subject==='프로그래밍'&&q.solutionStatus==='solved',`new id mismatch ${id}`);
 assert.equal(sha(`${q.answer}\0${q.solution}`),expected,`new answer altered ${id}`);
 assert(q.answer.trim().length>=2&&q.solution.trim().length>=70,`incomplete answer ${id}`);
 assert(q.verification?.status==='derived'&&q.verification?.checkedAgainst==='original-question-pdf'&&q.verification?.officialAnswerConfirmed===false,`unverified provenance ${id}`);
 assert(q.images?.length>=1&&q.source?.pages?.length>=1,`source missing ${id}`);
}
assert.equal(audit.entries.length,31);
for(const row of audit.entries){
 const q=map.get(row.id);
 assert(newIds.has(row.id)&&q.answer===row.answer&&q.solution===row.derivation,`audit mismatch ${row.id}`);
 assert.equal(row.imageSegments,q.images.length);
}
assert(db.questions.find(q=>q.id==='2024-A-08').solution.includes('정의되지 않는다'),'signed overflow caveat absent');
assert(db.questions.find(q=>q.id==='2022-A-02').answer.includes('c=X̅'),'LED diagram was not checked');
assert(db.questions.find(q=>q.id==='2026-B-05').answer.includes('㉤ 1'),'2d parity wrong');
const mirror=fs.readFileSync('data/generated/exam-data.js','utf8').trim();
assert(mirror.startsWith('window.CURRILOOP_EXAM_DATA='));
assert.deepEqual(JSON.parse(mirror.slice('window.CURRILOOP_EXAM_DATA='.length,-1)),db);
console.log(JSON.stringify({status:'PASS',previousAnswerHashesPreserved:231,added:31,programmingSolved:46,totalSolved:268,remaining:1,officialAnswerVerified:false}));

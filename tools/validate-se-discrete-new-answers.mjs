import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-21-build-03-se-discrete-answers.json','utf8'));
const byId=new Map(db.questions.map(q=>[q.id,q]));
const newIds=['2014-B-01','2016-A-04','2021-A-10','2023-A-12','2025-B-08','2025-B-09'];
assert.deepEqual(audit.newIds,newIds);
assert.equal(audit.officialAnswerKeyVerified,false);
assert.equal(audit.buildId,'2026.10.21-03');
assert.equal(db.questions.length,269);
assert.equal(db.questions.filter(q=>q.solutionStatus==='solved').length,268);
assert.deepEqual(db.questions.filter(q=>q.solutionStatus==='pending').map(q=>q.id),['2024-B-07']);
assert.equal(db.metadata.coverage.solved,268);
assert.equal(db.questions.filter(q=>q.subject==='소공'&&q.solutionStatus==='solved').length,5);
assert.equal(db.questions.filter(q=>q.subject==='이산수학'&&q.solutionStatus==='solved').length,1);
assert.equal(Object.keys(audit.previousAnswerHashes).length,262);
assert.equal(Object.keys(audit.newAnswerHashes).length,6);
for(const [id,h] of Object.entries(audit.previousAnswerHashes)){
 const q=byId.get(id);assert(q&&q.solutionStatus==='solved',id+' missing');
 assert.equal(sha(q.answer+'\0'+q.solution),h,id+' preexisting changed');
}
for(const [id,h] of Object.entries(audit.newAnswerHashes)){
 const q=byId.get(id);assert(newIds.includes(id)&&q?.solutionStatus==='solved',id+' absent');
 assert.equal(sha(q.answer+'\0'+q.solution),h,id+' new answer hash mismatch');
 assert.equal(q.verification.status,'derived');
 assert.equal(q.verification.officialAnswerConfirmed,false);
 assert.equal(q.verification.checkedAgainst,'original-question-pdf');
 assert(q.solution.length>=100&&q.images.length>=1&&q.source.pages.length>=1,id+' incomplete');
 const e=audit.entries.find(e=>e.id===id);
 assert(e&&e.answer===q.answer&&e.solution===q.solution,id+' audit mismatch');
}
// Independent CPM longest-path recomputation.
const jobs={A:[7,[]],B:[5,['A']],C:[10,['A']],D:[4,['B','C']],E:[6,['C']],F:[15,['D','E']],G:[12,['F']],H:[10,['D','E']],I:[0,['G','H']]};
const earliest={};for(const [id,[duration,parents]] of Object.entries(jobs)) earliest[id]=duration+Math.max(0,...parents.map(p=>earliest[p]));
assert.equal(earliest.I,50);
assert.equal([7,10,6,15,12].reduce((a,b)=>a+b),50);
// Two independent 2021 test coverage case sets.
const branch2021=(a,b)=>{let c=a>1&&b===1?1:2; c+=a===4?1:2;return c;};
for(const [a,b,c] of [[4,2,3],[2,1,3],[4,1,2],[3,2,4]])assert.equal(branch2021(a,b),c);
// Group-test algorithm: count calls for any single infected in 0..63.
for(let infected=0;infected<64;infected++){
 let calls=0;
 function test(l,r){calls++;if(infected<l||infected>r)return;if(l===r)return;const m=Math.floor((l+r)/2);test(l,m);test(m+1,r);}
 test(0,63);assert.equal(calls,13);
}
// Branch and condition cases from 2025.
const branch2025=(a,b)=>{let c=3;if(a<5||b>0)c=b-a;if(a===3&&c<2)c++;return c;};
assert.equal(branch2025(3,0),-2);
assert.equal(branch2025(5,-1),3);
assert.equal(branch2025(3,1),-1);
// From G_L, deleting CE and DF leaves precisely K3,3 between {A,D,F}/{B,C,E}.
const edges=['AB','AC','AE','BF','BD','CD','CE','CF','DE','DF','EF'];
const left=new Set('ADF');const right=new Set('BCE');
const kept=edges.filter(e=>!['CE','DF'].includes(e));
assert.equal(kept.length,9);
for(const u of left)for(const v of right)assert(kept.includes(u+v)||kept.includes(v+u));
// Ensure actual JS mirror is synchronized.
const mirror=fs.readFileSync('data/generated/exam-data.js','utf8').trim();
assert(mirror.startsWith('window.CURRILOOP_EXAM_DATA='));
assert.deepEqual(JSON.parse(mirror.slice('window.CURRILOOP_EXAM_DATA='.length,-1)),db);
console.log(JSON.stringify({status:'PASS',added:6,softwareEngineering:5,discreteMath:1,previousAnswersPreserved:262,totalSolved:268,pending:1,numericAndGraphChecks:true,officialVerified:false}));

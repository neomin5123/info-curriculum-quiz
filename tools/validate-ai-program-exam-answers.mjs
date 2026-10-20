import fs from 'node:fs';
import crypto from 'node:crypto';
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-04-ai-program-exam-answer-hashes.json','utf8'));
const assert=(c,m)=>{if(!c)throw new Error('AI/program answer audit: '+m);};
function auditedSolution(q){
 if(q.id!=='2021-B-02')return q.solution;
 const tag='\n\n재검토 주의:';
 const pos=q.solution.indexOf(tag);
 assert(pos>=0&&q.solution.indexOf(tag,pos+tag.length)===-1,'BCNF candidate-key warning absent or duplicated');
 assert(q.solution.slice(pos).includes('(A,E)')&&q.solution.slice(pos).includes('AC→E'),'candidate-key contradiction text incomplete');
 return q.solution.slice(0,pos);
}
const hash=q=>crypto.createHash('sha256').update(`${q.answer}\0${auditedSolution(q)}`).digest('hex');
const qs=new Map(db.questions.map(q=>[q.id,q]));
assert(Object.keys(audit.previousAnswersSha256).length===212,'prior baseline total');
assert(audit.newIds.length===19&&Object.keys(audit.newAnswersSha256).length===19,'new count');
for(const [id,expected] of Object.entries({...audit.previousAnswersSha256,...audit.newAnswersSha256})){
 const q=qs.get(id);assert(q?.solutionStatus==='solved'&&hash(q)===expected,'altered answer '+id);
}
for(const id of audit.newIds){const q=qs.get(id);
 assert(['인지머러','프로그래밍'].includes(q.subject),'wrong subject '+id);
 assert(q.verification?.status==='derived'&&q.verification.officialAnswerConfirmed===false,'official answer false labeling '+id);
 assert(q.verification.checkedAgainst==='original-question-pdf','unreviewed original '+id);
 assert(q.answer.length>2&&q.solution.length>=50,'short answer '+id);
}
assert(db.questions.filter(q=>q.solutionStatus==='solved').length===231,'total solved');
assert(db.metadata.coverage.solved===231,'coverage total');
assert(db.questions.filter(q=>q.subject==='인지머러'&&q.solutionStatus==='solved').length===6,'AI learning total');
assert(db.questions.filter(q=>q.subject==='프로그래밍'&&q.solutionStatus==='solved').length===15,'programming total');
assert(qs.get('2023-A-09').answer.includes('g(n)=2')&&qs.get('2023-A-09').answer.includes('f(목표)=3'),'A* result');
assert(qs.get('2026-A-03').answer.includes('1, x=(1,0)에서 1'),'perceptron result');
console.log(JSON.stringify({status:'PASS',baseline:212,added:19,totalSolved:231,aiLearningSolved:6,programmingSolved:15}));

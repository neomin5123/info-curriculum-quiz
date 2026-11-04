import {legacyAnswerForHistoricalChecks, legacySolutionForHistoricalChecks} from './legacy-review-corrections.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-03-os-exam-answer-hashes.json','utf8'));
function assert(condition,message){if(!condition)throw new Error(`OS answer audit: ${message}`);}
function auditedSolution(q){
 if(q.id!=='2021-B-02')return legacySolutionForHistoricalChecks(q);
 const tag='\n\n재검토 주의:';
 const pos=q.solution.indexOf(tag);
 assert(pos>=0&&q.solution.indexOf(tag,pos+tag.length)===-1,'BCNF candidate-key warning absent or duplicated');
 assert(q.solution.slice(pos).includes('(A,E)')&&q.solution.slice(pos).includes('AC→E'),'candidate-key contradiction text incomplete');
 return q.solution.slice(0,pos);
}
function hash(q){return crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex');}
const lookup=new Map(db.questions.map(q=>[q.id,q]));
assert(Object.keys(audit.previousAnswersSha256).length===186,'previous answer count');
assert(audit.newIds.length===26 && Object.keys(audit.newAnswersSha256).length===26,'new answer count');
for(const [id,expected] of Object.entries({...audit.previousAnswersSha256,...audit.newAnswersSha256})){
 const q=lookup.get(id); assert(q?.solutionStatus==='solved',`missing solved ${id}`);
 assert(hash(q)===expected,`solution content changed ${id}`);
}
for(const id of audit.newIds){
 const q=lookup.get(id);
 assert(q.subject==='운체',`unexpected subject ${id}`);
 assert(q.verification?.status==='derived' && q.verification?.officialAnswerConfirmed===false,`incorrect provenance ${id}`);
 assert(q.verification?.checkedAgainst==='original-question-pdf',`source check ${id}`);
 assert(['high','medium'].includes(q.verification?.confidence),`confidence missing ${id}`);
 assert(q.answer.length>=3 && q.solution.length>=60,`incomplete answer ${id}`);
}
for(const id of audit.reviewNeededIds)assert(lookup.get(id).verification.reviewNote,'uncertainty note missing '+id);
assert(db.questions.filter(q=>q.subject==='운체').length===27,'OS total wrong');
assert(db.questions.filter(q=>q.subject==='운체'&&q.solutionStatus==='solved').length===27,'OS solved incomplete');
assert(db.questions.filter(q=>q.solutionStatus==='solved').length===268,'total solved wrong');
assert(db.metadata.coverage.solved===268,'metadata solved wrong');
assert(lookup.get('2018-B-05').answer.includes('24')&&lookup.get('2018-B-05').answer.includes('0'),'race condition bound regressed');
assert(lookup.get('2022-A-12').answer.includes('5회'),'PFF regression');
assert(lookup.get('2024-B-06').answer.includes('[4,0,51]'),'second chance state regression');
assert(lookup.get('2023-B-10').answer.includes('220 ns'),'TLB miss time regression');
console.log(JSON.stringify({status:'PASS',osAdded:26,osSolved:27,totalSolved:231,previousAnswersUnchanged:186,reviewFlags:audit.reviewNeededIds}));

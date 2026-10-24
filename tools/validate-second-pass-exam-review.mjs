import {legacyAnswerForHistoricalChecks} from './legacy-review-corrections.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const fail=m=>{throw new Error('Second-pass exam review: '+m);};
const d=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const r=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-05-231-second-pass-audit.json','utf8'));
const a=r.records;
if(a.length!==231||d.questions.filter(x=>x.solutionStatus==='solved').length!==268)fail('231 solved count');
const byId=new Map(d.questions.map(x=>[x.id,x]));
const IDs=new Set();
for(const entry of a){
 if(IDs.has(entry.id))fail('duplicate ID '+entry.id);
 IDs.add(entry.id);
 const q=byId.get(entry.id);if(!q||q.solutionStatus!=='solved')fail('missing '+entry.id);
 if(crypto.createHash('sha256').update(legacyAnswerForHistoricalChecks(q)).digest('hex')!==entry.answerSha256)fail('answer content changed '+entry.id);
 if(q.text.length<5||!q.images.length||!q.source.pages.length||!q.solution.trim())fail('incomplete '+entry.id);
}
const q=byId.get('2021-B-02');
if(!q.solution.includes('재검토 주의:')||!q.solution.includes('(A,E)')||!q.solution.includes('후보키'))fail('BCNF conflict notice missing');
for(const id of ['2023-B-11','2021-B-10','2026-A-08']){
 if(!a.some(x=>x.id===id&&x.manualReviewFlag))fail('uncertainty flag missing '+id);
}
if(Object.keys(r.recomputations).length!==10||Object.values(r.recomputations).some(x=>x.checked!==true))fail('independent simulation audit');
if(d.questions.filter(x=>x.solutionStatus==='pending').length!==1)fail('pending count');
console.log(JSON.stringify({status:'PASS',structurallyReviewed:a.length,independentRecalculation:10,newIssue:'2021-B-02',previousAnswerTextsPreserved:true}));

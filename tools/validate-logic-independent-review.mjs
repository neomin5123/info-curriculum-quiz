import {legacyAnswerForHistoricalChecks} from './legacy-review-corrections.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const must=(x,m)=>{if(!x)throw Error('logic independent review: '+m)};
const data=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const report=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-08-logic-independent-review.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-05-231-second-pass-audit.json','utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const all=new Map(data.questions.map(q=>[q.id,q]));
const orig=new Map(baseline.records.map(e=>[e.id,e.answerSha256]));
const updates=report.changeAllowlist;
must(Object.keys(updates).length===4,'exactly 4 documented revisions');
must(report.entries.length===21,'21 re-reviewed questions');
must(data.questions.filter(q=>q.solutionStatus==='solved').length===268,'solved count preserved');
must(data.questions.filter(q=>q.solutionStatus==='pending').length===1,'pending count preserved');
const seen=new Set();for(const e of report.entries){
 must(!seen.has(e.id),'duplicate recheck '+e.id);seen.add(e.id);
 const q=all.get(e.id);must(q?.subject==='논회컴구'&&q.solutionStatus==='solved','subject or status '+e.id);
 must(e.independentReasoning?.length>=28&&e.sourcePages.length>0&&e.imageSegments===q.images.length,'weak review '+e.id);
 must(e.currentAnswerSha256===sha(q.answer),'answer hash changed '+e.id);
 must(e.correctedAnswerCompleteness===Boolean(updates[e.id]),'patch set mismatch '+e.id);
}
for(const q of data.questions.filter(q=>q.solutionStatus==='solved'&&orig.has(q.id))){
 const c=updates[q.id];
 if(c){
  must(sha(c.oldAnswer)===orig.get(q.id),'old snapshot mismatch '+q.id);
  must(sha(q.answer)===c.newAnswerSha256&&sha(q.solution)===c.newSolutionSha256,'new digest mismatch '+q.id);
  must(q.verification?.officialAnswerConfirmed===false&&q.verification.reviewNote?.includes('독립 재풀이'),'provenance wrong '+q.id);
 }else must(sha(legacyAnswerForHistoricalChecks(q))===orig.get(q.id),'undocumented answer change '+q.id);
}
must(all.get('2025-A-02').answer.includes('I3')&&all.get('2025-A-02').answer.includes('Y1'),'priority encoder missing a part');
must(all.get('2019-B-03').answer.includes('페이지 번호 3'),'paging missing page number');
must(all.get('2021-A-08').answer.includes('유효 주소 2004, 저장 값(AC) 2001'),'STORE result order');
must(all.get('2017-B-06').answer.includes('00→(1,0,0,0)'),'decoder full truth table');
console.log(JSON.stringify({status:'PASS',independentlyReviewed:seen.size,answerCorrections:Object.keys(updates).length,unchangedSolvedAnswers:231-Object.keys(updates).length,totalSolved:231}));

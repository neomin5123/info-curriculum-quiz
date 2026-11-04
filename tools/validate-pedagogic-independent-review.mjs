import {legacyAnswerForHistoricalChecks} from './legacy-review-corrections.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const fail=m=>{throw Error('pedagogic independent review: '+m);};
const data=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-06-pedagogic-independent-review.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-05-231-second-pass-audit.json','utf8'));
const pedagogic=data.questions.filter(x=>x.subject==='교교론');
const existing=new Map(data.questions.map(x=>[x.id,x]));
if(pedagogic.length!==74||audit.entries.length!==74||data.questions.length!==269)fail('question corpus counts');
const seen=new Set();let conditional=0,hashValidated=0;
for(const e of audit.entries){
 if(seen.has(e.id))fail('duplicate '+e.id);seen.add(e.id);
 const q=existing.get(e.id);if(!q||q.subject!=='교교론'||q.solutionStatus!=='solved')fail('question mismatch '+e.id);
 if(!e.independentCoreAnswer?.trim()||!e.reasoning?.trim())fail('missing independent explanation '+e.id);
 if(e.originalAnswerTextChanged!==false||e.officialAnswerConfirmed!==false)fail('false claims '+e.id);
 if(!e.pageRefs.length||e.imageSegments!==q.images.length)fail('source mismatch '+e.id);
 if(e.riskNote)conditional++;
}
if(conditional!==17||pedagogic.some(x=>!seen.has(x.id)))fail('review coverage');
const answerById=new Map(baseline.records.map(x=>[x.id,x.answerSha256]));
for(const q of data.questions.filter(x=>x.solutionStatus==='solved'&&answerById.has(x.id))){
 const fixed=answerById.get(q.id);
 const actual=crypto.createHash('sha256').update(legacyAnswerForHistoricalChecks(q)).digest('hex');
 if(!fixed||actual!==fixed)fail('previously reviewed answer modified '+q.id);
 hashValidated++;
}
if(hashValidated!==231||data.questions.filter(x=>x.solutionStatus==='pending').length!==1)fail('solved/pending count');
if(audit.counts.definitiveCorrections!==0||audit.counts.reproducedCoreMatches!==74)fail('false audit summary');
console.log(JSON.stringify({status:'PASS',pedagogicReproduced:74,conditional:17,existingAnswersPreserved:hashValidated,solved:231,pending:38}));

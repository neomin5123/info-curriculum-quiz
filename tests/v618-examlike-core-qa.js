
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const root=path.resolve(__dirname,'..');
const bank=JSON.parse(fs.readFileSync(path.join(root,'data/practice-bank-v11.json'),'utf8'));
if(bank.questions.length!==41) throw new Error(`core count ${bank.questions.length}`);
if(bank.meta.questionCount!==41||bank.meta.quarantineCount!==139) throw new Error('meta count mismatch');
const ids=new Set(), pairs=new Set(); let units=0;
for(const q of bank.questions){
 if(ids.has(q.questionId)) throw new Error(`duplicate ${q.questionId}`); ids.add(q.questionId);
 if(Number(q.points)!==4) throw new Error(`non-4pt ${q.questionId}`);
 if(!q.sourceIds?.length) throw new Error(`missing source ${q.questionId}`);
 if(!q.curriculumScopes?.length) throw new Error(`missing scope ${q.questionId}`);
 q.curriculumScopes.forEach(s=>pairs.add(`${s.subject}::${s.area}`));
 units+=(q.answerUnits||[]).length;
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!html.includes('41문항')||!html.includes('v6.18.0')) throw new Error('UI core count/version missing');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
if(!sw.includes('curriloop-v6-18-0-20260920')) throw new Error('SW version missing');
console.log(`v6.18 ExamLike Core QA: OK (questions=${bank.questions.length}, units=${units}, pairs=${pairs.size}, quarantined=${bank.meta.quarantineCount})`);

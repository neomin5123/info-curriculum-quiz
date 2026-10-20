import fs from 'node:fs';
import crypto from 'node:crypto';
function assert(ok,m){if(!ok)throw Error(m)}
const ai=JSON.parse(fs.readFileSync('data/curriculum/ai-basic-2022.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-01-ai-priority-review.json','utf8'));
const q=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
const ids=new Set(q.map(x=>x.id));
assert(ai.lines.length===110&&audit.lineReviews.length===110&&audit.unitReviews.length===296,'scope drift');
assert(audit.scope.semanticUnits===296&&audit.scope.knowledgeUnderstandingLines===11,'audit count drift');
assert(ai.metadata.stage3RPolicy==='AI_PRIORITY_V1_CONSERVATIVE_EVIDENCE_MAPPED_NOT_OFFICIAL','priority policy missing');
const lines=new Map(ai.lines.map(l=>[l.lineId,l]));
const grades=['S','A','B','C'];
let units=0,S=0,ki=0;
for(const l of ai.lines){
 const r=audit.lineReviews.find(x=>x.lineId===l.lineId);
 assert(r&&r.sourceText===l.sourceText&&r.grade===l.importanceReview.grade&&grades.includes(r.grade),'line grading mismatch '+l.lineId);
 assert(l.importanceReview.officialAnswerConfirmed===false,'unverified official claim '+l.lineId);
 if(l.family==='지식·이해'){assert((l.presentation?.units||[]).length===0,'KI should stay list recall');ki++;}
 for(const e of l.importanceReview.evidence){assert(ids.has(e.questionId),'nonexistent question');}
 for(const u of l.presentation?.units||[]){
  units++;const gr=u.stage3RGrades;
  assert(gr?.length===1&&grades.includes(gr[0]),'invalid grade '+u.unitId);
  assert(l.sourceText.slice(u.start,u.end)===u.text,'bad source offsets '+u.unitId);
  const row=audit.unitReviews.find(x=>x.unitId===u.unitId);
  assert(row&&row.grade===gr[0]&&row.phrase===u.text,'audit drift '+u.unitId);
  const ks=l.keywords.filter(k=>k.text===u.text&&k.start===u.start&&k.end===u.end);
  assert(ks.length===1&&ks[0].importance===gr[0]&&JSON.stringify(ks[0].stage3RGrades)===JSON.stringify(gr),'keyword mismatch '+u.unitId);
  if(gr[0]==='S'){
   S++;assert(row.directAnswerQuestionId,'S lacking directly elicited answer '+u.unitId);
   const ref=q.find(x=>x.id===row.directAnswerQuestionId);
   assert(ref&&ref.text.includes('2022 개정'),'S evidence must be 2022 source '+u.unitId);
   assert(['2024-B-01','2026-B-07'].includes(row.directAnswerQuestionId),'unapproved S evidence '+u.unitId);
  }else assert(!row.directAnswerQuestionId,'non-S direct-answer record incorrect '+u.unitId);
 }
}
assert(units===296&&S===6&&ki===11,'cardinality');
assert(audit.SUnitEvidence.length===6&&audit.SKnowledgeLines.length===1,'S evidence shape');
for(const e of audit.evidence){
 assert(ids.has(e.id)&&Array.isArray(e.lineIds),'bad evidence');
 if(e.relation==='2015_indirect_topic_only') assert(!audit.SUnitEvidence.some(x=>x.questionId===e.id),'historical curricula conflated');
}
console.log(JSON.stringify({status:'PASS',aiLines:110,aiPresentationUnits:units,kiWholeList:ki,examEvidence:audit.evidence.length,gradeLineCounts:audit.gradesByLine,gradeUnitCounts:audit.gradesByUnit},null,2));

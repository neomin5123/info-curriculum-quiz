'use strict';
const assert=require('assert');
global.window={};
require('../../data/curriculum/2022/curriculum.js');
const E=require('../../data/learning-aids/exam-recall-profiles.js');
const P=require('../../js/engines/practical-engine.js');

const subjects=window.CURRILOOP_CURRICULUM_DATA;
const rows=[];
for (const subjectId of E.pilotSubjects) {
  for (const [area,groups] of Object.entries(subjects[subjectId]||{})) {
    for (const [sourceGroup,sections] of Object.entries(groups||{})) {
      for (const section of sections||[]) for (const line of section.lines||[]) rows.push({subjectId,area,sourceGroup,section,line});
    }
  }
}
assert.equal(rows.filter(x=>x.subjectId==='middle-info').length,139);
assert.equal(rows.filter(x=>x.subjectId==='high-info').length,131);
assert.equal(rows.length,270);
const byId=new Map(rows.map(x=>[x.line.id,x]));

for (const [id,raw] of Object.entries(E.lineProfiles)) {
  const row=byId.get(id);
  assert(row,`profile points outside middle/high corpus or missing line: ${id}`);
  const p=E.getProfile({subjectKey:row.subjectId,lineId:id,sectionTitle:row.section.title,sourceGroup:row.sourceGroup});
  assert(p.directExam,`${id} must resolve as direct exam evidence`);
  assert(p.trainingMaxUnits>=p.observedMaxUnits,`${id} training max below observed`);
  assert(p.trainingMaxUnits<=p.observedMaxUnits+1,`${id} safety margin exceeds +1`);
  if (p.demandKind!=='production') {
    assert.equal(p.observedMaxUnits,1,`${id} non-production evidence must not claim multiple produced units`);
    assert(p.trainingMaxUnits<=2,`${id} non-production evidence must not exceed 2-set practice`);
    assert.equal(p.pinnedAnswers.length,0,`${id} non-production evidence must not inject exact exam blanks`);
  }
  for (const answer of [...p.pinnedAnswers,...p.priorityAnswers]) {
    assert(row.line.text.includes(answer),`${id} exam atom not found verbatim in source line: ${answer}`);
  }
}

// Mature combination caps for the exact cases that previously overblanked.
function mature(profile,count=8){
  const stats=Array.from({length:count},()=>({examCore:true,stat:{correct:4,successDays:['2026-09-15','2026-09-16','2026-09-18','2026-09-22']}}));
  return P.desiredExamSetCount(count,stats,profile);
}
for (const id of ['MI-03-AC-CO-01','MI-03-AC-CO-02','HI-03-AC-ST-02']) {
  const row=byId.get(id); const p=E.getProfile({subjectKey:row.subjectId,lineId:id,sectionTitle:row.section.title,sourceGroup:row.sourceGroup});
  assert.equal(mature(p),2,`${id} quoted/recognition line must mature at 2 gaps, not 3~4`);
  assert.equal(P.examCoverageLimit(p),0.35,`${id} non-production line must preserve at least 65% context when possible`);
}
for (const id of ['MI-03-CS-KI-02','MI-03-CS-VA-01','MI-05-CS-KN-02','MI-05-CS-KN-03','HI-01-AC-ST-03']) {
  const row=byId.get(id); const p=E.getProfile({subjectKey:row.subjectId,lineId:id,sectionTitle:row.section.title,sourceGroup:row.sourceGroup});
  assert.equal(mature(p),2,`${id} one-unit production should end at one extra safety unit`);
}
for (const id of ['HI-02-CS-KI-01','HI-02-CS-KN-01','HI-02-AC-CO-01','HI-TE-EVM-03']) {
  const row=byId.get(id); const p=E.getProfile({subjectKey:row.subjectId,lineId:id,sectionTitle:row.section.title,sourceGroup:row.sourceGroup});
  assert.equal(mature(p),3,`${id} two-unit production should end at 3 with +1 safety margin`);
  assert.equal(P.examCoverageLimit(p),0.55,`${id} production evidence coverage rail`);
}

console.log('middle/high exam-demand integrity QA passed:',{
  corpusLines:rows.length,
  directProfiles:Object.keys(E.lineProfiles).length,
  production:Object.values(E.lineProfiles).filter(p=>p.demandKind==='production').length,
  nonProduction:Object.values(E.lineProfiles).filter(p=>p.demandKind!=='production').length
});

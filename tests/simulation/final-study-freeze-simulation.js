'use strict';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const P=require('../../js/engines/planner-engine.js');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const guided=P.buildStudySections(ctx.window.CURRILOOP_CURRICULUM_DATA,['middle-info'],'과목 공통');
function noon(dayKey){ return new Date(`${dayKey}T12:00:00+09:00`).getTime(); }
function nextDay(dayKey){ return P.shiftDayKey(dayKey,1); }
function addEvidence(state, accuracy, stampBase){
  const vals=[accuracy,Math.min(1,accuracy+.04),Math.max(0,accuracy-.03),accuracy];
  vals.forEach((score,i)=>{ state=P.noteSessionAssessment(state,{key:`sim-${stampBase}-${i}`,kind:i<3?'recall':'core',status:score>=.999?'correct':'wrong',accuracy:score},stampBase+i); });
  return state;
}
function simulateAverage(){
  let state=P.normalizeState({targetLines:18});
  let day='2026-09-22'; let studied=0; let consolidations=0;
  for(let guard=0;guard<60;guard++,day=nextDay(day)){
    const now=noon(day);
    const progress=P.progressSummary(guided,state);
    if(progress.percent>=100) return {day,studied,consolidations,target:state.targetLines,progress};
    if(P.isConsolidationDay(state,now)) { state=P.recordStudyActivity(state,now); consolidations++; continue; }
    const deadline=P.deadlineGuidance(guided,state,{now});
    const backlog=(guard%5===0)?24:(guard%7===0?28:8); // 현실적인 변동, 심한 적체는 아님
    let session=state.activeSession||P.createNextSession(guided,state,backlog,now,{targetFloor:deadline.targetFloor});
    if(!session){ state=P.recordStudyActivity(state,now); continue; }
    if(!state.activeSession) state=P.startSession(state,session,now);
    state=addEvidence(state,.79,now);
    state=P.recordStudyActivity(state,now);
    state=P.completeActiveSession(state,now+6*3600*1000).state;
    studied++;
  }
  throw new Error('average simulation did not complete');
}
const avg=simulateAverage();
if(avg.progress.percent!==100) throw new Error('average must complete guided scope');
if(P.signedDayDistance(avg.day,'2026-10-24')<0) throw new Error(`average first pass missed D-35: ${avg.day}`);
const start=P.normalizeState({targetLines:8});
const late=P.deadlineGuidance(guided,start,{now:noon('2026-10-10')});
if(late.status!=='boost' || late.targetFloor<=8) throw new Error(`late user should receive deadline boost: ${JSON.stringify(late)}`);
const boosted=P.paceDecision({state:start,dueCount:0,now:noon('2026-10-10'),targetFloor:late.targetFloor});
if(boosted.mode!=='deadline-boost') throw new Error('deadline boost must activate when review load is stable');
const reviewFirst=P.paceDecision({state:start,dueCount:40,now:noon('2026-10-10'),targetFloor:late.targetFloor});
if(reviewFirst.mode==='deadline-boost') throw new Error('review backlog must outrank deadline boost');
const budget=P.dailyReviewBudget(18), allowance=P.reviewUnlockAllowance(18);
if(budget!==25 || allowance!==6) throw new Error(`review 75% gate ${budget}/${allowance}`);
const processedToUnlock=budget-allowance;
if(processedToUnlock!==19) throw new Error(`must process 19/25 before unlock, got ${processedToUnlock}`);
console.log(JSON.stringify({average:{completed:avg.day,studySessions:avg.studied,consolidations:avg.consolidations,target:avg.target},deadlineLate:{required:late.requiredDailyWorkload,targetFloor:late.targetFloor,forecast:late.estimatedCompletionDayKey},reviewGate:{budget,allowance,processBeforeUnlock:processedToUnlock}},null,2));

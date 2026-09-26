'use strict';
process.env.TZ = 'Asia/Seoul';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const P=require('../../js/engines/planner-engine.js');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const order=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
const sections=P.buildStudySections(ctx.window.CURRILOOP_CURRICULUM_DATA,order,'과목 공통');
function noon(dayKey){ return new Date(`${dayKey}T12:00:00+09:00`).getTime(); }
function nextDay(dayKey){ return P.shiftDayKey(dayKey,1); }
function addEvidence(state, accuracy, stampBase){
  const vals=[accuracy,Math.min(1,accuracy+.04),Math.max(0,accuracy-.03),accuracy];
  vals.forEach((score,i)=>{ state=P.noteSessionAssessment(state,{key:`sim-${stampBase}-${i}`,kind:i<3?'recall':'core',status:score>=.999?'correct':'wrong',accuracy:score},stampBase+i); });
  return state;
}
function simulate({start='2026-09-24', accuracy=.79, backlogFn=()=>8, offDays=new Set(), maxDays=90}={}){
  let state=P.normalizeState({targetLines:18},noon(start));
  let day=start, studied=0, consolidations=0, blocked=0;
  const seenSubjects=[];
  for(let guard=0;guard<maxDays;guard++,day=nextDay(day)){
    const now=noon(day); const progress=P.progressSummary(sections,state);
    if(progress.percent>=100) return {day,studied,consolidations,blocked,target:state.targetLines,progress,state,seenSubjects};
    if(offDays.has(day)) continue;
    if(P.isConsolidationDay(state,now)) { state=P.recordStudyActivity(state,now); consolidations++; continue; }
    const deadline=P.deadlineGuidance(sections,state,{now});
    const backlog=Number(backlogFn(guard,day,state)||0);
    let session=state.activeSession||P.createNextSession(sections,state,backlog,now,{targetFloor:deadline.targetFloor});
    if(!session){ state=P.recordStudyActivity(state,now); blocked++; continue; }
    if(!state.activeSession){ state=P.startSession(state,session,now); seenSubjects.push(session.subjectKey); }
    state=addEvidence(state,accuracy,now);
    state=P.recordStudyActivity(state,now);
    state=P.completeActiveSession(state,now+6*3600*1000).state;
    studied++;
    const after=P.progressSummary(sections,state);
    if(after.percent>=100) return {day,studied,consolidations,blocked,target:state.targetLines,progress:after,state,seenSubjects};
  }
  throw new Error(`simulation did not complete: ${P.progressSummary(sections,state).percent}%`);
}
const avg=simulate({backlogFn:()=>8});
if(avg.progress.percent!==100) throw new Error('average must complete six-course scope');
if(P.signedDayDistance(avg.day,'2026-11-07')<0) throw new Error(`average first pass missed D-21 recommendation: ${avg.day}`);
for(const subject of order) if(!avg.seenSubjects.includes(subject)) throw new Error(`subject never entered: ${subject}`);

const moderate=simulate({backlogFn:(g)=>g%9===0?24:(g%11===0?26:8)});
const gap=simulate({offDays:new Set(['2026-10-03','2026-10-17']), backlogFn:()=>8});
if(P.signedDayDistance(moderate.day,'2026-11-09')<0) throw new Error(`moderate review load slipped beyond two-day recovery margin: ${moderate.day}`);
if(P.signedDayDistance(gap.day,'2026-11-09')<0) throw new Error(`two one-day absences did not recover within two-day margin: ${gap.day}`);

const start=P.normalizeState({targetLines:8},noon('2026-09-24'));
const deadline=P.deadlineGuidance(sections,start,{now:noon('2026-09-24')});
if(deadline.deadlineDayKey!=='2026-11-07' || deadline.targetFloor<=8) throw new Error(`six-course deadline boost: ${JSON.stringify(deadline)}`);
const boosted=P.paceDecision({state:start,dueCount:0,now:noon('2026-09-24'),targetFloor:deadline.targetFloor});
if(boosted.mode!=='deadline-boost') throw new Error('deadline boost must activate when review load is stable');
const reviewFirst=P.paceDecision({state:start,dueCount:60,now:noon('2026-09-24'),targetFloor:deadline.targetFloor});
if(reviewFirst.mode==='deadline-boost') throw new Error('review backlog must outrank deadline boost');
const budget=P.dailyReviewBudget(18), allowance=P.reviewUnlockAllowance(18);
if(budget!==25 || allowance!==6 || budget-allowance!==19) throw new Error(`review gate ${budget}/${allowance}`);
console.log(JSON.stringify({
  average:{completed:avg.day,studySessions:avg.studied,consolidations:avg.consolidations,target:avg.target,subjects:[...new Set(avg.seenSubjects)]},
  moderateReview:{completed:moderate.day,studySessions:moderate.studied,consolidations:moderate.consolidations},
  twoSingleDayAbsences:{completed:gap.day,studySessions:gap.studied,consolidations:gap.consolidations},
  deadline:{buffer:P.FIRST_PASS_BUFFER_DAYS,targetFloor:deadline.targetFloor,minCompletion:deadline.minimumCompletionDayKey,forecast:deadline.estimatedCompletionDayKey},
  reviewGate:{budget,allowance,processBeforeUnlock:budget-allowance}
},null,2));

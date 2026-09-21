'use strict';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const P=require('../../js/engines/planner-engine.js');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const sections=P.buildStudySections(ctx.window.CURRILOOP_CURRICULUM_DATA,['middle-info','high-info','ai-basic','data-science','software-life','info-science'],'과목 공통');
function addEvidence(state, accuracy, serial){
  for(let i=0;i<6;i++) state=P.noteSessionAssessment(state,{key:`${serial}-${i}`,kind:i<2?'core':'recall',status:accuracy>=.85?'correct':'wrong',accuracy},Date.now()+i);
  return state;
}
function run(capacity, accuracy, days){
  let state=P.normalizeState({firstDayKey:'2026-09-21',targetLines:18});
  let partial=0, started=0, continued=0, serial=0;
  for(let d=0;d<days;d++){
    const now=new Date(2026,8,21+d,12).getTime();
    let session=state.activeSession || P.createNextSession(sections,state,0,now);
    if(!state.activeSession && session){state=P.startSession(state,session,now); partial=0; started++;}
    else if(state.activeSession) continued++;
    session=state.activeSession;
    if(!session) continue;
    partial += capacity;
    if(partial >= Number(session.workloadScore || session.lineCount || 0)){state=addEvidence(state,accuracy,serial++); state=P.completeActiveSession(state,now).state; partial=0;}
  }
  return {...P.progressSummary(sections,state), state, started, continued};
}
const fast=run(30,.93,45);
if(fast.percent<95) throw new Error(`fast first-pass expansion too slow: ${fast.percent}%`);
if(fast.state.targetLines<18) throw new Error(`fast accurate learner should not be slowed: ${fast.state.targetLines}`);
const slow=run(9,.62,21);
if(slow.state.targetLines>12) throw new Error(`slow/low-accuracy learner did not auto-reduce target: ${slow.state.targetLines}`);
if(slow.continued<3) throw new Error('slow learner must continue unfinished sessions across days');
const slowAccurate=run(9,.93,21);
if(slowAccurate.state.targetLines>=18) throw new Error('slow but accurate learner should still receive mild load reduction');
if(slowAccurate.state.targetLines<slow.state.targetLines) throw new Error('high accuracy should protect slow learner from excessive reduction');
if(P.dailyReviewBudget(slow.state.targetLines)<20) throw new Error('slow learner must retain a meaningful review budget');
if(P.dailyReviewBudget(slow.state.targetLines)>P.dailyReviewBudget(fast.state.targetLines)) throw new Error('slow learner review budget should not exceed fast learner budget');
console.log(JSON.stringify({fast:{percent:fast.percent,target:fast.state.targetLines,started:fast.started},slow:{percent:slow.percent,target:slow.state.targetLines,continued:slow.continued},slowAccurate:{percent:slowAccurate.percent,target:slowAccurate.state.targetLines}},null,2));

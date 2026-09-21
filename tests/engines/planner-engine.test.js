'use strict';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const P=require('../../js/engines/planner-engine.js');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const order=['middle-info','high-info','ai-basic','data-science','software-life','info-science'];
const sections=P.buildStudySections(data,order,'과목 공통');
if(sections.length<60) throw new Error(`study sections too few ${sections.length}`);
function stamp(state, scores, kind='recall', prefix='x'){
  scores.forEach((score,i)=>{state=P.noteSessionAssessment(state,{key:`${prefix}-${i}`,kind,status:score>=0.999?'correct':'wrong',accuracy:score},Date.now()+i);});
  return state;
}
let state=P.normalizeState({firstDayKey:'2026-09-21',targetLines:18});
const session=P.createNextSession(sections,state,0,new Date(2026,8,21,12).getTime());
if(!session || session.subjectKey!=='middle-info' || session.area!=='컴퓨팅 시스템') throw new Error('first session sequence');
state=P.startSession(state,session,new Date(2026,8,21,12).getTime());
if(P.createNextSession(sections,state,0,new Date(2026,8,22,12).getTime()).id!==session.id) throw new Error('unfinished session must continue');
// 높은 정확도라도 3일이 걸리면 과도하게 벌주지 않고 1문장만 감속한다.
state=stamp(state,[.95,.9,.92,.88],'recall','slow-high');
let completed=P.completeActiveSession(state,new Date(2026,8,23,12).getTime());
if(completed.daysSpent!==3 || completed.state.targetLines!==17) throw new Error(`slow-high adaptation ${completed.daysSpent}/${completed.state.targetLines}`);
if(completed.performance.percent<85) throw new Error('performance summary high accuracy');
const pause=P.paceDecision({state:completed.state,dueCount:400,now:new Date(2026,8,24,12).getTime()});
if(pause.allowNew || pause.mode!=='review-recovery') throw new Error('review overload must pause new scope');
// 1일 완료라도 정답률이 낮으면 감속한다.
let lowBase=P.normalizeState({...completed.state,targetLines:18,fastStreak:0,recoveryDayKey:''});
let lowSession=P.createNextSession(sections,lowBase,0,new Date(2026,8,24,12).getTime());
let lowStarted=P.startSession(lowBase,lowSession,new Date(2026,8,24,12).getTime());
lowStarted=stamp(lowStarted,[.4,.5,.45,.5],'recall','low');
const lowDone=P.completeActiveSession(lowStarted,new Date(2026,8,24,18).getTime());
if(lowDone.state.targetLines!==16) throw new Error(`low accuracy must reduce target, got ${lowDone.state.targetLines}`);
// 1일 + 높은 정확도를 세 번 연속 달성해야 1문장 증가한다.
let fastBase=P.normalizeState({...completed.state,targetLines:15,fastStreak:2,recoveryDayKey:''});
let fastSession=P.createNextSession(sections,fastBase,0,new Date(2026,8,24,12).getTime());
let fastStarted=P.startSession(fastBase,fastSession,new Date(2026,8,24,12).getTime());
fastStarted=stamp(fastStarted,[.95,.9,.92,.88],'recall','fast');
const fastDone=P.completeActiveSession(fastStarted,new Date(2026,8,24,18).getTime());
if(fastDone.state.targetLines!==16) throw new Error('fast learner gradual increase');
// 정답 데이터 없이 하루 만에 완료한 것은 증량 근거가 아니다.
let noEvidence=P.normalizeState({...completed.state,targetLines:18,fastStreak:2,recoveryDayKey:''});
let noEvidenceSession=P.createNextSession(sections,noEvidence,0,new Date(2026,8,24,12).getTime());
noEvidence=P.startSession(noEvidence,noEvidenceSession,new Date(2026,8,24,12).getTime());
const noEvidenceDone=P.completeActiveSession(noEvidence,new Date(2026,8,24,18).getTime());
if(noEvidenceDone.state.targetLines!==18 || noEvidenceDone.state.fastStreak!==0) throw new Error('completion without evidence must not increase pace');
// 첫 시도만 반영: 같은 key의 재시도로 점수를 덮어쓸 수 없다.
let first=P.normalizeState({targetLines:18});
first=P.startSession(first,session,Date.now());
first=P.noteSessionAssessment(first,{key:'same',kind:'recall',status:'wrong',accuracy:0},Date.now());
first=P.noteSessionAssessment(first,{key:'same',kind:'recall',status:'correct',accuracy:1},Date.now()+1);
const firstSummary=P.sessionPerformanceSummary(first.activeSession);
if(firstSummary.percent!==0 || firstSummary.evidenceCount!==1) throw new Error('first-attempt score must be immutable');
if(P.dailyReviewBudget(8)!==20 || P.dailyReviewBudget(22)!==27) throw new Error('review budget must stay robust for slow learners');
const light=P.reviewLoadDecision(18,26);
if(light.mode!=='light-reduce' || light.effectiveTargetLines>=18) throw new Error('moderate backlog must reduce new scope first');
const heavy=P.reviewLoadDecision(18,40);
if(heavy.mode!=='heavy-reduce' || heavy.effectiveTargetLines>10) throw new Error('heavy backlog must strongly reduce new scope');
const stop=P.reviewLoadDecision(18,60);
if(stop.mode!=='pause' || stop.effectiveTargetLines!==0) throw new Error('severe backlog must pause new scope');
const slowFloorStop=P.reviewLoadDecision(8,35);
if(slowFloorStop.mode!=='pause') throw new Error('minimum-scope slow learner must pause instead of pretending to reduce further');

// 여러 날로 나뉜 영역도 마지막 세션에서는 영역 전체가 덮였다고 판정되어야 한다.
const algoSections=sections.filter(x=>x.subjectKey==='middle-info'&&x.area==='알고리즘과 프로그래밍');
if(algoSections.length<2) throw new Error('algorithm area needs multiple sections for split-session test');
const splitState=P.normalizeState({completedSectionIds:algoSections.slice(0,-1).map(x=>x.id)});
const splitSession={subjectKey:'middle-info',area:'알고리즘과 프로그래밍',sectionIds:[algoSections[algoSections.length-1].id]};
if(!P.completesArea(sections,splitState,splitSession)) throw new Error('final split session must trigger area-completion structure practice');

console.log(`planner-engine tests: OK (sections=${sections.length})`);

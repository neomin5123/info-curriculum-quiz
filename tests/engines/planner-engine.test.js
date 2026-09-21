'use strict';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const P=require('../../js/engines/planner-engine.js');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const order=['middle-info','high-info','ai-basic','data-science','software-life','info-science'];
const sections=P.buildStudySections(data,order,'과목 공통');
if(sections.length<60) throw new Error(`study sections too few ${sections.length}`);
const shortLine={text:'운영 체제의 기능',easy:['운영 체제','기능'],normal:['운영 체제','기능']};
const longLine={text:'성취기준 해설은 학습자가 실제 문제 상황에서 여러 개념을 연결하고 적용하는 과정을 충분히 설명할 수 있도록 긴 맥락과 구체적인 조건을 포함한다. 이러한 문장은 짧은 내용 요소보다 읽기와 인출에 더 많은 부담이 든다.',easy:['성취기준 해설','문제 상황','여러 개념','연결','적용'],normal:['성취기준 해설','학습자','실제 문제 상황','여러 개념','연결','적용','긴 맥락','구체적인 조건']};
if(P.lineWorkload(longLine,'achievement','성취기준 해설','middle-info')<=P.lineWorkload(shortLine,'content-system','지식·이해','middle-info')) throw new Error('long guidance must weigh more than short content element');
if(!sections.every(x=>Number(x.workloadScore)>0)) throw new Error('every study section needs workload score');
function stamp(state, scores, kind='recall', prefix='x'){
  scores.forEach((score,i)=>{state=P.noteSessionAssessment(state,{key:`${prefix}-${i}`,kind,status:score>=0.999?'correct':'wrong',accuracy:score},Date.now()+i);});
  return state;
}
let state=P.normalizeState({firstDayKey:'2026-09-21',targetLines:18});
const session=P.createNextSession(sections,state,0,new Date(2026,8,21,12).getTime());
if(!session || session.subjectKey!=='middle-info' || session.area!=='컴퓨팅 시스템') throw new Error('first session sequence');
if(!Number.isFinite(session.workloadScore) || session.workloadScore<=0 || session.workloadScore>23.1) throw new Error(`first session workload bound ${session.workloadScore}`);
const synthetic=[
{id:'s1',subjectKey:'x',area:'a',sourceGroup:'content-system',lineCount:10,workloadScore:8},
{id:'s2',subjectKey:'x',area:'a',sourceGroup:'achievement',lineCount:2,workloadScore:12},
{id:'s3',subjectKey:'x',area:'a',sourceGroup:'achievement',lineCount:8,workloadScore:8}
];
const syntheticSession=P.createNextSession(synthetic,P.normalizeState({targetLines:18}),0,new Date(2026,8,21,12).getTime());
if(syntheticSession.sectionIds.join(',')!=='s1,s2' || syntheticSession.workloadScore!==20) throw new Error('session partition must follow workload, not raw sentence count');
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

// 미완료 세션의 현재 단계·입력 진행은 다음 날에도 보존되어야 한다.
let resume=P.normalizeState({targetLines:18});
const resumeSession=P.createNextSession(sections,resume,0,new Date(2026,8,25,12).getTime());
resume=P.startSession(resume,resumeSession,new Date(2026,8,25,12).getTime());
resume=P.noteSessionStudyProgress(resume,{
  stepIndex:2, stepKey:'fill|practical|실전 통회상', stepLabel:'실전 통회상',
  draftFields:{'draft-a':{value:'순차적인 데이터 저장',status:'correct'}},
  gradedRecall:{'recall-a':'wrong'},
  structureSession:{area:'테스트',questions:[{id:'q1',graded:true}],index:0,answered:1,correct:0,complete:false},
  lastFocus:{sectionIndex:1,lineIndex:2}
},new Date(2026,8,25,13).getTime());
const resumed=P.normalizeState(resume,new Date(2026,8,26,12).getTime());
if(resumed.activeSession.studyProgress.stepIndex!==2 || resumed.activeSession.studyProgress.stepKey!=='fill|practical|실전 통회상') throw new Error('planner step resume');
if(resumed.activeSession.studyProgress.draftFields['draft-a']?.status!=='correct') throw new Error('planner draft resume');
if(resumed.activeSession.studyProgress.gradedRecall['recall-a']!=='wrong') throw new Error('planner recall grade resume');
if(resumed.activeSession.studyProgress.lastFocus?.lineIndex!==2) throw new Error('planner focus resume');
if(P.createNextSession(sections,resumed,0,new Date(2026,8,26,12).getTime()).id!==resumeSession.id) throw new Error('resumed session identity');


// v7.6.5: 정리 주기는 달력 경과일이 아니라 실제 학습일 6일을 기준으로 한다.
let activity=P.normalizeState({targetLines:18,studyDayKeys:[],cycleStudyDayKeys:[]},new Date(2026,8,21,12).getTime());
const studyDates=[21,22,24,27,30,31]; // 중간에 쉬는 날이 있어도 카운트는 진행하지 않는다.
for (const day of studyDates) {
  const at=new Date(2026,8,day,12).getTime();
  activity=P.recordStudyActivity(activity,at);
  // 같은 날 여러 번 활동해도 1일로만 센다.
  activity=P.recordStudyActivity(activity,at+60*60*1000);
}
if(activity.cycleStudyDayKeys.length!==6 || activity.studyDayKeys.length!==6) throw new Error('actual study days must dedupe and ignore rest days');
const sixthDay=new Date(2026,8,31,18).getTime();
if(P.isConsolidationDay(activity,sixthDay)) throw new Error('the sixth study day itself must remain a normal study day');
const later=new Date(2026,9,3,12).getTime(); // 10/3: 며칠 쉬어도 다음 실제 학습일이 정리일
if(!P.isConsolidationDay(activity,later)) throw new Error('consolidation must remain pending across calendar rest days');
const pendingWithSession=P.normalizeState({...activity,activeSession:{id:'held',sectionIds:['s'],subjectKey:'x',area:'a'}} ,later);
const pendingDecision=P.paceDecision({state:pendingWithSession,dueCount:0,now:later});
if(pendingDecision.mode!=='consolidation' || pendingDecision.allowNew) throw new Error('consolidation must pause even an unfinished study session for that day');
activity=P.recordStudyActivity(activity,later);
if(activity.consolidationDayKey!==P.localDayKey(later) || activity.cycleStudyDayKeys.length!==0) throw new Error('consolidation activity must reset the six-day cycle');
if(!P.isConsolidationDay(activity,later)) throw new Error('once started, consolidation must remain active for the rest of that day');
const after=new Date(2026,9,4,12).getTime();
if(P.isConsolidationDay(activity,after)) throw new Error('the day after consolidation must start a fresh cycle');
if(activity.studyDayKeys.length!==7) throw new Error('consolidation day must count in overall study-day history');


// v7.7.0: 오늘 복습 예산의 75%를 처리하면 소량 잔여 복습과 새 진도를 병행할 수 있다.
if(P.reviewUnlockAllowance(18)!==6) throw new Error(`review unlock allowance ${P.reviewUnlockAllowance(18)}`);
if(P.reviewUnlockAllowance(8)!==5) throw new Error(`slow review unlock allowance ${P.reviewUnlockAllowance(8)}`);

// v7.7.0: 2027학년도 중등 1차 11/28, 첫 회독 권장 마감 D-35를 역산한다.
const guided=sections.filter(x=>x.subjectKey==='middle-info');
const deadlineBase=P.normalizeState({targetLines:8,completedSectionIds:[]},new Date(2026,9,20,12).getTime());
const deadline=P.deadlineGuidance(guided,deadlineBase,{now:new Date(2026,9,20,12).getTime()});
if(deadline.examDayKey!=='2026-11-28' || deadline.deadlineDayKey!=='2026-10-24') throw new Error(`deadline keys ${deadline.examDayKey}/${deadline.deadlineDayKey}`);
if(deadline.status!=='boost' && deadline.status!=='critical') throw new Error(`deadline status ${deadline.status}`);
if(deadline.targetFloor<=8) throw new Error(`deadline floor ${deadline.targetFloor}`);
const deadlineDecision=P.paceDecision({state:deadlineBase,dueCount:0,now:new Date(2026,9,20,12).getTime(),targetFloor:deadline.targetFloor});
if(deadlineDecision.mode!=='deadline-boost' || deadlineDecision.effectiveTargetLines!==deadline.targetFloor) throw new Error('deadline pace boost');
const blockedByReview=P.paceDecision({state:deadlineBase,dueCount:50,now:new Date(2026,9,20,12).getTime(),targetFloor:22});
if(blockedByReview.mode==='deadline-boost') throw new Error('review burden must outrank deadline boost');

console.log(`planner-engine tests: OK (sections=${sections.length})`);

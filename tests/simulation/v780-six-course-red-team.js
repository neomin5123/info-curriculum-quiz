'use strict';
process.env.TZ = 'Asia/Seoul';
const assert=require('assert');
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const P=require('../../js/engines/planner-engine.js');
const S=require('../../js/engines/structure-engine.js');
const R=require('../../js/engines/review-engine.js');
const D=require('../../js/engines/day-engine.js');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const order=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
const sections=P.buildStudySections(data,order,'과목 공통');
const sectionById=new Map(sections.map(x=>[x.id,x]));

function ts(s){return new Date(s).getTime();}
function noon(day){return ts(`${day}T12:00:00+09:00`);}
function rng(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function makeCycle(today,n){const arr=[];for(let i=n;i>=1;i--) arr.push(P.shiftDayKey(today,-i));return arr;}
function evidence(state,now,score=.8){
  for(let i=0;i<4;i++) state=P.noteSessionAssessment(state,{key:`rt-${now}-${i}`,kind:i===0?'core':i===3?'structure':'recall',status:score>=.85?'correct':score>=.65?'near':'wrong',accuracy:Math.max(0,Math.min(1,score+(i-1)*.02))},now+i);
  return state;
}

// 1) 04:00 study-day boundary is exact and shared by planner/review.
const boundaryCases=[
  ['2026-09-24T23:59:59+09:00','2026-09-24'],
  ['2026-09-25T00:00:00+09:00','2026-09-24'],
  ['2026-09-25T03:59:59+09:00','2026-09-24'],
  ['2026-09-25T04:00:00+09:00','2026-09-25']
];
for(const [stamp,key] of boundaryCases){
  assert.equal(D.studyDayKey(ts(stamp)),key,`day engine ${stamp}`);
  assert.equal(P.localDayKey(ts(stamp)),key,`planner day ${stamp}`);
  assert.equal(R.localDayKey(ts(stamp)),key,`review day ${stamp}`);
}

// 2) Crossing midnight cannot bypass the one-fresh-session-per-study-day cap; 04:00 can.
let state=P.normalizeState({targetLines:22},ts('2026-09-24T23:50:00+09:00'));
let s1=P.createNextSession(sections,state,0,ts('2026-09-24T23:50:00+09:00'),{targetFloor:22});
assert(s1,'23:50 first session');
state=P.startSession(state,s1,ts('2026-09-24T23:50:00+09:00'));
state=evidence(state,ts('2026-09-24T23:51:00+09:00'),.9);
state=P.recordStudyActivity(state,ts('2026-09-25T00:05:00+09:00'));
state=P.completeActiveSession(state,ts('2026-09-25T00:10:00+09:00')).state;
for(const stamp of ['2026-09-25T00:30:00+09:00','2026-09-25T03:59:59+09:00']){
  assert.equal(P.createNextSession(sections,state,0,ts(stamp),{targetFloor:22}),null,`same study-day bypass ${stamp}`);
  assert.equal(P.paceDecision({state,dueCount:0,now:ts(stamp),targetFloor:22}).mode,'daily-new-complete');
}
assert(P.createNextSession(sections,state,0,ts('2026-09-25T04:00:00+09:00'),{targetFloor:22}),'04:00 must open new study day');

// 3) Full 225-section traversal: no session crosses subject/area; every area-ending session has an appropriate structure gate.
let traverse=P.normalizeState({targetLines:22},noon('2026-09-24'));
let day='2026-09-24', sessions=0, areaEnds=0, commonEnds=0;
const entered=[];
for(let guard=0;guard<400 && P.progressSummary(sections,traverse).completedSections<P.progressSummary(sections,traverse).totalSections;guard++){
  const now=noon(day);
  if(P.isConsolidationDay(traverse,now)){traverse=P.recordStudyActivity(traverse,now);day=P.shiftDayKey(day,1);continue;}
  const sess=P.createNextSession(sections,traverse,0,now,{targetFloor:22});
  if(!sess){day=P.shiftDayKey(day,1);continue;}
  const members=sess.sectionIds.map(id=>sectionById.get(id));
  assert(members.length && members.every(Boolean),'session sections resolve');
  assert.equal(new Set(members.map(x=>x.subjectKey)).size,1,'session subject boundary');
  assert.equal(new Set(members.map(x=>x.area)).size,1,'session area boundary');
  assert.equal(members[0].subjectKey,sess.subjectKey); assert.equal(members[0].area,sess.area);
  const isAreaEnd=P.completesArea(sections,traverse,sess);
  if(isAreaEnd){
    areaEnds++;
    if(sess.area==='과목 공통'){
      commonEnds++; assert.equal(S.hasQuestions(data,sess.subjectKey,sess.area),false,`${sess.subjectKey} common area must not gate`);
    }else{
      assert.equal(S.hasQuestions(data,sess.subjectKey,sess.area),true,`${sess.subjectKey}/${sess.area} must have structure questions`);
      assert(S.buildSession(data,sess.subjectKey,sess.area,{limit:6,nonce:sessions}).length>0,`${sess.subjectKey}/${sess.area} structure session`);
    }
  }
  if(!entered.includes(sess.subjectKey)) entered.push(sess.subjectKey);
  traverse=P.startSession(traverse,sess,now); traverse=evidence(traverse,now+100,.9); traverse=P.recordStudyActivity(traverse,now); traverse=P.completeActiveSession(traverse,now+1000).state;
  // six repeated same-study-day attacks must fail no matter how much D-day pressure exists.
  for(let k=0;k<6;k++) assert.equal(P.createNextSession(sections,traverse,0,now+2000+k,{targetFloor:22}),null,`same-day traversal bypass ${sessions}/${k}`);
  sessions++; day=P.shiftDayKey(day,1);
}
assert.equal(P.progressSummary(sections,traverse).percent,100,'full traversal reaches 100%');
assert.deepStrictEqual(entered,order,'subjects entered in configured order');
assert.equal(areaEnds,33,'active policy areas end exactly once');
assert.equal(commonEnds,6,'six common areas');
assert.equal(P.createNextSession(sections,traverse,0,noon(P.shiftDayKey(day,1)),{targetFloor:22}),null,'100% scope must stop');

// 4) Every structure pool is unambiguous and every commentary answer points to an existing official standard.
let structurePools=0, structureQuestions=0, multi=0;
for(const sk of order){
  for(const area of Object.keys(data[sk])){
    const pool=S.buildQuestionPool(data,sk,area);
    if(area==='과목 공통'){assert.equal(pool.length,0,`${sk} common pool`);continue;}
    structurePools++; assert(pool.length>0,`${sk}/${area}: nonempty pool`);
    for(const q of pool){
      structureQuestions++;
      const vals=q.choices.map(c=>c.value); assert.equal(vals.length,new Set(vals).size,`${q.id}: choice uniqueness`);
      const answers=q.multiSelect?q.answers:[q.answer]; if(q.multiSelect)multi++;
      assert(answers.length>0,`${q.id}: answer`); answers.forEach(a=>assert(vals.includes(a),`${q.id}: answer in choices`));
      if(q.kind==='process-subject') assert.equal(q.answer,sk,`${q.id}: subject discrimination answer`);
    }
  }
}
assert.equal(structurePools,27); assert.equal(structureQuestions,148); assert(multi>=1,'multi-code commentary exercised');

for(const sk of order.filter(x=>x!=='middle-info')){
  for(const area of Object.keys(data[sk]).filter(x=>x!=='과목 공통')){
    const session=S.buildSession(data,sk,area,{limit:6,nonce:91});
    const mixed=session.filter(q=>q.kind==='process-subject');
    assert(mixed.length>0,`${sk}/${area}: process mix`);
    assert(mixed.some(q=>q.answer!==sk),`${sk}/${area}: subject context must not reveal process answer`);
  }
}

// 5) Randomized planner-state attacks across dates/progress/backlog/cycle states.
let randomStates=0, blockedCaps=0, recoveryBlocks=0, continuations=0;
for(let seed=1;seed<=240;seed++){
  const rnd=rng(seed); const offset=Math.floor(rnd()*60); const today=P.shiftDayKey('2026-09-24',offset); const now=noon(today);
  const prefix=Math.floor(rnd()*(sections.length+1));
  const completed=sections.slice(0,prefix).map(x=>x.id);
  const cycleN=Math.floor(rnd()*7);
  let st=P.normalizeState({targetLines:8+Math.floor(rnd()*15),completedSectionIds:completed,cycleStudyDayKeys:makeCycle(today,cycleN)},now);
  // Sometimes create a legitimate carried session begun yesterday.
  if(prefix<sections.length && rnd()<.32 && cycleN<6){
    const y=P.shiftDayKey(today,-1); const ys=noon(y); const cand=P.createNextSession(sections,st,0,ys,{targetFloor:22});
    if(cand){st=P.startSession(st,cand,ys); assert.equal(P.paceDecision({state:st,dueCount:80,now,targetFloor:22}).mode,'continue'); continuations++;}
  }else if(rnd()<.30){
    st=P.normalizeState({...st,lastNewSessionStartDayKey:today},now);
  }
  const due=Math.floor(rnd()*80); const floor=8+Math.floor(rnd()*15);
  const decision=P.paceDecision({state:st,dueCount:due,now,targetFloor:floor});
  const cand=P.createNextSession(sections,st,due,now,{targetFloor:floor});
  if(st.activeSession){assert(cand?.continued,'active session must continue');}
  else if(st.lastNewSessionStartDayKey===today && due<=P.dailyReviewBudget(st.targetLines)*2 && !P.isConsolidationDay(st,now) && st.recoveryDayKey!==today){
    assert.equal(cand,null,`seed ${seed}: same-day cap bypass`); blockedCaps++;
  }
  if(!st.activeSession && due>P.dailyReviewBudget(st.targetLines)*2){assert.equal(cand,null,`seed ${seed}: severe backlog must block`); recoveryBlocks++;}
  randomStates++;
}
assert(blockedCaps>20 && recoveryBlocks>20 && continuations>10,'random attacks did not exercise enough branches');

// 6) Review-skip infinite-loop attack: daily item requeues once, then is deferred. Never silently succeeds.
for(let i=0;i<2000;i++){
  const first=R.reviewSkipAction({conceptKey:`skip-${i}`,_dailyReview:true}); assert.equal(first.action,'requeue');
  assert(first.nextItem?._skippedOnce,'first skip marker');
  for(let k=0;k<50;k++){
    const next=R.reviewSkipAction(first.nextItem); assert.equal(next.action,'defer-next-day'); assert.equal(next.nextItem,null);
  }
}

// 7) UI scale implementation is bounded, persistent, and independent of full learning reset.
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(app.includes('const UI_SCALE_KEY = "curriloop-ui-scale-v1"'),'scale key');
assert(app.includes('const UI_SCALE_MIN = 80') && app.includes('const UI_SCALE_MAX = 140') && app.includes('const UI_SCALE_STEP = 10'),'scale bounds');
for(const fn of ['applyUiScale','changeUiScale','resetUiScale']) assert(new RegExp(`function\\s+${fn}\\s*\\(`).test(app),`scale function ${fn}`);
for(const id of ['uiScaleDown','uiScaleValue','uiScaleUp']) assert(html.includes(`id="${id}"`),`scale control ${id}`);
const clearStart=app.indexOf('async function clearAllLearningData()'); const clearEnd=app.indexOf('\n  function ',clearStart+20); const clearBody=app.slice(clearStart,clearEnd>clearStart?clearEnd:clearStart+8000);
assert(!clearBody.includes('UI_SCALE_KEY'),'full learning reset must not delete UI scale preference');
assert(!clearBody.includes('curriloop-ui-scale-v1'),'full learning reset must not delete scale storage key');
assert(clearBody.includes('Object.keys(fieldState).forEach'),'full learning reset must clear in-memory study drafts');
assert(clearBody.includes('sessionStorage.removeItem(DRAFT_STATE_KEY)'),'full learning reset must clear session draft storage');

console.log(JSON.stringify({
  redTeam:'OK',
  studyDayBoundary:boundaryCases.length,
  plannerSections:sections.length,
  traversalSessions:sessions,
  areaEnds,
  commonEnds,
  structurePools,
  structureQuestions,
  multiSelectQuestions:multi,
  randomStates,
  blockedSameDayAttacks:blockedCaps,
  severeBacklogBlocks:recoveryBlocks,
  carriedSessionContinuations:continuations,
  skipItems:2000,
  skipRepeatedAttacks:2000*50,
  uiScale:'80-140% / 10%'
},null,2));

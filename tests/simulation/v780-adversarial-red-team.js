'use strict';
process.env.TZ='Asia/Seoul';
const assert=require('assert');
const fs=require('fs'),vm=require('vm'),path=require('path');
const P=require('../../js/engines/planner-engine.js');
const S=require('../../js/engines/structure-engine.js');
const D=require('../../js/engines/day-engine.js');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const order=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
const sections=P.buildStudySections(data,order,'과목 공통');
const byId=new Map(sections.map(s=>[s.id,s]));
const noon=d=>new Date(`${d}T12:00:00+09:00`).getTime();
const next=d=>P.shiftDayKey(d,1);
function rng(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function evidence(st,acc,now,key){
  const vals=[Math.max(0,acc-.03),acc,Math.min(1,acc+.04),acc];
  vals.forEach((a,i)=>{st=P.noteSessionAssessment(st,{key:`${key}-${i}`,kind:i===0?'core':i===3?'structure':'recall',status:a>=.85?'correct':a>=.65?'near':'wrong',accuracy:a},now+i);});
  return st;
}
function simulate({accuracy=.79, backlog='light', offDays=[]}){
  let st=P.normalizeState({targetLines:18},noon('2026-09-24'));
  let day='2026-09-24', sessions=0, consolidations=0, blocked=0;
  const off=new Set(offDays);
  const backlogFn=(g)=> backlog==='light'?8 : backlog==='moderate'?(g%9===0?24:(g%11===0?26:8)) : (g%6===0?40:12);
  for(let g=0;g<100;g++,day=next(day)){
    if(P.progressSummary(sections,st).percent>=100) return {day,sessions,consolidations,blocked,target:st.targetLines};
    if(off.has(day)) continue;
    const now=noon(day);
    if(P.isConsolidationDay(st,now)){st=P.recordStudyActivity(st,now);consolidations++;continue;}
    const dg=P.deadlineGuidance(sections,st,{now});
    const due=backlogFn(g);
    const decision=P.paceDecision({state:st,dueCount:due,now,targetFloor:dg.targetFloor});
    const sess=st.activeSession||P.createNextSession(sections,st,due,now,{targetFloor:dg.targetFloor});
    if(!sess){
      if(due>P.dailyReviewBudget(st.targetLines)*2) assert(['review-recovery','consolidation','daily-new-complete'].includes(decision.mode));
      st=P.recordStudyActivity(st,now);blocked++;continue;
    }
    const members=sess.sectionIds.map(id=>byId.get(id));
    assert(members.length && members.every(Boolean));
    assert.equal(new Set(members.map(x=>x.subjectKey)).size,1,'scenario subject crossing');
    assert.equal(new Set(members.map(x=>x.area)).size,1,'scenario area crossing');
    if(!st.activeSession) st=P.startSession(st,sess,now);
    st=evidence(st,accuracy,now,`${backlog}-${accuracy}-${g}`);
    st=P.recordStudyActivity(st,now);
    st=P.completeActiveSession(st,now+5*3600*1000).state;
    sessions++;
    // Finished fresh session cannot be followed by another fresh session in the same study day.
    assert.equal(P.createNextSession(sections,st,0,now+6*3600*1000,{targetFloor:22}),null,'same-day cap after scenario completion');
  }
  return {...P.progressSummary(sections,st),day,sessions,consolidations,blocked,target:st.targetLines};
}

// A) Structure sessions: across many nonces, high-school subject context must never make every process answer equal the visible subject.
let structureSessions=0;
for(const sk of order){
  for(const area of Object.keys(data[sk]).filter(a=>a!=='과목 공통')){
    for(let nonce=0;nonce<6;nonce++){
      const q=S.buildSession(data,sk,area,{limit:6,nonce});
      assert(q.length>=1,`${sk}/${area}/${nonce}: empty structure session`);
      assert.equal(new Set(q.map(x=>x.id)).size,q.length,`${sk}/${area}/${nonce}: duplicate structure question`);
      if(sk!=='middle-info'){
        const proc=q.filter(x=>x.kind==='process-subject');
        assert(proc.length>=1,`${sk}/${area}/${nonce}: no process discrimination`);
        assert(proc.some(x=>x.answer!==sk),`${sk}/${area}/${nonce}: visible subject leaks all process answers`);
      }
      structureSessions++;
    }
  }
}

// B) 12,652 randomized planner-state attacks.
// deadlineGuidance는 별도 D에서 검증한다. 각 무작위 상태마다 역산을 재실행하면
// 동일 정책을 수천 번 중복 계산해 QA 자체가 비정상적으로 느려지므로 여기서는 정책 범위의 targetFloor를 직접 주입한다.
let blockedSameDay=0,severeReview=0,continued=0,randomStates=0;
for(let seed=1;seed<=12652;seed++){
  const r=rng(seed);
  const day=P.shiftDayKey('2026-09-24',Math.floor(r()*62));
  const now=noon(day);
  const prefix=Math.floor(r()*(sections.length+1));
  let st=P.normalizeState({
    targetLines:8+Math.floor(r()*15),
    completedSectionIds:sections.slice(0,prefix).map(x=>x.id),
    cycleStudyDayKeys:Array.from({length:Math.floor(r()*7)},(_,i)=>P.shiftDayKey(day,-i-1))
  },now);
  const due=Math.floor(r()*121);
  const targetFloor=8+Math.floor(r()*15);
  if(prefix<sections.length && r()<.24 && (st.cycleStudyDayKeys||[]).length<6){
    const y=P.shiftDayKey(day,-1), yn=noon(y);
    const old=P.createNextSession(sections,st,0,yn,{targetFloor});
    if(old){ st=P.startSession(st,old,yn); const c=P.createNextSession(sections,st,due,now,{targetFloor}); assert(c?.continued); continued++; }
  } else if(r()<.38){
    st=P.normalizeState({...st,lastNewSessionStartDayKey:day},now);
  }
  const decision=P.paceDecision({state:st,dueCount:due,now,targetFloor});
  const sess=P.createNextSession(sections,st,due,now,{targetFloor});
  if(st.activeSession){ assert(sess?.continued,'carried session lost'); }
  else if(st.lastNewSessionStartDayKey===day && !P.isConsolidationDay(st,now) && st.recoveryDayKey!==day){ assert.equal(sess,null,`seed ${seed}: same-day bypass`); blockedSameDay++; }
  if(!st.activeSession && due>P.dailyReviewBudget(st.targetLines)*2){ assert.equal(sess,null,`seed ${seed}: severe backlog opened new scope`); assert.notEqual(decision.mode,'deadline-boost'); severeReview++; }
  if(sess){
    const members=sess.sectionIds.map(id=>byId.get(id));
    assert(members.every(Boolean));
    assert.equal(new Set(members.map(x=>x.subjectKey)).size,1);
    assert.equal(new Set(members.map(x=>x.area)).size,1);
  }
  randomStates++;
}
assert(blockedSameDay>600 && severeReview>800 && continued>300,'random attack coverage too weak');

// C) Accuracy × backlog matrix. Every realistic matrix must still expose all six courses before the exam.
const matrix=[];
for(const accuracy of [.55,.62,.70,.79,.90]){
  for(const backlog of ['light','moderate','heavy']){
    const result=simulate({accuracy,backlog,offDays:['2026-10-03','2026-10-17']});
    assert(result.percent===undefined || result.percent===100,`${accuracy}/${backlog}: incomplete ${result.percent}`);
    assert(P.signedDayDistance(result.day,'2026-11-28')>=0,`${accuracy}/${backlog}: first pass after exam ${result.day}`);
    matrix.push({accuracy,backlog,completed:result.day,sessions:result.sessions,blocked:result.blocked,target:result.target});
  }
}

// D) Deadline forecast shown to user must reflect the policy targetFloor, not stale base target.
for(const base of [8,10,12,18,22]){
  const st=P.normalizeState({targetLines:base},noon('2026-09-24'));
  const dg=P.deadlineGuidance(sections,st,{now:noon('2026-09-24')});
  const expected=P.estimateCompletionForSections(sections,st,dg.targetFloor,noon('2026-09-24'));
  assert.equal(dg.estimatedCompletionDayKey,expected.dayKey,`forecast target mismatch base ${base}`);
  assert.equal(dg.remainingSessions,expected.sessions,`forecast session mismatch base ${base}`);
}

// E) Exact 04:00 boundary fuzz: every minute around the edge.
let boundaryMinutes=0;
for(let minute=-180;minute<=180;minute++){
  const edge=new Date('2026-09-25T04:00:00+09:00').getTime();
  const t=edge+minute*60*1000;
  const expected=minute<0?'2026-09-24':'2026-09-25';
  assert.equal(D.studyDayKey(t),expected,`boundary minute ${minute}`);
  assert.equal(P.localDayKey(t),expected,`planner boundary minute ${minute}`);
  boundaryMinutes++;
}

console.log(JSON.stringify({
  adversarialRedTeam:'OK',
  structureSessions,
  randomStates,
  blockedSameDay,
  severeReviewBlocks:severeReview,
  carriedContinuations:continued,
  boundaryMinutes,
  matrix
},null,2));

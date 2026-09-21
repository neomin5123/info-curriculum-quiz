'use strict';
const assert = require('assert');
const P = require('../../js/engines/planner-engine.js');
const R = require('../../js/engines/review-engine.js');
const fs = require('fs'); const vm = require('vm'); const path = require('path');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../data/curriculum/2022/curriculum.js'),'utf8'),ctx);
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const guided=P.buildStudySections(data,['middle-info'],'과목 공통');

function rng(seed){ let x=seed>>>0; return ()=>{ x=(1664525*x+1013904223)>>>0; return x/4294967296; }; }
function atDay(base, offset, hour=9){ const d=new Date(base); d.setDate(d.getDate()+offset); d.setHours(hour,0,0,0); return d.getTime(); }
function stamp(state, rnd, prefix, now){
  const n=3+Math.floor(rnd()*5);
  for(let i=0;i<n;i++){
    const score=rnd()<0.72 ? 0.85+rnd()*0.15 : rnd()*0.75;
    state=P.noteSessionAssessment(state,{key:`${prefix}-${i}`,kind:i%3===0?'core':'recall',status:score>=.999?'correct':score>=.65?'near':'wrong',accuracy:score},now+i);
  }
  return state;
}

const base=new Date(2026,8,21,9).getTime();
let scenarios=0, starts=0, completions=0, continuations=0, blockedSameDay=0;
for(let seed=1; seed<=120; seed++){
  const rnd=rng(seed);
  let state=P.normalizeState({targetLines:8+Math.floor(rnd()*15)},base);
  const startCountByDay=new Map();
  for(let day=0;day<70;day++){
    const now=atDay(base,day,9);
    const dayKey=P.localDayKey(now);
    // occasional rest day: no planner interaction at all
    if(rnd()<0.08) continue;
    const due=Math.floor(rnd()*65);
    const floor=rnd()<0.25 ? 22 : Math.floor(rnd()*23);
    const decision=P.paceDecision({state,dueCount:due,now,targetFloor:floor});
    // Existing session is allowed to continue even with high backlog, except consolidation day.
    if(state.activeSession && decision.mode==='continue') continuations++;
    let session=P.createNextSession(guided,state,due,now,{targetFloor:floor});
    if(session && !state.activeSession){
      state=P.startSession(state,session,now);
      starts++;
      const count=(startCountByDay.get(dayKey)||0)+1; startCountByDay.set(dayKey,count);
      assert(count<=1,`seed ${seed} day ${dayKey}: more than one fresh session started`);
      assert.equal(state.lastNewSessionStartDayKey,dayKey,`seed ${seed}: start marker`);
    }
    if(state.activeSession){
      // Sometimes leave it unfinished across days. Otherwise finish today.
      if(rnd()<0.64){
        state=stamp(state,rnd,`s${seed}d${day}`,now);
        const startedToday=state.activeSession.startedDayKey===dayKey;
        state=P.completeActiveSession(state,now+5*60*60*1000).state; completions++;
        // Attack the cap repeatedly with zero backlog and maximum deadline pressure.
        for(let k=0;k<6;k++){
          const attack=P.createNextSession(guided,state,0,now+(6+k)*60*60*1000,{targetFloor:22});
          if(startedToday){
            assert.equal(attack,null,`seed ${seed} ${dayKey}: same-day cap bypass on attack ${k}`);
            const attackDecision=P.paceDecision({state,dueCount:0,now:now+(6+k)*60*60*1000,targetFloor:22});
            assert.equal(attackDecision.mode,'daily-new-complete',`seed ${seed} ${dayKey}: wrong block mode ${attackDecision.mode}`);
            blockedSameDay++;
          } else if(attack && k===0 && !P.isConsolidationDay(state,now+(6+k)*60*60*1000)){
            // A carried session completed today: exactly one fresh session may now begin.
            state=P.startSession(state,attack,now+(6+k)*60*60*1000);
            const count=(startCountByDay.get(dayKey)||0)+1; startCountByDay.set(dayKey,count);
            assert(count<=1,`seed ${seed} ${dayKey}: carried session allowed >1 fresh session`);
            starts++;
            state=stamp(state,rnd,`carry${seed}d${day}`,now+(6+k)*60*60*1000);
            state=P.completeActiveSession(state,now+(7+k)*60*60*1000).state; completions++;
          }
        }
      }
    }
    for(const [key,count] of startCountByDay) assert(count<=1,`seed ${seed} ${key}: daily fresh-session invariant`);
    scenarios++;
  }
}
assert(blockedSameDay>100,'red team did not exercise same-day cap enough');

// Skip attack: no item may be requeued more than once.
for(let seed=1;seed<=1000;seed++){
  let item={conceptKey:`K${seed}`,_dailyReview:true};
  const first=R.reviewSkipAction(item);
  assert.equal(first.action,'requeue');
  item=first.nextItem;
  for(let i=0;i<50;i++){
    const next=R.reviewSkipAction(item);
    assert.notEqual(next.action,'requeue',`skip loop recreated at seed ${seed}, iteration ${i}`);
    assert.equal(next.action,'defer-next-day');
  }
}

// Legacy planner states without v7.7.1 field remain valid and do not falsely block.
const legacy=P.normalizeState({version:4,targetLines:18,completedSectionIds:[]},base);
assert.equal(legacy.lastNewSessionStartDayKey,'');
assert(P.createNextSession(guided,legacy,0,base),'legacy state must still open first session');

console.log(JSON.stringify({redTeam:'OK',scenarios,starts,completions,continuations,blockedSameDay,skipAttacks:1000},null,2));

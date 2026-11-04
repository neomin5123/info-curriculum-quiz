import fs from 'node:fs';
import vm from 'node:vm';

const fail=[];
const assert=(ok,msg)=>{if(!ok)fail.push(msg);};
const app=fs.readFileSync('js/app.js','utf8');
const storageSrc=fs.readFileSync('js/core/storage.js','utf8');
const gradingSrc=fs.readFileSync('js/core/grading.js','utf8');
const configSrc=fs.readFileSync('js/core/config.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const vercel=fs.readFileSync('vercel.json','utf8');

assert(app.includes('`round:${Math.max(1,Number(state.round||1))}`'),'RT-01: field key is not round-scoped');
assert(!/retryAttempts>=Number\(CL\.config\.maxRetriesPerTaskPerRound[\s\S]{0,120}delete state\.fieldRetries\[id\]/.test(app),'RT-03: failed retry can still be deleted by attempt limit');
const scheduleBody=app.slice(app.indexOf('function scheduleFieldRetry'),app.indexOf('function scheduleSetRetryFailures'));
assert(!scheduleBody.includes("kind:'set'"),'RT-04: scheduleFieldRetry can still create set cards');
assert(app.includes("else{\n      const items=expectedItemsForField(field,task),norm=CL.grading.norm;"),'RT-04: Enter fallback is not forced to single item');
assert(app.includes("if(dailyReviewAdvanceTimer){clearTimeout(dailyReviewAdvanceTimer);dailyReviewAdvanceTimer=null;}"),'RT-07: reset does not cancel daily-review timer');
assert(!app.includes('개 답 후'),'RT-08: internal retry delay count is visible');
assert(app.includes('if(state.fieldRetryCounts)delete state.fieldRetryCounts[id];'),'RT-09: retry counter is not pruned on resolution');
assert(app.includes('worker?.scriptURL===legacyScript'),'RT-10: service-worker cleanup is not script-scoped');
assert(app.includes("taskLineIds(task).forEach(lineId=>CL.storage.ensureReviewItem(state,lineId,'near'))"),'RT-11: reveal does not force a near-term review');
assert(app.includes("window.addEventListener('storage',e=>{if(e.key===CL.config.storageKey)reloadForExternalState();});"),'RT-12: no cross-tab storage synchronization');
assert(storageSrc.includes('latestRevision>stateRevision'),'RT-12: stale writes are not rejected');
assert(storageSrc.includes('backupCorruptRaw(raw)'),'RT-13: corrupt state is not backed up');
assert(html.includes('1·3·7·10·14일 간격 · 이후 14일 반복'),'exam-mode review interval label missing');
for(const h of ['Content-Security-Policy','X-Content-Type-Options','Referrer-Policy','Permissions-Policy','X-Frame-Options'])assert(vercel.includes(h),`security header missing: ${h}`);

// grading adversarial checks
{
  const ctx={window:{}};ctx.window.window=ctx.window;vm.createContext(ctx);vm.runInContext(gradingSrc,ctx);
  const g=ctx.window.CurriLoop.grading;
  for(const [expected,user] of [['분석','분류'],['설계','설명'],['구현','표현'],['추출','추론']]){
    const d=g.classifyDetailed(user,expected);
    assert(d.status==='wrong',`RT-05: action conflict ${expected}<-${user} graded ${d.status}/${d.reason}`);
  }
  const under=g.gradeSetDetailed(['A'],['A','B','C']);
  assert(under.correct===false&&under.status!=='correct',`RT-06: underfill inconsistent ${JSON.stringify(under)}`);
}

// storage/SRS adversarial checks
{
  const bag=new Map();
  const localStorage={getItem:k=>bag.has(k)?bag.get(k):null,setItem:(k,v)=>bag.set(k,String(v)),removeItem:k=>bag.delete(k),key:i=>[...bag.keys()][i]??null,get length(){return bag.size;}};
  const events=[];
  const ctx={window:{CurriLoop:{}},localStorage,console,CustomEvent:class{constructor(type){this.type=type;}}};
  ctx.window.window=ctx.window;ctx.window.dispatchEvent=e=>events.push(e.type);ctx.window.CurriLoop.config={appVersion:'9.0.54-study-rc.1',storageKey:'test-state',reviewIntervalsDays:[1,3,7,10,14]};
  vm.createContext(ctx);vm.runInContext(storageSrc,ctx);
  const st=ctx.window.CurriLoop.storage;
  const state=st.fresh();st.ensureReviewItem(state,'L','correct');
  state.reviewSchedule.L.dueDate=st.localDateKey();
  let r=st.completeDailyReview(state,'L','correct',{unitCount:3});
  assert(r.unitCursor===1&&r.stage===0&&r.dueDate===st.addDays(st.localDateKey(),1),'RT-02: first unit does not advance cursor with 1-day spacing');
  r=st.completeDailyReview(state,'L','correct',{unitCount:3});
  assert(r.unitCursor===2&&r.stage===0,'RT-02: second unit does not stay in same stage');
  r=st.completeDailyReview(state,'L','correct',{unitCount:3});
  assert(r.unitCursor===0&&r.stage===1&&r.dueDate===st.addDays(st.localDateKey(),3),'RT-02: stage does not advance only after all units');
  r.unitCursor=2;r.stage=3;r=st.completeDailyReview(state,'L','wrong',{unitCount:3});
  assert(r.unitCursor===2&&r.stage===0&&r.dueDate===st.addDays(st.localDateKey(),1),'RT-02: failed unit is skipped or delayed too long');
  r.unitCursor=0;r.stage=4;r=st.completeDailyReview(state,'L','correct',{unitCount:1});
  assert(r.stage===4&&r.dueDate===st.addDays(st.localDateKey(),14),'exam-mode cap is not 14 days');

  // migrate old 21/30-day schedules into exam-mode cap
  const far=st.addDays(st.localDateKey(),30);
  bag.set('test-state',JSON.stringify({_revision:2,reviewSchedule:{OLD:{lineId:'OLD',stage:5,dueDate:far}},ui:{}}));
  const migrated=st.load();
  assert(migrated.reviewSchedule.OLD.stage===4,'exam-mode migration did not clamp legacy stage');
  assert(migrated.reviewSchedule.OLD.dueDate===st.addDays(st.localDateKey(),14),'exam-mode migration did not pull legacy due date inside 14-day cap');

  // corrupt backup
  bag.set('test-state','{BROKEN');
  const recovered=st.load();
  assert(recovered._recoveredFromCorrupt===true,'RT-13: corrupt load not flagged');
  assert([...bag.keys()].some(k=>k.startsWith('test-state:corrupt-backup:')),'RT-13: corrupt raw not backed up');

  // stale write rejection
  bag.set('test-state',JSON.stringify({_revision:9}));
  const stale=st.fresh();stale._revision=4;
  const saved=st.save(stale);
  assert(saved===false&&events.includes('curriloop:stale-state'),'RT-12: stale save was not rejected/notified');
}

if(fail.length){console.error(fail.join('\n'));process.exit(1);}
console.log(JSON.stringify({
  status:'PASS',
  release:'9.0.54-study-rc.1',
  fixed:['RT-01','RT-02','RT-03','RT-04','RT-05','RT-06','RT-07','RT-08','RT-09','RT-10','RT-11','RT-12','RT-13'],
  reviewIntervalsDays:[1,3,7,10,14],
  maxReviewGapDays:14,
  securityHeaders:true
},null,2));

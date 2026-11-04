import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync('js/app.js','utf8');
const storage=fs.readFileSync('js/core/storage.js','utf8');
const gradingSrc=fs.readFileSync('js/core/grading.js','utf8');
const configSrc=fs.readFileSync('js/core/config.js','utf8');
const data=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));

const ctx={window:{}};ctx.window.window=ctx.window;vm.createContext(ctx);
vm.runInContext(gradingSrc,ctx,{filename:'grading.js'});
const g=ctx.window.CurriLoop.grading;
const findings=[];
const add=(id,severity,title,evidence)=>findings.push({id,severity,title,evidence});

// RT-01: round-scoped draft/grade contamination
if(/function makeFieldKey\(field,index\)\{[^}]*return \[taskId,state\.ui\.stage,state\.ui\.mode,index\]/s.test(app)){
  const rotating=data.lines.filter(l=>((l.presentation?.coreSets?.length||0)>1)||((l.presentation?.practicalSets?.length||0)>1));
  add('RT-01','CRITICAL','회차(round) 간 답안/채점 상태 오염',{
    keyOmitsRound:true,rotatingLines:rotating.length,aiRotatingLines:rotating.filter(l=>l.subject==='ai-basics').length,
    example:'MI-01-CS-KI-01: round1=하드웨어와 소프트웨어, round2=컴퓨팅 시스템, round3=사회적, 기술적 가치'
  });
}

// RT-02: SRS line-level stage + one-unit rotation starvation
const multi=[];
for(const l of data.lines){
  if(l.family==='지식·이해')continue;
  const units=l.presentation?.units?.length?l.presentation.units:(l.keywords||[]).filter(k=>k.active);
  if(units.length>1)multi.push({lineId:l.lineId,subject:l.subject,n:units.length});
}
if(app.includes('units[Number(rec.reviewCount||0)%Math.max(1,units.length)]')&&storage.includes('stage=Math.min(intervals.length-1,stage+1)')){
  add('RT-02','CRITICAL','장기복습이 line 단위 stage를 올리면서 unit 하나만 순환',{
    multiUnitLines:multi.length,aiMultiUnitLines:multi.filter(x=>x.subject==='ai-basics').length,maxUnits:Math.max(...multi.map(x=>x.n)),
    worstFirstExposureDays:[1,4,11,25,46,76],failedUnitSkippedBecauseReviewCountAlwaysIncrements:true
  });
}

// RT-03: retry disappears after repeated failed retry attempts
if(/r\.retryAttempts>=Number\(CL\.config\.maxRetriesPerTaskPerRound\|\|2\)\)\{\s*delete state\.fieldRetries\[id\]/s.test(app)){
  add('RT-03','CRITICAL','재인출 카드가 정답 회복 없이 2회 실패 후 삭제됨',{
    violates:'카드는 재인출 정답 또는 명시적 reset/OFF로만 해소',maxRetriesPerTaskPerRound:2
  });
}

// RT-04: Enter on unordered field can create a new set retry
if(app.includes("const unordered=!options.forceSingle&&(field.classList.contains('ki-input')") && app.includes("else scheduleFieldRetry(field,detail.status,detail,matchedItem);")){
  add('RT-04','HIGH','개별 Enter 오답에서 전체-set 재인출 카드가 다시 생성될 수 있음',{
    path:'gradeSingleAnswerField -> wrong/unknown with matchedItem=null -> scheduleFieldRetry(no forceSingle) -> kind:set',
    reloadBehavior:'migrateLegacySetRetries는 초기 로드 1회만 실행되어 세션 중 동작과 재로드 후 동작이 달라짐'
  });
}

// RT-05: semantically conflicting action verb may be labeled near/typo
const swaps={분석:'분류',분류:'분석',설계:'설명',설명:'설계',구현:'표현',표현:'구현',추출:'추론',추론:'추출'};
let semanticNear=[];
for(const l of data.lines){
  const texts=[l.sourceText,...(l.presentation?.units||[]).map(u=>u.text)];
  for(const e of [...new Set(texts)]) for(const [a,b] of Object.entries(swaps)) if(e.includes(a)){
    const u=e.replace(a,b),d=g.classifyDetailed(u,e);
    if(g.strictActionConflict(u,e)&&d.status==='near')semanticNear.push({lineId:l.lineId,family:l.family,swap:`${a}->${b}`,expected:e,user:u});
  }
}
if(semanticNear.length) add('RT-05','HIGH','의미가 다른 행동동사가 오타(near)로 완화 판정됨',{
  vulnerableOfficialTargets:semanticNear.length,uniqueLines:new Set(semanticNear.map(x=>x.lineId)).size,examples:semanticNear.slice(0,5)
});

// RT-06: gradeSetDetailed underfill status inconsistency
const under=g.gradeSetDetailed(['A'],['A','B','C']);
if(!under.correct&&under.status==='correct') add('RT-06','MEDIUM','집합 채점 underfill에서 correct=false인데 status=correct',under);

// RT-07: review reset race
if(app.includes('dailyReviewAdvanceTimer=setTimeout')&&!/resetReviewData\(\)[\s\S]{0,600}clearTimeout\(dailyReviewAdvanceTimer\)/.test(app)){
  add('RT-07','MEDIUM','복습 데이터 초기화 직후 지연 타이머가 데이터를 재생성할 수 있음',{
    timer:'dailyReviewAdvanceTimer',windowMs:650
  });
}

// RT-08: retry delay visibly exposed despite hidden-delay UX requirement
if(app.includes("`${left}개 답 후`")) add('RT-08','MEDIUM','재인출 지연 카운트가 복습 화면에 노출됨',{text:'N개 답 후'});

// RT-09: retry counter unbounded over rounds
if(storage.includes('fieldRetryCounts')&&!app.includes('delete state.fieldRetryCounts[id]')){
  add('RT-09','MEDIUM','fieldRetryCounts가 회차별 key를 계속 누적하여 장기 사용 시 localStorage 팽창',{
    roundInRetryId:app.includes('|round:${state.round||1}'),cleanupOnResolve:false
  });
}

// RT-10: all service workers on origin are unregistered
if(app.includes('navigator.serviceWorker.getRegistrations()')&&app.includes('regs.map(r=>r.unregister())')){
  add('RT-10','MEDIUM','동일 origin의 모든 Service Worker를 무차별 unregister',{scope:'all registrations on origin'});
}

// RT-11: reveal not considered by grading
if(app.includes('let revealed=') && !/revealed[^\n]{0,80}(grade|record|status)/.test(app)){
  add('RT-11','LOW','정답 보기 후 입력한 답도 독립 회상 correct와 동일하게 기록될 수 있음',{learningIntegrity:true});
}

// RT-12: stale whole-state multi-tab overwrite architecture
if(storage.includes('localStorage.setItem(CL.config.storageKey,JSON.stringify(state))')&&!storage.includes("addEventListener('storage'")){
  add('RT-12','HIGH','다중 탭에서 전체 state last-write-wins로 진도 유실 가능',{crossTabMerge:false,storageEvent:false});
}

// RT-13: parse failure silently fresh-resets
if(storage.includes('}catch(e){return fresh();}')){
  add('RT-13','HIGH','저장 상태 JSON 파싱 실패 시 백업 없이 fresh()로 조용히 초기화',{silentRecovery:false});
}

const order={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};
findings.sort((a,b)=>order[b.severity]-order[a.severity]||a.id.localeCompare(b.id));
console.log(JSON.stringify({status:'RED_TEAM_FINDINGS',count:findings.length,summary:Object.fromEntries(['CRITICAL','HIGH','MEDIUM','LOW'].map(s=>[s,findings.filter(f=>f.severity===s).length])),findings},null,2));

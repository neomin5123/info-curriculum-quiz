const fs=require('fs');
const path=require('path');
const E=require('../../js/practice/practice-engine.js');
const G=require('../../js/engines/grading-engine.js');
const R=require('../../js/engines/recall-engine.js');
const root=path.resolve(__dirname,'../..');
const vm=require('vm');
const bankCtx={window:{}}; vm.createContext(bankCtx); vm.runInContext(fs.readFileSync(path.join(root,'data/questions/production.js'),'utf8'),bankCtx);
const bank=bankCtx.window.CURRILOOP_PRACTICE_BANK;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ui=fs.readFileSync(path.join(root,'js/practice/practice-ui.js'),'utf8');
const pe=fs.readFileSync(path.join(root,'js/practice/practice-engine.js'),'utf8');
const cur=fs.readFileSync(path.join(root,'data/curriculum/2022/curriculum.js'),'utf8');
const cur15=fs.readFileSync(path.join(root,'data/curriculum/2015/transition-reference.js'),'utf8');
const map15=fs.readFileSync(path.join(root,'data/curriculum/mappings/2015-2022.js'),'utf8');

function assert(cond,msg){if(!cond) throw new Error(msg)}

assert(html.includes('id="structureButton"'),'structure practice UI');
assert(html.includes('id="middleInfoFillVariant"'),'middle-info segmented fill variant UI');
assert(html.includes('id="studyProgressBox"'),'separate study progress bar');
assert(html.includes('class="study-mode-section"'),'separate study mode section');
assert(html.includes('class="study-action-bar"'),'separate study action bar');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
assert(app.includes('빈칸 방식'),'middle-info fill variant label');
assert(app.includes('setMiddleInfoFillVariant'),'middle-info segmented fill variant behavior');
assert(app.includes('field.classList.add("hidden")'),'middle-info legacy difficulty dropdown hidden');
assert(app.includes('항목 수는 보여주지 않으며') && app.includes('recall-free-input'),'free recall must hide item count and slots');
assert(app.includes('RecallEngine.isRecallMastered(item)'),'recall mastery must use strict spaced criterion');
assert(R.recallMasteryStage({correctStreak:1}).label==='학습됨','recall learned stage');
assert(R.recallMasteryStage({correctStreak:2}).label==='안정화 중','recall stabilizing stage');
assert(R.recallMasteryStage({correctStreak:4}).label==='숙달','recall mastered stage');
assert(app.includes('updateRecallSectionMastery') && app.includes('LearningEngine.DAY_MS'),'whole-section failure must move to a later date');
assert(app.includes('record.recallSectionTitle ? 2 + Math.floor(Math.random() * 2)'),'same-day targeted repair distance');
assert(R.memoryTier('지식·이해').key==='exact','middle-info exact tier');
assert(R.memoryTier('성취기준 해설').key==='coreplus','middle-info guidance tier');
const recallProbe=R.matchRecallList(['B','A','C'],['A','B','C'],(u,e)=>G.classifyDetailed(u,e,[]));
assert(recallProbe.contentExact===true && recallProbe.orderCorrect===false,'holistic recall content/order split');
assert(bank.questions.length===31,`question count ${bank.questions.length}`);
assert(bank.questions.filter(q=>q.points===4).length===24,'4pt count');
assert(bank.questions.filter(q=>q.points===2).length===7,'2pt count');
assert(bank.meta.rulesVersion==='1.6','rules version');
assert(html.includes('v7.5.2'),'version label');
assert(html.includes('31문항'),'UI count');
assert(html.includes('정확히 20점'),'20-point set description');
assert(ui.includes('renderExamText'),'exam text renderer');
assert(ui.includes('practice-unit-feedback'),'unit-level feedback');
assert(ui.includes('openExplanation'),'explanation modal function');
assert(html.includes('practiceExplanationModalBackdrop'),'explanation modal markup');
assert(html.includes('통합 해설'),'explanation UI label');
assert(pe.includes('unitResults'),'unit-level grading engine');

const corpusIds=new Set();
for(const m of (cur+'\n'+cur15).matchAll(/"id"\s*:\s*"([A-Z0-9-]+)"/g)) corpusIds.add(m[1]);

let totalUnits=0;
let multiUnitTasks=0;
let fourPointStructured=0;
let twoPointViewBased=0;
for(const q of bank.questions){
  assert(Array.isArray(q.curriculumScopes)&&q.curriculumScopes.length>=1,`${q.questionId} scope`);
  assert(q.sourceIds.every(id=>corpusIds.has(id)),`${q.questionId} invalid source id`);
  assert(q.tasks.reduce((s,t)=>s+Number(t.points||0),0)===q.points,`${q.questionId} task total`);
  assert(q.answerUnits.reduce((s,u)=>s+Number(u.points||0),0)===q.points,`${q.questionId} unit total`);
  assert(q.answerUnits.every(u=>Number(u.points)===1),`${q.questionId} non-1pt unit`);
  assert(q.stem.includes('<작성 방법>'),`${q.questionId} missing writing method`);
  assert(q.explanation && q.explanation.length>=20,`${q.questionId} explanation`);
  assert(q.explanationDetail?.examPoint,`${q.questionId} examPoint`);
  assert(q.explanationDetail?.watchOut,`${q.questionId} watchOut`);
  if(q.points===4){
    if(/\(가\)/.test(q.stem)&&(/\(나\)/.test(q.stem)||/교사/.test(q.stem))&&(q.stem.includes('2022 개정'))) fourPointStructured++;
    assert(q.answerUnits.length===4,`${q.questionId} must have four 1pt units`);
  }
  if(q.points===2){
    if(/\(가\)/.test(q.stem)||/규칙|자료|장치|요구사항/.test(q.stem)) twoPointViewBased++;
    assert(q.answerUnits.length===2,`${q.questionId} must have two 1pt units`);
  }
  totalUnits+=q.answerUnits.length;
  for(const t of q.tasks){
    const us=q.answerUnits.filter(u=>u.taskId===t.id);
    assert(us.length>=1,`${q.questionId}/${t.id} has no units`);
    assert(us.reduce((s,u)=>s+u.points,0)===t.points,`${q.questionId}/${t.id} unit-task mismatch`);
    if(us.length>1) multiUnitTasks++;

    // A 1-point task must not explicitly demand multiple distinct answers.
    if(Number(t.points)===1){
      assert(!/(두 개|2개|세 측면|세 가지|3개)/.test(t.prompt),`${q.questionId}/${t.id} 1pt task asks multiple answers`);
    }
  }
  // Official-key full score.
  const answers={};
  for(const t of q.tasks) answers[t.id]=q.answerUnits.filter(u=>u.taskId===t.id).map(u=>u.key).join(' / ');
  const grade=E.gradeQuestion(q,answers,G);
  assert(grade.earned===q.points,`${q.questionId} official key ${grade.earned}/${q.points}`);
  // Partial-credit isolation: each semantic unit alone must be worth exactly 1 when a task has multiple units.
  for(const t of q.tasks){
    const us=q.answerUnits.filter(u=>u.taskId===t.id);
    if(us.length<=1) continue;
    for(const u of us){
      const only={}; q.tasks.forEach(tt=>only[tt.id]=''); only[t.id]=u.key;
      const r=E.gradeQuestion(q,only,G).results.find(x=>x.task.id===t.id);
      assert(r.earned===1,`${q.questionId}/${t.id}/${u.label} partial-credit leakage ${r.earned}`);
    }
  }
}
assert(totalUnits===110,`unit count ${totalUnits}`);
assert(fourPointStructured===24,`4pt structured ${fourPointStructured}/24`);
assert(twoPointViewBased===7,`2pt view-based ${twoPointViewBased}/7`);
assert(multiUnitTasks>=7,`multi-unit tasks ${multiUnitTasks}`);

const ex30=bank.questions.find(q=>q.questionId==='EX-030');
assert(ex30,'EX-030 exists');
assert(ex30.legacyEvidence?.examYear===2025 && ex30.legacyEvidence?.paper==='A' && ex30.legacyEvidence?.question===7,'EX-030 historical archetype');
assert(ex30.curriculumScopes.some(s=>s.subject==='software-life'&&s.area==='현상을 분석하는 소프트웨어'),'EX-030 software-life scope');
assert(ex30.curriculumScopes.some(s=>s.subject==='data-science'&&s.area==='데이터 준비와 분석'),'EX-030 data-science scope');
assert(ex30.answerUnits.map(u=>u.key).join('|')==='소프트웨어와 생활|데이터 과학|21℃|N','EX-030 canonical answers');

const ex31=bank.questions.find(q=>q.questionId==='EX-031');
assert(ex31,'EX-031 exists');
assert(ex31.comparison2015===true,'EX-031 comparison flag');
assert(ex31.legacyEvidence?.examYear===2025 && ex31.legacyEvidence?.paper==='A' && ex31.legacyEvidence?.question===6,'EX-031 historical archetype');
assert(ex31.answerUnits.length===4 && ex31.answerUnits.every(u=>u.points===1),'EX-031 four atomic units');
assert(ex31.sourceIds.some(id=>id.startsWith('C15-')) && ex31.sourceIds.includes('MI-03-AC-EX-03'),'EX-031 cross-curriculum source IDs');
const transitionCtx={window:{}}; vm.createContext(transitionCtx); vm.runInContext(cur15,transitionCtx); vm.runInContext(map15,transitionCtx);
const maps=transitionCtx.window.CURRILOOP_CURRICULUM_TRANSITION?.mappings || [];
assert(maps.some(m=>m.id==='MAP-15-22-009' && m.relationType==='분화'),'array transition mapping');


// v7 global mini-set regression: exactly 20 points, not a fixed question count.
for(let seed=1;seed<=1000;seed++){
  let x=seed>>>0;
  const rng=()=>{x=(1664525*x+1013904223)>>>0; return x/4294967296};
  const ids=E.buildExamSet(bank.questions,{targetPoints:20,randomFn:rng});
  assert(ids.length===6,`preferred mixed set size seed=${seed}: ${ids.length}`);
  assert(new Set(ids).size===ids.length,`set duplicate seed=${seed}`);
  const qs=ids.map(id=>bank.questions.find(q=>q.questionId===id));
  const total=qs.reduce((s,q)=>s+q.points,0);
  assert(total===20,`set score total ${total}`);
  assert(qs.filter(q=>q.points===4).length===4,`4pt mix seed=${seed}`);
  assert(qs.filter(q=>q.points===2).length===2,`2pt mix seed=${seed}`);
}

// A narrow filter that cannot reach 20 points must fail instead of fabricating a smaller set.
const middle=bank.questions.filter(q=>(q.curriculumScopes||[]).some(s=>s.subject==='middle-info'));
assert(middle.reduce((s,q)=>s+q.points,0)===24,'middle-info expected 24 points after EX-031');
assert(E.buildExamSet(middle,{targetPoints:20}).length>0,'middle-info should build an exact 20-point set');

// High-info has enough points and must still produce exactly 20.
const high=bank.questions.filter(q=>(q.curriculumScopes||[]).some(s=>s.subject==='high-info'));
for(let seed=1;seed<=100;seed++){
  let x=seed>>>0; const rng=()=>{x=(1103515245*x+12345)>>>0; return x/4294967296};
  const ids=E.buildExamSet(high,{targetPoints:20,randomFn:rng});
  assert(ids.length>0,'high-info 20-point set');
  const total=ids.reduce((sum,id)=>sum+bank.questions.find(q=>q.questionId===id).points,0);
  assert(total===20,`high-info total ${total}`);
}
console.log(`v7.5.2 Middle Info Recall + UI QA: OK (questions=${bank.questions.length}, 4pt=24, 2pt=7, units=${totalUnits}, mappings=${maps.length}, multiUnitTasks=${multiUnitTasks})`);

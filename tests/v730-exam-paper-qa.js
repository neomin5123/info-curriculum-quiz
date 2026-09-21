const fs=require('fs');
const path=require('path');
const E=require('../js/practice-engine.js');
const G=require('../js/grading-engine.js');
const root=path.resolve(__dirname,'..');
const bank=JSON.parse(fs.readFileSync(path.join(root,'data/practice-bank-v11.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ui=fs.readFileSync(path.join(root,'js/practice-ui.js'),'utf8');
const pe=fs.readFileSync(path.join(root,'js/practice-engine.js'),'utf8');
const cur=fs.readFileSync(path.join(root,'data/curriculum-data.js'),'utf8');
const sup=fs.readFileSync(path.join(root,'data/supplemental-data.js'),'utf8');

function assert(cond,msg){if(!cond) throw new Error(msg)}
assert(bank.questions.length===30,`question count ${bank.questions.length}`);
assert(bank.questions.filter(q=>q.points===4).length===23,'4pt count');
assert(bank.questions.filter(q=>q.points===2).length===7,'2pt count');
assert(bank.meta.rulesVersion==='1.6','rules version');
assert(html.includes('v7.3.0'),'version label');
assert(html.includes('30문항'),'UI count');
assert(html.includes('정확히 20점'),'20-point set description');
assert(ui.includes('renderExamText'),'exam text renderer');
assert(ui.includes('practice-unit-feedback'),'unit-level feedback');
assert(ui.includes('openExplanation'),'explanation modal function');
assert(html.includes('practiceExplanationModalBackdrop'),'explanation modal markup');
assert(html.includes('통합 해설'),'explanation UI label');
assert(pe.includes('unitResults'),'unit-level grading engine');

const corpusIds=new Set();
for(const m of cur.matchAll(/"id":"([A-Z0-9-]+)"/g)) corpusIds.add(m[1]);
for(const m of sup.matchAll(/L\("([A-Z0-9-]+)"/g)) corpusIds.add(m[1]);

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
assert(totalUnits===106,`unit count ${totalUnits}`);
assert(fourPointStructured===23,`4pt structured ${fourPointStructured}/23`);
assert(twoPointViewBased===7,`2pt view-based ${twoPointViewBased}/7`);
assert(multiUnitTasks>=7,`multi-unit tasks ${multiUnitTasks}`);

const ex30=bank.questions.find(q=>q.questionId==='EX-030');
assert(ex30,'EX-030 exists');
assert(ex30.legacyEvidence?.examYear===2025 && ex30.legacyEvidence?.paper==='A' && ex30.legacyEvidence?.question===7,'EX-030 historical archetype');
assert(ex30.curriculumScopes.some(s=>s.subject==='software-life'&&s.area==='현상을 분석하는 소프트웨어'),'EX-030 software-life scope');
assert(ex30.curriculumScopes.some(s=>s.subject==='data-science'&&s.area==='데이터 준비와 분석'),'EX-030 data-science scope');
assert(ex30.answerUnits.map(u=>u.key).join('|')==='소프트웨어와 생활|데이터 과학|21℃|N','EX-030 canonical answers');

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
assert(middle.reduce((s,q)=>s+q.points,0)===20,'middle-info expected 20 points');
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
console.log(`v7.3 Exam Paper QA: OK (questions=${bank.questions.length}, 4pt=23, 2pt=7, units=${totalUnits}, multiUnitTasks=${multiUnitTasks})`);

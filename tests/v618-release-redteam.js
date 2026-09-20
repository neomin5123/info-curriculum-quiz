'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}}; vm.createContext(ctx);
for(const file of ['data/curriculum-data.js','data/supplemental-data.js','data/practice-bank.js','js/grading-engine.js','js/practice-engine.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const data=ctx.window.CURRILOOP_CURRICULUM_DATA, bank=ctx.window.CURRILOOP_PRACTICE_BANK;
const G=ctx.CurriLoopGradingEngine, E=ctx.CurriLoopPracticeEngine;
const sourceIds=new Set();
for(const subject of Object.values(data)) for(const groups of Object.values(subject)) for(const sections of Object.values(groups)) if(Array.isArray(sections)) for(const section of sections) for(const line of section.lines||[]) sourceIds.add(line.id);
if(sourceIds.size!==662||bank.questions.length!==41) throw new Error(`corpus/bank count ${sourceIds.size}/${bank.questions.length}`);
let units=0;
for(const q of bank.questions){
  for(const sid of q.sourceIds||[]) if(!sourceIds.has(sid)) throw new Error(`unknown source ${q.questionId}:${sid}`);
  for(const u of q.answerUnits||[]){
    units++;
    const task=q.tasks.find(t=>t.id===u.taskId); const pts=Number(task?.points||0);
    const exact=E.gradeAnswer(u.key,u,pts,G); if(exact.status!=='correct'||exact.earned!==pts) throw new Error(`key fail ${q.questionId}:${u.taskId}`);
    if(Array.isArray(u.requiredConcepts)&&u.requiredConcepts.length){const attack=E.gradeAnswer(`${u.key} 이 내용은 정답이 아니며 수행하지 않는다`,u,pts,G);if(attack.status==='correct'||attack.earned>0)throw new Error(`negation bypass ${q.questionId}:${u.taskId}`);}
    for(const bad of u.forbiddenConfusions||[]){const attack=E.gradeAnswer(bad,u,pts,G);if(attack.status==='correct'||attack.earned>0)throw new Error(`forbidden bypass ${q.questionId}:${u.taskId}`);}
  }
}
if(units!==88) throw new Error(`unit count ${units}`);
function seeded(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
for(let seed=1;seed<=1000;seed++){
  const ids=E.buildExamSet(bank.questions,{size:5,randomFn:seeded(seed)}); const qs=ids.map(id=>bank.questions.find(q=>q.questionId===id));
  if(ids.length!==5||new Set(ids).size!==5)throw new Error(`set id failure ${seed}`);
  const src=qs.flatMap(q=>q.sourceIds||[]); if(src.length!==new Set(src).size)throw new Error(`set source cluster ${seed}`);
  if(new Set(qs.flatMap(q=>E.questionScopes(q).map(s=>s.subject))).size<3)throw new Error(`set subject cluster ${seed}`);
  if(qs.filter(q=>E.questionScopes(q).length>1).length>2)throw new Error(`set multiscope cluster ${seed}`);
  if(qs.filter(q=>q.comparison2015).length>1)throw new Error(`set comparison cluster ${seed}`);
}
// Every visible filter combination must only return matching scope pairs/version.
const subjects=['all','middle-info','high-info','ai-basic','data-science','software-life','info-science'];
const areas=['all',...new Set(bank.questions.flatMap(q=>E.questionScopes(q).map(s=>s.area)))];
for(const subject of subjects) for(const area of areas) for(const version of ['all','2022','comparison']){
  const out=E.filterQuestions(bank.questions,{subject,area,version});
  for(const q of out){const scopes=E.questionScopes(q);if(subject!=='all'&&area!=='all'&&!scopes.some(s=>s.subject===subject&&s.area===area))throw new Error(`cross-product leak ${subject}/${area}/${q.questionId}`);if(subject!=='all'&&area==='all'&&!scopes.some(s=>s.subject===subject))throw new Error(`subject leak ${q.questionId}`);if(subject==='all'&&area!=='all'&&!scopes.some(s=>s.area===area))throw new Error(`area leak ${q.questionId}`);if(version==='2022'&&q.comparison2015)throw new Error(`version leak 2022 ${q.questionId}`);if(version==='comparison'&&!q.comparison2015)throw new Error(`version leak comparison ${q.questionId}`);}
}
// Adaptive-state stress: all deficits stay finite and within the defined [0,6] bound.
let adaptive={}; const statuses=['wrong','unknown','near','correct'];
for(let i=0;i<5000;i++){const q=bank.questions[i%bank.questions.length]; adaptive=E.updateAdaptiveState(adaptive,q,statuses[i%statuses.length],100000+i);}
for(const bucket of [adaptive.scopes,adaptive.sourceTypes]) for(const [key,item] of Object.entries(bucket)){if(!Number.isFinite(item.deficit)||item.deficit<0||item.deficit>6)throw new Error(`adaptive bound ${key}:${item.deficit}`);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'), ui=fs.readFileSync(path.join(root,'js/practice-ui.js'),'utf8'), app=fs.readFileSync(path.join(root,'app.js'),'utf8'), sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
if(!ui.includes('정답과 근거를 제출 전까지 공개하지 않습니다.')||!ui.includes('if (setMode && !setSubmitted) return'))throw new Error('pre-submit answer/source guard missing');
if(!ui.includes('pool.length < EXAM_SET_SIZE'))throw new Error('undersized exam-set guard missing');
if(!app.includes('validateBackupPracticeAdaptive')||!app.includes("key === '__adaptive'"))throw new Error('adaptive backup validation missing');
if(!html.includes('v6.18.0')||!sw.includes('curriloop-v6-18-0-20260920'))throw new Error('release version/cache mismatch');
for(const asset of ['/data/practice-bank.js?v=6.18.0','/js/practice-engine.js?v=6.18.0','/js/practice-ui.js?v=6.18.0','/app.js?v=6.18.0']) if(!html.includes(asset)||!sw.includes(asset))throw new Error(`release asset mismatch ${asset}`);
console.log('v6.18 final red team: OK (41q/88u, 1000 set generations, all filter combinations, 5000 adaptive updates)');

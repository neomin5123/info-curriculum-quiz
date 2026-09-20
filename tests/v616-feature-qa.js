'use strict';
const fs=require('fs'), path=require('path');
const E=require('../js/practice-engine.js');
const bank=require('../data/practice-bank-v11.json');
const root=path.resolve(__dirname,'..');
function seeded(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
for(let seed=1;seed<=500;seed++){
  const ids=E.buildExamSet(bank.questions,{size:5,randomFn:seeded(seed)});
  if(ids.length!==5||new Set(ids).size!==5) throw new Error(`set size/dup seed=${seed}`);
  const qs=ids.map(id=>bank.questions.find(q=>q.questionId===id));
  if(qs.some(q=>!q)) throw new Error(`unknown set id seed=${seed}`);
  const sources=qs.flatMap(q=>q.sourceIds||[]);
  if(sources.length!==new Set(sources).size) throw new Error(`source overlap seed=${seed}`);
  const subjects=new Set(qs.flatMap(q=>E.questionScopes(q).map(s=>s.subject)));
  if(subjects.size<5) throw new Error(`subject diversity ${subjects.size} seed=${seed}`);
  if(qs.filter(q=>E.questionScopes(q).length>1).length>2) throw new Error(`multi-scope clustering seed=${seed}`);
  if(qs.filter(q=>q.comparison2015).length>1) throw new Error(`comparison clustering seed=${seed}`);
}
const middle=E.filterQuestions(bank.questions,{subject:'middle-info',area:'all',version:'2022'});
for(let seed=1;seed<=50;seed++){
  const ids=E.buildExamSet(middle,{size:5,randomFn:seeded(seed)});
  if(ids.length!==5||new Set(ids).size!==5) throw new Error(`filtered set failure seed=${seed}`);
  for(const id of ids){const q=bank.questions.find(x=>x.questionId===id);if(!E.questionScopes(q).some(s=>s.subject==='middle-info'))throw new Error(`filtered set scope leak ${id}`);}
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ui=fs.readFileSync(path.join(root,'js/practice-ui.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
for(const marker of ['id="practiceSetButton"','id="practiceSetSubmitButton"','id="practiceSetStatus"','실전 세트 5문항']) if(!html.includes(marker)) throw new Error(`set UI missing ${marker}`);
for(const marker of ['let setMode = false','let setAnswers = {}','setSubmitted','Engine.buildExamSet','정답과 근거를 제출 전까지 공개하지 않습니다.','if (setMode && !setSubmitted) return','root.togglePracticeExamSet = toggleSet','root.submitPracticeExamSet = submitSet','version:4']) if(!ui.includes(marker)) throw new Error(`set state/guard missing ${marker}`);
if(!css.includes('.practice-controls { grid-template-columns:repeat(3,minmax(160px,1fr)); }')) throw new Error('practice filter grid is not 3 columns');
if(!html.includes('v6.17.0')||!app.includes('const APP_VERSION = "6.17.0"')) throw new Error('v616 version missing');
for(const marker of ['/js/practice-engine.js?v=6.17.0','/js/practice-ui.js?v=6.17.0','/app.js?v=6.17.0']) if(!sw.includes(marker)) throw new Error(`SW current asset missing ${marker}`);
console.log('v6.16 exam-set QA: OK (500 balanced set generations + 50 filtered generations)');

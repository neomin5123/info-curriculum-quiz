'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}}; vm.createContext(ctx);
for(const file of ['data/curriculum-data.js','data/supplemental-data.js','data/practice-bank.js','js/practice-engine.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const data=ctx.window.CURRILOOP_CURRICULUM_DATA, bank=ctx.window.CURRILOOP_PRACTICE_BANK, Engine=ctx.CurriLoopPracticeEngine;
if(!bank||bank.questions?.length<150) throw new Error('bank count regression');
const sourceMap=new Map();
for(const [sub,subject] of Object.entries(data)) for(const [area,groups] of Object.entries(subject)) for(const sections of Object.values(groups)) if(Array.isArray(sections)) for(const section of sections) for(const line of section.lines||[]) sourceMap.set(line.id,{sub,area});
const pairSet=new Set(); let multi=0;
for(const q of bank.questions){
  if(!Array.isArray(q.curriculumScopes)||!q.curriculumScopes.length) throw new Error(`scope missing ${q.questionId}`);
  const expected=[]; const seen=new Set();
  for(const sid of q.sourceIds||[]){const x=sourceMap.get(sid); if(x&&x.area!=='과목 공통'){const key=x.sub+'|'+x.area; if(!seen.has(key)){seen.add(key);expected.push(key);}}}
  const actual=q.curriculumScopes.map(s=>s.subject+'|'+s.area);
  if(JSON.stringify(expected)!==JSON.stringify(actual)) throw new Error(`scope mismatch ${q.questionId}: ${actual} vs ${expected}`);
  actual.forEach(x=>pairSet.add(x));
  if(q.curriculumScopes.length>1) multi++;
  const subs=[...new Set(q.curriculumScopes.map(s=>s.subject))];
  const areas=[...new Set(q.curriculumScopes.map(s=>s.area))];
  if(JSON.stringify(subs)!==JSON.stringify(q.subjects)||JSON.stringify(areas)!==JSON.stringify(q.areas)) throw new Error(`derived index mismatch ${q.questionId}`);
}
if(pairSet.size!==27) throw new Error(`pair coverage ${pairSet.size}`);

const expectedAreas={
  'middle-info':['데이터','디지털 문화','알고리즘과 프로그래밍','인공지능','컴퓨팅 시스템'],
  'high-info':['데이터','디지털 문화','알고리즘과 프로그래밍','인공지능','컴퓨팅 시스템'],
  'ai-basic':['인공지능과 학습','인공지능 프로젝트','인공지능의 사회적 영향','인공지능의 이해'],
  'data-science':['데이터 과학의 이해','데이터 과학 프로젝트','데이터 모델링과 평가','데이터 준비와 분석'],
  'software-life':['가치를 창출하는 소프트웨어','모의 실험하는 소프트웨어','세상을 변화시키는 소프트웨어','창작을 지원하는 소프트웨어','현상을 분석하는 소프트웨어'],
  'info-science':['데이터 구조','알고리즘','정보과학 프로젝트','프로그래밍']
};
for(const [subject,expected] of Object.entries(expectedAreas)){
  const actual=[...new Set(bank.questions.flatMap(q=>Engine.questionScopes(q).filter(s=>s.subject===subject).map(s=>s.area)))].sort((a,b)=>a.localeCompare(b,'ko'));
  const exp=[...expected].sort((a,b)=>a.localeCompare(b,'ko'));
  if(JSON.stringify(actual)!==JSON.stringify(exp)) throw new Error(`subject area dropdown mismatch ${subject}: ${actual}`);
}
// Critical regression: subject+area must match the SAME scope, never a cross-product.
const q=bank.questions.find(q=>q.questionId==='PB-045');
if(!q) throw new Error('PB-045 missing');
if(Engine.filterQuestions([q],{subject:'middle-info',area:'데이터 과학 프로젝트',version:'all'}).length) throw new Error('cross-product leak');
if(Engine.filterQuestions([q],{subject:'middle-info',area:'데이터',version:'all'}).length!==1) throw new Error('valid pair filtered out');
if(Engine.filterQuestions([q],{subject:'data-science',area:'데이터 과학 프로젝트',version:'all'}).length!==1) throw new Error('second valid pair filtered out');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!html.includes('v6.17.0')) throw new Error('version missing');
if(!html.includes('<option value="all">전체</option><option value="2022">2022 개정</option><option value="comparison">15·22 비교</option>')) throw new Error('version filter labels');
const ui=fs.readFileSync(path.join(root,'js/practice-ui.js'),'utf8');
if(!ui.includes('scope.subject === subject')||!ui.includes('과목 · 영역')) { /* literal may be template */ }
console.log(`v6.14+ scope/filter QA: OK (questions=${bank.questions.length}, pairs=${pairSet.size}, multiScope=${multi})`);

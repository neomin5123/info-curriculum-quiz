'use strict';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}}; vm.createContext(ctx);
for (const file of ['data/curriculum-data.js','data/supplemental-data.js','data/practice-bank.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const data=ctx.window.CURRILOOP_CURRICULUM_DATA;
const bank=ctx.window.CURRILOOP_PRACTICE_BANK;
if(!bank || !Array.isArray(bank.questions) || !bank.questions.length) throw new Error('practice bank missing');
if(bank.questions.length!==150) throw new Error(`exam-core bank count ${bank.questions.length}`);
const sourceIds=new Set();
for(const subject of Object.values(data)) for(const groups of Object.values(subject)) for(const sections of Object.values(groups)) if(Array.isArray(sections)) for(const section of sections) for(const line of section.lines||[]) sourceIds.add(line.id);
const coverage=new Set(); let multi=0, compare=0;
for(const q of bank.questions){
  if(!Array.isArray(q.subjects)||!q.subjects.length) throw new Error(`subjects missing ${q.questionId}`);
  if(!Array.isArray(q.areas)) throw new Error(`areas missing ${q.questionId}`);
  if(q.areas.includes('과목 공통')) throw new Error(`common area leaked ${q.questionId}`);
  if('patternType' in q || 'difficulty' in q || 'track' in q || 'subject' in q || 'area' in q) throw new Error(`legacy taxonomy leaked ${q.questionId}`);
  if(q.subjects.length>1) multi++;
  if(q.comparison2015) compare++;
  const total=(q.tasks||[]).reduce((s,t)=>s+Number(t.points||0),0);
  if(total!==4 || Number(q.points)!==4) throw new Error(`not exam 4-point ${q.questionId}: ${total}`);
  for(const sid of q.sourceIds||[]) if(!sourceIds.has(sid)) throw new Error(`unknown source ${q.questionId}:${sid}`);
  for(const sid of q.sourceIds||[]){
    outer: for(const [sk,groups] of Object.entries(data)) for(const [areaName,groupObj] of Object.entries(groups)){
      for(const sections of Object.values(groupObj||{})) if(Array.isArray(sections)) for(const section of sections) for(const line of section.lines||[]) if(line.id===sid){ if(areaName!=='과목 공통') coverage.add(`${sk}|${areaName}`); break outer; }
    }
  }
}
if(coverage.size!==27) throw new Error(`concrete area coverage ${coverage.size}`);
if(multi<5) throw new Error(`multi-subject tagging too low ${multi}`);
if(compare!==1) throw new Error(`comparison count ${compare}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const marker of ['id="practiceSubject"','id="practiceArea"','id="practiceVersion"','id="practiceQuestionArea"']) if(!html.includes(marker)) throw new Error(`practice UI missing ${marker}`);
for(const forbidden of ['id="practicePattern"','id="practiceDifficulty"','<label for="practicePattern">문제 유형</label>']) if(html.includes(forbidden)) throw new Error(`legacy learner taxonomy still visible: ${forbidden}`);
if(!html.includes('과목과 영역은 한 문제에 여러 개가 걸리면 모두 표시')) throw new Error('multi-tag help missing');
console.log(`v6.12+ exam-core regression QA: OK (${bank.questions.length} questions, comparison=${compare}, multi=${multi}, concreteAreas=${coverage.size})`);

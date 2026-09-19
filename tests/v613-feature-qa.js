'use strict';
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}}; vm.createContext(ctx);
for(const file of ['data/curriculum-data.js','data/supplemental-data.js','data/practice-bank.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const data=ctx.window.CURRILOOP_CURRICULUM_DATA, bank=ctx.window.CURRILOOP_PRACTICE_BANK;
if(!bank||bank.questions?.length!==150) throw new Error(`v613 bank count ${bank?.questions?.length}`);
if(bank.meta?.questionCount!==150) throw new Error('meta count mismatch');
const sourceMap=new Map();
for(const [sub,subject] of Object.entries(data)) for(const [area,groups] of Object.entries(subject)) for(const sections of Object.values(groups)) if(Array.isArray(sections)) for(const section of sections) for(const line of section.lines||[]) sourceMap.set(line.id,{sub,area,section:section.title});
const pairs=new Set(); let compare=0,multi=0,units=0;
const direct=[/영역명.*쓰/,/과목명.*쓰/,/성취기준.*번호/,/세 범주.*쓰/];
for(const q of bank.questions){
  if(q.points!==4) throw new Error(`not 4pt ${q.questionId}`);
  if(!Array.isArray(q.subjects)||!q.subjects.length||!Array.isArray(q.areas)||!q.areas.length) throw new Error(`tags missing ${q.questionId}`);
  if(q.areas.includes('과목 공통')) throw new Error(`common area ${q.questionId}`);
  if('difficulty' in q||'patternType' in q||'subject' in q||'area' in q) throw new Error(`legacy taxonomy ${q.questionId}`);
  if(q.comparison2015) compare++;
  if(q.subjects.length>1) multi++;
  const total=(q.tasks||[]).reduce((s,t)=>s+Number(t.points||0),0); if(total!==4) throw new Error(`task points ${q.questionId}`);
  const prompts=(q.tasks||[]).map(t=>t.prompt).join(' '); if(direct.some(r=>r.test(prompts))) throw new Error(`direct recall ${q.questionId}`);
  const tids=new Set((q.tasks||[]).map(t=>t.id)), uids=new Set((q.answerUnits||[]).map(u=>u.taskId)); if(tids.size!==uids.size||[...tids].some(x=>!uids.has(x))) throw new Error(`unit mismatch ${q.questionId}`);
  units+=(q.answerUnits||[]).length;
  for(const sid of q.sourceIds||[]){ const s=sourceMap.get(sid); if(!s) throw new Error(`unknown source ${q.questionId}:${sid}`); if(s.area!=='과목 공통') pairs.add(`${s.sub}|${s.area}`); }
}
if(pairs.size!==27) throw new Error(`pair coverage ${pairs.size}`);
if(compare!==1) throw new Error(`comparison ${compare}`);
if(multi<10) throw new Error(`multi-subject too low ${multi}`);
if(units!==311) throw new Error(`answer units ${units}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!html.includes('150문항')||!html.includes('v6.14.0')) throw new Error('v613 UI/version missing');
console.log(`v6.13 Exam Core 150 QA: OK (questions=150, units=${units}, comparison=${compare}, multi=${multi}, pairs=${pairs.size})`);

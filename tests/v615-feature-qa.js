'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}}; vm.createContext(ctx);
for(const file of ['data/curriculum-data.js','data/supplemental-data.js','data/practice-bank.js','js/grading-engine.js','js/practice-engine.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const data=ctx.window.CURRILOOP_CURRICULUM_DATA, bank=ctx.window.CURRILOOP_PRACTICE_BANK;
const G=ctx.CurriLoopGradingEngine, E=ctx.CurriLoopPracticeEngine;
if(!bank || bank.questions?.length!==180) throw new Error(`v615 bank count ${bank?.questions?.length}`);
if(bank.meta?.questionCount!==180 || bank.meta?.targetMilestone!==180) throw new Error('v615 meta count/target mismatch');
if(bank.meta?.comparison2015Count!==1) throw new Error(`comparison count ${bank.meta?.comparison2015Count}`);
const sourceMap=new Map();
for(const [sub,subject] of Object.entries(data)) for(const [area,groups] of Object.entries(subject)) for(const sections of Object.values(groups)) if(Array.isArray(sections)) for(const section of sections) for(const line of section.lines||[]) sourceMap.set(line.id,{sub,area,title:section.title,text:line.text});
const ids=new Set(), pairs=new Set(), typeQuestionCount=new Map(); let units=0,multi=0,commonQ=0,contentQ=0;
const contentTypes=new Set(['핵심 아이디어','지식·이해','과정·기능','가치·태도']);
const direct=[/영역명.*쓰/,/과목명.*쓰/,/성취기준.*번호/,/세 범주.*쓰/];
let keyFail=0,variantFail=0,negBypass=0,forbiddenBypass=0,blankFail=0;
for(const q of bank.questions){
 if(ids.has(q.questionId)) throw new Error(`duplicate ${q.questionId}`); ids.add(q.questionId);
 if(q.points!==4 || (q.tasks||[]).reduce((s,t)=>s+Number(t.points||0),0)!==4) throw new Error(`not 4pt ${q.questionId}`);
 if(!Array.isArray(q.curriculumScopes)||!q.curriculumScopes.length) throw new Error(`scope missing ${q.questionId}`);
 if(q.areas?.includes('과목 공통')) throw new Error(`common area leaked ${q.questionId}`);
 if('patternType' in q||'difficulty' in q||'track' in q||'subject' in q||'area' in q) throw new Error(`legacy taxonomy ${q.questionId}`);
 const prompts=(q.tasks||[]).map(t=>t.prompt).join(' '); if(direct.some(r=>r.test(prompts))) throw new Error(`direct recall ${q.questionId}`);
 const expected=[],seen=new Set(),types=[]; let hasCommon=false,hasContent=false;
 for(const sid of q.sourceIds||[]){ const s=sourceMap.get(sid); if(!s) throw new Error(`unknown source ${q.questionId}:${sid}`); if(!types.includes(s.title)) types.push(s.title); if(s.area==='과목 공통')hasCommon=true; else {const key=s.sub+'|'+s.area;if(!seen.has(key)){seen.add(key);expected.push(key);pairs.add(key);}} if(contentTypes.has(s.title))hasContent=true; }
 const actual=q.curriculumScopes.map(s=>s.subject+'|'+s.area); if(JSON.stringify(expected)!==JSON.stringify(actual)) throw new Error(`scope mismatch ${q.questionId}: ${actual} vs ${expected}`);
 if(new Set(actual).size!==actual.length) throw new Error(`duplicate scope ${q.questionId}`);
 if(JSON.stringify([...new Set(q.curriculumScopes.map(s=>s.subject))])!==JSON.stringify(q.subjects)) throw new Error(`subject index mismatch ${q.questionId}`);
 if(JSON.stringify([...new Set(q.curriculumScopes.map(s=>s.area))])!==JSON.stringify(q.areas)) throw new Error(`area index mismatch ${q.questionId}`);
 if(new Set(types).size!==new Set(q.sourceType||[]).size || types.some(t=>!(q.sourceType||[]).includes(t))) throw new Error(`sourceType mismatch ${q.questionId}: ${types} vs ${q.sourceType}`);
 if(q.curriculumScopes.length>1)multi++; if(hasCommon)commonQ++; if(hasContent)contentQ++;
 for(const t of new Set(types)) typeQuestionCount.set(t,(typeQuestionCount.get(t)||0)+1);
 if((q.tasks||[]).length!==(q.answerUnits||[]).length) throw new Error(`unit count mismatch ${q.questionId}`);
 units+=(q.answerUnits||[]).length;
 for(const u of q.answerUnits||[]){ const task=q.tasks.find(t=>t.id===u.taskId); if(!task) throw new Error(`unit task missing ${q.questionId}:${u.taskId}`); const pts=Number(task.points||0);
   let r=E.gradeAnswer(u.key,u,pts,G); if(r.status!=='correct'||r.earned!==pts)keyFail++;
   for(const v of u.acceptedVariants||[]){let rv=E.gradeAnswer(v,u,pts,G); if(rv.status!=='correct'||rv.earned!==pts)variantFail++;}
   let rb=E.gradeAnswer('',u,pts,G); if(rb.status!=='unknown'||rb.earned!==0)blankFail++;
   if(Array.isArray(u.requiredConcepts)&&u.requiredConcepts.length){const rn=E.gradeAnswer(u.key+' 이 내용은 정답이 아니다',u,pts,G); if(rn.status==='correct'||rn.earned>0)negBypass++;}
   for(const bad of u.forbiddenConfusions||[]){const rf=E.gradeAnswer(bad,u,pts,G); if(rf.status==='correct'||rf.earned>0)forbiddenBypass++;}
 }
}
if(units!==371) throw new Error(`answer units ${units}`);
if(pairs.size!==27) throw new Error(`pair coverage ${pairs.size}`);
if(multi<16) throw new Error(`multi-scope too low ${multi}`);
if(commonQ<40) throw new Error(`common-source integration too low ${commonQ}`);
if(contentQ<29) throw new Error(`content-system integration too low ${contentQ}`);
if((typeQuestionCount.get('교수·학습의 방향')||0)<9 || (typeQuestionCount.get('교수·학습 방법')||0)<8) throw new Error(`teaching-method coverage weak ${JSON.stringify(Object.fromEntries(typeQuestionCount))}`);
if([keyFail,variantFail,blankFail,negBypass,forbiddenBypass].some(Boolean)) throw new Error(`grading redteam failed key=${keyFail} variant=${variantFail} blank=${blankFail} neg=${negBypass} forbidden=${forbiddenBypass}`);
for(let n=186;n<=215;n++) if(!ids.has(`PB-${String(n).padStart(3,'0')}`)) throw new Error(`new item missing PB-${n}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'), app=fs.readFileSync(path.join(root,'app.js'),'utf8'), sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
if(!html.includes('180문항')||!html.includes('v6.17.0')) throw new Error('v615 UI/version missing');
if(!app.includes('const APP_VERSION = "6.17.0"')) throw new Error('app version missing');
for(const marker of ['/data/practice-bank.js?v=6.17.0','/js/practice-ui.js?v=6.17.0','/app.js?v=6.17.0']) if(!sw.includes(marker)) throw new Error(`SW version missing ${marker}`);
console.log(`v6.15 Exam Core 180 QA: OK (questions=180, units=${units}, pairs=${pairs.size}, multi=${multi}, common=${commonQ}, content=${contentQ}, teachDir=${typeQuestionCount.get('교수·학습의 방향')||0}, teachMethod=${typeQuestionCount.get('교수·학습 방법')||0})`);

import fs from 'node:fs';
import vm from 'node:vm';
function assert(value,message){if(!value)throw new Error(message);}
const read=p=>fs.readFileSync(p,'utf8');
const base=JSON.parse(read('data/curriculum/middle-high-v9.0.6.json'));
const ai=JSON.parse(read('data/curriculum/ai-basic-2022.json'));
const q=JSON.parse(read('data/exams/major-exams-2014-2026.json'));
const ctx={window:{}};
vm.runInNewContext(read('js/core/study-engine.js'),ctx);
const data={...base,lines:[...base.lines,...ai.lines],knowledgeUnderstandingGroups:[...base.knowledgeUnderstandingGroups,...ai.knowledgeUnderstandingGroups]};
const state=(subject,area,family)=>({ui:{subject,area,family,stage:'whole',retry:true,mode:'cloze'},round:1});
const make=ctx.window.CurriLoop.study.makeEngine;
const areas=['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트'];
assert(base.lines.length===270,'existing official lines changed');
assert(base.lines.reduce((n,l)=>n+(l.presentation?.units?.length||0),0)===370,'existing presentation changed');
assert(ai.lines.length===110,'AI official line mismatch');
assert(new Set(data.lines.map(l=>l.lineId)).size===380,'line IDs not distinct');
assert(q.questions.length===269&&q.questions.filter(x=>x.solutionStatus==='solved').length===231,'exam data changed');
let e=make(data,state('ai-basic','all','content-system'));
assert(e.subjects.length===3&&e.labels['ai-basic']==='인공지능 기초','AI subject unavailable');
assert(JSON.stringify(e.areasForSubject('ai-basic'))===JSON.stringify(areas),'AI area choices mismatch');
e.rebuild();assert(e.queue.length===4,'AI content-system all areas must be four study tasks');
for(const task of e.queue){
  assert(task.group.subject==='ai-basic','foreign subject in AI queue');
  assert(task.group.rows.some(r=>r.family==='지식·이해'),'missing AI knowledge group');
  const ki=data.knowledgeUnderstandingGroups.find(g=>g.subject==='ai-basic'&&g.area===task.group.area);
  assert(ki&&task.group.rows.find(r=>r.family==='지식·이해').items.length===ki.items.length,'KI group not full-list');
  const active=task.group.items.filter(it=>it.recallable);
  assert(active.length>=1,'no AI cloze prompts');
  for(const item of active){
    const line=e.lineMap.get(item.lineId);
    assert(e.recallUnitsForLine(line).every(k=>line.sourceText.slice(k.start,k.end)===k.text),'invalid AI cloze span '+line.lineId);
  }
}
e=make(data,state('ai-basic','all','standards'));e.rebuild();
assert(e.queue.length===4&&e.queue.reduce((a,t)=>a+t.group.items.length,0)===19,'AI standards not full coverage');
e=make(data,state('ai-basic','all','content-standards'));e.rebuild();
assert(e.queue.length===4&&e.queue.every(t=>t.group.standards.length),'AI content + standards missing');
for(const fam of ['character-goals','teaching-eval']){
  e=make(data,state('ai-basic','all',fam));e.rebuild();
  assert(e.queue.length===1&&e.current().group.items.length>0,`AI common family ${fam} inaccessible`);
}
for(const fam of ['explain-consider']){
  e=make(data,state('ai-basic','all',fam));e.rebuild();
  assert(e.queue.length===4&&e.queue.every(t=>t.group.items.length>0),'AI guidance not accessible');
}
for(const s of ['middle-info','high-info']){
  e=make(data,state(s,'all','content-system'));e.rebuild();
  assert(e.queue.length===5,'legacy course lost a study area '+s);
}
for(const token of ["syncAreaOptions(state.ui.area)","subject==='ai-basic'&&g.familyGroup==='standards'","standardBodyUnits(rawUnits,parts.offset,parts.body)","AREA_MEMO_DEFAULTS['ai-basic']"])
  assert(read('js/app.js').includes(token),'AI UI behavior absent: '+token);
assert(read('js/core/config.js').includes("storageKey:'curriloop:v9:study-state'"),'storage compatibility broken');
console.log(JSON.stringify({status:'PASS',legacyLines:270,legacyPresentation:370,aiLines:110,aiAreas:4,aiStandards:19,aiKI:11,examQuestions:269,examSolved:231,aiStudyModes:4},null,2));

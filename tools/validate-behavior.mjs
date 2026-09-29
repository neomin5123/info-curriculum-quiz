import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};context.window.window=context.window;vm.createContext(context);for(const p of ['data/generated/study-data.js','js/core/study-engine.js'])vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});context.window.CurriLoop.config={retryDelay:3,maxRetriesPerTaskPerRound:2};
const data=context.window.CURRILOOP_STUDY_DATA,make=context.window.CurriLoop.study.makeEngine;
const state=(subject,area,family,stage)=>({ui:{subject,area,family,stage,retry:true},round:1,progress:{},itemProgress:{}});function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
let e=make(data,state('middle-info','컴퓨팅 시스템','content-system','single'));e.rebuild();
assert(e.queue.length===1&&e.queue[0].type==='content-system','single content-system must be one full-table task');
assert(e.queue[0].focus.kind==='single','single focus mismatch');
assert(e.queue[0].group.coreIdeas.length===2,'middle CS core ideas missing');
assert(e.queue[0].group.rows.map(r=>r.family).join('|')==='지식·이해|과정·기능|가치·태도','content-system rows');
const kiIds=e.queue[0].group.rows.find(r=>r.family==='지식·이해').items.map(x=>x.lineId);
assert(kiIds.every(id=>e.queue[0].focus.lineIds.includes(id)),'all KI items must be active regardless of recall stage');
assert(!e.queue[0].focus.lineIds.includes('MI-01-CS-VA-01')&&!e.queue[0].focus.lineIds.includes('MI-01-CS-VA-02'),'C-only value-attitude items must stay visible but not become production blanks');

e=make(data,state('middle-info','컴퓨팅 시스템','content-system','practical'));e.rebuild();
assert(e.queue.length===1&&e.queue[0].type==='content-system'&&e.queue[0].focus.kind==='practical','practical content-system must be one full-table task');

e=make(data,state('middle-info','컴퓨팅 시스템','content-system','whole'));e.rebuild();
assert(e.queue.length===1&&e.queue[0].type==='content-system'&&e.queue[0].focus.kind==='whole','whole content-system must be one full-table task');
const sampleLine=e.lineMap.get('MI-01-CS-KI-01');
assert(e.recallUnitsForLine(sampleLine,'whole').length===4,'whole recall should blank every presentation unit on the sample core idea');
e=make(data,state('middle-info','컴퓨팅 시스템','content-system','single'));e.rebuild();
assert(e.recallUnitsForLine(e.lineMap.get('MI-01-CS-KI-01'),'single').length===1,'single recall should blank one presentation unit per non-KI line');
e=make(data,state('middle-info','컴퓨팅 시스템','content-system','practical'));e.rebuild();
assert(e.recallUnitsForLine(e.lineMap.get('MI-01-CS-KI-01'),'practical').length===2,'practical recall should use representative multi-blank set on the sample core idea');

e=make(data,state('middle-info','컴퓨팅 시스템','standards','whole'));e.rebuild();assert(e.queue.length===1&&e.queue[0].type==='whole-group'&&e.queue[0].group.items.length===3,'standards whole mismatch');
e=make(data,state('middle-info','컴퓨팅 시스템','content-standards','single'));e.rebuild();assert(e.queue.length===1&&e.queue[0].type==='content-standards','content+standards single must be one composite task');assert(e.queue[0].group.standards.length===3,'content+standards single must visibly include all 3 standards');assert(e.queue[0].focus.contentLineIds.length>0&&e.queue[0].focus.standardLineIds.length===3,'content+standards single focus incomplete');
e=make(data,state('middle-info','컴퓨팅 시스템','content-standards','practical'));e.rebuild();assert(e.queue.length===1&&e.queue[0].type==='content-standards','content+standards practical must be one composite task');assert(e.queue[0].group.standards.length===3&&e.queue[0].focus.standardLineIds.length===3,'content+standards practical standards missing');
e=make(data,state('middle-info','컴퓨팅 시스템','content-standards','whole'));e.rebuild();assert(e.queue.length===1&&e.queue[0].type==='content-standards','content+standards whole mismatch');assert(e.queue[0].group.standards.length===3&&e.queue[0].focus.standardLineIds.length===3,'combined standards missing');
e=make(data,state('middle-info','컴퓨팅 시스템','explain-consider','whole'));e.rebuild();assert(e.queue.length===1&&e.queue[0].group.sections.length===2,'explain+consider whole mismatch');
e=make(data,state('middle-info','all','character-goals','whole'));e.rebuild();assert(e.queue.length===1&&e.queue[0].group.area==='과목 공통','character+goals must be common');
e=make(data,state('middle-info','all','teaching-eval','whole'));e.rebuild();assert(e.queue.length===1&&e.queue[0].group.sections.map(x=>x.family).join('|')==='교수·학습|평가','teaching+eval mismatch');
e=make(data,state('middle-info','all','content-system','whole'));e.rebuild();assert(e.queue.length===5,'all-area content system should be 5 tasks');
e=make(data,state('all','all','content-system','whole'));e.rebuild();assert(e.queue.length===10,'all-subject all-area content system should be 10 tasks');
assert(e.familyGroupOrder.length===6,'family group count must be 6');assert(e.groupAvailable('standards','middle-info','컴퓨팅 시스템'),'standalone 성취기준 option must be available for a specific area');assert(e.groupAvailable('content-standards','middle-info','컴퓨팅 시스템'),'내용체계 + 성취기준 option must be available for a specific area');assert(!e.groupAvailable('character-goals','middle-info','컴퓨팅 시스템'),'common group must not appear for specific area');assert(e.groupAvailable('character-goals','middle-info','all'),'common group must appear for all area');assert(e.groupAvailable('content-system','middle-info','컴퓨팅 시스템'),'content group missing for specific area');
console.log(JSON.stringify({status:'PASS',familyGroups:e.familyGroupOrder,specificAreaContentTasksPerStage:1,allAreaContentTasks:5,allSubjectContentTasks:10},null,2));
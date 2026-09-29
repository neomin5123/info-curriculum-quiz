import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};context.window.window=context.window;vm.createContext(context);
for(const p of ['data/generated/study-data.js','js/core/study-engine.js'])vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});
context.window.CurriLoop.config={retryDelay:3,maxRetriesPerTaskPerRound:2};
const data=context.window.CURRILOOP_STUDY_DATA,make=context.window.CurriLoop.study.makeEngine;
const state=(subject,area,family,stage)=>({ui:{subject,area,family,stage,retry:true},round:1,progress:{},itemProgress:{}});
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
let e=make(data,state('middle-info','all','지식·이해','ki-area'));e.rebuild();assert(e.queue.length===5,'middle KI area-by-area should be 5 tasks');assert(e.queue.every(t=>t.type==='ki'),'area-by-area tasks must be KI groups');
e=make(data,state('middle-info','all','지식·이해','ki-all'));e.rebuild();assert(e.queue.length===1,'middle KI all should be 1 task');assert(e.queue[0].type==='ki-all','middle all-recall task type');assert(e.queue[0].group.items.length===17,'middle all-recall should contain 17 KI items');
e=make(data,state('high-info','all','지식·이해','ki-all'));e.rebuild();assert(e.queue.length===1&&e.queue[0].group.items.length===15,'high all-recall should contain 15 KI items');
e=make(data,state('all','all','지식·이해','ki-all'));e.rebuild();assert(e.queue.length===2,'middle+high all-recall should be split into 2 school-level tasks');assert(e.queue.map(t=>t.group.items.length).sort((a,b)=>a-b).join(',')==='15,17','middle+high KI item counts');
e=make(data,state('middle-info','컴퓨팅 시스템','content-system','content-table'));e.rebuild();assert(e.queue.length===1,'specific-area content-system should be 1 composite table task');assert(e.queue[0].type==='content-system','content-system task type');assert(e.queue[0].group.rows.map(r=>r.family).join('|')==='지식·이해|과정·기능|가치·태도','content-system row order');const csExpected=data.lines.filter(l=>l.subject==='middle-info'&&l.area==='컴퓨팅 시스템'&&['지식·이해','과정·기능','가치·태도'].includes(l.family));assert(e.queue[0].group.items.length===csExpected.length,'content-system item count mismatch');
e=make(data,state('middle-info','all','content-system','content-table'));e.rebuild();assert(e.queue.length===5,'middle all-area content-system should be 5 table tasks');assert(e.queue.every(t=>t.type==='content-system'),'all-area content-system must only contain composite tasks');
e=make(data,state('all','all','content-system','content-table'));e.rebuild();assert(e.queue.length===10,'middle+high all-area content-system should be 10 table tasks');
console.log(JSON.stringify({status:'PASS',middleKIAreaTasks:5,middleKIAllItems:17,highKIAllItems:15,allSubjectKIAllTasks:2,contentSystemSpecificAreaTasks:1,middleAllAreaContentSystemTasks:5,allSubjectAllAreaContentSystemTasks:10},null,2));

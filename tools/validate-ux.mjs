import fs from 'node:fs';import vm from 'node:vm';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const context={window:{}};context.window.window=context.window;vm.createContext(context);vm.runInContext(fs.readFileSync('js/core/grading.js','utf8'),context,{filename:'grading.js'});
const G=context.window.CurriLoop.grading;
assert(G.classify('운영 체제의 기능','운영체제의 기능')==='correct','exact normalization failed');
assert(G.classify('','운영 체제의 기능')==='unknown','empty must be unknown');
assert(G.classify('운영 체졔의 기능','운영 체제의 기능')==='near','Hangul typo should be near');
assert(G.classify('기술 발달','기술의 발전')==='near','semantic near should be preserved');
assert(G.classify('시스템을 설계','시스템을 분석')==='wrong','strict action conflict should stay wrong');
const set=G.gradeSetDetailed(['운영 체제의 기능','','컴퓨팅 시스템의 동작 원리'],['컴퓨팅 시스템의 동작 원리','운영 체제의 기능','피지컬 컴퓨팅의 개념']);
assert(set.results[0].status==='correct','unordered exact failed');assert(set.results[1].status==='unknown','unordered empty failed');assert(set.results[2].status==='correct','unordered second exact failed');
const app=fs.readFileSync('js/app.js','utf8'),html=fs.readFileSync('index.html','utf8');
assert(app.includes("block:'center',behavior:'smooth'"),'smooth center scrolling missing');
assert(app.includes("detail.status==='correct'"),'correct-field auto focus missing');
assert(app.includes('CL.storage.setDraft'),'draft persistence missing');
assert(html.indexOf('sourceButton')<html.indexOf('</section>')&&html.includes('provenanceFooter'),'source/provenance UI missing');
console.log(JSON.stringify({status:'PASS',grading:['correct','near','unknown','wrong'],draftPersistence:true,smoothFocus:true,provenance:true},null,2));

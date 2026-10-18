import fs from 'node:fs';
import vm from 'node:vm';

function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');

assert(html.includes('area-navigator area-navigator-bottom'),'bottom area navigator missing');
assert(html.includes('← 이전 영역')&&html.includes('다음 영역 →'),'full area navigation labels missing');
const navPos=html.indexOf('id="areaNavigator"');
const secondaryPos=html.indexOf('class="secondary-actions"');
assert(navPos>secondaryPos,'area navigator must live below task controls');
assert(app.includes("state.ui.stage!=='practical'"),'auto-flow must be limited to practical stage');
assert(app.includes('currentAnswerFieldsAllCorrect()'),'auto-flow must require all current answers correct');
assert(app.includes('PRACTICAL_AUTO_ADVANCE_DELAY_MS=950'),'auto-flow delay marker missing');
assert(app.includes("if(status==='correct')schedulePracticalAutoAdvance();"),'whole-task grading must trigger practical auto-flow');
assert(app.includes('else schedulePracticalAutoAdvance();'),'last individual field must trigger practical auto-flow');
assert(app.includes('engine.next();revealed=false;render();'),'auto-flow must use normal engine next transition');
assert(app.includes("mode:'queue'")&&app.includes("mode:'filter'"),'area navigation must support all-area and specific-area scopes');
assert(app.includes("changeScope(()=>{state.ui.area=target.area;el.area.value=target.area;});"),'specific-area navigation must change area scope');
assert(css.includes('v9.0.41 — practical auto-flow + bottom area navigation'),'v9.0.41 area navigation css missing');

// Engine invariant: completing the last task and calling normal next() advances round,
// so practicalSets rotate without a separate "처음부터" action.
const context={window:{}};context.window.window=context.window;vm.createContext(context);
for(const p of ['data/generated/study-data.js','js/core/study-engine.js'])vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});
context.window.CurriLoop.config={retryDelay:3,maxRetriesPerTaskPerRound:2};
const data=context.window.CURRILOOP_STUDY_DATA,make=context.window.CurriLoop.study.makeEngine;
const state={ui:{subject:'middle-info',area:'컴퓨팅 시스템',family:'content-system',stage:'practical',retry:true},round:1,progress:{},itemProgress:{}};
const e=make(data,state);e.rebuild();
const line=e.lineMap.get('MI-01-CS-KI-01');
const before=e.selectedSet(line)?.unitIds?.join('|');
assert(before,'baseline practical set missing');
assert(e.stats().total===1,'specific-area content-system practical scope expected one task');
e.next();
const after=e.selectedSet(line)?.unitIds?.join('|');
assert(state.round===2,'normal next() at last task must advance round');
assert(after&&after!==before,'practical set must rotate on naturally advanced round');

console.log(JSON.stringify({
  status:'PASS',
  practicalAutoFlow:'correct task -> 950ms -> normal next()',
  roundAdvanceWithoutManualNextRound:true,
  practicalSetRotates:true,
  bottomAreaNavigation:true,
  specificAreaNavigation:true,
  allAreaQueueNavigation:true
},null,2));

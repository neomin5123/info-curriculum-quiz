import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');

assert(css.includes('#studyPage > .control-card{\n  position:sticky;'),'sticky control card missing');
assert(html.includes('class="task-meta-hidden"'),'redundant task meta not hidden');
assert(html.includes('class="retry-pill"'),'retry pill missing');
assert(html.indexOf('id="nextButton"') < html.indexOf('id="checkButton"'),'bottom order must be previous, next, check, reveal');
assert(html.indexOf('id="checkButton"') < html.indexOf('id="revealButton"'),'check must precede reveal');
assert(app.includes("el.reveal.disabled=!gradable"),'reveal button must be disabled outside cloze');
assert(app.includes("if(state.ui.mode!=='cloze')return;"),'Enter grading must be cloze-only');
assert(app.includes('function updateRetryToggleUI()'),'retry pill state helper missing');
assert(css.includes('.retry-pill.on{'),'retry ON visual state missing');

assert(app.includes("el.areaMemoTab?.addEventListener('pointerdown'"),'memo pointer toggle missing');
assert(css.includes('.area-memo-shell.open,\n.area-memo-shell:hover,\n.area-memo-shell:focus-within{\n  transform:translateX(0)!important;'),
  'memo open transform must override collapsed !important');

assert(app.includes('return `<label class="standard-row standard-typing-row">'),'standard typing row still inherits generic 25px trace grid');
assert(!app.includes('standard-row standard-typing-row cs-input-item cs-typing-item trace-copy-row'),'legacy standard class collision remains');
assert(css.includes('grid-template-columns:86px minmax(0,1fr) 70px!important;'),'standard code layout fix missing');

assert(css.includes('min-height:38px!important;'),'compact typing field height missing');
assert(css.includes('max-width:54rem!important;'),'standard typing width cap missing');

console.log(JSON.stringify({
  status:'PASS',
  stickyControls:true,
  redundantTaskMetaHidden:true,
  retryToggle:'top pill ON/OFF',
  memoOpenImportantOverride:true,
  standardCodeColumnFixed:true,
  compactAnswerFields:true,
  clozeOnlyGradingControls:true
},null,2));

import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');
const app=fs.readFileSync('js/app.js','utf8');
for(const id of ['studyControlCard','mobileControlToggle','studyControlBody','mobileControlSummary']){
  assert(html.includes(`id="${id}"`),`mobile control HTML missing ${id}`);
}
const bodyStart=html.indexOf('id="studyControlBody"');
const bodyEnd=html.indexOf('</section>',bodyStart);
for(const id of ['subjectSelect','areaSelect','familySelect','stageSelect','retryToggle','sourceButton']){
  const pos=html.indexOf(`id="${id}"`);
  assert(pos>bodyStart && pos<bodyEnd,`${id} must stay inside collapsible control body`);
}
assert(css.includes('@media(max-width:760px)'), 'mobile breakpoint missing');
assert(css.includes('.mobile-controls-collapsed .control-card-body'), 'collapsed body rule missing');
assert(css.includes('@media(min-width:761px)'), 'desktop override missing');
assert(css.includes('.control-card-body{display:block!important}'), 'desktop must force control body visible');
for(const token of [
  "MOBILE_CONTROL_STORAGE_KEY='curriloop-mobile-controls-collapsed-v1'",
  "window.matchMedia('(max-width:760px)')",
  'function initMobileControlCollapse()',
  "setAttribute('aria-expanded'",
  'updateMobileControlSummary()',
  "localStorage.setItem(MOBILE_CONTROL_STORAGE_KEY"
])assert(app.includes(token),`mobile collapse logic missing: ${token}`);
assert(app.includes('initSelectors();initMobileControlCollapse();'), 'mobile collapse must initialize after selectors');
console.log(JSON.stringify({status:'PASS',mobileOnly:true,desktopAlwaysExpanded:true,persistentUserChoice:true,scope:'과목→원문 출처'},null,2));

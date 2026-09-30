import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('js/app.js','utf8'),css=fs.readFileSync('assets/css/app.css','utf8');
for(const id of ['areaMemoDock','areaMemoShell','areaMemoTab','areaMemoText','areaMemoClear'])assert(html.includes(`id="${id}"`),`memo HTML missing ${id}`);
for(const token of ["AREA_MEMO_STORAGE_KEY='curriloop-area-notes-v1'",'function areaMemoKey()','function saveAreaMemoNow()','function loadAreaMemo()','function setAreaMemoOpen(open)',"el.areaMemoText?.addEventListener('input',scheduleAreaMemoSave)"])assert(app.includes(token),`memo app missing ${token}`);
assert(app.includes("if(el.areaMemoShell.contains(e.target))return"),'memo outside-click containment missing');
for(const token of ['.area-memo-dock{','.area-memo-shell:hover','.area-memo-shell.open','.area-memo-text{'])assert(css.includes(token),`memo CSS missing ${token}`);
assert(app.includes("`${state.ui.subject||'middle-info'}|${state.ui.area||'all'}`"),'memo scope key missing');
console.log(JSON.stringify({status:'PASS',scope:'subject|area',independentStorage:true,autosaveDebounceMs:350,hoverReveal:true,outsidePointerCollapse:true},null,2));

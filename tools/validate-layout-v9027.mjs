import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');
assert(app.includes('class="cs-cloze-content"'),'dedicated content-system cloze container missing');
assert(app.includes("document.addEventListener('pointerdown'"),'outside pointer close listener missing');
assert(app.includes("if(el.retryDock.contains(e.target))return"),'retry dock containment guard missing');
assert(css.includes('.cs-cloze-content{'),'cloze-content CSS missing');
assert(css.includes('word-break:keep-all'),'Korean keep-all wrapping guard missing');
assert(css.includes('max-width:min(48vw,29rem)!important'),'desktop cloze-width cap missing');
assert(css.includes('display:inline-flex!important'),'inline answer wrapper hardening missing');
console.log(JSON.stringify({status:'PASS',outsidePointerClose:true,koreanWrapGuard:true,dedicatedClozeContainer:true},null,2));

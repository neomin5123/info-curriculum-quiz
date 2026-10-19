import fs from 'node:fs';
const css=fs.readFileSync('assets/css/app.css','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
function ensure(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
ensure(css.includes('body.exam-wide .app-header')&&css.includes('body.exam-wide .app-shell'),'exam-only width override missing');
ensure(css.includes('max-width:none')&&css.includes('clamp(12px, 1.25vw, 24px)'),'viewport width/minimal gutters missing');
ensure(app.includes("document.body.classList.toggle('exam-wide',exam)"),'tab-specific class toggle missing');
ensure(html.includes('id="studyPage"')&&html.includes('id="reviewPage"')&&html.includes('id="examPage"'),'tab structure changed');
ensure(css.includes('.app-shell{max-width:1100px'),'normal app shell max width accidentally removed');
console.log('exam-only wide layout PASS');

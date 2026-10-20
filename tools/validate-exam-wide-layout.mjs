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

// Build 17: toolbar must be relocated into the answer column, with no independent row.
ensure(html.includes('id="examNavigationBar"')&&html.includes('id="examQuestionSelect"'),'question picker shell missing');
ensure(app.includes('sideSlot.appendChild(el.examNavBar)')&&app.includes('class="exam-right-column"'),'question picker not in answer-side column');
ensure(app.includes('class="exam-selected-title"')&&!app.includes('<h3>${esc(q.subject)}</h3>'),'question header still shows redundant subject title');
ensure(css.includes('.exam-side-navigation .exam-navigation-bar')&&css.includes('.exam-two-pane>.exam-right-column'),'compact right-side selector layout missing');
console.log('exam inline picker PASS');

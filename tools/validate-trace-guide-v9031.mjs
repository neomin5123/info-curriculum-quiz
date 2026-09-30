import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8'),css=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['trace-copy-stack','<small class="trace-guide">${esc(it.text)}</small>','trace-guide trace-guide-block','trace-guide trace-guide-list'])assert(app.includes(token),`trace markup missing: ${token}`);
for(const token of ['.trace-copy-stack{','.trace-guide{','font-size:11px;','grid-template-columns:25px minmax(0,1fr) 82px!important;'])assert(css.includes(token),`trace CSS missing: ${token}`);
assert(app.includes('data-answer="${esc(it.text)}"'),'typing answer binding missing');
assert(app.includes("if(field.id==='typingInput'&&task?.type==='line')return task.line.sourceText;"),'single-line typing expected answer changed');
console.log(JSON.stringify({status:'PASS',visual:'small guide above input',gradingSemanticsChanged:false,surfaces:['content-system','standards','whole-group','KI','single-line']},null,2));

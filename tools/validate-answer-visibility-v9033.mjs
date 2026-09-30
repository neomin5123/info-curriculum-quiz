import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8'),css=fs.readFileSync('assets/css/app.css','utf8');
assert((app.match(/trace-answer-textarea/g)||[]).length>=4,'typing textarea conversion incomplete');
assert(app.includes('function resizeAnswerField(field)'), 'resizeAnswerField missing');
assert(app.includes("field.tagName==='TEXTAREA'"),'textarea autogrow missing');
assert(app.includes('Math.min(48,len+1)'), 'inline dynamic width missing');
assert(app.includes('resizeAnswerField(field);field.classList.remove'), 'input-time resize missing');
assert(css.includes('.trace-answer-textarea{'),'typing textarea CSS missing');
assert(css.includes('max-width:min(84vw,46rem)!important;'),'cloze width cap not expanded');
console.log(JSON.stringify({status:'PASS',typingWraps:true,typingAutoGrows:true,inlineDynamicWidth:true},null,2));

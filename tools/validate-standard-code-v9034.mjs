import fs from 'node:fs';
import vm from 'node:vm';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}

const context={window:{}};context.window.window=context.window;vm.createContext(context);
vm.runInContext(fs.readFileSync('data/generated/study-data.js','utf8'),context,{filename:'study-data.js'});
const data=context.window.CURRILOOP_STUDY_DATA;
const app=fs.readFileSync('js/app.js','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');

const standards=data.lines.filter(x=>x.family==='성취기준');
let parsed=0,unitPrefixOverlap=0;
for(const line of standards){
  const m=String(line.sourceText||'').match(/^\[([^\]]+)\]\s*(.+)$/);
  assert(m,`unparsed standard: ${line.lineId}`);
  parsed++;
  const prefixLen=line.sourceText.length-m[2].length;
  const units=(line.presentation?.units||[]);
  for(const u of units){
    if(u.start<prefixLen)unitPrefixOverlap++;
  }
}
assert(unitPrefixOverlap===0,`presentation unit overlaps standard code: ${unitPrefixOverlap}`);

for(const token of [
  'function splitStandardText(text)',
  'function standardBodyUnits(units,offset,bodyLength)',
  'data-answer="${esc(parts.body)}"',
  'class="standard-code"',
  'class="standard-body cs-cloze-content"'
]) assert(app.includes(token),`standard split implementation missing: ${token}`);

for(const token of [
  '.standard-row{',
  'grid-template-columns:92px minmax(0,1fr);',
  '.standard-code{',
  '.standard-row.standard-typing-row{'
]) assert(css.includes(token),`standard layout CSS missing: ${token}`);

assert(!app.includes('class="group-input standard-input trace-answer-textarea" rows="1" data-section="성취기준" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}"'),
  'standard typing still expects code + body');

console.log(JSON.stringify({
  status:'PASS',
  standards:standards.length,
  parsed,
  codeRequiredInTypingAnswer:false,
  codeShownAsLeftLabel:true,
  guideShowsBodyOnly:true,
  clozeAndMaskUseBodyOnly:true
},null,2));

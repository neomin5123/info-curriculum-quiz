import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=fs.readFileSync('js/app.js','utf8');
const gradingCode=fs.readFileSync('js/core/grading.js','utf8');
const context={window:{CurriLoop:{}}};vm.runInNewContext(gradingCode,context);
const grading=context.window.CurriLoop.grading;
const raw=app.match(/const curatedExplanationClozePhrases\s*=\s*(\{[\s\S]*?\});\nfunction explanationClozeUnits/);
assert(raw,'curated phrase registry missing');
const curated=JSON.parse(raw[1]);
const dataText=fs.readFileSync('data/generated/study-data.js','utf8');
const data=JSON.parse(dataText.slice(dataText.indexOf('=')+1).trim().replace(/;$/,''));
const byId=new Map(data.lines.map(x=>[x.lineId,x]));
const start=app.indexOf('function inputRows('),end=app.indexOf('\nfunction valueAttitudeWholeCue(',start);
assert(start>=0&&end>start);
const fn=app.slice(start,end);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderWithSpans(text,units,replacer){let out='',cursor=0;units.forEach((u,i)=>{out+=esc(text.slice(cursor,u.start))+replacer(u,i);cursor=u.end;});return out+esc(text.slice(cursor));}
let total=0;let tested=0;
for(const [id,phrases] of Object.entries(curated)){
 const line=byId.get(id);assert(line,`missing source: ${id}`);
 const source=line.sourceText;
 let units=[];
 for(const phrase of phrases){const start=source.indexOf(phrase);assert(start>=0,`phrase missing: ${id} ${phrase}`); const end=start+phrase.length;assert(!units.some(u=>start<u.end&&end>u.start),`overlap: ${id}`); units.push({start,end,text:phrase});}
 units.sort((a,b)=>a.start-b.start);
 const sandbox={esc,renderWithSpans,explanationClozeUnits:()=>units,sourceItems:items=>items.map(i=>esc(i.text)).join('')};
 vm.runInNewContext(fn,sandbox);
 const it={lineId:id,text:source};
 const html=sandbox.inputRows([it],'해설','cloze');
 const matches=[...html.matchAll(/class="inline-input semantic-inline-input"[^>]*data-answer="([^"]+)"/g)];
 assert.equal(matches.length,units.length,`count mismatch ${id}`);
 for(let i=0;i<units.length;i++){
  const got=matches[i][1].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  assert.equal(got,units[i].text,`answer mismatch ${id}`);
  assert.equal(grading.classifyDetailed(got,got).status,'correct');
  assert.equal(grading.classifyDetailed('',got).status,'unknown');
  assert.equal(grading.classifyDetailed('zzzz-invalid-input',got).status,'wrong');
  tested++;
 }
 const reconstructed=html.replace(/<input class="inline-input semantic-inline-input"[^>]*>/g,'').replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 const remaining=units.reduceRight((text,u)=>text.slice(0,u.start)+text.slice(u.end),source);
 assert(reconstructed.includes(remaining),`visible context mismatch ${id}`);
 const mask=sandbox.inputRows([it],'해설','mask');assert.equal((mask.match(/class="mask" data-reveal/g)||[]).length,units.length);
 const typing=sandbox.inputRows([it],'해설','typing');assert(typing.includes('trace-answer-textarea'));assert(typing.includes('data-answer='));
 total++;
}
assert.equal(total,54);assert.equal(tested,136);
console.log(`Build48 render-to-grade integration PASS: ${total} rows / ${tested} answers, correct/blank/wrong, mask and typing contracts`);

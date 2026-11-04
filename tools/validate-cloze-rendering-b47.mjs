import fs from 'node:fs';import assert from 'node:assert/strict';
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes("const semantic=['해설','고려사항','적용 시 고려 사항'].includes(prefix)"));
assert(app.includes("if(semantic&&['mask','cloze'].includes(mode))"));
assert(app.includes('semantic-inline-input'));
assert(app.includes('data-answer="${esc(u.text)}"'));
const m=app.match(/const curatedExplanationClozePhrases\s*=\s*(\{[\s\S]*?\});\nfunction explanationClozeUnits/);
assert(m,'curated phrase registry not found');
const curated=JSON.parse(m[1]);
const dataText=fs.readFileSync('data/generated/study-data.js','utf8');
const data=JSON.parse(dataText.slice(dataText.indexOf('=')+1).trim().replace(/;$/,''));
const map=new Map(data.lines.map(x=>[x.lineId,x.sourceText]));
let count=0,errors=[];
for(const [id,phrases] of Object.entries(curated)){
 const t=map.get(id);if(!t){errors.push(`${id}: not found`);continue;}
 let spans=[];for(const phrase of phrases){const start=t.indexOf(phrase);if(start<0){errors.push(`${id}: missing ${phrase}`);continue;}
 const end=start+phrase.length;if(spans.some(([a,b])=>start<b&&end>a))errors.push(`${id}: overlapping ${phrase}`);
 if(phrase.length===t.length)errors.push(`${id}: full paragraph hidden`);
 spans.push([start,end]);count++;}
 if(!spans.length)errors.push(`${id}: no blanks`);
}
assert.equal(errors.length,0,errors.join('\n'));
console.log(`Build47 semantic rendered-input contract PASS: ${Object.keys(curated).length} curated entries, ${count} source-anchored phrases`);

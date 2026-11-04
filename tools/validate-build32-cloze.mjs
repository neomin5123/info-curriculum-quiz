import fs from 'node:fs';import assert from 'node:assert/strict';
const app=fs.readFileSync('js/app.js','utf8');
const data=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const review=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-32-semantic-cloze-review.json','utf8'));
assert.equal(review.items.length,54);
const map=new Map(data.lines.map(x=>[x.lineId,x.sourceText]));
for(const item of review.items){
 assert.equal(item.source,map.get(item.id));assert(item.blanks.length>=1&&item.blanks.length<=4);
 let last=0;for(const u of item.blanks){assert(u.start>=last);assert(u.end<=item.source.length);assert.equal(item.source.slice(u.start,u.end),u.text);assert(u.end-u.start<39);last=u.end;}
}
assert(app.includes('curatedExplanationClozePhrases[item.lineId]'));
assert(app.includes("if(mode==='source')return sourceItems(items,false)"));
assert(app.includes("mode==='typing'"));
assert(app.includes('data-answer="${esc(u.text)}"'));
console.log('Build32 semantic cloze: 54 records, intact original text, bounded nonoverlapping answers PASS');

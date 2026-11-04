import fs from 'node:fs';import assert from 'node:assert/strict';
const app=fs.readFileSync('js/app.js','utf8');const m=app.match(/const CLOZE46_OVERRIDES=(\{.*?\});\nfor\(const line of DATA\.lines\)/s);assert(m);const changes=JSON.parse(m[1]);assert.equal(Object.keys(changes).length,10);
const source=JSON.parse(fs.readFileSync('data/generated/study-data.js','utf8').split('=',2).slice(1).join('=').trim().replace(/;$/,''));
for(const [id,d] of Object.entries(changes)){const l=source.lines.find(x=>x.lineId===id);assert(l);for(let i=0;i<d.units.length;i++){const u=d.units[i];assert.equal(l.sourceText.slice(u.start,u.end),u.text);if(i)assert(d.units[i-1].end<=u.start)}for(const set of [...d.coreSets,...d.practicalSets])for(const key of set.unitIds)assert(d.units.some(u=>u.unitId===key));}
console.log('Build46 semantic cloze source + linkage PASS');

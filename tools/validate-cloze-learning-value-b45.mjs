import fs from 'node:fs';import assert from 'node:assert/strict';
const app=fs.readFileSync('js/app.js','utf8');const m=app.match(/const CLOZE45_OVERRIDES=(\{.*?\});\nfor\(const line of DATA\.lines\)/s);assert(m);const ov=JSON.parse(m[1]);assert.equal(Object.keys(ov).length,5);
const st=fs.readFileSync('data/generated/study-data.js','utf8');const data=JSON.parse(st.slice(st.indexOf('=')+1).trim().replace(/;$/,''));
for(const [id,p] of Object.entries(ov)){const l=data.lines.find(x=>x.lineId===id);assert(l);for(let i=0;i<p.units.length;i++){const u=p.units[i];assert.equal(l.sourceText.slice(u.start,u.end),u.text);if(i)assert(p.units[i-1].end<=u.start)}for(const set of [...p.coreSets,...p.practicalSets])for(const key of set.unitIds)assert(p.units.some(u=>u.unitId===key));}
assert(!ov['HI-03-AC-ST-09'].units.some(u=>u.text==='문제 해결'));assert(!ov['MI-03-AC-EX-01'].units.some(u=>u.text.includes('효과적이고')));console.log('Build45 targeted learning-value checks PASS');

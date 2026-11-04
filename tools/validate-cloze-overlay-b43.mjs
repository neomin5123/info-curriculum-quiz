import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const script=fs.readFileSync('js/app.js','utf8');
const m=script.match(/const CLOZE43_OVERRIDES=(\{.*?\});\nfor\(const line of DATA\.lines\)/s);
assert(m,'UI overlay missing');
const overrides=JSON.parse(m[1]);
assert(Object.keys(overrides).length>=10);
for(const [lineId,p] of Object.entries(overrides)){
 const line=root.lines.find(x=>x.lineId===lineId);
 assert(line,'unknown line');
 let prev=0;
 for(const u of p.units){
  assert(u.start>=prev,'overlap '+lineId);
  assert.equal(line.sourceText.slice(u.start,u.end),u.text);
  prev=u.end;
 }
 for(const set of [...p.coreSets,...p.practicalSets]){
  assert(set.unitIds.every(id=>p.units.some(u=>u.unitId===id)),'dangling id '+lineId);
 }
}
assert.deepEqual(overrides['HI-04-CS-PF-01'].units.map(x=>x.text),['지능 에이전트']);
assert.equal(root.lines.reduce((s,x)=>s+(x.presentation?.units?.length||0),0),370);
console.log('Build43 UI cloze correction: '+Object.keys(overrides).length+' lines / frozen baseline intact PASS');

import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const src=fs.readFileSync('js/app.js','utf8');
const m=src.match(/const CLOZE44_OVERRIDES=(\{.*?\});\nfor\(const line of DATA\.lines\)/s);
assert(m,'Build44 overrides not linked to DATA');
const ov=JSON.parse(m[1]);assert.equal(Object.keys(ov).length,11);
const study=fs.readFileSync('data/generated/study-data.js','utf8');const data=JSON.parse(study.slice(study.indexOf('=')+1).trim().replace(/;$/,''));
for(const [id,p] of Object.entries(ov)){
 const line=data.lines.find(x=>x.lineId===id);assert(line,id);
 assert.equal(p.units.length,2,id);
 for(const unit of p.units){assert.equal(line.sourceText.slice(unit.start,unit.end),unit.text,id);assert(unit.text.trim()===unit.text,id)}
 assert(p.units[0].end<=p.units[1].start,id);
 for(const set of [...p.coreSets,...p.practicalSets])for(const unitId of set.unitIds)assert(p.units.some(u=>u.unitId===unitId),id);
}
console.log('Build44: 11 source-anchored overlays, 22 atomic blanks, active renderer link PASS');

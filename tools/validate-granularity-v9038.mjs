import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
let units=0,bOnly=0,shortB=0,missing=0,invalid=0,overlap=0;
for(const line of data.lines){
  const p=line.presentation;if(!p)continue;
  units+=p.units.length;
  const km=new Map(line.keywords.map(k=>[k.keywordId,k]));
  const covered=new Set();
  const sorted=[...p.units].sort((a,b)=>a.start-b.start||a.end-b.end);
  for(let i=0;i<sorted.length;i++){
    const u=sorted[i];
    if(new Set(u.stage3RGrades||[]).size===1 && (u.stage3RGrades||[])[0]==='B'){
      bOnly++;
      if(String(u.text||'').replace(/\s/g,'').length<=3)shortB++;
    }
    if(!Array.isArray(u.sourceKeywordIds)||!u.sourceKeywordIds.length||u.sourceKeywordIds.some(id=>!km.has(id)))invalid++;
    for(const id of u.sourceKeywordIds||[])covered.add(id);
    if(i&&sorted[i-1].end>u.start)overlap++;
    assert(line.sourceText.slice(u.start,u.end)===u.text,`source-faithful presentation mismatch ${line.lineId} ${u.unitId}`);
  }
  if(line.family!=='지식·이해')for(const k of line.keywords){if(k.active&&!covered.has(k.keywordId))missing++;}
  for(const set of [...(p.coreSets||[]),...(p.practicalSets||[])]){
    assert((set.unitIds||[]).every(id=>p.units.some(u=>u.unitId===id)),`stale unit ref ${line.lineId} ${set.setId}`);
    assert((set.unitIds||[]).length<=3,`practical/core set too large ${line.lineId} ${set.setId}`);
  }
}
assert(data.lines.length===270,'official line count changed');
assert(missing===0,`active non-KN presentation coverage missing: ${missing}`);
assert(invalid===0,`presentation units without policy keyword mapping: ${invalid}`);
assert(overlap===0,`overlapping presentation units: ${overlap}`);
assert(shortB<=2,`too many <=3-char B-only fragments: ${shortB}`);
console.log(JSON.stringify({status:'PASS',officialLines:data.lines.length,presentationUnits:units,bOnlyUnits:bOnly,shortBFragments:shortB,missingActiveAtoms:missing,invalidMappings:invalid,overlap},null,2));

import fs from 'node:fs';
import crypto from 'node:crypto';
const d=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const fail=[];
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const sourceHash=hash(d.lines.map(l=>[l.lineId,l.sourceText]));
const policyHash=hash(d.lines.map(l=>[l.lineId,l.keywords.map(k=>[k.keywordId,k.text,k.start,k.end,!!k.active,k.stage3RGrades||[],k.canonicalAtomIds||[],k.importance])]))
const sSig=d.lines.flatMap(l=>(l.presentation?.units||[]).filter(u=>(u.stage3RGrades||[]).includes('S')).map(u=>[l.lineId,u.text,u.start,u.end,u.sourceKeywordIds,u.stage3RGrades]));
const sHash=hash(sSig);
if(sourceHash!=='a1da9c9decf6dce91affadf05f0d14a296613b5026f7a870c54f345dc602fc95')fail.push(`official source hash changed ${sourceHash}`);
if(policyHash!=='fb07736cacfa2f967a8b88e41c1db7934811dc51b13014da1fea1afb31a6afa3')fail.push(`frozen keyword policy hash changed ${policyHash}`);
if(sSig.length!==30||sHash!=='5cfa1be81ad2c38cb068ddbae1204abca4378651fddb008a9b21229597fbcebd')fail.push(`S exact presentation changed count=${sSig.length} hash=${sHash}`);
let units=0,missingCoverage=0,unsupported=0,invalidRefs=0,overlaps=0;
const gradeOrder=['S','A','B','C','X'];
for(const l of d.lines){
  if(l.family==='지식·이해')continue;
  const pr=l.presentation;
  if(!pr){fail.push(`presentation missing ${l.lineId}`);continue;}
  const km=new Map(l.keywords.map(k=>[k.keywordId,k]));
  const covered=new Set();
  const ordered=[...pr.units].sort((a,b)=>a.start-b.start);
  units+=ordered.length;
  for(const u of ordered){
    if(l.sourceText.slice(u.start,u.end)!==u.text)fail.push(`source mismatch ${l.lineId}:${u.text}`);
    if(!u.sourceKeywordIds?.length){unsupported++;fail.push(`policyless presentation unit ${l.lineId}:${u.text}`);continue;}
    const grades=[];
    for(const kid of u.sourceKeywordIds){
      const k=km.get(kid);
      if(!k||!k.active){invalidRefs++;fail.push(`invalid/inactive sourceKeywordId ${l.lineId}:${kid}`);continue;}
      covered.add(kid); grades.push(...(k.stage3RGrades||[]));
    }
    const expected=[...new Set(grades)].sort((a,b)=>gradeOrder.indexOf(a)-gradeOrder.indexOf(b));
    const actual=[...(u.stage3RGrades||[])].sort((a,b)=>gradeOrder.indexOf(a)-gradeOrder.indexOf(b));
    if(JSON.stringify(expected)!==JSON.stringify(actual))fail.push(`grade mapping mismatch ${l.lineId}:${u.text}`);
  }
  for(let i=1;i<ordered.length;i++)if(ordered[i-1].end>ordered[i].start){overlaps++;fail.push(`overlap ${l.lineId}`);}
  for(const k of l.keywords){
    if(k.active&&!covered.has(k.keywordId)){missingCoverage++;fail.push(`active keyword uncovered ${l.lineId}:${k.keywordId}:${k.text}`);}
  }
  if(pr.practicalSets.length>4)fail.push(`practical set cap ${l.lineId}`);
  const um=new Set(pr.units.map(u=>u.unitId));
  for(const s of [...pr.coreSets,...pr.practicalSets]){
    if(s.blankCount>3)fail.push(`4+ blank set ${s.setId}`);
    if(s.blankCount!==s.unitIds.length)fail.push(`blankCount mismatch ${s.setId}`);
    for(const id of s.unitIds)if(!um.has(id))fail.push(`broken unit ref ${s.setId}:${id}`);
  }
}
if(units!==370)fail.push(`presentation unit count ${units} != 370`);
if(d.metadata.presentationLayer!=='v9.0.38')fail.push(`presentationLayer ${d.metadata.presentationLayer}`);
if(fail.length){console.error(fail.join('\n'));process.exit(1);}
console.log(JSON.stringify({status:'PASS',presentationUnits:units,missingCoverage,unsupported,invalidRefs,overlaps,sExactUnits:sSig.length,sourceHash,policyHash,sHash},null,2));

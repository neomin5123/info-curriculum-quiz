import fs from 'node:fs';
const p='data/curriculum/middle-high-v9.0.6.json';
const d=JSON.parse(fs.readFileSync(p,'utf8'));
const fail=[]; const lineIds=new Set();
if(d.lines.length!==270)fail.push(`official line count ${d.lines.length} != 270`);
for(const l of d.lines){
  if(lineIds.has(l.lineId))fail.push(`duplicate lineId ${l.lineId}`); lineIds.add(l.lineId);
  const km=new Map(l.keywords.map(k=>[k.keywordId,k]));
  for(const k of l.keywords){
    if(k.active&&!l.sourceText.includes(k.text))fail.push(`legacy target not in source ${l.lineId}:${k.text}`);
    const gs=k.stage3RGrades||[];
    if(k.active&&gs.length&&gs.every(g=>g==='C'||g==='X'))fail.push(`C/X-only legacy active ${l.lineId}:${k.text}`);
  }
  for(const s of [...l.coreSets,...l.practicalSets]){
    if(s.blankCount>=4)fail.push(`legacy 4+ blanks ${s.setId}`);
    for(const id of s.keywordIds)if(!km.has(id))fail.push(`broken legacy set ref ${s.setId}:${id}`);
  }
  if(l.family!=='지식·이해'){
    const pr=l.presentation;
    if(!pr)fail.push(`presentation missing ${l.lineId}`);
    else{
      const um=new Map(pr.units.map(u=>[u.unitId,u]));
      for(const u of pr.units){
        if(l.sourceText.slice(u.start,u.end)!==u.text)fail.push(`presentation source mismatch ${l.lineId}:${u.text}`);
      }
      if(pr.practicalSets.length>4)fail.push(`presentation practical cap ${l.lineId}:${pr.practicalSets.length}`);
      for(const s of [...pr.coreSets,...pr.practicalSets]){
        if(s.blankCount>=4)fail.push(`presentation 4+ blanks ${s.setId}`);
        const chosen=[];
        for(const id of s.unitIds){if(!um.has(id))fail.push(`broken presentation ref ${s.setId}:${id}`);else chosen.push(um.get(id));}
        chosen.sort((a,b)=>a.start-b.start);
        for(let i=1;i<chosen.length;i++)if(chosen[i-1].end>chosen[i].start)fail.push(`presentation overlap ${s.setId}`);
      }
    }
  }
}
const ki=d.lines.filter(l=>l.family==='지식·이해');
const grouped=(d.knowledgeUnderstandingGroups||[]).flatMap(g=>g.items);
const groupedIds=new Set(grouped.map(x=>x.lineId));
if(ki.length!==32)fail.push(`KI line count ${ki.length} != 32`);
if(grouped.length!==32)fail.push(`KI grouped item count ${grouped.length} != 32`);
for(const l of ki){if(!groupedIds.has(l.lineId))fail.push(`KI missing group ${l.lineId}`);if(!l.presentationOverride?.suppressIndividualClozeInMainStudy)fail.push(`KI suppression missing ${l.lineId}`);}
for(const g of d.knowledgeUnderstandingGroups||[]){
  const texts=g.items.map(x=>x.text);
  if(new Set(texts).size!==texts.length)fail.push(`duplicate KI answer ${g.groupId}`);
  if(g.itemCount!==g.items.length)fail.push(`bad KI count ${g.groupId}`);
  if(g.itemCount<2||g.itemCount>7)fail.push(`unexpected KI group size ${g.groupId}:${g.itemCount}`);
}
if(fail.length){console.error(fail.join('\n'));process.exit(1);}
const pu=d.lines.filter(l=>l.family!=='지식·이해').flatMap(l=>l.presentation.units);
console.log(JSON.stringify({status:'PASS',lines:d.lines.length,kiLines:ki.length,kiGroups:d.knowledgeUnderstandingGroups.length,presentationUnits:pu.length,version:d.metadata.version},null,2));

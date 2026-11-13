import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const base=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const ai=JSON.parse(fs.readFileSync('data/curriculum/ai-basic-2022.json','utf8'));
const ds=JSON.parse(fs.readFileSync('data/curriculum/data-science-2022-PREVIEW.json','utf8'));
const sourceFiles=[base,ai,ds];
const combined={...base, lines:sourceFiles.flatMap(x=>x.lines), knowledgeUnderstandingGroups:sourceFiles.flatMap(x=>x.knowledgeUnderstandingGroups)};
const seenIds=new Set(),setIds=new Set(),unitIds=new Set();let count=0,sets=0,structuralChecks=0;
for(const l of combined.lines){
  assert(!seenIds.has(l.lineId),`duplicate id ${l.lineId}`);seenIds.add(l.lineId);
  for(const u of l.presentation?.units||[]){
    assert(!unitIds.has(u.unitId),`duplicate unitId ${u.unitId}`);unitIds.add(u.unitId);
    assert.equal(l.sourceText.slice(u.start,u.end),u.text,`unit span ${u.unitId}`);
    count++; structuralChecks++;
  }
  const um=new Map((l.presentation?.units||[]).map(u=>[u.unitId,u]));
  const sorted=[...um.values()].sort((a,b)=>a.start-b.start);
  for(let i=1;i<sorted.length;i++)assert(sorted[i-1].end<=sorted[i].start,`overlap ${l.lineId}`);
  for(const s of [...l.presentation?.coreSets||[],...l.presentation?.practicalSets||[]]){
    assert(!setIds.has(s.setId),`duplicate set ${s.setId}`);setIds.add(s.setId);
    assert.equal(s.unitIds.length,s.blankCount,`blank count ${s.setId}`);
    assert(s.unitIds.length>0&&s.unitIds.length<=3,`invalid set count ${s.setId}`);
    for(const id of s.unitIds)assert(um.has(id),`missing unit ${s.setId}:${id}`);
    sets++;structuralChecks++;
  }
}
assert.equal(combined.lines.length,449);
assert.equal(count,577);
assert.equal(combined.lines.filter(l=>l.family==='성취기준').length,86);
assert.equal(combined.lines.filter(l=>l.family==='과정·기능').length,59);
const ctx={window:{}};
for(const file of ['data/generated/study-data.js','data/generated/ai-basic-data.js','data/generated/data-science-data.js']){
  vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
}
assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.CURRILOOP_STUDY_DATA)),base);
assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.CURRILOOP_AI_BASIC_DATA)),ai);
// data science global name may differ in the original; verify source rather than guessing
const dsName=Object.keys(ctx.window).find(k=>k.includes('DATA_SCIENCE'));
assert(dsName, 'no data-science global');
assert.deepEqual(JSON.parse(JSON.stringify(ctx.window[dsName])),ds);
vm.runInNewContext(fs.readFileSync('js/core/study-engine.js','utf8'),ctx);
const make=ctx.window.CurriLoop.study.makeEngine;
const state=(subject,area,family,stage)=>({ui:{subject,area,family,stage,retry:false,mode:'cloze'},round:1});
for(const subj of ['middle-info','high-info','ai-basic','data-science']){
  const eng=make(combined,state(subj,'all','standards','whole'));eng.rebuild();
  assert(eng.queue.length>0,`standards queue missing for ${subj}`);
}
for(const target of [
 ['MI-TE-EVD-01','컴퓨팅 사고력'],['HI-TE-EVD-01','컴퓨팅 사고력'],
 ['MI-01-AC-CO-04','기초적인 프로그래밍 역량'],
 ['HI-02-AC-CO-02','센서 데이터 수집'],['HI-02-AC-CO-02','공공 데이터나 민간 데이터'],
 ['HI-04-AC-CO-01','자동화하기 어려웠던 문제'],
 ['HI-05-CS-VA-02','정보 보호 및 보안'],
 ['MI-03-AC-CO-03','‘컴퓨팅 시스템’ 영역과 연계'],
 ]){
 const l=combined.lines.find(x=>x.lineId===target[0]);assert(l,`missing ${target[0]}`);
 assert(l.presentation.units.some(u=>u.text===target[1]),`not displayed ${target[0]}`);
}
for(const subj of ['middle-info','high-info','ai-basic']){
 const engine=make(combined,state(subj,'all','teaching-eval','whole'));engine.rebuild();
 assert(engine.queue.length>0,`missing common teaching-eval ${subj}`);
}
const aiProj=combined.lines.find(l=>l.lineId==='AI-22-PJ-AT-02');
assert.deepEqual(aiProj.presentation.units.map(u=>u.text),['협력적으로']);
assert(aiProj.presentation.coreSets.length&&aiProj.presentation.practicalSets.length);
const report={status:'PASS',lines:combined.lines.length,activePresentationUnits:count,sets,structuralChecks,
 idUniqueness:seenIds.size,subjects:4,editsVerified:8,aiProjectAttitudeRecalledInCoreAndPractical:true};
console.log(JSON.stringify(report,null,2));

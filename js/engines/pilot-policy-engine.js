(function(root,factory){
  const cfg=(typeof module==='object'&&module.exports)?require('../../data/learning-aids/pilot-policy.js'):root?.CURRILOOP_PILOT_POLICY;
  const repair=(typeof module==='object'&&module.exports)?require('../../data/learning-aids/policy-repair.js'):root?.CURRILOOP_POLICY_REPAIR;
  const api=factory(cfg,repair);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CurriLoopPilotPolicyEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Config,Repair){'use strict';
const tasks=Config?.tasks||[];const byId=new Map(tasks.map(x=>[x.canonicalAtomId,x]));const byOwner=new Map();tasks.forEach(t=>{if(!byOwner.has(t.ownerLineId))byOwner.set(t.ownerLineId,[]);byOwner.get(t.ownerLineId).push(t);});
const req=Repair?.gradingRequirements||{};const legacyMap=new Map((Repair?.legacyGapMap||[]).map(x=>[[x.subject,x.lineId,x.gapId].join('|'),x]));
function normalize(v){return String(v||'').normalize('NFKC').replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g,'').toLowerCase();}
function isPilotSubject(s){return (Config?.pilotSubjects||[]).includes(String(s||''));}
function tasksForLine(lineId){return (byOwner.get(String(lineId||''))||[]).filter(t=>t.grade!=='X');}
function allTasksForSubject(s){return tasks.filter(t=>(t.subjects||[t.subject]).includes(s)&&t.grade!=='X');}
function gradeOf(id){return byId.get(id)?.grade||'';}function lineWorkload(lineId){return Number(Config?.lineWorkload?.[lineId]||0);}
function taskKind(g){return g==='S'?'exact-production':g==='A'?'structured-production':g==='B'?'meaning-production':g==='C'?'recognition':'inactive';}
function aliasHit(answer,aliases){const n=normalize(answer);return !!n&&(aliases||[]).some(a=>{const x=normalize(a);return !!x&&(n===x||n.includes(x));});}
function coverage(answer,units){const hits=(units||[]).map(u=>aliasHit(answer,u.aliases||[]));return {hits:hits.filter(Boolean).length,total:hits.length,detail:hits};}
function gradeProduction(taskOrId,answer){const task=typeof taskOrId==='string'?byId.get(taskOrId):taskOrId;if(!task)return {ok:false,reason:'missing-task'};const n=normalize(answer);if(!n)return {ok:false,reason:'empty'};const exactSurface=[...(task.surfaceLabels||[]),task.label].filter(Boolean).some(x=>normalize(x)===n);
  if(task.grade==='S'){const targets=[...(task.surfaceLabels||[]),task.label].filter(Boolean);return {ok:targets.some(x=>normalize(x)===n),reason:'exact-production'};}
  if(task.grade==='A'){if(exactSurface)return {ok:true,reason:'structured-production-exact-valid'};const r=req[task.canonicalAtomId];const units=r?.requiredComponents||[];const c=coverage(answer,units);const min=Math.max(1,Number(r?.minRequired||units.length||1));return {ok:c.hits>=min,reason:'structured-production',coverage:c,minRequired:min};}
  if(task.grade==='B'){if(exactSurface)return {ok:true,reason:'meaning-production-exact-valid'};const r=req[task.canonicalAtomId];const units=r?.meaningUnits||[];const c=coverage(answer,units);const min=Math.max(1,Number(r?.minRequired||1));return {ok:c.hits>=min,reason:'meaning-production',coverage:c,minRequired:min};}
  return {ok:false,reason:'not-production'};
}
function gradeTask(taskOrId,answer){const task=typeof taskOrId==='string'?byId.get(taskOrId):taskOrId;if(!task)return {ok:false,reason:'missing-task'};if(task.grade==='X')return {ok:false,reason:'inactive'};if(task.grade==='C')return {ok:normalize(answer)===normalize(task.label),reason:'recognition'};return gradeProduction(task,answer);}
function legacyGapMapping(subject,lineId,gapId){return legacyMap.get([subject,lineId,gapId].join('|'))||null;}
function legacyGapCount(canonicalAtomId){return Number(Repair?.legacyGapCounts?.[canonicalAtomId]||0);}
function gradingRequirement(canonicalAtomId){return req[canonicalAtomId]||null;}
function legacyMigrationSeed(canonicalAtomId,records,now=Date.now()){const grade=gradeOf(canonicalAtomId);if(!grade||grade==='X')return null;const list=Array.isArray(records)?records:[];const expected=Math.max(1,legacyGapCount(canonicalAtomId));const uniqueGapIds=[...new Set(list.map(r=>r.gapId).filter(Boolean))];const allMastered=uniqueGapIds.length>=expected&&list.length>0&&list.every(r=>Boolean(r.item?.mastered));const lastSeenAt=Math.max(0,...list.map(r=>Number(r.item?.lastSeenAt||0)));const lastSuccessAt=Math.max(0,...list.map(r=>Number(r.item?.lastSuccessAt||0)));const seed={correctCount:0,nearCount:0,unknownCount:0,wrongCount:0,correctStreak:0,mastered:false,nextReviewAt:0,lastSeenAt,lastSuccessAt:0,lastResult:'legacy-migrated',legacyMigration:{version:1,confidence:'deterministic-derived',mappedGapIds:uniqueGapIds,recordCount:list.length,allMappedMastered:allMastered}};if(grade==='C'&&allMastered){seed.correctCount=1;seed.correctStreak=2;seed.mastered=true;seed.lastSuccessAt=lastSuccessAt||lastSeenAt;seed.nextReviewAt=Math.min(...list.map(r=>Number(r.item?.nextReviewAt||0)).filter(v=>v>0).concat([now+86400000]));seed.lastResult='legacy-recognition-preserved';}return seed;}
return {config:Config,repair:Repair,isPilotSubject,tasksForLine,allTasksForSubject,gradeOf,lineWorkload,taskKind,normalize,gradeTask,gradeProduction,gradingRequirement,legacyGapMapping,legacyGapCount,legacyMigrationSeed};
});

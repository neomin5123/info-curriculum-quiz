'use strict';
const assert=require('assert'); const P=require('../../js/engines/pilot-policy-engine.js');
assert.deepStrictEqual(P.config.pilotSubjects,['middle-info','high-info','ai-basic','data-science','info-science','software-life']);
for(const s of P.config.pilotSubjects){
 const all=P.config.tasks.filter(t=>(t.subjects||[t.subject]).includes(s)); const active=P.allTasksForSubject(s);
 assert(active.every(t=>t.grade!=='X')); assert(all.filter(t=>t.grade==='X').every(t=>!active.some(a=>a.canonicalAtomId===t.canonicalAtomId)));
 const ids=active.map(t=>t.canonicalAtomId); assert.strictEqual(ids.length,new Set(ids).size,'canonical duplicate active task');
 for(const t of active){assert.strictEqual(P.taskKind(t.grade),t.grade==='S'?'exact-production':t.grade==='A'?'structured-production':t.grade==='B'?'meaning-production':'recognition');}
}
console.log('Stage5 pilot policy QA: OK',Object.fromEntries(P.config.pilotSubjects.map(s=>[s,P.allTasksForSubject(s).length])));

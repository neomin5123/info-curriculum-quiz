'use strict';
const assert=require('assert');const P=require('../../js/engines/pilot-policy-engine.js');const L=require('../../js/engines/learning-engine.js');
const subjects=['middle-info','high-info','ai-basic','data-science','info-science','software-life'];
assert.deepStrictEqual(P.config.pilotSubjects,subjects);assert.equal(P.config.tasks.length,1765);assert.equal(P.config.tasks.filter(t=>t.grade!=='X').length,1297);
const ids=P.config.tasks.map(t=>t.canonicalAtomId);assert.equal(ids.length,new Set(ids).size,'global canonical task must be unique');
for(const t of P.config.tasks){assert(['S','A','B','C','X'].includes(t.grade));assert(t.sourceLineIds.length>0);if(t.grade==='C')assert((t.choices||[]).length>=2);if(t.grade==='X')assert(!P.tasksForLine(t.ownerLineId).some(x=>x.canonicalAtomId===t.canonicalAtomId));}
assert.deepStrictEqual(L.REVIEW_INTERVALS,[1,3,7,14,30,60]);
console.log('Stage6 full policy rollout QA: OK',Object.fromEntries(subjects.map(s=>[s,P.allTasksForSubject(s).length])));
const fs=require('fs'),path=require('path');const app=fs.readFileSync(path.resolve(__dirname,'../../js/app.js'),'utf8');
assert(app.includes('if (window.CurriLoopPilotPolicyEngine?.isPilotSubject?.(subjectKey)) return false;'),'legacy gap mastery must retire for policy subjects');
assert(app.includes('pilot|canonical|'),'canonical mastery key required');

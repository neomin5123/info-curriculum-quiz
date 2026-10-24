import fs from 'node:fs';
import crypto from 'node:crypto';
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-08-logic-independent-review.json','utf8'));
const changes=audit.changeAllowlist;
// Build 11 fixes a genuine SPN scheduling mistake; project historical hashes remain immutable.
const osAudit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-11-os-independent-review.json','utf8'));
const osChanges=osAudit.changeAllowlist;
function beforeOsReview(q){
 const c=osChanges[q.id];if(!c)return q;
 if(hash(q.answer)!==c.newAnswerSha256||hash(q.solution)!==c.newSolutionSha256)throw Error('OS review correction changed: '+q.id);
 return {...q,answer:c.oldAnswer,solution:c.oldSolution};
}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
export function legacyAnswerForHistoricalChecks(q){
 q=beforeOsReview(q);
 const c=changes[q.id]; if(!c)return q.answer;
 if(hash(q.answer)!==c.newAnswerSha256||hash(q.solution)!==c.newSolutionSha256)throw Error('Review correction changed: '+q.id);
 return c.oldAnswer;
}
export function legacySolutionForHistoricalChecks(q){
 q=beforeOsReview(q);
 const c=changes[q.id]; if(!c)return q.solution;
 if(hash(q.answer)!==c.newAnswerSha256||hash(q.solution)!==c.newSolutionSha256)throw Error('Review correction changed: '+q.id);
 return c.oldSolution;
}

import {legacyAnswerForHistoricalChecks} from './legacy-review-corrections.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const must=(v,m)=>{if(!v)throw Error('algorithm-review: '+m);};
const exam=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-07-algorithms-independent-review.json','utf8'));
const traces=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-07-algorithm-executable-checks.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-05-231-second-pass-audit.json','utf8'));
const subject=exam.questions.filter(q=>q.subject==='자구알고');
must(subject.length===31&&audit.entries.length===31&&exam.questions.length===269,'corpus count');
must(traces.allPass===true&&traces.checks===41,'numeric checks');
must(Object.values(traces.results).length===41&&Object.values(traces.results).every(c=>c.pass===true),'numeric check content');
const qmap=new Map(subject.map(q=>[q.id,q]));const seen=new Set();let conditional=0;
for(const e of audit.entries){
 must(!seen.has(e.id),'duplicate '+e.id);seen.add(e.id);
 const q=qmap.get(e.id);must(q?.solutionStatus==='solved','missing solved '+e.id);
 must(e.matchesStoredCoreAnswer===true&&e.answerStringChanged===false&&e.officialAnswerConfirmed===false,'review claims '+e.id);
 must(e.independentlyDerivedResult?.trim()&&e.recomputationEvidence?.trim(),'empty analysis '+e.id);
 must(e.imageSegments===q.images.length&&JSON.stringify(e.originalSourcePages)===JSON.stringify(q.source.pages),'source mismatch '+e.id);
 for(const id of e.executableChecks)must(id.startsWith(e.id+':')&&traces.results[id]?.pass===true,'check reference '+id);
 if(e.requiresOfficialScoringCheck){must(!!e.riskNote,'risk note '+e.id);conditional++}
}
must(conditional===4&&subject.every(q=>seen.has(q.id)),'coverage/risk count');
must(audit.counts.coreAnswersMatched===31&&audit.counts.definitiveAnswerCorrections===0,'audit counts');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const hashes=new Map(baseline.records.map(x=>[x.id,x.answerSha256]));let solved=0;
for(const q of exam.questions){
 if(q.solutionStatus==='solved'&&hashes.has(q.id)){
  must(digest(legacyAnswerForHistoricalChecks(q))===hashes.get(q.id),'baseline answer changed '+q.id);solved++;
 }
}
must(solved===231&&exam.questions.filter(q=>q.solutionStatus==='pending').length===1,'solved counts');
console.log(JSON.stringify({status:'PASS',rederived:31,coreMatches:31,conditional,executableChecks:41,existingAnswersPreserved:solved}));

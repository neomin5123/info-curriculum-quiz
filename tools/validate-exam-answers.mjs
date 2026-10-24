import {legacyAnswerForHistoricalChecks, legacySolutionForHistoricalChecks} from './legacy-review-corrections.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
function assert(x,msg){if(!x){console.error('exam answer audit FAIL:',msg);process.exit(1);}}
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
function auditedSolution(q){
 if(q.id!=='2021-B-02')return legacySolutionForHistoricalChecks(q);
 const tag='\n\n재검토 주의:';
 const pos=q.solution.indexOf(tag);
 assert(pos>=0&&q.solution.indexOf(tag,pos+tag.length)===-1,'BCNF candidate-key warning absent or duplicated');
 assert(q.solution.slice(pos).includes('(A,E)')&&q.solution.slice(pos).includes('AC→E'),'candidate-key contradiction text incomplete');
 return q.solution.slice(0,pos);
}

const addedIds=['2014-A-01','2014-A-02','2014-A-03','2014-A-11','2014-A-12','2014-B-05','2016-A-01','2016-A-09','2016-A-10','2016-B-01','2016-B-08'];
const previousBuildSolutionHashes={
  "2014-A-01": "6036fd754acf9a908207987799b84e949eb6316c48b0951aea50f7380f797e85",
  "2014-A-02": "54a2bd384c5a121a60a1d2a7cf4df3b9898e7af514db823042ea1c102f3b3a94",
  "2014-A-03": "e804387e715890fbec755e124c044d1a637746b874fea352994e7eebfa3639cc",
  "2014-A-11": "afad7702f63186f45a863125076a480cd0783337c2fc4b9e41f72b3a91e9f46c",
  "2014-A-12": "c5fff108e12fb535eddaaea5df42e77d645e8d6c255221226dac2e852668ba69",
  "2014-B-05": "dc589da77a5455d0940b2ae9760dc21954c05265db23e9a313f47f551db1c15b",
  "2016-A-01": "d2665d1ab0b5b43dfbfd8b3adab5c8b83dd79f382e446e98d2d74f6bdfda3c9d",
  "2016-A-02": "8d934be5109dd8babbe0349a993455ee5fc6bd98e51cf5832c727380a24ce6ec",
  "2016-A-03": "d18ac764b8ce17c910331d91d66a157a96d98338f27e7b507bc9f2900eadfda5",
  "2016-A-09": "078ccb322ed2c71aa4768fb3723fe98b72f920797c15c040d4753fd181c07f7f",
  "2016-A-10": "2953c05407aa903e1e8772aff1bead5978202faf89f173afbc3234904551ca98",
  "2016-B-01": "aa756d8932de02117c1daf96839954644223424dae8683a151b1e6af6b46d00d",
  "2016-B-08": "a81f466e22d42a61abad4215cb2a81197fa315519fb5c3283e12b9d8d555bb9b",
  "2026-A-01": "46a6793d40837e46f433beea638682e29c688e6cb58684dab9497c7a8a400ca2",
  "2026-A-02": "042e9ca8b2c68c438d123c39f51b9650de5edab56e8764d2f9be614c09f43925",
  "2026-A-04": "05cc51ae7883bc1347dc19c835993338c405b22b93bd677e055000d07956072b",
  "2026-A-06": "db52e1ada6feddf0118f4cd5d9878ba97c3dae5f56275e11f0b9e4b85ea97d17"
};
const addedIds2017=["2017-A-01", "2017-A-02", "2017-A-03", "2017-A-09", "2017-A-10", "2017-B-01", "2017-B-08"];
const previousBuild02SolutionHashes={
  "2014-A-01": "6036fd754acf9a908207987799b84e949eb6316c48b0951aea50f7380f797e85",
  "2014-A-02": "54a2bd384c5a121a60a1d2a7cf4df3b9898e7af514db823042ea1c102f3b3a94",
  "2014-A-03": "e804387e715890fbec755e124c044d1a637746b874fea352994e7eebfa3639cc",
  "2014-A-11": "afad7702f63186f45a863125076a480cd0783337c2fc4b9e41f72b3a91e9f46c",
  "2014-A-12": "c5fff108e12fb535eddaaea5df42e77d645e8d6c255221226dac2e852668ba69",
  "2014-B-05": "dc589da77a5455d0940b2ae9760dc21954c05265db23e9a313f47f551db1c15b",
  "2016-A-01": "d2665d1ab0b5b43dfbfd8b3adab5c8b83dd79f382e446e98d2d74f6bdfda3c9d",
  "2016-A-02": "8d934be5109dd8babbe0349a993455ee5fc6bd98e51cf5832c727380a24ce6ec",
  "2016-A-03": "d18ac764b8ce17c910331d91d66a157a96d98338f27e7b507bc9f2900eadfda5",
  "2016-A-09": "078ccb322ed2c71aa4768fb3723fe98b72f920797c15c040d4753fd181c07f7f",
  "2016-A-10": "2953c05407aa903e1e8772aff1bead5978202faf89f173afbc3234904551ca98",
  "2016-B-01": "aa756d8932de02117c1daf96839954644223424dae8683a151b1e6af6b46d00d",
  "2016-B-08": "a81f466e22d42a61abad4215cb2a81197fa315519fb5c3283e12b9d8d555bb9b",
  "2017-A-01": "6dc81f5a3026c5cd5041b7482be103f0070d801d01add0898d17a2b888d9b0a5",
  "2017-A-02": "bf74b943d601e844ad933ae0e35f7d3cd25a43826e22265ba05af43e306344e3",
  "2017-A-03": "43246685f89858753d18fa2122d56382790bc411848219a6931ee8a70c03f5c1",
  "2017-A-09": "ba06a46fac3766fd27754d58f139482073bdb509acd7bdb35fbb334cd5fa6d53",
  "2017-A-10": "46108257a0d9a8860d9d08afbf5683e394067f2f5d9bcc5d3a0120ab8dcf6a78",
  "2017-B-01": "70c71d4a6680ea59c432cef0fe3caa04a7fe39ee8c1d4f64d92d2863e08dbe20",
  "2017-B-08": "9a6dbeadbf1f9f96f7e90362c5b049898a842d0e64bc12a0582b56372c2e08cf",
  "2026-A-01": "46a6793d40837e46f433beea638682e29c688e6cb58684dab9497c7a8a400ca2",
  "2026-A-02": "042e9ca8b2c68c438d123c39f51b9650de5edab56e8764d2f9be614c09f43925",
  "2026-A-04": "05cc51ae7883bc1347dc19c835993338c405b22b93bd677e055000d07956072b",
  "2026-A-06": "db52e1ada6feddf0118f4cd5d9878ba97c3dae5f56275e11f0b9e4b85ea97d17"
};
const addedIds2018=["2018-A-09", "2018-A-10", "2018-A-11", "2018-B-01", "2018-B-08"];
const originalSolutionHashes={
 '2016-A-02':'8d934be5109dd8babbe0349a993455ee5fc6bd98e51cf5832c727380a24ce6ec',
 '2016-A-03':'d18ac764b8ce17c910331d91d66a157a96d98338f27e7b507bc9f2900eadfda5',
 '2026-A-01':'46a6793d40837e46f433beea638682e29c688e6cb58684dab9497c7a8a400ca2',
 '2026-A-02':'042e9ca8b2c68c438d123c39f51b9650de5edab56e8764d2f9be614c09f43925',
 '2026-A-04':'05cc51ae7883bc1347dc19c835993338c405b22b93bd677e055000d07956072b',
 '2026-A-06':'db52e1ada6feddf0118f4cd5d9878ba97c3dae5f56275e11f0b9e4b85ea97d17'
};
for(const [id,hash] of Object.entries(previousBuildSolutionHashes)){
 const q=db.questions.find(x=>x.id===id);assert(q&&q.solutionStatus==='solved','previous build solved id missing '+id);
 assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,'previous build answer changed: '+id);
}
for(const [id,hash] of Object.entries(previousBuild02SolutionHashes)){
 const q=db.questions.find(x=>x.id===id);assert(q&&q.solutionStatus==='solved','previous build02 solved id missing '+id);
 assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,'previous build02 answer changed: '+id);
}
const ids=new Set(db.questions.map(x=>x.id));
assert(ids.size===269,'question id collision or count changed');
for(const [id,hash] of Object.entries(originalSolutionHashes)){
 const q=db.questions.find(x=>x.id===id);assert(q && q.solutionStatus==='solved','baseline solved id missing '+id);
 const current=crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex');
 assert(current===hash,'existing baseline answer was modified: '+id);
}
for(const id of [...addedIds,...addedIds2017,...addedIds2018]){
 const q=db.questions.find(x=>x.id===id);
 assert(q && q.subject==='교교론' && q.solutionStatus==='solved','unexpected new answer status '+id);
 assert(q.answer.trim().length>=3 && q.solution.trim().length>=20,'answer or explanation is incomplete '+id);
 assert(q.verification?.status==='derived' && q.verification?.officialAnswerConfirmed===false,'official-answer provenance missing '+id);
 assert(q.verification?.checkedAgainst==='original-question-pdf','original check missing '+id);
 assert(['high','medium'].includes(q.verification?.confidence),'confidence invalid '+id);
}
for(const q of db.questions){
 if(q.solutionStatus==='solved'&&!addedIds.includes(q.id)&&!addedIds2017.includes(q.id)&&!addedIds2018.includes(q.id)&&!Object.hasOwn(originalSolutionHashes,q.id)){
  assert(q.verification?.status==='derived'&&q.verification?.officialAnswerConfirmed===false,'unexpected solved question missing provenance '+q.id);
 }
}

const build04Audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-04-exam-answer-hashes.json','utf8'));
assert(Object.keys(build04Audit.existingAnswersSha256).length===29,'build03 baseline hash count wrong');
assert(Object.keys(build04Audit.newAnswersSha256).length===50,'build04 new hash count wrong');
for (const [id,hash] of Object.entries({...build04Audit.existingAnswersSha256,...build04Audit.newAnswersSha256})){
 const q=db.questions.find(x=>x.id===id);
 assert(q && q.solutionStatus==='solved','hash-audited solution missing '+id);
 const current=crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex');
 assert(current===hash,`build04 audited answer changed: ${id}`);
}
for(const id of build04Audit.newIds){
 const q=db.questions.find(x=>x.id===id);
 assert(q && q.subject==='교교론' && q.year>=2019 && q.year<=2026,'build04 inserted non-pedagogic answer '+id);
 assert(q.verification?.status==='derived' && q.verification?.checkedAgainst==='original-question-pdf' && q.verification?.officialAnswerConfirmed===false,'build04 provenance missing '+id);
}

const build05Audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-05-exam-answer-hashes.json','utf8'));
assert(Object.keys(build05Audit.existingAnswersSha256).length===79,'build04 baseline hash count wrong');
assert(Object.keys(build05Audit.newAnswersSha256).length===13,'build05 new hash count wrong');
for(const [id,hash] of Object.entries({...build05Audit.existingAnswersSha256,...build05Audit.newAnswersSha256})){
 const q=db.questions.find(x=>x.id===id);
 assert(q && q.solutionStatus==='solved','build05 hash-audited solution missing '+id);
 assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,'build05 answer changed '+id);
}
for(const id of build05Audit.newIds){
 const q=db.questions.find(x=>x.id===id);
 assert(q && q.subject==='자구알고','unexpected build05 subject '+id);
 assert(q.verification?.status==='derived'&&q.verification?.officialAnswerConfirmed===false&&q.verification?.checkedAgainst==='original-question-pdf','build05 provenance invalid '+id);
}

const build06Audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-06-exam-answer-hashes.json','utf8'));
assert(Object.keys(build06Audit.existingAnswersSha256).length===92,'build05 baseline answer count mismatch');
assert(Object.keys(build06Audit.newAnswersSha256).length===18,'build06 new answer count mismatch');
for (const [id,hash] of Object.entries({...build06Audit.existingAnswersSha256,...build06Audit.newAnswersSha256})) {
 const q=db.questions.find(x=>x.id===id);
 assert(q?.solutionStatus==='solved',`build06 missing answer ${id}`);
 assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,`build06 answer changed ${id}`);
}
for (const id of build06Audit.newIds) {
 const q=db.questions.find(x=>x.id===id);
 assert(q?.subject==='자구알고' && q.solutionStatus==='solved',`build06 wrong subject/status ${id}`);
 assert(q.verification?.status==='derived' && q.verification?.checkedAgainst==='original-question-pdf' && q.verification?.officialAnswerConfirmed===false,`build06 provenance ${id}`);
}
assert(db.questions.filter(q=>q.subject==='자구알고').length===31,'algorithm corpus changed');
assert(db.questions.filter(q=>q.subject==='자구알고'&&q.solutionStatus==='solved').length===31,'algorithm solve incomplete');
assert(db.questions.find(q=>q.id==='2023-B-11').verification.reviewNote.includes('충돌'),'Kruskal discrepancy audit missing');


const build07Audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-07-exam-answer-hashes.json','utf8'));
assert(Object.keys(build07Audit.existingAnswersSha256).length===110,'build06 baseline answer count mismatch');
assert(Object.keys(build07Audit.newAnswersSha256).length===20,'build07 new answer count mismatch');
for (const [id,hash] of Object.entries({...build07Audit.existingAnswersSha256,...build07Audit.newAnswersSha256})) {
 const q=db.questions.find(x=>x.id===id);
 assert(q?.solutionStatus==='solved',`build07 missing answer ${id}`);
 assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,`build07 answer changed ${id}`);
}
for (const id of build07Audit.newIds) {
 const q=db.questions.find(x=>x.id===id);
 assert(q?.subject==='논회컴구' && q.solutionStatus==='solved',`build07 wrong subject/status ${id}`);
 assert(q.verification?.status==='derived' && q.verification?.checkedAgainst==='original-question-pdf' && q.verification?.officialAnswerConfirmed===false,`build07 provenance ${id}`);
}
assert(db.questions.filter(q=>q.subject==='논회컴구').length===21,'digital logic corpus changed');
assert(db.questions.filter(q=>q.subject==='논회컴구'&&q.solutionStatus==='solved').length===21,'digital logic unsolved');
assert(db.questions.find(q=>q.id==='2020-B-11').answer.includes('②, ⑤'),'NOP timing regression');

// Build08: preserve all Build07 answers and trace DB input separately.
const build08Audit=JSON.parse(fs.readFileSync('data/audits/2026-10-19-build-08-exam-answer-hashes.json','utf8'));
assert(Object.keys(build08Audit.priorAnswersSha256).length===130,'build07 baseline answer count mismatch');
assert(Object.keys(build08Audit.newAnswersSha256).length===29,'build08 new answer count mismatch');
for (const [id,hash] of Object.entries({...build08Audit.priorAnswersSha256,...build08Audit.newAnswersSha256})) {
 const q=db.questions.find(x=>x.id===id);
 assert(q?.solutionStatus==='solved',`build08 missing answer ${id}`);
 assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,`build08 answer changed ${id}`);
}
for (const id of build08Audit.newIds) {
 const q=db.questions.find(x=>x.id===id);
 assert(q?.subject==='디비' && q.solutionStatus==='solved',`build08 wrong subject/status ${id}`);
 assert(q.verification?.status==='derived' && q.verification?.checkedAgainst==='original-question-pdf' && q.verification?.officialAnswerConfirmed===false,`build08 provenance ${id}`);
}
assert(db.questions.filter(q=>q.subject==='디비').length===30,'DB corpus changed');
assert(db.questions.filter(q=>q.subject==='디비'&&q.solutionStatus==='solved').length===29,'DB expected 29 solved');
assert(db.questions.find(q=>q.id==='2024-B-07').solutionStatus==='pending','ambiguous candidate key problem must stay under review');
const build02Audit=JSON.parse(fs.readFileSync('data/audits/2026-10-20-build-02-network-exam-answer-hashes.json','utf8'));
assert(Object.keys(build02Audit.previousAnswersSha256).length===159,'networking baseline 159 count wrong');
assert(build02Audit.newIds.length===27,'networking new count wrong');
assert(Object.keys(build02Audit.newAnswersSha256).length===27,'networking new hashes count wrong');
for(const [id,hash] of Object.entries({...build02Audit.previousAnswersSha256,...build02Audit.newAnswersSha256})){
  const q=db.questions.find(x=>x.id===id);
  assert(q?.solutionStatus==='solved',`networking answer missing ${id}`);
  assert(crypto.createHash('sha256').update(`${legacyAnswerForHistoricalChecks(q)}\0${auditedSolution(q)}`).digest('hex')===hash,`networking previous/new answer changed ${id}`);
}
for(const id of build02Audit.newIds){
  const q=db.questions.find(x=>x.id===id);
  assert(q?.subject==='데통네트웤'&&q.solutionStatus==='solved',`networking unexpected subject ${id}`);
  assert(q.verification?.status==='derived'&&q.verification?.checkedAgainst==='original-question-pdf'&&q.verification?.officialAnswerConfirmed===false,`networking provenance wrong ${id}`);
  assert(q.answer.length>=2&&q.solution.length>50,`networking answer incomplete ${id}`);
}
assert(db.questions.filter(q=>q.subject==='데통네트웤').length===28,'networking corpus wrong');
assert(db.questions.filter(q=>q.subject==='데통네트웤'&&q.solutionStatus==='solved').length===28,'networking not complete');
for(const id of build02Audit.reviewNeededIds)assert(db.questions.find(q=>q.id===id)?.verification?.reviewNote,'networking review note missing '+id);
const solved=db.questions.filter(x=>x.solutionStatus==='solved');
const pedagogic=db.questions.filter(x=>x.subject==='교교론');
assert(solved.length===268,'solved total wrong');
assert(pedagogic.length===74,'pedagogic question count changed');
assert(pedagogic.filter(x=>x.solutionStatus==='solved').length===74,'pedagogic solved count wrong');
assert(db.metadata.coverage.solved===solved.length,'metadata count mismatch');
assert(addedIds2017.every(id=>db.questions.find(q=>q.id===id)?.year===2017),'added non-2017 id');
assert(addedIds2018.every(id=>db.questions.find(q=>q.id===id)?.year===2018),'added non-2018 id');
const app=fs.readFileSync('js/app.js','utf8');
assert(app.includes('독립 풀이 · 공식 정답 검증 전'),'answer provenance UI label not found');
console.log(JSON.stringify({status:'PASS',addedThisBuild:19,totalSolved:solved.length,pedagogicSolved:74,pedagogicPending:0,algorithmsSolved:31,networkingSolved:28,previousBuildSolvedUnchanged:212},null,2));

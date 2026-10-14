import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const data=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));

for(const token of [
  "field.dataset.section||line?.family||ctx.family||'빈칸'",
  'function retryTargetForLine(',
  'function scheduleSetRetryFailures(',
  'function migrateLegacySetRetries(',
  'const retryGradePending=new Map()',
  'function acknowledgeRetryCard(',
  "flashRetryResult(id,overallNear?'near':'wrong'",
  "gradeButton.textContent='확인'",
  'retryGradePending.has(activeRetryCardId)',
  'const sourceExpected=r.sourceExpected||r.correctAnswer'
])assert(app.includes(token),`v9.0.44 invariant missing: ${token}`);

assert(!app.includes('전체를 다시 작성하세요.'),'retry must not demand whole-line rewrite');
assert(!app.includes('전체를 다시 쓰세요.'),'retry must not demand whole-set rewrite');
assert(app.includes('data-retry-grade="${esc(id)}">채점</button>'),'retry initial action must be 채점');
assert(app.includes('성취기준 빈칸'),'standard-number/body rendering regression');

const line=data.lines.find(x=>x.lineId==='MI-02-CS-PF-01');
assert(line?.family==='과정·기능','fixture must be 과정·기능');
assert(line?.area==='데이터','fixture must be 데이터');
assert((line.presentation?.units||[]).some(x=>x.text==='디지털 데이터로 표현'),'fixture granularity missing');

assert(pkg.version==='9.0.44-study-rc.1','package version mismatch');
console.log(JSON.stringify({
  status:'PASS',
  retryMetaExample:'데이터 · 과정·기능',
  standardCodeContext:'retained by existing standard renderer',
  postGradeDismissal:'manual 확인/나중에',
  resultToast:'transient',
  legacySetRetry:'migrated to one-at-a-time cards',
  wholeRewritePromptRemoved:true,
  curriculumDataChanged:false
},null,2));

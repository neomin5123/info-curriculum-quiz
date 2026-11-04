import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');

assert(!app.includes('function cancelFieldRetry('),'main-study retry cancellation helper must be removed');
assert(!app.includes("status==='correct')cancelFieldRetry"),'correct main answer must not cancel a scheduled retry');
assert(!app.includes("saved?.status==='correct'"),'saved correct grade must not silently delete a pending retry');
assert(app.includes('Once a miss creates a retry record'),'retry persistence invariant comment missing');
assert(app.includes('delete state.fieldRetries[id];'),'retry-card completion/removal path missing');
assert(app.includes("flashRetryResult(id,'correct','재인출 완료 ✓')"),'retry-card recovery completion feedback missing');
assert(app.includes("state.fieldRetries={};")&&app.includes("state.fieldRetryCounts={};"),'explicit retry OFF purge must remain');
assert(html.includes('한 번 예약된 카드는 메인 답안을 고쳐 맞혀도 유지되며, 카드에서 회복해야 사라집니다.'),'retry persistence tooltip missing');

for(const token of [
  'scheduleSetRetryFailures',
  "if(detail.status!=='correct')",
  'scheduleFieldRetry(field,detail.status'
]) assert(app.includes(token),`main grading path persistence missing: ${token}`);

console.log(JSON.stringify({
  status:'PASS',
  invariant:'miss event schedules a card independent of later main-field correction',
  cardResolution:'retry-card correct or explicit reset/OFF only',
  regressionGuard:true
},null,2));

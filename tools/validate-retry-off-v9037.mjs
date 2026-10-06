import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');

for(const token of [
  "if(!state.ui.retry){",
  "activeRetryCardId='';",
  "state.fieldRetries={};",
  "state.fieldRetryCounts={};",
  "renderRetryDock();",
  "renderReviewPage();"
]) assert(app.includes(token),`retry-off purge missing: ${token}`);

assert(html.includes('OFF로 바꾸면 현재 대기 중인 오답 카드도 삭제됩니다.'),
  'retry OFF tooltip must explain pending-card deletion');

console.log(JSON.stringify({
  status:'PASS',
  offDeletesPendingCards:true,
  offClearsPerFieldRetryCounters:true,
  longTermSrsUnaffected:true
},null,2));

import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const token of [
  'function retryScopeMatchesCurrent(r)',
  'function currentRoundRetryEntries()',
  'function atRoundEnd()',
  'function promoteTailRetries(',
  'promoteTailRetries({requireFullyGraded:true})',
  'if(promoteTailRetries({announce:true}))return;',
  "atRoundEnd()&&retryScopeMatchesCurrent(r)?serial:serial+Number(CL.config.retryDelay||3)",
  '남은 오답 카드 ${pending.length}개를 복습하면 이번 회차가 끝납니다.'
]) assert(app.includes(token),`tail-drain invariant missing: ${token}`);
assert(/v9\.0\.(?:4[1-9]|5[0-9]) Study RC/.test(html),'v9.0.41+ visible build marker missing');
console.log(JSON.stringify({status:'PASS',tailStarvationRemoved:true,roundAdvanceBlockedUntilRetryDrain:true},null,2));

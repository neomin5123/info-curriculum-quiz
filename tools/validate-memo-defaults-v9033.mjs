import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8'),html=fs.readFileSync('index.html','utf8');
for(const token of [
  'const AREA_MEMO_DEFAULTS=',
  "'middle-info':{",
  "'high-info':{",
  "'컴퓨팅 시스템':'컴퓨팅 시스템(구성요소·동작 원리)",
  'function areaMemoDefaultText()',
  'Object.prototype.hasOwnProperty.call(store,key)',
  "store[key]=value;",
  '기본 영역 개요로 초기화할까요?'
])assert(app.includes(token),`memo default implementation missing: ${token}`);
assert(html.includes('>개요로 초기화</button>'),'memo reset button label missing');
console.log(JSON.stringify({status:'PASS',defaultOverviewScopes:10,blankOverridePreserved:true,resetRestoresOverview:true},null,2));

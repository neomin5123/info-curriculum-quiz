import fs from 'node:fs';
import vm from 'node:vm';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
const start=app.indexOf('const AREA_MEMO_LEGACY_DEFAULTS=');
const end=app.indexOf('function areaMemoStore(){',start);
assert(start>=0&&end>start,'memo outline block missing');
let block=app.slice(start,end).replaceAll(/^const /gm,'var ');
const context={state:{ui:{subject:'middle-info',area:'컴퓨팅 시스템'}}};
vm.createContext(context);
vm.runInContext(block+'\nthis.__memo={AREA_MEMO_LEGACY_DEFAULTS,AREA_MEMO_DEFAULTS,AREA_MEMO_AREA_ORDER,areaMemoTextFor,areaMemoLegacyTextFor,migrateLegacyAreaMemoDefaults};',context);
const M=context.__memo;
const subjects=['middle-info','high-info','all'];
const areas=[...M.AREA_MEMO_AREA_ORDER,'all'];
const validScopes=[];
for(const s of subjects)for(const a of areas){
  if(s==='all'||a==='all'||['middle-info','high-info'].includes(s)&&M.AREA_MEMO_AREA_ORDER.includes(a))validScopes.push([s,a]);
}
// 실제 UI에서 가능한 18개 scope만 검사: 학교급별 6 + 중고전체 6
assert(validScopes.length===18,`unexpected memo scopes: ${validScopes.length}`);
const oldStore={};
for(const [s,a] of validScopes)oldStore[`${s}|${a}`]=M.areaMemoLegacyTextFor(s,a);
const fullMigration=M.migrateLegacyAreaMemoDefaults(oldStore);
assert(fullMigration.changed&&fullMigration.count===18,`full legacy migration count mismatch: ${JSON.stringify(fullMigration)}`);
for(const [s,a] of validScopes){
  const key=`${s}|${a}`;
  assert(oldStore[key]===M.areaMemoTextFor(M.AREA_MEMO_DEFAULTS,s,a),`scope not migrated: ${key}`);
}
const protectedStore={
  'middle-info|데이터':'사용자가 직접 쓴 메모 → 이 화살표는 보존되어야 함',
  'high-info|인공지능':''
};
const protectedMigration=M.migrateLegacyAreaMemoDefaults(protectedStore);
assert(!protectedMigration.changed&&protectedMigration.count===0,'custom or blank memo treated as legacy default');
assert(protectedStore['middle-info|데이터']==='사용자가 직접 쓴 메모 → 이 화살표는 보존되어야 함','custom memo overwritten');
assert(protectedStore['high-info|인공지능']==='','blank memo overwritten');
for(const s of ['middle-info','high-info'])for(const a of M.AREA_MEMO_AREA_ORDER){
  const txt=M.AREA_MEMO_DEFAULTS[s][a];
  assert(!txt.includes('→'),`arrow chain remains: ${s}/${a}`);
  assert(/^1\. /m.test(txt),`numbered outline missing: ${s}/${a}`);
  assert(txt.split('\n').every(line=>/^\d+\. /.test(line)||/^   - /.test(line)),`invalid outline line: ${s}/${a}`);
}
assert(M.AREA_MEMO_DEFAULTS['high-info']['컴퓨팅 시스템']===`1. 유·무선 네트워크 특성
2. 네트워크 환경 구성
3. 사물인터넷
   - 구성·동작 원리
   - 삶·사회 변화 예측
4. 피지컬 장치 선택
5. 사물인터넷 시스템 설계`,'agreed high-info computing-system outline changed');
const oneArea=M.areaMemoTextFor(M.AREA_MEMO_DEFAULTS,'middle-info','컴퓨팅 시스템');
assert(!oneArea.startsWith('[컴퓨팅 시스템]'),'specific-area memo repeats area title');
const allArea=M.areaMemoTextFor(M.AREA_MEMO_DEFAULTS,'middle-info','all');
for(const a of M.AREA_MEMO_AREA_ORDER)assert(allArea.includes(`[${a}]\n`),`all-area heading missing: ${a}`);
const allAll=M.areaMemoTextFor(M.AREA_MEMO_DEFAULTS,'all','all');
assert(allAll.includes('[중학교 정보]')&&allAll.includes('[고등학교 정보]'),'school headings missing in all/all');
console.log(JSON.stringify({status:'PASS',outlineAreas:10,uiScopes:18,migratedLegacyDefaults:18,customMemoPreserved:true,blankMemoPreserved:true,areaHeadingOnlyInAggregate:true},null,2));

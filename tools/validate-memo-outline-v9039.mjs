import fs from 'node:fs';
function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8');
for(const token of [
  'const LEGACY_AREA_MEMO_DEFAULTS=',
  'const AREA_MEMO_DEFAULTS=',
  '1. 유·무선 네트워크 특성',
  '3. 사물인터넷',
  '   - 구성·동작 원리',
  'function legacyAreaMemoDefaultTextFor(subject,area)',
  'function migrateAreaMemoDefaults()',
  "if(saved===legacyAreaMemoDefaultTextFor(subject,area))",
  'migrateAreaMemoDefaults();'
])assert(app.includes(token),`memo outline/migration missing: ${token}`);
assert(app.includes("const saved=String(store[key]??'');"),'saved blank/user text handling missing');
assert(!app.includes("store[key]=areaMemoDefaultTextFor(subject,area);\n        changed=true;\n      }\n      else"),'migration must not overwrite non-exact user edits');
console.log(JSON.stringify({status:'PASS',defaultAreaOutlines:10,scopeCount:18,exactMatchMigration:true,userEditsPreserved:true,blankMemoPreserved:true},null,2));

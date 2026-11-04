import fs from 'node:fs';
const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
for(const token of [
  'function retrySourceArea(r)',
  "engine.lineMap.get(id)?.area",
  "if(areas.length===1)return areas[0];",
  "const areaRaw=retrySourceArea(r);"
]){
  if(!app.includes(token)){console.error('v9.0.50 retry source-area marker missing:',token);process.exit(1);}
}
if(app.includes("const areaRaw=scope.area&&scope.area!=='all'?scope.area:'전체 영역';")){
  console.error('legacy scope-only retry area still present');process.exit(1);
}
console.log('v9.0.50 retry source-area PASS');

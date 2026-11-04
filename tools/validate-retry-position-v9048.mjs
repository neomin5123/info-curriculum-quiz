import fs from 'node:fs';
const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
for(const token of [
  'function retrySectionPosition(r)',
  'return index>=0?`${index+1}/${peers.length}`',
  'const position=retrySectionPosition(r);',
  "return `${area} · ${section}${position?` ${position}`:''}`;"
]){
  if(!app.includes(token)){console.error('v9.0.48 retry position marker missing:',token);process.exit(1);}
}
console.log('v9.0.48 retry position PASS');

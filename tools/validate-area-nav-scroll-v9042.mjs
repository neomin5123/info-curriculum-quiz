import fs from 'node:fs';
const app=fs.readFileSync('js/app.js','utf8');
const m=app.match(/function jumpArea\(delta\)\{([\s\S]*?)\n\}/);
if(!m){console.error('jumpArea missing');process.exit(1);}
const body=m[1];
for(const token of ["const viewport={x:window.scrollX||0,y:window.scrollY||0};","requestAnimationFrame(()=>window.scrollTo({left:viewport.x,top:viewport.y,behavior:'auto'}));"]){
  if(!body.includes(token)){console.error('viewport preservation missing:',token);process.exit(1);}
}
if(body.includes('scrollIntoView')){console.error('area navigation still forces scrollIntoView');process.exit(1);}
console.log('area navigation viewport stability PASS');

import fs from 'node:fs';
const css=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['v9.0.45 — fixed-width area navigator','width:212px;','flex:0 0 212px;','width:192px;','text-align:center;']){
  if(!css.includes(token)){console.error('v9.0.45 fixed area-nav geometry missing:',token);process.exit(1);}
}
console.log('v9.0.45 fixed area-nav geometry PASS');

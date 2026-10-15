import fs from 'node:fs';
const app=fs.readFileSync('js/app.js','utf8');
for(const token of ["gradeButton.textContent='Enter'","gradeButton.setAttribute('aria-label','Enter를 눌러 확인')","gradeButton.focus({preventScroll:true})","retryGradePending.has(id)?acknowledgeRetryCard(id,false):gradeRetryCard(id)"]){
  if(!app.includes(token)){console.error('v9.0.46 retry Enter behavior missing:',token);process.exit(1);}
}
if(app.includes("gradeButton.textContent='확인'")){console.error('legacy 확인 label remains');process.exit(1);}
console.log('v9.0.46 retry Enter confirmation PASS');

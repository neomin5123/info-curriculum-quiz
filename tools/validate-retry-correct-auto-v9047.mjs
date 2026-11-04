import fs from 'node:fs';
const app=fs.readFileSync('js/app.js','utf8');
for(const token of [
  "if(status==='correct'){",
  "setRetryFeedback(id,'정확합니다. 잠시 후 다음 카드로 넘어갑니다.','good')",
  "if(gradeButton)gradeButton.hidden=true",
  "setTimeout(()=>{if(retryGradePending.has(id))acknowledgeRetryCard(id,false);},1000)",
  "setRetryFeedback(id,'확인 후 다시 묻습니다.',feedbackStatus);"
]){
  if(!app.includes(token)){console.error('v9.0.47 retry behavior missing:',token);process.exit(1);}
}
console.log('v9.0.47 correct auto advance PASS');

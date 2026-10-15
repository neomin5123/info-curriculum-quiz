import fs from 'node:fs';
const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../assets/css/app.css',import.meta.url),'utf8');
for(const token of [
  'data-retry-answer',
  'setRetryAnswer(id,`정답: ${expected}`,feedbackStatus);',
  "setRetryFeedback(id,'확인 후 다시 묻습니다.',feedbackStatus);"
]){
  if(!app.includes(token)){console.error('v9.0.49 retry feedback marker missing:',token);process.exit(1);}
}
if(app.includes('`${label} · 정답: ${expected} · 확인 후 다시 묻습니다.`')){
  console.error('legacy combined retry feedback still present');process.exit(1);
}
if(!css.includes('.practical-retry-answer{')){console.error('retry answer style missing');process.exit(1);}
console.log('v9.0.49 retry feedback PASS');

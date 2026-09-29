import fs from 'node:fs';
const required=['index.html','assets/css/app.css','data/curriculum/middle-high-v9.0.6.json','data/generated/study-data.js','js/core/config.js','js/core/storage.js','js/core/grading.js','js/core/study-engine.js','js/app.js','service-worker.js','manifest.webmanifest'];
const miss=required.filter(p=>!fs.existsSync(p));if(miss.length){console.error('missing:',miss);process.exit(1);}const html=fs.readFileSync('index.html','utf8');for(const p of required.filter(x=>/\.(js|css)$/.test(x))){if(!html.includes(p) && p!=='service-worker.js'){console.error('index does not reference',p);process.exit(1);}}console.log('package static PASS');

if(!html.includes('내용체계 전체') && !fs.readFileSync('js/app.js','utf8').includes('내용체계 전체')){console.error('content-system UI missing');process.exit(1);}
if(!html.includes('회상 방식')){console.error('recall-mode label missing');process.exit(1);}

import fs from 'node:fs';
const required=['index.html','assets/css/app.css','data/curriculum/middle-high-v9.0.6.json','data/generated/study-data.js','js/core/config.js','js/core/storage.js','js/core/grading.js','js/core/study-engine.js','js/app.js','service-worker.js','manifest.webmanifest'];
const miss=required.filter(p=>!fs.existsSync(p));if(miss.length){console.error('missing:',miss);process.exit(1);}const html=fs.readFileSync('index.html','utf8');for(const p of required.filter(x=>/\.(js|css)$/.test(x))){if(!html.includes(p)&&p!=='service-worker.js'){console.error('index does not reference',p);process.exit(1);}}
const app=fs.readFileSync('js/app.js','utf8'),engine=fs.readFileSync('js/core/study-engine.js','utf8');
for(const label of ['성격 + 목표','내용체계','성취기준','내용체계 + 성취기준','성취기준 해설 + 적용 시 고려사항','교수학습 + 평가'])if(!engine.includes(label)){console.error('group missing',label);process.exit(1);}for(const label of ['단일 회상','실전 조합','전체 회상'])if(!app.includes(label)){console.error('stage missing',label);process.exit(1);}if(!html.includes('zoomSelect')||!html.includes('원문 출처')){console.error('zoom/source footer missing');process.exit(1);}if(html.includes('headerStats')||html.includes('scopeHint')||html.includes('compactStatus')){console.error('removed clutter still present');process.exit(1);}console.log('package static PASS');
const appUX=fs.readFileSync('js/app.js','utf8');
for(const token of ['installAnswerInputUX','e.key===\'Tab\'','e.key!==\'Enter\'','e.isComposing','keyCode===229','firstClickSelectDone','field.select()']){
  if(!appUX.includes(token)){console.error(`input UX missing: ${token}`);process.exit(1);}
}

const indexDeploy=fs.readFileSync('index.html','utf8');
const configDeploy=fs.readFileSync('js/core/config.js','utf8');
const appDeploy=fs.readFileSync('js/app.js','utf8');
const vercelDeploy=JSON.parse(fs.readFileSync('vercel.json','utf8'));
if(!indexDeploy.includes('v9.0.15 Study RC')||!indexDeploy.includes('data-build="9.0.15-study-rc.1"')){console.error('deploy build marker missing');process.exit(1);}
if(!configDeploy.includes("9.0.15-study-rc.1")){console.error('config deploy version mismatch');process.exit(1);}
if(appDeploy.includes("serviceWorker.register('./service-worker.js')")){console.error('persistent service worker registration still enabled');process.exit(1);}
if(!appDeploy.includes('getRegistrations')||!appDeploy.includes("startsWith('curriloop-')")){console.error('old cache cleanup missing');process.exit(1);}
if(!JSON.stringify(vercelDeploy).includes('no-store')){console.error('Vercel no-store header missing');process.exit(1);}

const htmlV14=fs.readFileSync('index.html','utf8');
const appV14=fs.readFileSync('js/app.js','utf8');
const engineV14=fs.readFileSync('js/core/study-engine.js','utf8');
if(!htmlV14.includes('class="brand-row"')||!htmlV14.includes('v9.0.15 Study RC')){console.error('inline version header missing');process.exit(1);}
if(!appV14.includes("['whole','전체 회상']")){console.error('whole recall label not renamed');process.exit(1);}
if(!appV14.includes("family==='지식·이해'")||!appV14.includes('recallUnitsForLine')){console.error('table-wide recall renderer missing');process.exit(1);}
if(!engineV14.includes("focus:{id:stage,kind:stage,lineIds}")){console.error('one-table-per-stage engine behavior missing');process.exit(1);}

const appV15=fs.readFileSync('js/app.js','utf8');
const engineV15=fs.readFileSync('js/core/study-engine.js','utf8');
if(!appV15.includes('function renderContentStandards(task)')||!appV15.includes('standardItemHtml(task')){console.error('composite content+standards renderer missing');process.exit(1);}
if(!engineV15.includes('function buildContentStandardsTasks')||!engineV15.includes("type:'content-standards'")){console.error('composite content+standards task builder missing');process.exit(1);}

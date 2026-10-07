import fs from 'node:fs';
const required=['index.html','assets/css/app.css','data/curriculum/middle-high-v9.0.6.json','data/generated/study-data.js','js/core/config.js','js/core/storage.js','js/core/grading.js','js/core/study-engine.js','js/app.js','service-worker.js','manifest.webmanifest','vercel.json'];
const miss=required.filter(p=>!fs.existsSync(p));if(miss.length){console.error('missing:',miss);process.exit(1);}
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('js/app.js','utf8'),engine=fs.readFileSync('js/core/study-engine.js','utf8'),storage=fs.readFileSync('js/core/storage.js','utf8'),grading=fs.readFileSync('js/core/grading.js','utf8'),css=fs.readFileSync('assets/css/app.css','utf8'),config=fs.readFileSync('js/core/config.js','utf8');
for(const p of required.filter(x=>/\.(js|css)$/.test(x))){if(!html.includes(p)&&p!=='service-worker.js'){console.error('index does not reference',p);process.exit(1);}}
for(const label of ['성격 + 목표','내용체계','성취기준','내용체계 + 성취기준','성취기준 해설 + 적용 시 고려사항','교수학습 + 평가'])if(!engine.includes(label)){console.error('group missing',label);process.exit(1);}
for(const label of ['단일 회상','실전 조합','전체 회상'])if(!app.includes(label)){console.error('stage missing',label);process.exit(1);}
if(!html.includes('v9.0.39 Study RC')||!html.includes('data-build="9.0.39-study-rc.1"')){console.error('deploy build marker missing');process.exit(1);}
if(!config.includes("9.0.39-study-rc.1")){console.error('config version mismatch');process.exit(1);}
if(!html.includes('<button class="source-button" id="sourceButton">원문 출처</button>')||!html.includes('id="provenanceFooter"')){console.error('source placement/provenance missing');process.exit(1);}
for(const token of ['classifyDetailed','likelyTypo','decomposeHangul','gradeSetDetailed','aggregateStatus'])if(!grading.includes(token)){console.error('grading restoration missing',token);process.exit(1);}
for(const token of ['drafts','fieldGrades','scopeRounds','scopeTasks','noteScopeRound','restoreScopeRound'])if(!storage.includes(token)){console.error('storage restoration missing',token);process.exit(1);}
for(const token of ['prepareAnswerFields','gradeSingleAnswerField','scrollIntoView','renderProvenance','정답: ${answer}','firstClickSelectDone'])if(!app.includes(token)){console.error('UX restoration missing',token);process.exit(1);}
for(const token of ['.field-note.near','.inline-input.near','.provenance-footer','.answer-field-wrap'])if(!css.includes(token)){console.error('visual restoration missing',token);process.exit(1);}
if(app.includes("serviceWorker.register('./service-worker.js')")){console.error('persistent SW registration still enabled');process.exit(1);}
if(!JSON.stringify(JSON.parse(fs.readFileSync('vercel.json','utf8'))).includes('no-store')){console.error('Vercel no-store missing');process.exit(1);}
console.log('package static PASS');

const cssV18=fs.readFileSync('assets/css/app.css','utf8');
if(!cssV18.includes('--good-text:#1f5f3b')||!cssV18.includes('--good-bg-strong:#e6f4ea')||!cssV18.includes('.cs-inline-input.correct')){console.error('v9.0.18 graded color patch missing');process.exit(1);}

const appV19=fs.readFileSync('js/app.js','utf8');
const cssV19=fs.readFileSync('assets/css/app.css','utf8');
const storageV19=fs.readFileSync('js/core/storage.js','utf8');
for(const token of ['scheduleFieldRetry','activateDueFieldRetry','answerSerial','fieldRetries']){
  if(!appV19.includes(token)&&!storageV19.includes(token)){console.error(`v9.0.19 retry token missing: ${token}`);process.exit(1);}
}
if(!cssV19.includes('width:clamp(9rem')||!cssV19.includes('.field-note.retry')){console.error('v9.0.19 larger-field/retry styling missing');process.exit(1);}

const htmlV20=fs.readFileSync('index.html','utf8');
const appV20=fs.readFileSync('js/app.js','utf8');
const cssV20=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['reviewMainTab','reviewPage','retryDock']){if(!htmlV20.includes(token)){console.error(`v9.0.20 HTML missing ${token}`);process.exit(1);}}
for(const token of ['renderRetryDock','openRetryCard','renderReviewPage','openWeakItem']){if(!appV20.includes(token)){console.error(`v9.0.20 app missing ${token}`);process.exit(1);}}
if(appV20.includes('if(activateDueFieldRetry())return')){console.error('automatic retry focus hijack still enabled');process.exit(1);}
if(!cssV20.includes('.retry-card+.retry-card{margin-top:-13px}')||!cssV20.includes('.retry-card:hover')){console.error('stacked retry-card hover UI missing');process.exit(1);}

const appV21=fs.readFileSync('js/app.js','utf8');
const cssV21=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['retryCardPanelHtml','gradeRetryCard','deferRetryCard','practical-retry-panel','retryBlankText']){
  if(!appV21.includes(token)&&!cssV21.includes(token)){console.error(`v9.0.21 missing ${token}`);process.exit(1);}
}
if(appV21.includes("Object.assign(state.ui,{\n    subject:scope.subject")){console.error('retry card still navigates main study context');process.exit(1);}
if(!cssV21.includes('v8-style self-contained delayed-recall cards')){console.error('v8-style retry card CSS missing');process.exit(1);}

const appV22=fs.readFileSync('js/app.js','utf8');
const htmlV22=fs.readFileSync('index.html','utf8');
const storageV22=fs.readFileSync('js/core/storage.js','utf8');
const configV22=fs.readFileSync('js/core/config.js','utf8');
for(const token of ['clearAnswersButton','resetReviewButton','reviewTodayCount','dailyReviewList']){if(!htmlV22.includes(token)){console.error(`v9.0.22 HTML missing ${token}`);process.exit(1);}}
for(const token of ['clearFilledAnswers','resetReviewData','dailyReviewGroups','gradeDailyReview','scheduleFieldRetry']){if(!appV22.includes(token)){console.error(`v9.0.22 app missing ${token}`);process.exit(1);}}
for(const token of ['draftDate','dayChanged','reviewSchedule','completeDailyReview','clearStudyInputs','clearReviewData']){if(!storageV22.includes(token)){console.error(`v9.0.22 storage missing ${token}`);process.exit(1);}}
if(!configV22.includes('reviewIntervalsDays:[1,3,7,14,21,30]')){console.error('compressed review interval config missing');process.exit(1);}
if(appV22.includes("engine.scheduleRetry(task)")){console.error('old task-level retry still active; field-card retry should own checkbox behavior');process.exit(1);}

const cssV23=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['.retry-dock .retry-card{','display:block;','grid-template-columns:none;','writing-mode:horizontal-tb;']){if(!cssV23.includes(token)){console.error(`v9.0.23 hover card layout fix missing ${token}`);process.exit(1);}}

const appV24=fs.readFileSync('js/app.js','utf8');
const cssV24=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['showRetryResult','재인출 완료 ✓','재인출 실패','표현 확인 필요','1000']){
  if(!appV24.includes(token)){console.error(`v9.0.24 retry feedback missing ${token}`);process.exit(1);}
}
for(const token of ['.retry-result-overlay','.retry-result-overlay.result-good','.retry-result-overlay.result-bad','.retry-card-input.correct']){
  if(!cssV24.includes(token)){console.error(`v9.0.24 retry feedback CSS missing ${token}`);process.exit(1);}
}

const appV25=fs.readFileSync('js/app.js','utf8');
for(const token of ['retryCardOrderSnapshot','nextRetryCardIdAfter','advanceRetryCardAfter(id,orderBefore,1000)','valueAttitudeWholeCue','data-review-policy="recognition-cue"']){
  if(!appV25.includes(token)){console.error(`v9.0.25 missing ${token}`);process.exit(1);}
}

const appV26=fs.readFileSync('js/app.js','utf8');
const cssV26=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['retrySafeLabel','retryDockVisibleEntries','single-multiline','grading-lock']){
  if(!appV26.includes(token)&&!cssV26.includes(token)){console.error(`v9.0.26 retry-card audit fix missing ${token}`);process.exit(1);}
}
if((appV26.match(/function retryEntries\(/g)||[]).length!==1||(appV26.match(/function retryMeta\(/g)||[]).length!==1){
  console.error('duplicate retry helper declarations remain');process.exit(1);
}

const appV27=fs.readFileSync('js/app.js','utf8');
const cssV27=fs.readFileSync('assets/css/app.css','utf8');
for(const token of ['cs-cloze-content',"document.addEventListener('pointerdown'"]){
  if(!appV27.includes(token)){console.error(`v9.0.27 app fix missing ${token}`);process.exit(1);}
}
for(const token of ['word-break:keep-all','display:inline-flex!important','max-width:min(48vw,29rem)!important']){
  if(!cssV27.includes(token)){console.error(`v9.0.27 CSS fix missing ${token}`);process.exit(1);}
}
if(!fs.existsSync('docs/PRACTICE_BANK_REVIEW_v9.0.27.md')){console.error('practice review report missing');process.exit(1);}

const cssV28=fs.readFileSync('assets/css/app.css','utf8');
if(!cssV28.includes('.retry-dock.has-cards{\n  pointer-events:none!important;')){
  console.error('v9.0.28 retry dock pointer-through fix missing');process.exit(1);
}
for(const token of ['.retry-dock .retry-card-peek','.retry-dock .practical-retry-panel']){
  if(!cssV28.includes(token)){console.error(`v9.0.28 interactive retry child missing ${token}`);process.exit(1);}
}

const cssV29=fs.readFileSync('assets/css/app.css','utf8');
const appV29=fs.readFileSync('js/app.js','utf8');
if(!cssV29.includes('.cs-input-item.cs-typing-item{')||!cssV29.includes('.group-input-row.copy-mode{')){
  console.error('v9.0.29 typing layout protections missing');process.exit(1);
}
if(!appV29.includes('group-input-row copy-mode trace-copy-row')){
  console.error('v9.0.29 copy-mode markup missing');process.exit(1);
}

const htmlV30=fs.readFileSync('index.html','utf8');
const appV30=fs.readFileSync('js/app.js','utf8');
const cssV30=fs.readFileSync('assets/css/app.css','utf8');
if(!htmlV30.includes('areaMemoDock')||!htmlV30.includes('areaMemoText')){console.error('v9.0.30 memo HTML missing');process.exit(1);}
if(!appV30.includes('curriloop-area-notes-v1')||!cssV30.includes('.area-memo-shell.open')){console.error('v9.0.30 memo implementation missing');process.exit(1);}

const appV31=fs.readFileSync('js/app.js','utf8');
const cssV31=fs.readFileSync('assets/css/app.css','utf8');
if(!appV31.includes('trace-copy-stack')||!appV31.includes('trace-guide trace-guide-block')){console.error('v9.0.31 trace guide markup missing');process.exit(1);}
if(!cssV31.includes('.trace-guide{')||!cssV31.includes('.trace-copy-stack{')){console.error('v9.0.31 trace guide CSS missing');process.exit(1);}

const cssV32=fs.readFileSync('assets/css/app.css','utf8');
const htmlV32=fs.readFileSync('index.html','utf8');
if(!cssV32.includes('grid-template-columns:minmax(0,1fr) 46px!important;')||!htmlV32.includes('area-memo-tab-icon')){
  console.error('v9.0.32 memo geometry/identity fix missing');process.exit(1);
}

const appV33=fs.readFileSync('js/app.js','utf8');
const cssV33=fs.readFileSync('assets/css/app.css','utf8');
if(!appV33.includes('AREA_MEMO_DEFAULTS')||!appV33.includes('trace-answer-textarea')){
  console.error('v9.0.33 memo default / answer visibility implementation missing');process.exit(1);
}
if(!cssV33.includes('.trace-answer-textarea{')){
  console.error('v9.0.33 answer visibility CSS missing');process.exit(1);
}

const appV34=fs.readFileSync('js/app.js','utf8');
const cssV34=fs.readFileSync('assets/css/app.css','utf8');
if(!appV34.includes('splitStandardText')||!appV34.includes('data-answer="${esc(parts.body)}"')){
  console.error('v9.0.34 standard code/body split missing');process.exit(1);
}
if(!cssV34.includes('.standard-code{')||!cssV34.includes('.standard-row.standard-typing-row{')){
  console.error('v9.0.34 standard label layout CSS missing');process.exit(1);
}

const htmlV35=fs.readFileSync('index.html','utf8');
const appV35=fs.readFileSync('js/app.js','utf8');
const cssV35=fs.readFileSync('assets/css/app.css','utf8');
if(!cssV35.includes('#studyPage > .control-card{\n  position:sticky;')||!htmlV35.includes('class="retry-pill"')){
  console.error('v9.0.35 sticky controls / retry pill missing');process.exit(1);
}
if(!cssV35.includes('transform:translateX(0)!important;')||!appV35.includes("areaMemoTab?.addEventListener('pointerdown'")){
  console.error('v9.0.35 memo interaction repair missing');process.exit(1);
}
if(appV35.includes('standard-row standard-typing-row cs-input-item cs-typing-item trace-copy-row')){
  console.error('v9.0.35 standard code layout collision remains');process.exit(1);
}

const htmlV36=fs.readFileSync('index.html','utf8');const appV36=fs.readFileSync('js/app.js','utf8');if(!htmlV36.includes('areaNavigator')||!htmlV36.includes('page-jump-dock')){console.error('v9.0.36 navigation UI missing');process.exit(1);}if(!appV36.includes('renderAreaNavigator')||!appV36.includes("field.setAttribute('spellcheck','false')")){console.error('v9.0.36 behavior missing');process.exit(1);}

const appV37=fs.readFileSync('js/app.js','utf8');
if(!appV37.includes("state.fieldRetries={};")||!appV37.includes("state.fieldRetryCounts={};")){
  console.error('v9.0.37 retry OFF purge missing');process.exit(1);
}

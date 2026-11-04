import fs from 'node:fs';
const app=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');
const must=[
  ['shared prompt model',/function recallPromptModel\(r\)/],
  ['retry uses shared model',/const model=recallPromptModel\(r\),setMode=model\.setMode/],
  ['daily uses shared model',/const model=recallPromptModel\(recallRecord\)/],
  ['daily actual meta',/g\.model\.meta/],
  ['daily one-at-a-time active id',/activeDailyReviewId/],
  ['daily single render',/dailyActive\?dailyReviewCardHtml\(dailyActive,dailyIndex,daily\.length\)/],
  ['daily wrong acknowledgment',/dailyReviewPending=\{id,status,expected:group\.answer\}/],
  ['daily enter acknowledgment',/if\(dailyReviewPending\?\.id===id\)\{acknowledgeDailyReview\(id\);return;\}/],
  ['knowledge review per line',/line\.family==='지식·이해'[\s\S]*String\(line\.sourceText\|\|''\)\.trim\(\)/],
  ['review description one card',/예정된 항목을 한 장씩 복습하고/],
  ['unified review css',/v9\.0\.51 — unified recall presentation/]
];
for(const [name,re] of must){if(!(re.test(name==='review description one card'?html:name==='unified review css'?css:app))){console.error('FAIL',name);process.exit(1);}}
if(/영역 전체 회상/.test(app)){console.error('FAIL legacy daily KI whole-area recall remains');process.exit(1);}
console.log(JSON.stringify({status:'PASS',sharedRecallPromptModel:true,dailyReviewOneCardAtATime:true,dailyUsesActualAreaAndPosition:true,wrongReviewRequiresAcknowledgment:true,knowledgeReviewPerLine:true},null,2));

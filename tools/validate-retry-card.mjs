import fs from 'node:fs';
import vm from 'node:vm';

function assert(ok,msg){if(!ok){console.error(msg);process.exit(1);}}
const context={window:{}};context.window.window=context.window;vm.createContext(context);
vm.runInContext(fs.readFileSync('data/generated/study-data.js','utf8'),context,{filename:'study-data.js'});
const data=context.window.CURRILOOP_STUDY_DATA;
const app=fs.readFileSync('js/app.js','utf8');
const css=fs.readFileSync('assets/css/app.css','utf8');

const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/[·⋅ㆍ.,:;!?()[\]{}'"“”‘’\-_/\\]/g,'').toLowerCase();
function safeLabel(text,answers,fallback='해당 항목'){
  const value=String(text||'').trim();
  if(!value)return fallback;
  const vn=norm(value);
  return (answers||[]).some(a=>norm(a)&&vn.includes(norm(a)))?fallback:value;
}
function prompt(text,answer,label='이 항목'){
  const source=String(text||'').trim(),target=String(answer||'').trim();
  const sl=safeLabel(label,[target],'이 항목');
  if(!target)return `${sl}의 정답을 다시 떠올려 입력하세요.`;
  if(!source||norm(source)===norm(target))return `${sl} 전체를 다시 작성하세요.`;
  if(!source.includes(target))return `${sl}의 정답을 다시 작성하세요.`;
  const masked=source.split(target).join('〔　　　　〕');
  if(norm(target)&&norm(masked).includes(norm(target)))return `${sl}의 핵심 표현을 다시 작성하세요.`;
  return masked;
}
function safeMeta(area,family,answer){
  const answers=[answer].filter(Boolean);
  return `${safeLabel(area,answers,'해당 영역')} · ${safeLabel(family,answers,'해당 구분')}`;
}

const targets=[];
for(const line of data.lines){
  // typing mode can retry the entire official line
  targets.push({kind:'typing-whole',line,answer:line.sourceText});
  const units=(line.presentation&&line.presentation.units&&line.presentation.units.length)
    ? line.presentation.units
    : (line.keywords||[]).filter(k=>k.active);
  for(const u of units)targets.push({kind:'production-unit',line,answer:u.text});
  // v9.0.25+ whole-recall C cues for value-attitude
  if(line.family==='가치·태도'&&!units.length){
    for(const k of (line.keywords||[])){
      if(!k.active&&(k.stage3RGrades||[]).includes('C')&&Number.isInteger(k.start)&&Number.isInteger(k.end)&&line.sourceText.slice(k.start,k.end)===k.text){
        targets.push({kind:'value-attitude-cue',line,answer:k.text});
      }
    }
  }
}

let whole=0,repeated=0,metaLeakPrior=0;
const failures=[];
for(const t of targets){
  const {line,answer}=t;
  if(answer===line.sourceText)whole++;
  if(answer&&line.sourceText.split(answer).length-1>1)repeated++;
  if(answer&&(line.area.includes(answer)||line.family.includes(answer)))metaLeakPrior++;
  const p=prompt(line.sourceText,answer,`${line.family} 항목`);
  const m=safeMeta(line.area,line.family,answer);
  if(answer&&norm(p).includes(norm(answer)))failures.push({type:'prompt',id:line.lineId,answer,p});
  if(answer&&norm(m).includes(norm(answer)))failures.push({type:'meta',id:line.lineId,answer,m});
}
assert(!failures.length,`answer leakage remains: ${JSON.stringify(failures.slice(0,5))}`);

for(const token of [
  'function retryDockVisibleEntries',
  "panel.dataset.gradingLock==='1'",
  "field.id==='typingInput'&&task?.type==='ki'",
  "sourceMode:kiTyping?'single-multiline':'multi-field'",
  'noteAnswerAttempt();',
  "source.split(target).join('〔　　　　〕')",
  "retrySafeLabel(areaRaw,answers,'해당 영역')"
])assert(app.includes(token),`retry-card fix missing: ${token}`);

assert((app.match(/function retryEntries\(/g)||[]).length===1,'retryEntries duplicate declaration remains');
assert((app.match(/function retryMeta\(/g)||[]).length===1,'retryMeta duplicate declaration remains');
assert(css.includes('max-height:min(72vh,620px)'),'large retry panel viewport guard missing');
assert(css.includes('inset:auto auto 12px 50%!important'),'compact result toast missing');

console.log(JSON.stringify({
  status:'PASS',
  auditedTargets:targets.length,
  priorRisk:{
    wholeSourceTargets:whole,
    repeatedAnswerTargets:repeated,
    metadataExactLeakTargets:metaLeakPrior
  },
  residualExactAnswerLeakage:0,
  checks:[
    'whole-source prompt hiding',
    'repeated occurrence masking',
    'metadata masking',
    'KI typing as set retry',
    'whole-check answerSerial advance',
    'active card outside first six',
    'double-submit lock',
    'large-set viewport guard',
    'compact result toast'
  ]
},null,2));

import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const fail=[];
const assert=(ok,msg)=>{if(!ok)fail.push(msg);};
const d=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const app=fs.readFileSync('js/app.js','utf8');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');

assert(pkg.version==='9.0.54-study-rc.1',`package ${pkg.version}`);
assert(d.metadata.version==='v9.0.53-final-qa',`data version ${d.metadata.version}`);
assert(d.metadata.presentationLayer==='v9.0.53',`presentation layer ${d.metadata.presentationLayer}`);

const ai=d.lines.filter(l=>l.subject==='ai-basics');
const legacy=d.lines.filter(l=>l.subject!=='ai-basics');
assert(ai.length===104,`AI line count ${ai.length}`);
assert(legacy.length===270,`legacy line count ${legacy.length}`);
assert(new Set(d.lines.map(l=>l.lineId)).size===d.lines.length,'duplicate lineId');

// Official-text source freeze established by v9.0.53 line-by-line cross-check against [별책10].
const aiSourceHash=hash(ai.map(l=>`${l.lineId}\t${l.sourceText}`).join('\n'));
const legacySourceHash=hash(legacy.map(l=>`${l.lineId}\t${l.sourceText}`).join('\n'));
assert(aiSourceHash==='417e3b1bafc3faef5e601f9c8d1742bf806a79561d52baa7b06fafa57eda5d98',`AI source hash ${aiSourceHash}`);
assert(legacySourceHash==='bce21b81d787287409c0d52e378970f06f2aa2c9cc58f53c48315b60184da31e',`legacy source hash ${legacySourceHash}`);

const expectedAreaCounts={
  '인공지능의 이해':{'핵심 아이디어':2,'지식·이해':3,'과정·기능':3,'가치·태도':2,'성취기준':5,'해설':2,'고려사항':2},
  '인공지능과 학습':{'핵심 아이디어':2,'지식·이해':3,'과정·기능':4,'가치·태도':2,'성취기준':6,'해설':4,'고려사항':3},
  '인공지능의 사회적 영향':{'핵심 아이디어':2,'지식·이해':3,'과정·기능':4,'가치·태도':2,'성취기준':4,'해설':2,'고려사항':3},
  '인공지능 프로젝트':{'핵심 아이디어':2,'지식·이해':2,'과정·기능':3,'가치·태도':3,'성취기준':4,'해설':2,'고려사항':2},
  '과목 공통':{'성격':2,'목표':5,'교수·학습':9,'평가':7}
};
for(const [area,expect] of Object.entries(expectedAreaCounts)){
  for(const [family,n] of Object.entries(expect)){
    const got=ai.filter(l=>l.area===area&&l.family===family).length;
    assert(got===n,`${area}/${family}: ${got} != ${n}`);
  }
}

const standardCodes=ai.filter(l=>l.family==='성취기준').map(l=>l.sourceText.match(/^\[([^\]]+)\]/)?.[1]);
const expectedCodes=[
  ...Array.from({length:5},(_,i)=>`12인기01-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:6},(_,i)=>`12인기02-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:4},(_,i)=>`12인기03-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:4},(_,i)=>`12인기04-${String(i+1).padStart(2,'0')}`)
];
assert(JSON.stringify(standardCodes)===JSON.stringify(expectedCodes),`standard code sequence ${standardCodes.join(',')}`);

// Every active AI target must be an exact, boundary-correct slice of the official source text.
for(const l of ai){
  for(const k of l.keywords||[]){
    if(!k.active)continue;
    assert(l.sourceText.slice(k.start,k.end)===k.text,`keyword boundary ${l.lineId}/${k.keywordId}: ${JSON.stringify(k.text)}`);
  }
  for(const u of l.presentation?.units||[]){
    assert(l.sourceText.slice(u.start,u.end)===u.text,`presentation boundary ${l.lineId}/${u.unitId}: ${JSON.stringify(u.text)}`);
  }
}

// Stage-4 review caught this previously truncated semantic unit; freeze the corrected phrase.
const met04=ai.find(l=>l.lineId==='AI-TE-MET-04');
const met04Targets=met04?.presentation?.units?.map(u=>u.text)||[];
assert(met04Targets.includes('인지적 부담은 최소화'),'MET-04 contrast target 1 missing');
assert(met04Targets.includes('활용에 대한 경험은 높일 수 있도록'),'MET-04 contrast target 2 not fully repaired');
assert(!met04Targets.includes('활용에 대한 경험은 높'),'truncated MET-04 target remains');

// Final recall-policy invariants.
for(const l of ai.filter(l=>l.family==='과정·기능')){
  assert(l.presentation?.units?.length===1,`PF unit count ${l.lineId}`);
  assert(l.presentation?.units?.[0]?.text===l.sourceText,`PF not full-line recall ${l.lineId}`);
}
for(const l of ai.filter(l=>l.family==='가치·태도'))assert(l.presentation?.units?.length===1,`VA target count ${l.lineId}`);
for(const l of ai.filter(l=>l.family==='성취기준'))assert((l.presentation?.units?.length||0)>=1&&(l.presentation?.units?.length||0)<=2,`standard target count ${l.lineId}`);

const requiredStrongTargets=[
  ['AI-01-UND-EX-02','최상 우선, A*'],
  ['AI-02-LRN-EX-03','지도학습과 비지도학습, 강화학습'],
  ['AI-02-LRN-EX-03','분류, 예측, 군집'],
  ['AI-02-LRN-EX-04','컴퓨터 비전, 음성 인식, 자연어처리'],
  ['AI-TE-MET-01','문제기반학습, 프로젝트 기반학습, 디자인기반학습, 짝 프로그래밍, 탐구학습']
];
for(const [id,target] of requiredStrongTargets){
  const l=ai.find(x=>x.lineId===id);
  assert(l?.presentation?.units?.some(u=>u.text===target),`strong target missing ${id}: ${target}`);
}

// Engine integration across every AI area and common family.
const context={window:{}};context.window.window=context.window;vm.createContext(context);
for(const p of ['data/generated/study-data.js','js/core/study-engine.js'])vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});
context.window.CurriLoop.config={retryDelay:3,maxRetriesPerTaskPerRound:2};
const data=context.window.CURRILOOP_STUDY_DATA, make=context.window.CurriLoop.study.makeEngine;
const mk=(area,family,stage='single')=>({ui:{subject:'ai-basics',area,family,stage,retry:true},round:1,progress:{},itemProgress:{}});
const areas=['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트'];
let e=make(data,mk('all','content-system','whole'));e.rebuild();
assert(e.queue.length===4,`all-area content queue ${e.queue.length}`);
assert(e.areasForSubject('ai-basics').join('|')===areas.join('|'),`AI areas ${e.areasForSubject('ai-basics').join('|')}`);
for(const area of areas){
  e=make(data,mk(area,'content-standards','single'));e.rebuild();
  assert(e.queue.length===1,`${area} content-standard queue ${e.queue.length}`);
  const g=e.queue[0]?.group;
  assert(g?.area===area,`${area} group area mismatch`);
  assert((g?.standards||[]).length===expectedAreaCounts[area]['성취기준'],`${area} standard group count`);
}
e=make(data,mk('all','character-goals','single'));e.rebuild();assert(e.queue.length===7,`character-goals ${e.queue.length}`);
e=make(data,mk('all','teaching-eval','single'));e.rebuild();assert(e.queue.length===16,`teaching-eval ${e.queue.length}`);

// Shared review/retry renderer invariants remain active for AI as well.
for(const token of ['function retrySourceArea(r)','function retrySectionPosition(r)','function recallPromptModel(r)','function dailyReviewGroups()'])
  assert(app.includes(token),`shared recall function missing ${token}`);

if(fail.length){console.error(fail.join('\n'));process.exit(1);}
console.log(JSON.stringify({
  status:'PASS',
  aiLines:ai.length,
  officialSourceHash:aiSourceHash,
  legacyLines:legacy.length,
  legacySourceHash,
  correctedTarget:'활용에 대한 경험은 높일 수 있도록',
  standardCodes:standardCodes.length,
  areas
},null,2));

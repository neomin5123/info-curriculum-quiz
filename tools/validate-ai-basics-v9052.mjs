import fs from 'node:fs';import vm from 'node:vm';
const fail=[];const assert=(ok,msg)=>{if(!ok)fail.push(msg);};
const d=JSON.parse(fs.readFileSync('data/curriculum/middle-high-v9.0.6.json','utf8'));
const app=fs.readFileSync('js/app.js','utf8');
for(const token of ["'ai-basics':{",'function areaItems(subject=el.subject.value)','function syncAreas(preferred=state.ui.area)',"el.subject.append(option('all','전체 과목'))","'ai-basics':['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트']"])assert(app.includes(token),`AI UI integration missing: ${token}`);
const ai=d.lines.filter(l=>l.subject==='ai-basics');
assert(ai.length===104,`AI line count ${ai.length} != 104`);
const fam=Object.fromEntries([...new Set(ai.map(l=>l.family))].map(f=>[f,ai.filter(l=>l.family===f).length]));
const expectedFam={'성격':2,'목표':5,'핵심 아이디어':8,'지식·이해':11,'과정·기능':14,'가치·태도':9,'성취기준':19,'해설':10,'고려사항':10,'교수·학습':9,'평가':7};
for(const [k,v] of Object.entries(expectedFam))assert(fam[k]===v,`AI family ${k} ${fam[k]} != ${v}`);
const areas=['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트'];
for(const a of areas)assert(ai.some(l=>l.area===a),`AI area missing ${a}`);
const kig=(d.knowledgeUnderstandingGroups||[]).filter(g=>g.subject==='ai-basics');
assert(kig.length===4,`AI KI groups ${kig.length} != 4`);
assert(kig.map(g=>g.itemCount).join(',')==='3,3,3,2',`AI KI group sizes ${kig.map(g=>g.itemCount).join(',')}`);
// 과정·기능은 sourceText 전체가 단일 presentation unit이어야 한다.
for(const l of ai.filter(l=>l.family==='과정·기능')){
  assert(l.presentation?.units?.length===1,`PF unit count ${l.lineId}`);
  assert(l.presentation?.units?.[0]?.text===l.sourceText,`PF not full-line recall ${l.lineId}`);
}
// 가치·태도는 한 덩어리만 회상.
for(const l of ai.filter(l=>l.family==='가치·태도'))assert(l.presentation?.units?.length===1,`VA should have one chunk ${l.lineId}`);
// 성취기준 번호와 핵심 빈칸 정책.
for(const l of ai.filter(l=>l.family==='성취기준')){
  assert(/^\[12인기\d{2}-\d{2}\]/.test(l.sourceText),`standard code missing ${l.lineId}`);
  assert((l.presentation?.units?.length||0)>=1&&(l.presentation?.units?.length||0)<=2,`standard target count ${l.lineId}`);
}
const st0204=ai.find(l=>l.sourceText.startsWith('[12인기02-04]'));
assert(st0204?.presentation?.units?.map(u=>u.text).join('|')==='훈련 데이터|테스트 데이터','[12인기02-04] training/test targets');
const st0304=ai.find(l=>l.sourceText.startsWith('[12인기03-04]'));
assert(st0304?.presentation?.units?.map(u=>u.text).join('|')==='윤리적 딜레마 상황|인공지능 윤리','[12인기03-04] ethics targets');
const ex0203=ai.find(l=>l.lineId==='AI-02-LRN-EX-03');
assert(ex0203?.presentation?.units?.map(u=>u.text).join('|')==='지도학습과 비지도학습, 강화학습|분류, 예측, 군집','ML enumeration targets');
const teach=ai.find(l=>l.lineId==='AI-TE-MET-01');
assert(teach?.presentation?.units?.[0]?.text==='문제기반학습, 프로젝트 기반학습, 디자인기반학습, 짝 프로그래밍, 탐구학습','teaching methods exact list');
const ev=ai.find(l=>l.lineId==='AI-TE-EVD-04');
assert(ev?.presentation?.units?.some(u=>u.text==='인공지능의 구현과 활용'),'AI-specific evaluation target missing');
// engine integration
const context={window:{}};context.window.window=context.window;vm.createContext(context);
for(const p of ['data/generated/study-data.js','js/core/study-engine.js'])vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});
context.window.CurriLoop.config={retryDelay:3,maxRetriesPerTaskPerRound:2};
const make=context.window.CurriLoop.study.makeEngine,data=context.window.CURRILOOP_STUDY_DATA;
const state=(area,family='content-system',stage='single')=>({ui:{subject:'ai-basics',area,family,stage,retry:true},round:1,progress:{},itemProgress:{}});
let e=make(data,state('all','content-system','whole'));e.rebuild();
assert(e.subjects.includes('ai-basics'),'engine subject missing ai-basics');
assert(e.labels['ai-basics']==='인공지능 기초','AI subject label mismatch');
assert(e.areasForSubject('ai-basics').join('|')===areas.join('|'),`AI area selector mismatch ${e.areasForSubject('ai-basics').join('|')}`);
assert(e.queue.length===4,`AI all-area content tasks ${e.queue.length} != 4`);
e=make(data,state('인공지능과 학습','content-standards','single'));e.rebuild();
assert(e.queue.length===1&&e.queue[0].group.standards.length===6,'AI learning standards integration mismatch');
assert(e.queue[0].group.content?.rows.find(r=>r.family==='지식·이해')?.items.length===3,'AI learning KI integration mismatch');
e=make(data,state('all','character-goals','single'));e.rebuild();assert(e.queue.length===7,'AI character+goals line tasks != 7');
e=make(data,state('all','teaching-eval','single'));e.rebuild();assert(e.queue.length===16,'AI teaching+eval line tasks != 16');
if(fail.length){console.error(fail.join('\n'));process.exit(1);}console.log(JSON.stringify({status:'PASS',aiLines:ai.length,families:fam,areas,kiGroups:kig.length},null,2));

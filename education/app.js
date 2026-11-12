(()=>{'use strict';
const source=window.CURRILOOP_EDU_DATA||{topics:[]},topics=source.topics,exams=window.CURRILOOP_EDU_EXAMS||[];
const drills=(window.CURRILOOP_EDU_DRILLS||[]).filter(d=>topics.some(t=>t.id===d.topicId));
const standardItems=topics.flatMap(t=>t.questions.map(q=>({...q,topicId:t.id,title:t.title,area:t.area,origin:'standard'})));
const drillItems=drills.map(d=>({id:d.id,topicId:d.topicId,title:d.topicTitle,area:d.area,prompt:d.prompt,answer:d.answer,keywords:d.checks,kind:d.type,origin:'drill',hints:d.hints,sourceYear:d.sourceYear,sourcePage:d.sourcePage,sourceAnchor:d.sourceAnchor,sourceEvidence:d.sourceEvidence||'contextual',sourceAlignment:d.sourceAlignment||'주제 확장',sourceRequirement:d.sourceRequirement||'',sourceRelationNote:d.sourceRelationNote||''}));
const items=[...standardItems,...drillItems],itemsById=new Map(items.map(q=>[q.id,q]));
const drillsById=new Map(drills.map(d=>[d.id,d]));
const $=id=>document.getElementById(id),key='curriloop:education:text:v1',validGrades=['again','partial','good','easy'];
let state={reviews:{},drafts:{},examDrafts:{},examRequirements:{},examReviews:{},drillDrafts:{},drillReviews:{},checks:{}};try{const raw=JSON.parse(localStorage.getItem(key)||'{}');if(raw&&typeof raw==='object')state={reviews:raw.reviews||{},drafts:raw.drafts||{},examDrafts:raw.examDrafts||{},examRequirements:raw.examRequirements||{},examReviews:raw.examReviews||{},drillDrafts:raw.drillDrafts||{},drillReviews:raw.drillReviews||{},checks:raw.checks||{}}}catch(e){console.warn('교육학 저장 기록을 읽을 수 없습니다.',e)}
// v5 호환: 이전 '기출 변형'에서 풀이한 기록을 새 통합 문제 풀이에 반영한다.
for(const d of drills){if(!state.reviews[d.id]&&state.drillReviews[d.id])state.reviews[d.id]=state.drillReviews[d.id];if(!Object.prototype.hasOwnProperty.call(state.drafts,d.id)&&typeof state.drillDrafts[d.id]==='string')state.drafts[d.id]=state.drillDrafts[d.id];}
// Questions have stable IDs. Records for retired IDs remain in backups, but are not included in visible statistics.
const DAY=86400000;
function scheduleReview(previous,grade,now=Date.now()){
  const old=previous&&typeof previous==='object'?previous:{};
  const oldStreak=Number.isInteger(old.streak)?Math.max(0,Math.min(7,old.streak)):
    (['good','easy'].includes(old.grade)?1:0);
  let streak,days;
  if(grade==='again'){streak=0;days=1;}
  else if(grade==='partial'){streak=Math.max(0,oldStreak-1);days=2;}
  else if(grade==='good'){streak=Math.min(7,oldStreak+1);days=[0,3,7,14,30,45,60,90][streak];}
  else {streak=Math.min(7,oldStreak+2);days=[0,3,7,14,30,45,60,90][streak];days=Math.max(7,days);}
  // 성공을 다음 단계로 올리는 것은 이전 성공의 복습 예정 시각 이후에만 허용한다.
  // 하루가 바뀌어도 아직 복습 시기가 아니라면 반복 클릭으로 간격을 늘리지 않는다.
  // 실패·부분 회상은 언제든 간격을 줄일 수 있다.
  const priorSuccess=['good','easy'].includes(old.grade);
  const earlySuccess=['good','easy'].includes(grade)&&priorSuccess&&
    Number.isFinite(old.due)&&old.due>now;
  if(earlySuccess){
    streak=oldStreak;
    days=Number.isFinite(old.intervalDays)&&old.intervalDays>0?old.intervalDays:
      [0,3,7,14,30,45,60,90][Math.max(1,oldStreak)];
  }
  const history=Array.isArray(old.history)?old.history.filter(x=>x&&validGrades.includes(x.grade)&&Number.isFinite(x.at)).slice(-19):[];
  history.push({at:now,grade,days});
  return {...old,seen:true,grade,due:earlySuccess?old.due:now+days*DAY,last:now,attempts:(Number.isInteger(old.attempts)?Math.max(0,old.attempts):0)+1,streak,intervalDays:days,history};
}
let hintVisible=false;
let currentTab='concept',topicId=topics[0]?.id||'',questionId=items[0]?.id||'',queue=[],qidx=0,answerVisible=false;
const setNotice=(s)=>{$('announce').textContent=s;};
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));return true}catch(e){setNotice('브라우저 저장 공간에 기록을 저장하지 못했습니다. 기존 기록을 확인하고 저장 공간을 확보하거나 백업하세요.');return false}};
const mk=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
const fill=(select,options,value)=>{select.replaceChildren(...options.map(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;return o}));if(value!==undefined)select.value=value;};
const areas=['전체',...new Set(topics.map(t=>t.area))];
const areaOptions=()=>areas.map(a=>[a,a]);
const filteredTopics=(area,term='')=>topics.filter(t=>(area==='전체'||t.area===area)&&(!term||[t.title,t.summary,...t.sections.map(s=>s.text)].join(' ').toLowerCase().includes(term.toLowerCase())));
const syncTopicSelect=(type)=>{const area=$(type+'Area').value,term=type==='concept'?$('conceptSearch').value.trim():'';const list=filteredTopics(area,term),sel=$(type==='concept'?'conceptSelect':'practiceTopic');fill(sel,[['ALL','전체 개념'],...list.map(t=>[t.id,t.title])],topicId);if(type==='concept'){if(!list.length){topicId='';sel.value='ALL'}else if(!list.some(t=>t.id===topicId)){topicId=list[0].id;sel.value=topicId}}};
const formatDay=ts=>ts?new Date(ts).toLocaleDateString('ko-KR'):'미지정';
function stats(){const now=Date.now(),done=items.filter(q=>state.reviews[q.id]?.seen).length,due=items.filter(q=>state.reviews[q.id]?.seen&&state.reviews[q.id].due<=now).length;
$('topicCount').textContent=topics.length;$('questionCount').textContent=items.length;$('doneCount').textContent=done;$('dueCount').textContent=due;}
function showTab(t){currentTab=t;document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===t;b.classList.toggle('selected',active);b.setAttribute('aria-selected',String(active))});for(const p of ['concept','practice','review'])$(p+'Panel').hidden=p!==t;if(t==='concept')renderConcept();if(t==='practice')renderQuestion();if(t==='review')renderReview();}
function renderConcept(){if(!topics.length)return;let t=topics.find(x=>x.id===topicId);if(!t){$('conceptTitle').textContent='검색 결과가 없습니다.';$('conceptSummary').textContent='영역 또는 검색어를 바꿔 주세요.';$('conceptBody').replaceChildren();$('conceptMeta').textContent='';$('conceptSource').textContent='';return}
$('conceptSelect').value=t.id;$('conceptMeta').textContent=t.area+' · 관련 문제 '+items.filter(q=>q.topicId===t.id).length+'개';$('conceptTitle').textContent=t.title;$('conceptSummary').textContent=t.summary;
$('conceptBody').replaceChildren(...t.sections.map(s=>{let div=mk('section',undefined,'concept-section');div.append(mk('h3',s.heading),mk('p',s.text));return div}));
$('conceptSource').textContent=`주교재: ${t.source.document}, ${t.source.page}쪽 참고 · 필기 판독 및 개념 설명을 바탕으로 편집한 텍스트입니다. 원문 전체 전사가 아니므로 중요한 시험 내용은 검증이 필요합니다.`;
}
function buildQueue(keepId){let area=$('practiceArea').value,scope=$('practiceScope').value,t=$('practiceTopic').value,kind=$('practiceKind').value,now=Date.now();queue=items.filter(q=>(area==='전체'||q.area===area)&&(t==='ALL'||q.topicId===t)&&(kind==='all'||q.origin===kind)&&(
scope==='all'||(scope==='new'&&!state.reviews[q.id]?.seen)||(scope==='weak'&&['again','partial'].includes(state.reviews[q.id]?.grade))||(scope==='due'&&state.reviews[q.id]?.seen&&state.reviews[q.id]?.due<=now))).map(q=>q.id);
if(keepId&&queue.includes(keepId))qidx=queue.indexOf(keepId);else qidx=0;questionId=queue[qidx]||'';answerVisible=false;hintVisible=false;}
function renderQuestion(){
  const q=itemsById.get(questionId);
  $('answerPanel').hidden=!answerVisible;
  if(!q){
    $('practiceMeta').textContent='0문항';$('practicePrompt').textContent='조건에 맞는 문제가 없습니다.';
    $('practiceCategory').textContent='필터를 변경하거나 복습 날짜를 확인하세요.';
    $('practiceClues').hidden=true;$('toggleHints').hidden=true;$('practiceSource').textContent='';
    $('practiceAnswer').value='';$('practiceAnswer').disabled=true;$('revealAnswer').disabled=true;
    $('previousQuestion').disabled=true;$('nextQuestion').disabled=true;
    $('keywordChecklist').replaceChildren();$('practiceHistory').textContent='';$('goToConcept').disabled=true;return;
  }
  $('practiceAnswer').disabled=false;$('revealAnswer').disabled=false;$('goToConcept').disabled=false;
  $('previousQuestion').disabled=queue.length<2;$('nextQuestion').disabled=queue.length<2;
  // Naming questions must not reveal the target term in the topic title or citation before answering.
  const naming=q.kind==='명칭';
  $('practiceMeta').textContent=`${q.area} · ${naming?'개념 명칭 회상':q.title} · ${qidx+1}/${queue.length}`;
  $('practicePrompt').textContent=q.prompt;
  $('practiceCategory').textContent=q.origin==='drill'?`기출 소재 변형 · ${q.kind} · ${q.sourceYear}학년도 관련`:`개념 확인 · ${q.kind}`;
  const hasHints=q.origin==='drill'&&Array.isArray(q.hints)&&q.hints.length>0;
  $('toggleHints').hidden=!hasHints;
  $('toggleHints').textContent=hintVisible?'힌트 숨기기':'힌트 보기 (선택)';
  $('practiceClues').hidden=!hasHints||!hintVisible;
  $('practiceHints').replaceChildren(...(q.hints||[]).map(k=>mk('span',k,'hint-chip')));
  $('practiceSource').textContent=answerVisible?
    (q.origin==='drill'?`참고: ${q.sourceYear}학년도 기출 PDF ${q.sourcePage}쪽 · 연계 수준: ${q.sourceAlignment}. 원문이 요구한 내용: ${q.sourceRequirement}. 차이: ${q.sourceRelationNote}. 관련 표현의 등장 여부는 확인했으나 모범답안은 자체 제작이며 공식 채점기준이 아닙니다.`:'교육학 필기 기반 자체 제작 문제 · 공식 기출문항이 아닙니다.'):
    '학습용 자체 제작 문제 · 출처 상세 정보는 정답 확인 후 표시됩니다.';
  $('practiceAnswer').value=state.drafts[q.id]||'';
  $('practiceModel').textContent=q.answer;
  const checked=state.checks[q.id]||{};
  $('keywordResult').textContent=`자가 점검 ${q.keywords.filter((_,j)=>checked[String(j)]===true).length}/${q.keywords.length}개 확인 · 답안의 의미와 필수 조건을 직접 비교하세요.`;
  $('keywordChecklist').replaceChildren(...q.keywords.map((kw,i)=>{
    const label=mk('label',undefined,'keyword'),cb=document.createElement('input');cb.type='checkbox';
    cb.checked=checked[String(i)]===true;
    cb.addEventListener('change',()=>{const prev=state.checks[q.id]?{...state.checks[q.id]}:undefined;if(!state.checks[q.id])state.checks[q.id]={};state.checks[q.id][String(i)]=cb.checked;if(!save()){if(prev)state.checks[q.id]=prev;else delete state.checks[q.id];cb.checked=prev?.[String(i)]===true;return;}const n=q.keywords.filter((_,j)=>state.checks[q.id][String(j)]===true).length;$('keywordResult').textContent=`자가 점검 ${n}/${q.keywords.length}개 확인 · 체크하지 않은 요소를 답안과 대조하세요.`;});
    label.append(cb,document.createTextNode(' '+kw));return label;
  }));
  $('revealAnswer').textContent=answerVisible?'핵심 답안 숨기기':'핵심 답안 확인';
  const r=state.reviews[q.id];
  $('practiceHistory').textContent=r?.seen?
    `누적 ${r.attempts||1}회 평가 · 현재 연속 성공 ${r.streak||0}단계 · 다음 복습 ${formatDay(r.due)}`:
    '아직 복습 평정 기록이 없는 문제입니다.';
}
function moveQuestion(step){if(!queue.length)return;qidx=(qidx+step+queue.length)%queue.length;questionId=queue[qidx];answerVisible=false;hintVisible=false;renderQuestion()}
function gradeQuestion(g){
  const q=itemsById.get(questionId);if(!q||!validGrades.includes(g))return;
  const checkedCount=q.keywords.filter((_,i)=>state.checks[q.id]?.[String(i)]===true).length;
  const now=Date.now();const next=scheduleReview(state.reviews[q.id],g,now);
  const previous=state.reviews[q.id];state.reviews[q.id]=next;if(!save()){if(previous)state.reviews[q.id]=previous;else delete state.reviews[q.id];renderQuestion();return;}stats();
  setNotice(`${q.title} · 자가 점검 ${checkedCount}/${q.keywords.length}개 · 누적 성공 ${next.streak}단계 · ${next.intervalDays}일 후 복습 예정`);
  const oldId=questionId,oldIdx=qidx;
  buildQueue(oldId);
  if(!queue.length){renderQuestion();return}
  if(questionId===oldId&&queue.length>1)qidx=(qidx+1)%queue.length;
  else if(questionId!==oldId)qidx=Math.min(oldIdx,queue.length-1);
  questionId=queue[qidx]||'';answerVisible=false;hintVisible=false;renderQuestion();
}
function renderReview(){let now=Date.now(),due=items.filter(q=>state.reviews[q.id]?.seen&&state.reviews[q.id].due<=now),weak=items.filter(q=>['again','partial'].includes(state.reviews[q.id]?.grade));function list(id,arr){const el=$(id);el.replaceChildren();if(!arr.length){el.append(mk('p','현재 해당하는 질문이 없습니다.','empty'));return}for(const q of arr){const r=state.reviews[q.id],b=mk('button',undefined,'review-item');b.type='button';b.append(mk('strong',q.title),mk('span',q.prompt),mk('small',`마지막 평정: ${r.grade} · 다음 복습 ${formatDay(r.due)}`));b.addEventListener('click',()=>{showPracticeQuestion(q.id)});el.append(b)}}list('dueList',due);list('weakList',weak);

}
function showPracticeQuestion(id){let q=itemsById.get(id);if(!q)return;$('practiceArea').value=q.area;syncTopicSelect('practice');$('practiceTopic').value=q.topicId;$('practiceKind').value='all';$('practiceScope').value='all';buildQueue(id);showTab('practice')}
function exportJson(){let blob=new Blob([JSON.stringify({format:'curriloop-education-text-v1',exported:new Date().toISOString(),state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`CurriLoop_교육학_학습기록_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function importJson(file){
  const reader=new FileReader();
  reader.onload=()=>{try{
    const d=JSON.parse(reader.result);
    if(d.format!=='curriloop-education-text-v1'||!d.state||typeof d.state!=='object'||Array.isArray(d.state))throw Error('지원하지 않는 백업 형식');
    if(!confirm('기존 교육학 학습기록을 백업 파일 내용으로 교체할까요? 기존 기록은 먼저 내보내기 하세요.'))return;
    const src=d.state;
    const cleanText=(obj,limit)=>{let out=Object.create(null);if(!obj||typeof obj!=='object'||Array.isArray(obj))return out;
      for(const [id,value] of Object.entries(obj)){if(typeof value==='string'&&id.length<=160)Object.defineProperty(out,id,{value:value.slice(0,limit),enumerable:true,writable:true,configurable:true});}return out};
    const cleanReviews=obj=>{let out=Object.create(null);if(!obj||typeof obj!=='object'||Array.isArray(obj))return out;
      for(const [id,v] of Object.entries(obj)){
        if(id.length>160||!v||typeof v!=='object'||!validGrades.includes(v.grade)||!Number.isFinite(v.due))continue;
        const h=Array.isArray(v.history)?v.history.filter(x=>x&&validGrades.includes(x.grade)&&Number.isFinite(x.at)&&Number.isFinite(x.days)).slice(-20):[];
        Object.defineProperty(out,id,{value:{seen:true,grade:v.grade,due:v.due,last:Number.isFinite(v.last)?v.last:0,attempts:Number.isInteger(v.attempts)?Math.max(0,v.attempts):1,streak:Number.isInteger(v.streak)?Math.max(0,Math.min(7,v.streak)):undefined,intervalDays:Number.isFinite(v.intervalDays)?v.intervalDays:undefined,history:h},enumerable:true,writable:true,configurable:true});
      }return out};
    const cleanChecks=obj=>{let out=Object.create(null);if(!obj||typeof obj!=='object'||Array.isArray(obj))return out;
      for(const [id,checks] of Object.entries(obj)){if(id.length>160||!checks||typeof checks!=='object'||Array.isArray(checks))continue;
        let valid={};for(const [k,v] of Object.entries(checks))if(/^\d{1,3}$/.test(k)&&typeof v==='boolean')valid[k]=v;
        Object.defineProperty(out,id,{value:valid,enumerable:true,writable:true,configurable:true});}return out};
    const beforeImport=state;
    state={reviews:cleanReviews(src.reviews),drafts:cleanText(src.drafts,20000),examDrafts:cleanText(src.examDrafts,50000),examRequirements:cleanText(src.examRequirements,20000),examReviews:cleanReviews(src.examReviews),drillDrafts:cleanText(src.drillDrafts,20000),drillReviews:cleanReviews(src.drillReviews),checks:cleanChecks(src.checks)};
    for(const dr of drills){if(!state.reviews[dr.id]&&state.drillReviews[dr.id])state.reviews[dr.id]=state.drillReviews[dr.id];if(typeof state.drafts[dr.id]!=='string'&&typeof state.drillDrafts[dr.id]==='string')state.drafts[dr.id]=state.drillDrafts[dr.id]}
    if(!save()){state=beforeImport;setNotice('백업 복원 중 저장에 실패했습니다. 기존 학습 기록을 유지했습니다. 저장 공간을 확보한 뒤 다시 시도하세요.');return;}
    stats();buildQueue();showTab(currentTab);
    const orphan=Object.keys(state.reviews).filter(id=>!itemsById.has(id)).length;
    setNotice(`교육학 기록 복원 완료. 현재 목록에서 제외된 질문의 과거 기록 ${orphan}건도 백업용으로 보존했습니다.`);
  }catch(err){setNotice('백업을 읽지 못했습니다: '+err.message)}};
  reader.readAsText(file);
}
function init(){fill($('conceptArea'),areaOptions(),'전체');fill($('practiceArea'),areaOptions(),'전체');syncTopicSelect('concept');syncTopicSelect('practice');
$('conceptSelect').value=topicId;$('practiceTopic').value='ALL';buildQueue();
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
$('conceptArea').onchange=()=>{syncTopicSelect('concept');renderConcept()};$('conceptSearch').oninput=()=>{syncTopicSelect('concept');renderConcept()};$('conceptSelect').onchange=()=>{if($('conceptSelect').value==='ALL'){const t=filteredTopics($('conceptArea').value,$('conceptSearch').value)[0];topicId=t?.id||''}else topicId=$('conceptSelect').value;renderConcept()};
$('nextTopic').onclick=()=>{let a=filteredTopics($('conceptArea').value,$('conceptSearch').value),pos=a.findIndex(t=>t.id===topicId);if(a.length){topicId=a[(pos+1)%a.length].id;$('conceptSelect').value=topicId;renderConcept()}};
$('startTopicPractice').onclick=()=>{if(!topicId)return;let t=topics.find(t=>t.id===topicId);$('practiceArea').value=t.area;syncTopicSelect('practice');$('practiceTopic').value=t.id;$('practiceScope').value='all';buildQueue();showTab('practice')};
for(const id of ['practiceArea','practiceTopic','practiceKind','practiceScope'])$(id).addEventListener('change',()=>{if(id==='practiceArea'){$('practiceTopic').value='ALL';syncTopicSelect('practice');$('practiceTopic').value='ALL';}buildQueue();renderQuestion()});
$('shufflePractice').onclick=()=>{for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}qidx=0;questionId=queue[0]||'';answerVisible=false;hintVisible=false;renderQuestion()};
$('practiceAnswer').oninput=e=>{if(!questionId)return;const had=Object.prototype.hasOwnProperty.call(state.drafts,questionId),previous=state.drafts[questionId];state.drafts[questionId]=e.target.value;if(!save()){if(had)state.drafts[questionId]=previous;else delete state.drafts[questionId];setNotice('답안 자동 저장에 실패했습니다. 현재 입력창의 내용을 복사하고 브라우저 저장 공간을 확인하세요.');}};$('revealAnswer').onclick=()=>{answerVisible=!answerVisible;renderQuestion()};$('toggleHints').onclick=()=>{hintVisible=!hintVisible;renderQuestion()};$('previousQuestion').onclick=()=>moveQuestion(-1);$('nextQuestion').onclick=()=>moveQuestion(1);document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>gradeQuestion(b.dataset.grade));

$('goToConcept').onclick=()=>{const q=itemsById.get(questionId);if(!q)return;topicId=q.topicId;$('conceptArea').value=q.area;$('conceptSearch').value='';syncTopicSelect('concept');$('conceptSelect').value=topicId;showTab('concept');};
$('reviewRefresh').onclick=renderReview;
$('exportBtn').onclick=exportJson;$('importFile').onchange=e=>{if(e.target.files[0])importJson(e.target.files[0]);e.target.value=''};
stats();showTab('concept');}
init();
})();

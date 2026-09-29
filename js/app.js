(function(){
'use strict';
const DATA=window.CURRILOOP_STUDY_DATA;
const CL=window.CurriLoop;
if(!DATA||!CL)throw new Error('CurriLoop data/core failed to load.');
const $=id=>document.getElementById(id);
const state=CL.storage.load();
const engine=CL.study.makeEngine(DATA,state);
const el={subject:$('subjectSelect'),area:$('areaSelect'),family:$('familySelect'),stage:$('stageSelect'),hint:$('scopeHint'),content:$('studyContent'),feedback:$('feedback'),meta:$('taskMeta'),progress:$('progressMeta'),header:$('headerStats'),status:$('compactStatus'),retry:$('retryToggle'),check:$('checkButton'),reveal:$('revealButton'),prev:$('prevButton'),next:$('nextButton'),round:$('nextRoundButton'),source:$('sourceButton'),dialog:$('sourceDialog'),dialogBody:$('sourceDialogBody'),closeSource:$('closeSource')};
let revealed=false,lastGrade=null;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function option(v,t){const o=document.createElement('option');o.value=v;o.textContent=t;return o;}
function setOptions(select,items,preferred){
  select.innerHTML='';items.forEach(([v,t])=>select.append(option(v,t)));
  select.value=items.some(x=>x[0]===preferred)?preferred:items[0][0];return select.value;
}
function initSelectors(){
  el.subject.append(option('all','중·고 정보 전체'));engine.subjects.forEach(s=>el.subject.append(option(s,engine.labels[s])));
  el.area.append(option('all','전체 영역'));engine.areas.forEach(a=>el.area.append(option(a,a)));
  el.family.append(option('content-system','내용체계 전체'));
  el.family.append(option('all','전체 출제 항목'));engine.families.forEach(f=>el.family.append(option(f,f)));
  el.subject.value=[...el.subject.options].some(o=>o.value===state.ui.subject)?state.ui.subject:'middle-info';
  el.area.value=[...el.area.options].some(o=>o.value===state.ui.area)?state.ui.area:'컴퓨팅 시스템';
  el.family.value=[...el.family.options].some(o=>o.value===state.ui.family)?state.ui.family:'지식·이해';
  syncStageOptions();el.retry.checked=state.ui.retry;
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
}
function syncStageOptions(){
  const family=el.family.value||state.ui.family,area=el.area.value||state.ui.area,preferred=state.ui.stage;
  let items;
  if(family==='지식·이해'){
    items=area==='all'?[['ki-area','영역별 회상'],['ki-all','전체 영역 통회상']]:[['ki-area','영역 전체 회상']];
  }else items=[['single','단일 회상'],['practical','실전 조합']];
  state.ui.stage=setOptions(el.stage,items,preferred);
  renderScopeHint();
}
function renderScopeHint(){
  if(!el.hint)return;
  const family=el.family.value,area=el.area.value,subject=el.subject.value,stage=el.stage.value;
  let t='';
  if(family==='content-system')t='내용체계 전체 = 지식·이해 + 과정·기능 + 가치·태도';
  else if(family==='지식·이해'&&area==='all'&&stage==='ki-area')t='5개 영역을 영역별 문제로 순서대로 회상합니다.';
  else if(family==='지식·이해'&&area==='all'&&stage==='ki-all')t=subject==='all'?'학교급별로 지식·이해 전체를 한 문제씩 통회상합니다.':'선택한 학교급의 지식·이해 전체를 한 문제로 통회상합니다.';
  else if(family==='지식·이해')t='이 영역의 지식·이해 내용 요소를 한 번에 모두 회상합니다.';
  else if(area==='all')t='선택한 출제 항목을 5개 영역 전체에서 순회합니다.';
  el.hint.textContent=t;
}
function persist(){CL.storage.save(state);}
function rebuild(){const id=engine.current()?engine.taskId(engine.current()):null;engine.rebuild(id);revealed=false;lastGrade=null;render();persist();}
function setMode(m){state.ui.mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));revealed=false;lastGrade=null;render();persist();}
function currentTask(){return engine.current();}
function isKITask(task){return task&&(task.type==='ki'||task.type==='ki-all');}
function render(){
  const task=currentTask(),st=engine.stats();el.feedback.textContent='';el.feedback.className='feedback';lastGrade=null;renderScopeHint();
  if(!task){el.content.innerHTML='<div class="empty">현재 조건에 해당하는 학습 항목이 없습니다.</div>';el.meta.textContent='';el.progress.textContent='';return;}
  const isKI=isKITask(task);const subject=isKI?task.group.subjectLabel:task.line.subjectLabel,area=isKI?task.group.area:task.line.area,family=isKI?(task.type==='ki-all'?'지식·이해 · 전체 영역 통회상':'지식·이해'):task.line.family;
  el.meta.textContent=`${subject} · ${area} · ${family}`;el.progress.textContent=`${st.cursor} / ${st.total} · ${st.round}바퀴`;
  const answered=Object.values(state.progress).reduce((a,p)=>a+(p.attempts||0),0),correct=Object.values(state.progress).reduce((a,p)=>a+(p.correct||0),0);
  el.header.textContent=`누적 ${answered}회 · 정답 ${correct}회`;
  el.status.textContent=`저장: 이 브라우저 localStorage · 오답 재출제 ${state.ui.retry?'ON':'OFF'} · 앱 ${CL.config.appVersion} · 데이터 ${DATA.metadata.version}`;
  if(isKI)renderKI(task);else renderLine(task);
  const mode=state.ui.mode;let gradable=mode==='typing'||mode==='cloze';
  if(!isKI&&mode==='cloze'){const set=engine.selectedSet(task.line);gradable=!!(set&&engine.keywordsForSet(task.line,set).length);}
  el.check.disabled=!gradable;persist();
}
function groupedKIHtml(g,masked=false){
  const groups=g.groups||[g];
  return groups.map(gr=>`<section class="ki-source-group"><div class="ki-source-title">${esc(gr.area)}</div><div class="source-list">${gr.items.map((it,i)=>`<div class="item"><span class="num">${i+1}.</span> ${masked?`<span class="mask" data-reveal>${esc(it.text)}</span>`:esc(it.text)}</div>`).join('')}</div></section>`).join('');
}
function renderKI(task){
  const g=task.group,mode=state.ui.mode,aggregate=task.type==='ki-all';
  if(mode==='source'){el.content.innerHTML=`<div class="ki-prompt">${aggregate?esc(g.subjectLabel+' · 지식·이해 전체'):esc(g.area+' 영역 · 지식·이해')}</div>${groupedKIHtml(g,false)}`;return;}
  if(mode==='mask'){el.content.innerHTML=`<div class="ki-prompt">${esc(g.prompt)}</div>${groupedKIHtml(g,true)}`;bindMasks();return;}
  if(mode==='typing'){el.content.innerHTML=`<div class="ki-prompt">${esc(g.prompt)}</div><div class="typing-area"><textarea id="typingInput" placeholder="내용 요소를 한 줄에 하나씩 입력"></textarea></div>`;return;}
  el.content.innerHTML=`<div class="ki-prompt">${esc(g.prompt)}</div>${aggregate?`<div class="recall-note">총 ${g.items.length}개 · 순서 무관</div>`:''}<div class="ki-grid">${g.items.map((_,i)=>`<label class="ki-row"><span>${i+1}</span><input class="ki-input" autocomplete="off" aria-label="${i+1}번 내용 요소"><span class="ki-mark"></span></label>`).join('')}</div>`;
}
function renderLine(task){
  const line=task.line,mode=state.ui.mode;
  if(mode==='source'){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}
  if(mode==='typing'){el.content.innerHTML='<div class="typing-area"><textarea id="typingInput" placeholder="원문을 그대로 입력"></textarea></div>';return;}
  if(mode==='mask'){
    const ks=(line.presentation?.units?.length?line.presentation.units:line.keywords.filter(k=>k.active)).slice().sort((a,b)=>a.start-b.start);
    el.content.innerHTML=`<div class="mask-text">${renderWithSpans(line.sourceText,ks,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</div>`;bindMasks();return;
  }
  const set=engine.selectedSet(line),ks=engine.keywordsForSet(line,set);
  if(!set||!ks.length){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}
  el.content.innerHTML=`<div class="cloze-text">${renderWithSpans(line.sourceText,ks,(k,i)=>`<input class="inline-input" data-answer="${esc(k.text)}" aria-label="빈칸 ${i+1}" autocomplete="off">`)}</div>`;
}
function renderWithSpans(text,ks,replacer){let out='',cursor=0;ks.forEach((k,i)=>{out+=esc(text.slice(cursor,k.start))+replacer(k,i);cursor=k.end;});return out+esc(text.slice(cursor));}
function bindMasks(){document.querySelectorAll('[data-reveal]').forEach(x=>x.onclick=()=>x.classList.toggle('revealed'));}
function check(){
  const task=currentTask();if(!task)return;const mode=state.ui.mode;if(mode==='source'||mode==='mask'){el.feedback.textContent='이 모드는 채점하지 않습니다.';return;}
  let ok=false;
  if(isKITask(task)){
    const answers=task.group.items.map(x=>x.text);const values=mode==='typing'?String($('typingInput')?.value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean):[...document.querySelectorAll('.ki-input')].map(x=>x.value);
    const grade=CL.grading.gradeSet(values,answers);ok=grade.correct;lastGrade=grade;
    if(mode==='cloze'){
      const rows=[...document.querySelectorAll('.ki-row')];grade.results.forEach((r,i)=>{const inp=rows[i]?.querySelector('input'),m=rows[i]?.querySelector('.ki-mark');if(!inp||!m)return;inp.classList.remove('correct','wrong');if(r.status==='correct'){inp.classList.add('correct');m.textContent='정답';m.className='ki-mark good';}else{inp.classList.add('wrong');m.textContent=r.status==='duplicate'?'중복':r.status==='empty'?'미입력':'오답';m.className='ki-mark bad';}});
    }
    const matchedNorm=new Set(grade.matchedKeys);task.group.items.forEach(it=>CL.storage.recordItem(state,it.lineId,matchedNorm.has(CL.grading.norm(it.text))));
    el.feedback.textContent=ok?'전체 정답':`${grade.matchedCount}/${grade.total}개 정답`;el.feedback.className='feedback '+(ok?'good':'bad');
  }else{
    const line=task.line;if(mode==='typing'){ok=CL.grading.exact($('typingInput')?.value,line.sourceText);}else{const inputs=[...document.querySelectorAll('.inline-input')];ok=inputs.length>0;inputs.forEach(inp=>{const right=CL.grading.exact(inp.value,inp.dataset.answer);inp.classList.toggle('correct',right);inp.classList.toggle('wrong',!right);if(!right)ok=false;});}
    el.feedback.textContent=ok?'정답':'원문과 다른 부분이 있습니다.';el.feedback.className='feedback '+(ok?'good':'bad');
  }
  CL.storage.record(state,engine.taskId(task),ok);if(!ok)engine.scheduleRetry(task);persist();renderStatusOnly();
}
function renderStatusOnly(){const answered=Object.values(state.progress).reduce((a,p)=>a+(p.attempts||0),0),correct=Object.values(state.progress).reduce((a,p)=>a+(p.correct||0),0);el.header.textContent=`누적 ${answered}회 · 정답 ${correct}회`;}
function reveal(){
  const task=currentTask();if(!task)return;revealed=!revealed;let box=document.querySelector('.answer-box');if(box)box.remove();if(!revealed)return;
  if(isKITask(task)){const g=task.group;const ans=(g.groups||[g]).map(gr=>`<strong>${esc(gr.area)}</strong><br>${gr.items.map((x,i)=>`${i+1}. ${esc(x.text)}`).join('<br>')}`).join('<br><br>');el.content.insertAdjacentHTML('beforeend',`<div class="answer-box">${ans}</div>`);}else el.content.insertAdjacentHTML('beforeend',`<div class="answer-box">${esc(task.line.sourceText)}</div>`);
}
function sourceInfo(){
  const task=currentTask();if(!task)return;const isKI=isKITask(task);const subject=isKI?task.group.subjectLabel:task.line.subjectLabel,area=isKI?task.group.area:task.line.area,family=isKI?'지식·이해':task.line.family,id=isKI?task.group.groupId:task.line.lineId;
  const official=isKI?(task.group.groups||[task.group]).map(gr=>`[${gr.area}]\n${gr.items.map(x=>'• '+x.text).join('\n')}`).join('\n\n'):task.line.sourceText;
  el.dialogBody.className='source-dialog-body';el.dialogBody.innerHTML=`<dl><dt>문서</dt><dd>${esc(CL.config.officialSource)}</dd><dt>과목</dt><dd>${esc(subject)}</dd><dt>영역</dt><dd>${esc(area)}</dd><dt>구분</dt><dd>${esc(family)}</dd><dt>ID</dt><dd><code>${esc(id)}</code></dd></dl><div class="official">${esc(official)}</div>`;el.dialog.showModal();
}
function changeFilters(){state.ui.subject=el.subject.value;state.ui.area=el.area.value;state.ui.family=el.family.value;syncStageOptions();state.ui.stage=el.stage.value;rebuild();}
initSelectors();engine.rebuild();render();
el.subject.onchange=changeFilters;el.area.onchange=changeFilters;el.family.onchange=changeFilters;el.stage.onchange=()=>{state.ui.stage=el.stage.value;renderScopeHint();rebuild();};el.retry.onchange=()=>{state.ui.retry=el.retry.checked;persist();render();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
el.check.onclick=check;el.reveal.onclick=reveal;el.next.onclick=()=>{engine.next();revealed=false;render();};el.prev.onclick=()=>{engine.prev();revealed=false;render();};el.round.onclick=()=>{engine.nextRound();revealed=false;render();};el.source.onclick=sourceInfo;el.closeSource.onclick=()=>el.dialog.close();
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();

(function(){
'use strict';
const DATA=window.CURRILOOP_STUDY_DATA,CL=window.CurriLoop;if(!DATA||!CL)throw new Error('CurriLoop data/core failed to load.');
const $=id=>document.getElementById(id),state=CL.storage.load(),engine=CL.study.makeEngine(DATA,state);
const el={subject:$('subjectSelect'),area:$('areaSelect'),family:$('familySelect'),stage:$('stageSelect'),zoom:$('zoomSelect'),content:$('studyContent'),feedback:$('feedback'),meta:$('taskMeta'),progress:$('progressMeta'),retry:$('retryToggle'),check:$('checkButton'),reveal:$('revealButton'),prev:$('prevButton'),next:$('nextButton'),round:$('nextRoundButton'),source:$('sourceButton'),dialog:$('sourceDialog'),dialogBody:$('sourceDialogBody'),closeSource:$('closeSource')};
let revealed=false;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function option(v,t){const o=document.createElement('option');o.value=v;o.textContent=t;return o;}
function setOptions(select,items,preferred){select.innerHTML='';items.forEach(([v,t])=>select.append(option(v,t)));select.value=items.some(x=>x[0]===preferred)?preferred:items[0]?.[0]||'';return select.value;}
function familyItems(){return engine.familyGroupOrder.filter(id=>engine.groupAvailable(id,el.subject.value,state.ui.area)).map(id=>[id,engine.groupLabel(id)]);}
function syncFamilies(preferred=state.ui.family){state.ui.family=setOptions(el.family,familyItems(),preferred);}
function syncStages(preferred=state.ui.stage){state.ui.stage=setOptions(el.stage,[['single','단일 회상'],['practical','실전 조합'],['whole','통짜 회상']],preferred);}
function initSelectors(){
  el.subject.append(option('all','중·고 정보 전체'));engine.subjects.forEach(s=>el.subject.append(option(s,engine.labels[s])));
  el.area.append(option('all','전체 영역'));engine.areas.forEach(a=>el.area.append(option(a,a)));
  el.subject.value=[...el.subject.options].some(o=>o.value===state.ui.subject)?state.ui.subject:'middle-info';
  el.area.value=[...el.area.options].some(o=>o.value===state.ui.area)?state.ui.area:'컴퓨팅 시스템';state.ui.area=el.area.value;
  syncFamilies();syncStages();el.retry.checked=state.ui.retry;el.zoom.value=String(state.ui.zoom||100);applyZoom();
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
}
function applyZoom(){const z=Number(el.zoom.value||100);state.ui.zoom=z;document.documentElement.style.setProperty('--ui-zoom',String(z/100));}
function persist(){CL.storage.save(state);}
function rebuild(){const id=engine.current()?engine.taskId(engine.current()):null;engine.rebuild(id);revealed=false;render();persist();}
function setMode(m){state.ui.mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));revealed=false;render();persist();}
function currentTask(){return engine.current();}
function isGroupTask(t){return t&&['content-system','content-standards','whole-group'].includes(t.type);}
function isKITask(t){return t&&t.type==='ki';}
function taskContext(task){
  if(task.type==='line')return {subject:task.line.subjectLabel,area:task.line.area,family:task.line.family,id:task.line.lineId};
  if(task.type==='ki')return {subject:task.group.subjectLabel,area:task.group.area,family:'지식·이해',id:task.group.groupId};
  return {subject:task.group.subjectLabel,area:task.group.area,family:task.group.label,id:task.group.groupId};
}
function render(){
  const task=currentTask(),st=engine.stats();el.feedback.textContent='';el.feedback.className='feedback';
  if(!task){el.content.innerHTML='<div class="empty">현재 조건에 해당하는 학습 항목이 없습니다.</div>';el.meta.textContent='';el.progress.textContent='';return;}
  const c=taskContext(task);el.meta.textContent=`${c.subject} · ${c.area} · ${c.family}`;el.progress.textContent=`${st.cursor} / ${st.total}`;
  if(task.type==='content-system')renderContentSystem(task.group);
  else if(task.type==='content-standards')renderContentStandards(task.group);
  else if(task.type==='whole-group')renderWholeGroup(task.group);
  else if(task.type==='ki')renderKI(task.group);
  else renderLine(task.line);
  const mode=state.ui.mode;let gradable=mode==='typing'||mode==='cloze';
  if(task.type==='line'&&mode==='cloze'){const set=engine.selectedSet(task.line);gradable=!!(set&&engine.keywordsForSet(task.line,set).length);}
  el.check.disabled=!gradable;persist();
}
function sourceItems(items,masked=false){return `<div class="source-list">${items.map((it,i)=>`<div class="item"><span class="num">${i+1}.</span> ${masked?`<span class="mask" data-reveal>${esc(it.text)}</span>`:esc(it.text)}</div>`).join('')}</div>`;}
function renderKI(g){
  const mode=state.ui.mode;if(mode==='source'){el.content.innerHTML=sourceItems(g.items,false);return;}if(mode==='mask'){el.content.innerHTML=sourceItems(g.items,true);bindMasks();return;}
  if(mode==='typing'){el.content.innerHTML=`<div class="typing-area"><textarea id="typingInput" placeholder="내용 요소를 한 줄에 하나씩 입력"></textarea></div>`;return;}
  el.content.innerHTML=`<div class="ki-grid">${g.items.map((_,i)=>`<label class="ki-row"><span>${i+1}</span><input class="ki-input" autocomplete="off" aria-label="${i+1}번 내용 요소"><span class="ki-mark"></span></label>`).join('')}</div>`;
}
function inputRows(items,prefix,mode){
  if(mode==='source')return sourceItems(items,false);if(mode==='mask')return sourceItems(items,true);
  return `<div class="group-inputs">${items.map((it,i)=>`<label class="group-input-row">${mode==='typing'?`<span class="copy-source">${esc(it.text)}</span>`:`<span class="num">${i+1}</span>`}<input class="group-input" data-section="${esc(prefix)}" data-line-id="${esc(it.lineId)}" ${mode==='typing'?`data-answer="${esc(it.text)}"`:''} autocomplete="off"><span class="group-mark"></span></label>`).join('')}</div>`;
}
function contentSystemHtml(g,mode){
  const core=g.coreIdeas?.length?`<section class="core-ideas"><div class="section-title">핵심 아이디어</div>${inputRows(g.coreIdeas,'핵심 아이디어',mode)}</section>`:'';
  const table=`<div class="cs-table" role="table"><div class="cs-head" role="row"><div>범주</div><div>내용 요소</div></div>${g.rows.map(row=>`<div class="cs-row" role="row" data-section-block="${esc(row.family)}"><div class="cs-family">${esc(row.family)}</div><div class="cs-items">${inputRows(row.items,row.family,mode)}</div></div>`).join('')}</div>`;
  return `<div class="cs-wrap">${core}${table}</div>`;
}
function renderContentSystem(g){el.content.innerHTML=contentSystemHtml(g,state.ui.mode);if(state.ui.mode==='mask')bindMasks();}
function renderContentStandards(g){
  const mode=state.ui.mode,content=g.content?contentSystemHtml(g.content,mode):'',standards=g.standards.length?`<section class="whole-section standards-section"><div class="section-title">성취기준</div>${inputRows(g.standards,'성취기준',mode)}</section>`:'';
  el.content.innerHTML=`<div class="whole-wrap">${content}${standards}</div>`;if(mode==='mask')bindMasks();
}
function renderWholeGroup(g){
  const mode=state.ui.mode;el.content.innerHTML=`<div class="whole-wrap">${g.sections.map(s=>`<section class="whole-section"><div class="section-title">${esc(s.family)}</div>${inputRows(s.items,s.family,mode)}</section>`).join('')}</div>`;if(mode==='mask')bindMasks();
}
function renderLine(line){
  const mode=state.ui.mode;if(mode==='source'){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}if(mode==='typing'){el.content.innerHTML='<div class="typing-area"><textarea id="typingInput" placeholder="원문을 그대로 입력"></textarea></div>';return;}
  if(mode==='mask'){const ks=(line.presentation?.units?.length?line.presentation.units:line.keywords.filter(k=>k.active)).slice().sort((a,b)=>a.start-b.start);el.content.innerHTML=`<div class="mask-text">${renderWithSpans(line.sourceText,ks,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</div>`;bindMasks();return;}
  const set=engine.selectedSet(line),ks=engine.keywordsForSet(line,set);if(!set||!ks.length){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}el.content.innerHTML=`<div class="cloze-text">${renderWithSpans(line.sourceText,ks,(k,i)=>`<input class="inline-input" data-answer="${esc(k.text)}" aria-label="빈칸 ${i+1}" autocomplete="off">`)}</div>`;
}
function renderWithSpans(text,ks,replacer){let out='',cursor=0;ks.forEach((k,i)=>{out+=esc(text.slice(cursor,k.start))+replacer(k,i);cursor=k.end;});return out+esc(text.slice(cursor));}
function bindMasks(){document.querySelectorAll('[data-reveal]').forEach(x=>x.onclick=()=>x.classList.toggle('revealed'));}
function gradeSection(items,inputs,typing){
  if(typing){let matched=0;inputs.forEach((inp,i)=>{const right=CL.grading.exact(inp.value,items[i]?.text||'');paintGroupInput(inp,right,right?'정답':'오답');CL.storage.recordItem(state,inp.dataset.lineId,right);if(right)matched++;});return {correct:matched===items.length&&items.length>0,matched,total:items.length};}
  const grade=CL.grading.gradeSet(inputs.map(x=>x.value),items.map(x=>x.text));grade.results.forEach((r,i)=>{const inp=inputs[i];if(!inp)return;paintGroupInput(inp,r.status==='correct',r.status==='correct'?'정답':r.status==='duplicate'?'중복':r.status==='empty'?'미입력':'오답');});const matchedNorm=new Set(grade.matchedKeys);items.forEach(it=>CL.storage.recordItem(state,it.lineId,matchedNorm.has(CL.grading.norm(it.text))));return {correct:grade.correct,matched:grade.matchedCount,total:grade.total};
}
function paintGroupInput(inp,right,text){inp.classList.toggle('correct',right);inp.classList.toggle('wrong',!right);const m=inp.parentElement.querySelector('.group-mark');if(m){m.textContent=text;m.className='group-mark '+(right?'good':'bad');}}
function groupSections(task){
  if(task.type==='content-system')return [...(task.group.coreIdeas?.length?[{family:'핵심 아이디어',items:task.group.coreIdeas}]:[]),...task.group.rows];
  if(task.type==='content-standards')return [...(task.group.content?.coreIdeas?.length?[{family:'핵심 아이디어',items:task.group.content.coreIdeas}]:[]),...(task.group.content?.rows||[]),...(task.group.standards.length?[{family:'성취기준',items:task.group.standards}]:[])];
  return task.group.sections||[];
}
function check(){
  const task=currentTask();if(!task)return;const mode=state.ui.mode;if(mode==='source'||mode==='mask'){el.feedback.textContent='이 모드는 채점하지 않습니다.';return;}let ok=false,matched=0,total=0;
  if(isGroupTask(task)){
    ok=true;groupSections(task).forEach(sec=>{const inputs=[...document.querySelectorAll(`.group-input[data-section="${CSS.escape(sec.family)}"]`)];const r=gradeSection(sec.items,inputs,mode==='typing');matched+=r.matched;total+=r.total;if(!r.correct)ok=false;});el.feedback.textContent=ok?'전체 정답':`${matched}/${total}개 정답`;el.feedback.className='feedback '+(ok?'good':'bad');
  }else if(isKITask(task)){
    const answers=task.group.items.map(x=>x.text),values=mode==='typing'?String($('typingInput')?.value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean):[...document.querySelectorAll('.ki-input')].map(x=>x.value),grade=CL.grading.gradeSet(values,answers);ok=grade.correct;if(mode==='cloze'){const rows=[...document.querySelectorAll('.ki-row')];grade.results.forEach((r,i)=>{const inp=rows[i]?.querySelector('input'),m=rows[i]?.querySelector('.ki-mark');if(!inp||!m)return;inp.classList.toggle('correct',r.status==='correct');inp.classList.toggle('wrong',r.status!=='correct');m.textContent=r.status==='correct'?'정답':r.status==='duplicate'?'중복':r.status==='empty'?'미입력':'오답';m.className='ki-mark '+(r.status==='correct'?'good':'bad');});}const matchedNorm=new Set(grade.matchedKeys);task.group.items.forEach(it=>CL.storage.recordItem(state,it.lineId,matchedNorm.has(CL.grading.norm(it.text))));el.feedback.textContent=ok?'전체 정답':`${grade.matchedCount}/${grade.total}개 정답`;el.feedback.className='feedback '+(ok?'good':'bad');
  }else{
    const line=task.line;if(mode==='typing')ok=CL.grading.exact($('typingInput')?.value,line.sourceText);else{const inputs=[...document.querySelectorAll('.inline-input')];ok=inputs.length>0;inputs.forEach(inp=>{const right=CL.grading.exact(inp.value,inp.dataset.answer);inp.classList.toggle('correct',right);inp.classList.toggle('wrong',!right);if(!right)ok=false;});}el.feedback.textContent=ok?'정답':'원문과 다른 부분이 있습니다.';el.feedback.className='feedback '+(ok?'good':'bad');
  }
  CL.storage.record(state,engine.taskId(task),ok);if(!ok)engine.scheduleRetry(task);persist();
}
function reveal(){
  const task=currentTask();if(!task)return;revealed=!revealed;document.querySelector('.answer-box')?.remove();if(!revealed)return;let html='';
  if(isGroupTask(task))html=groupSections(task).map(s=>`<strong>${esc(s.family)}</strong><br>${s.items.map((x,i)=>`${i+1}. ${esc(x.text)}`).join('<br>')}`).join('<br><br>');
  else if(isKITask(task))html=task.group.items.map((x,i)=>`${i+1}. ${esc(x.text)}`).join('<br>');else html=esc(task.line.sourceText);
  el.content.insertAdjacentHTML('beforeend',`<div class="answer-box">${html}</div>`);
}
function sourceInfo(){
  const task=currentTask();if(!task)return;const c=taskContext(task);let official='';
  if(isGroupTask(task))official=groupSections(task).map(s=>`[${s.family}]\n${s.items.map(x=>'• '+x.text).join('\n')}`).join('\n\n');else if(isKITask(task))official=task.group.items.map(x=>'• '+x.text).join('\n');else official=task.line.sourceText;
  el.dialogBody.className='source-dialog-body';el.dialogBody.innerHTML=`<dl><dt>문서</dt><dd>${esc(CL.config.officialSource)}</dd><dt>과목</dt><dd>${esc(c.subject)}</dd><dt>영역</dt><dd>${esc(c.area)}</dd><dt>구분</dt><dd>${esc(c.family)}</dd><dt>ID</dt><dd><code>${esc(c.id)}</code></dd></dl><div class="official">${esc(official)}</div>`;el.dialog.showModal();
}
function filterChange(kind){
  if(kind==='subject')state.ui.subject=el.subject.value;
  if(kind==='area')state.ui.area=el.area.value;
  syncFamilies(state.ui.family);state.ui.family=el.family.value;syncStages(state.ui.stage);state.ui.stage=el.stage.value;rebuild();
}
initSelectors();engine.rebuild();render();
el.subject.onchange=()=>filterChange('subject');el.area.onchange=()=>filterChange('area');el.family.onchange=()=>{state.ui.family=el.family.value;syncStages();rebuild();};el.stage.onchange=()=>{state.ui.stage=el.stage.value;rebuild();};el.zoom.onchange=()=>{applyZoom();persist();};el.retry.onchange=()=>{state.ui.retry=el.retry.checked;persist();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));el.check.onclick=check;el.reveal.onclick=reveal;el.next.onclick=()=>{engine.next();revealed=false;render();};el.prev.onclick=()=>{engine.prev();revealed=false;render();};el.round.onclick=()=>{engine.nextRound();revealed=false;render();};el.source.onclick=sourceInfo;el.closeSource.onclick=()=>el.dialog.close();
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();

(function(){
'use strict';
const DATA=window.CURRILOOP_STUDY_DATA;
const CL=window.CurriLoop;
if(!DATA||!CL)throw new Error('CurriLoop data/core failed to load.');
const $=id=>document.getElementById(id);
const state=CL.storage.load();
const engine=CL.study.makeEngine(DATA,state);
const el={subject:$('subjectSelect'),area:$('areaSelect'),family:$('familySelect'),stage:$('stageSelect'),content:$('studyContent'),feedback:$('feedback'),meta:$('taskMeta'),progress:$('progressMeta'),header:$('headerStats'),status:$('compactStatus'),retry:$('retryToggle'),check:$('checkButton'),reveal:$('revealButton'),prev:$('prevButton'),next:$('nextButton'),round:$('nextRoundButton'),source:$('sourceButton'),dialog:$('sourceDialog'),dialogBody:$('sourceDialogBody'),closeSource:$('closeSource')};
let revealed=false,lastGrade=null;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function option(v,t){const o=document.createElement('option');o.value=v;o.textContent=t;return o;}
function initSelectors(){
  el.subject.append(option('all','중·고 정보 전체')); engine.subjects.forEach(s=>el.subject.append(option(s,engine.labels[s])));
  el.area.append(option('all','전체 영역')); engine.areas.forEach(a=>el.area.append(option(a,a)));
  el.family.append(option('all','전체')); engine.families.forEach(f=>el.family.append(option(f,f)));
  el.subject.value=state.ui.subject;el.area.value=state.ui.area;el.family.value=state.ui.family;el.stage.value=state.ui.stage;el.retry.checked=state.ui.retry;
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
}
function persist(){CL.storage.save(state);}
function rebuild(){const id=engine.current()?engine.taskId(engine.current()):null;engine.rebuild(id);revealed=false;lastGrade=null;render();persist();}
function setMode(m){state.ui.mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));revealed=false;lastGrade=null;render();persist();}
function currentTask(){return engine.current();}
function render(){
  const task=currentTask(); const st=engine.stats();
  el.feedback.textContent='';el.feedback.className='feedback';lastGrade=null;
  if(!task){el.content.innerHTML='<div class="empty">현재 조건에 해당하는 학습 항목이 없습니다.</div>';el.meta.textContent='';el.progress.textContent='';return;}
  const isKI=task.type==='ki';
  if(isKI){state.ui.stage='full';el.stage.value='full';el.stage.disabled=true;}else{el.stage.disabled=false;if(state.ui.stage==='full'){state.ui.stage='single';el.stage.value='single';}}
  const subject=isKI?task.group.subjectLabel:task.line.subjectLabel,area=isKI?task.group.area:task.line.area,family=isKI?'지식·이해':task.line.family;
  el.meta.textContent=`${subject} · ${area} · ${family}`;el.progress.textContent=`${st.cursor} / ${st.total} · ${st.round}바퀴`;
  const answered=Object.values(state.progress).reduce((a,p)=>a+(p.attempts||0),0),correct=Object.values(state.progress).reduce((a,p)=>a+(p.correct||0),0);
  el.header.textContent=`누적 ${answered}회 · 정답 ${correct}회`;
  el.status.textContent=`저장: 이 브라우저 localStorage · 오답 재출제 ${state.ui.retry?'ON':'OFF'} · 데이터 ${DATA.metadata.version}`;
  if(isKI)renderKI(task);else renderLine(task);
  const mode=state.ui.mode;
  let gradable=mode==='typing'||mode==='cloze';
  if(!isKI&&mode==='cloze'){const set=engine.selectedSet(task.line);gradable=!!(set&&engine.keywordsForSet(task.line,set).length);}
  el.check.disabled=!gradable;
  persist();
}
function renderKI(task){
  const g=task.group,mode=state.ui.mode;
  if(mode==='source'){
    el.content.innerHTML=`<div class="ki-prompt">${esc(g.area)} 영역 · 지식·이해</div><div class="source-list">${g.items.map((it,i)=>`<div class="item">${i+1}. ${esc(it.text)}</div>`).join('')}</div>`;return;
  }
  if(mode==='mask'){
    el.content.innerHTML=`<div class="ki-prompt">${esc(g.prompt)}</div><div class="source-list">${g.items.map((it,i)=>`<div class="item"><span class="num">${i+1}.</span> <span class="mask" data-reveal>${esc(it.text)}</span></div>`).join('')}</div>`;bindMasks();return;
  }
  if(mode==='typing'){
    el.content.innerHTML=`<div class="ki-prompt">${esc(g.prompt)}</div><div class="typing-area"><textarea id="typingInput" placeholder="내용 요소를 한 줄에 하나씩 입력"></textarea></div>`;return;
  }
  el.content.innerHTML=`<div class="ki-prompt">${esc(g.prompt)}</div><div class="ki-grid">${g.items.map((_,i)=>`<label class="ki-row"><span>${i+1}</span><input class="ki-input" autocomplete="off" aria-label="${i+1}번 내용 요소"><span class="ki-mark"></span></label>`).join('')}</div>`;
}
function renderLine(task){
  const line=task.line,mode=state.ui.mode;
  if(mode==='source'){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}
  if(mode==='typing'){el.content.innerHTML=`<div class="typing-area"><textarea id="typingInput" placeholder="원문을 그대로 입력">${''}</textarea></div>`;return;}
  if(mode==='mask'){
    const ks=line.keywords.filter(k=>k.active).sort((a,b)=>a.start-b.start); el.content.innerHTML=`<div class="mask-text">${renderWithSpans(line.sourceText,ks,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</div>`;bindMasks();return;
  }
  const set=engine.selectedSet(line),ks=engine.keywordsForSet(line,set);
  if(!set||!ks.length){el.content.innerHTML=`<div class="source-text">${esc(line.sourceText)}</div>`;return;}
  el.content.innerHTML=`<div class="cloze-text">${renderWithSpans(line.sourceText,ks,(k,i)=>`<input class="inline-input" data-answer="${esc(k.text)}" aria-label="빈칸 ${i+1}" autocomplete="off">`)}</div>`;
}
function renderWithSpans(text,ks,replacer){let out='',cursor=0;ks.forEach((k,i)=>{out+=esc(text.slice(cursor,k.start))+replacer(k,i);cursor=k.end;});return out+esc(text.slice(cursor));}
function bindMasks(){document.querySelectorAll('[data-reveal]').forEach(x=>x.onclick=()=>x.classList.toggle('revealed'));}
function check(){
  const task=currentTask();if(!task)return; const mode=state.ui.mode;
  if(mode==='source'||mode==='mask'){el.feedback.textContent='이 모드는 채점하지 않습니다.';return;}
  let ok=false;
  if(task.type==='ki'){
    const answers=task.group.items.map(x=>x.text);
    const values=mode==='typing'?String($('typingInput')?.value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean):[...document.querySelectorAll('.ki-input')].map(x=>x.value);
    const grade=CL.grading.gradeSet(values,answers);ok=grade.correct;lastGrade=grade;
    if(mode==='cloze'){
      const rows=[...document.querySelectorAll('.ki-row')];grade.results.forEach((r,i)=>{const inp=rows[i]?.querySelector('input'),m=rows[i]?.querySelector('.ki-mark');if(!inp||!m)return;inp.classList.remove('correct','wrong');if(r.status==='correct'){inp.classList.add('correct');m.textContent='정답';m.className='ki-mark good';}else{inp.classList.add('wrong');m.textContent=r.status==='duplicate'?'중복':r.status==='empty'?'미입력':'오답';m.className='ki-mark bad';}});
    }
    const matchedNorm=new Set(grade.matchedKeys);task.group.items.forEach(it=>CL.storage.recordItem(state,it.lineId,matchedNorm.has(CL.grading.norm(it.text))));
    el.feedback.textContent=ok?'전체 정답':`${grade.matchedCount}/${grade.total}개 정답`;el.feedback.className='feedback '+(ok?'good':'bad');
  }else{
    const line=task.line;
    if(mode==='typing'){ok=CL.grading.exact($('typingInput')?.value,line.sourceText);}
    else{const inputs=[...document.querySelectorAll('.inline-input')];ok=inputs.length>0;inputs.forEach(inp=>{const right=CL.grading.exact(inp.value,inp.dataset.answer);inp.classList.toggle('correct',right);inp.classList.toggle('wrong',!right);if(!right)ok=false;});}
    el.feedback.textContent=ok?'정답':'원문과 다른 부분이 있습니다.';el.feedback.className='feedback '+(ok?'good':'bad');
  }
  CL.storage.record(state,engine.taskId(task),ok);if(!ok)engine.scheduleRetry(task);persist();renderStatusOnly();
}
function renderStatusOnly(){const answered=Object.values(state.progress).reduce((a,p)=>a+(p.attempts||0),0),correct=Object.values(state.progress).reduce((a,p)=>a+(p.correct||0),0);el.header.textContent=`누적 ${answered}회 · 정답 ${correct}회`;}
function reveal(){const task=currentTask();if(!task)return;revealed=!revealed;let box=document.querySelector('.answer-box');if(box)box.remove();if(!revealed)return;if(task.type==='ki'){const ans=task.group.items.map((x,i)=>`${i+1}. ${esc(x.text)}`).join('<br>');el.content.insertAdjacentHTML('beforeend',`<div class="answer-box">${ans}</div>`);}else{el.content.insertAdjacentHTML('beforeend',`<div class="answer-box">${esc(task.line.sourceText)}</div>`);}}
function sourceInfo(){const task=currentTask();if(!task)return;const isKI=task.type==='ki';const subject=isKI?task.group.subjectLabel:task.line.subjectLabel,area=isKI?task.group.area:task.line.area,family=isKI?'지식·이해':task.line.family,id=isKI?task.group.groupId:task.line.lineId,official=isKI?task.group.items.map(x=>'• '+x.text).join('\n'):task.line.sourceText;el.dialogBody.className='source-dialog-body';el.dialogBody.innerHTML=`<dl><dt>문서</dt><dd>${esc(CL.config.officialSource)}</dd><dt>과목</dt><dd>${esc(subject)}</dd><dt>영역</dt><dd>${esc(area)}</dd><dt>구분</dt><dd>${esc(family)}</dd><dt>ID</dt><dd><code>${esc(id)}</code></dd></dl><div class="official">${esc(official)}</div>`;el.dialog.showModal();}
function changeFilters(){state.ui.subject=el.subject.value;state.ui.area=el.area.value;state.ui.family=el.family.value;state.ui.stage=el.stage.value;rebuild();}
initSelectors();engine.rebuild();render();
el.subject.onchange=changeFilters;el.area.onchange=changeFilters;el.family.onchange=changeFilters;el.stage.onchange=()=>{state.ui.stage=el.stage.value;rebuild();};el.retry.onchange=()=>{state.ui.retry=el.retry.checked;persist();render();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
el.check.onclick=check;el.reveal.onclick=reveal;el.next.onclick=()=>{engine.next();revealed=false;render();};el.prev.onclick=()=>{engine.prev();revealed=false;render();};el.round.onclick=()=>{engine.nextRound();revealed=false;render();};el.source.onclick=sourceInfo;el.closeSource.onclick=()=>el.dialog.close();
if('serviceWorker' in navigator && location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();

(function(){
'use strict';
const DATA=window.CURRILOOP_STUDY_DATA,CL=window.CurriLoop;if(!DATA||!CL)throw new Error('CurriLoop data/core failed to load.');
const $=id=>document.getElementById(id),state=CL.storage.load(),engine=CL.study.makeEngine(DATA,state);CL.storage.restoreScopeRound(state);
const el={subject:$('subjectSelect'),area:$('areaSelect'),family:$('familySelect'),stage:$('stageSelect'),zoom:$('zoomSelect'),content:$('studyContent'),feedback:$('feedback'),meta:$('taskMeta'),progress:$('progressMeta'),retry:$('retryToggle'),check:$('checkButton'),reveal:$('revealButton'),prev:$('prevButton'),next:$('nextButton'),round:$('nextRoundButton'),source:$('sourceButton'),dialog:$('sourceDialog'),dialogBody:$('sourceDialogBody'),closeSource:$('closeSource'),provenance:$('provenanceFooter')};
let revealed=false;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function option(v,t){const o=document.createElement('option');o.value=v;o.textContent=t;return o;}
function setOptions(select,items,preferred){select.innerHTML='';items.forEach(([v,t])=>select.append(option(v,t)));select.value=items.some(x=>x[0]===preferred)?preferred:items[0]?.[0]||'';return select.value;}
function familyItems(){return engine.familyGroupOrder.filter(id=>engine.groupAvailable(id,el.subject.value,state.ui.area)).map(id=>[id,engine.groupLabel(id)]);}
function syncFamilies(preferred=state.ui.family){state.ui.family=setOptions(el.family,familyItems(),preferred);}
function syncStages(preferred=state.ui.stage){state.ui.stage=setOptions(el.stage,[['single','단일 회상'],['practical','실전 조합'],['whole','전체 회상']],preferred);}
function initSelectors(){
  el.subject.append(option('all','중·고 정보 전체'));engine.subjects.forEach(s=>el.subject.append(option(s,engine.labels[s])));
  el.area.append(option('all','전체 영역'));engine.areas.forEach(a=>el.area.append(option(a,a)));
  el.subject.value=[...el.subject.options].some(o=>o.value===state.ui.subject)?state.ui.subject:'middle-info';
  el.area.value=[...el.area.options].some(o=>o.value===state.ui.area)?state.ui.area:'컴퓨팅 시스템';state.ui.area=el.area.value;
  syncFamilies();syncStages();el.retry.checked=state.ui.retry;el.zoom.value=String(state.ui.zoom||100);applyZoom();
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.ui.mode));
}
function applyZoom(){const z=Number(el.zoom.value||100);state.ui.zoom=z;document.documentElement.style.setProperty('--ui-zoom',String(z/100));}
function persist(){CL.storage.noteScopeRound(state);CL.storage.noteScopeTask(state,engine.current()?engine.taskId(engine.current()):'');CL.storage.save(state);}
function rebuild(preferredId=''){const currentId=engine.current()?engine.taskId(engine.current()):'';const id=preferredId||CL.storage.scopeTask(state)||currentId;engine.rebuild(id);revealed=false;render();persist();}
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
  if(!task){el.content.innerHTML='<div class="empty">현재 조건에 해당하는 학습 항목이 없습니다.</div>';el.meta.textContent='';el.progress.textContent='';if(el.provenance)el.provenance.textContent='';return;}
  const c=taskContext(task);el.meta.textContent=`${c.subject} · ${c.area} · ${c.family}`;el.progress.textContent=`${st.cursor} / ${st.total}`;
  if(task.type==='content-system')renderContentSystem(task);
  else if(task.type==='content-standards')renderContentStandards(task);
  else if(task.type==='whole-group')renderWholeGroup(task.group);
  else if(task.type==='ki')renderKI(task.group);
  else renderLine(task.line);
  const mode=state.ui.mode;let gradable=mode==='typing'||mode==='cloze';
  if(task.type==='line'&&mode==='cloze'){const set=engine.selectedSet(task.line);gradable=!!(set&&engine.keywordsForSet(task.line,set).length);}
  el.check.disabled=!gradable;renderProvenance(task);prepareAnswerFields();persist();
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
function contentSystemItemHtml(task,it,family,mode,itemIx){
  const focus=task?.focus||{kind:'whole',lineIds:[it.lineId]},active=!!focus.lineIds?.includes(it.lineId);
  if(mode==='source'||!active)return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${esc(it.text)}</span></div>`;

  // 지식·이해는 회상 난이도와 무관하게 해당 영역의 항목 전체를 통째로 회상한다.
  if(family==='지식·이해'){
    if(mode==='mask')return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span class="mask" data-reveal>${esc(it.text)}</span></div>`;
    if(mode==='typing')return `<label class="cs-input-item cs-typing-item"><span class="cs-copy-source">${esc(it.text)}</span><input class="group-input" data-section="${esc(family)}" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}" autocomplete="off"><span class="group-mark"></span></label>`;
    return `<label class="cs-input-item"><span class="cs-num">${itemIx+1}</span><input class="group-input" data-section="${esc(family)}" data-line-id="${esc(it.lineId)}" autocomplete="off"><span class="group-mark"></span></label>`;
  }

  const line=engine.lineMap.get(it.lineId);
  const units=line?engine.recallUnitsForLine(line,focus.kind):[];

  if(mode==='typing'){
    return `<label class="cs-input-item cs-typing-item"><span class="cs-copy-source">${esc(it.text)}</span><input class="group-input" data-section="${esc(family)}" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}" autocomplete="off"><span class="group-mark"></span></label>`;
  }
  if(!line||!units.length)return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${esc(it.text)}</span></div>`;

  if(mode==='mask'){
    return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${renderWithSpans(it.text,units,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</span></div>`;
  }

  return `<div class="cs-source-item cs-cloze-item"><span class="cs-num">${itemIx+1}</span><span>${renderWithSpans(it.text,units,(k,i)=>`<input class="inline-input cs-inline-input" data-line-id="${esc(it.lineId)}" data-answer="${esc(k.text)}" aria-label="${esc(family)} 빈칸 ${i+1}" autocomplete="off">`)}</span></div>`;
}
function contentSystemSectionHtml(task,family,items,mode){
  return items.map((it,i)=>contentSystemItemHtml(task,it,family,mode,i)).join('');
}
function contentSystemHtml(g,mode,task=null){
  const effectiveTask=task||{focus:{kind:'whole',lineIds:g.items.filter(x=>x.recallable||x.family==='지식·이해').map(x=>x.lineId)}};
  const core=g.coreIdeas?.length?`<section class="core-ideas"><div class="section-title">핵심 아이디어</div><div class="cs-items">${contentSystemSectionHtml(effectiveTask,'핵심 아이디어',g.coreIdeas,mode)}</div></section>`:'';
  const table=`<div class="cs-table" role="table"><div class="cs-head" role="row"><div>범주</div><div>내용 요소</div></div>${g.rows.map(row=>`<div class="cs-row" role="row" data-section-block="${esc(row.family)}"><div class="cs-family">${esc(row.family)}</div><div class="cs-items">${contentSystemSectionHtml(effectiveTask,row.family,row.items,mode)}</div></div>`).join('')}</div>`;
  return `<div class="cs-wrap">${core}${table}</div>`;
}
function renderContentSystem(task){el.content.innerHTML=contentSystemHtml(task.group,state.ui.mode,task);if(state.ui.mode==='mask')bindMasks();}
function standardItemHtml(task,it,mode,itemIx){
  const active=task.focus?.standardLineIds?.includes(it.lineId);
  if(mode==='source'||!active)return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${esc(it.text)}</span></div>`;
  const line=engine.lineMap.get(it.lineId),units=line?engine.recallUnitsForLine(line,task.focus?.kind||state.ui.stage):[];
  if(mode==='typing')return `<label class="cs-input-item cs-typing-item"><span class="cs-copy-source">${esc(it.text)}</span><input class="group-input standard-input" data-section="성취기준" data-line-id="${esc(it.lineId)}" data-answer="${esc(it.text)}" autocomplete="off"><span class="group-mark"></span></label>`;
  if(!line||!units.length)return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${esc(it.text)}</span></div>`;
  if(mode==='mask')return `<div class="cs-source-item"><span class="cs-num">${itemIx+1}</span><span>${renderWithSpans(it.text,units,k=>`<span class="mask" data-reveal>${esc(k.text)}</span>`)}</span></div>`;
  return `<div class="cs-source-item cs-cloze-item"><span class="cs-num">${itemIx+1}</span><span>${renderWithSpans(it.text,units,(k,i)=>`<input class="inline-input standard-inline-input" data-line-id="${esc(it.lineId)}" data-answer="${esc(k.text)}" aria-label="성취기준 빈칸 ${i+1}" autocomplete="off">`)}</span></div>`;
}
function renderContentStandards(task){
  const mode=state.ui.mode,g=task.group;
  const contentTask=g.content?{type:'content-system',group:g.content,focus:{kind:task.focus?.kind||state.ui.stage,lineIds:task.focus?.contentLineIds||[]}}:null;
  const content=g.content?contentSystemHtml(g.content,mode,contentTask):'';
  const standards=g.standards.length?`<section class="whole-section standards-section"><div class="section-title">성취기준</div><div class="cs-items">${g.standards.map((it,i)=>standardItemHtml(task,it,mode,i)).join('')}</div></section>`:'';
  el.content.innerHTML=`<div class="whole-wrap">${content}${standards}</div>`;
  if(mode==='mask')bindMasks();
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
function groupSections(task){
  if(task.type==='content-system')return [...(task.group.coreIdeas?.length?[{family:'핵심 아이디어',items:task.group.coreIdeas}]:[]),...task.group.rows];
  if(task.type==='content-standards')return [...(task.group.content?.coreIdeas?.length?[{family:'핵심 아이디어',items:task.group.content.coreIdeas}]:[]),...(task.group.content?.rows||[]),...(task.group.standards.length?[{family:'성취기준',items:task.group.standards}]:[])];
  if(task.type==='ki')return [{family:'지식·이해',items:task.group.items||[]}];
  return task.group?.sections||[];
}
function statusLabel(status,reason=''){
  if(status==='correct')return '정답';
  if(status==='near')return reason?`확인 · ${CL.grading.reasonLabel(reason)}`:'표기 확인';
  if(status==='unknown')return '모름';
  if(status==='duplicate')return '중복';
  return '오답';
}
function statusClass(status){return status==='correct'?'good':status==='near'?'near':status==='unknown'?'unknown':'bad';}
function gradeCounts(statuses){const out={correct:0,near:0,unknown:0,wrong:0,duplicate:0};statuses.forEach(s=>{if(out[s]!=null)out[s]++;});return out;}
function taskStatusFrom(statuses){return CL.grading.aggregateStatus(statuses.map(s=>s==='duplicate'?'wrong':s));}
function fieldNote(field){return field.closest('.answer-field-wrap')?.querySelector('.field-note')||null;}
function fieldMark(field){return field.closest('.group-input-row,.cs-input-item,.ki-row')?.querySelector('.group-mark,.ki-mark')||null;}
function resetFieldVisual(field){
  ['correct','near','unknown','wrong'].forEach(c=>field.classList.remove(c));
  const note=fieldNote(field);if(note){note.textContent='';note.className='field-note';}
  const mark=fieldMark(field);if(mark){mark.textContent='';mark.className=mark.classList.contains('ki-mark')?'ki-mark':'group-mark';}
}
function applyFieldGrade(field,detail,expected='',save=true){
  if(!field||!detail)return;
  resetFieldVisual(field);
  const status=detail.status==='duplicate'?'wrong':detail.status;
  field.classList.add(status);
  const label=statusLabel(detail.status,detail.reason),mark=fieldMark(field),note=fieldNote(field);
  if(mark){mark.textContent=label;mark.className=(mark.classList.contains('ki-mark')?'ki-mark ':'group-mark ')+statusClass(detail.status);}
  const answer=String(expected||detail.expected||detail.matched||'').trim();
  if(note){
    if(detail.status==='correct')note.textContent='';
    else if(detail.status==='near')note.textContent=answer?`정답: ${answer}`:'공식 표현을 다시 확인하세요.';
    else if(detail.status==='unknown')note.textContent=answer?`정답: ${answer}`:'미입력';
    else if(detail.status==='duplicate')note.textContent=answer?`이미 사용한 답 · ${answer}`:'이미 사용한 답';
    else note.textContent=answer?`정답: ${answer}`:'정답을 확인하세요.';
    note.className='field-note '+statusClass(detail.status);
  }
  if(save&&field.dataset.fieldKey)CL.storage.setFieldGrade(state,field.dataset.fieldKey,{status:detail.status,reason:detail.reason||'',expected:answer});
}
function recordMatchedItem(items,result){
  if(result?.answerIndex!=null&&items[result.answerIndex])CL.storage.recordItem(state,items[result.answerIndex].lineId,result.status==='duplicate'?'wrong':result.status);
}
function gradeSetFields(fields,items,save=true){
  const answers=items.map(x=>x.text),grade=CL.grading.gradeSetDetailed(fields.map(x=>x.value),answers),matched=new Set();
  grade.results.forEach((r,i)=>{const f=fields[i];if(!f)return;applyFieldGrade(f,r,r.expected,save);if(r.answerIndex!=null&&(r.status==='correct'||r.status==='near'))matched.add(r.answerIndex);recordMatchedItem(items,r);});
  const failureStatus=grade.results.some(r=>['wrong','duplicate'].includes(r.status))?'wrong':'unknown';
  items.forEach((it,i)=>{if(!matched.has(i))CL.storage.recordItem(state,it.lineId,failureStatus);});
  return {statuses:grade.results.map(r=>r.status),matched:grade.matchedCount,total:grade.total};
}
function expectedItemsForField(field,task){
  if(field.classList.contains('ki-input'))return task?.group?.items||[];
  const family=field.dataset.section;if(!family)return [];
  return groupSections(task).find(s=>s.family===family)?.items||[];
}
function claimedExpectedNorms(field){
  const rowSelector=field.classList.contains('ki-input')?'.ki-input':`.group-input[data-section="${CSS.escape(field.dataset.section||'')}"]:not([data-answer])`;
  const claimed=new Set();
  document.querySelectorAll(rowSelector).forEach(other=>{if(other===field)return;const g=other.dataset.fieldKey?CL.storage.getFieldGrade(state,other.dataset.fieldKey):null;if(g&&['correct','near'].includes(g.status)&&g.expected)claimed.add(CL.grading.norm(g.expected));});
  return claimed;
}
function fixedExpectedForField(field,task){
  if(field.dataset.answer)return field.dataset.answer;
  if(field.id==='typingInput'&&task?.type==='line')return task.line.sourceText;
  return '';
}
function gradeFixedField(field,expected,save=true){
  const detail=CL.grading.classifyDetailed(field.value,expected);applyFieldGrade(field,detail,expected,save);
  if(field.dataset.lineId)CL.storage.recordItem(state,field.dataset.lineId,detail.status);
  return detail;
}
function gradeUnorderedField(field,task,save=true){
  const items=expectedItemsForField(field,task),answers=items.map(x=>x.text),claimed=claimedExpectedNorms(field),detail=CL.grading.bestMatch(field.value,answers,claimed);
  applyFieldGrade(field,detail,detail.expected,save);recordMatchedItem(items,detail);
  return detail;
}
function check(){
  const task=currentTask();if(!task)return;const mode=state.ui.mode;
  if(mode==='source'||mode==='mask'){el.feedback.textContent='이 모드는 채점하지 않습니다.';return;}
  const statuses=[],processed=new Set();
  if(task.type==='ki'&&mode==='typing'){
    const field=$('typingInput'),values=String(field?.value||'').split(/\n+/).map(x=>x.trim()),r=CL.grading.gradeSetDetailed(values,task.group.items.map(x=>x.text));
    const status=r.status;applyFieldGrade(field,{status,reason:status==='unknown'?'empty':'meaning',expected:task.group.items.map(x=>x.text).join(' / ')},task.group.items.map(x=>x.text).join(' / '));statuses.push(status);
  }else{
    const unorderedFamilies=new Map();
    document.querySelectorAll('.group-input:not([data-answer]),.ki-input').forEach(field=>{const key=field.classList.contains('ki-input')?'지식·이해':field.dataset.section||'';if(!unorderedFamilies.has(key))unorderedFamilies.set(key,[]);unorderedFamilies.get(key).push(field);});
    unorderedFamilies.forEach((fields,family)=>{const items=family==='지식·이해'&&task.type==='ki'?task.group.items:(groupSections(task).find(s=>s.family===family)?.items||[]);const r=gradeSetFields(fields,items);r.statuses.forEach(x=>statuses.push(x));fields.forEach(x=>processed.add(x));});
    document.querySelectorAll('.inline-input,.group-input[data-answer]').forEach(field=>{if(processed.has(field))return;const d=gradeFixedField(field,fixedExpectedForField(field,task));statuses.push(d.status);});
    if(task.type==='line'&&mode==='typing'){
      const field=$('typingInput');if(field){const d=gradeFixedField(field,task.line.sourceText);statuses.push(d.status);}
    }
  }
  if(!statuses.length){el.feedback.textContent='채점할 입력칸이 없습니다.';el.feedback.className='feedback';return;}
  const status=taskStatusFrom(statuses),counts=gradeCounts(statuses);
  const parts=[counts.correct?`정확 ${counts.correct}`:'',counts.near?`확인 ${counts.near}`:'',counts.unknown?`모름 ${counts.unknown}`:'',(counts.wrong+counts.duplicate)?`오답 ${counts.wrong+counts.duplicate}`:''].filter(Boolean);
  el.feedback.textContent=status==='correct'?'전체 정답':parts.join(' · ');el.feedback.className='feedback '+statusClass(status);
  CL.storage.record(state,engine.taskId(task),status);if(status!=='correct')engine.scheduleRetry(task);persist();
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


function renderProvenance(task){
  if(!el.provenance||!task)return;
  const c=taskContext(task),texts=[];
  if(isGroupTask(task))groupSections(task).forEach(sec=>sec.items.forEach(it=>texts.push(it.text)));
  else if(isKITask(task))task.group.items.forEach(it=>texts.push(it.text));
  else texts.push(task.line?.sourceText||'');
  const codes=[...new Set(texts.flatMap(t=>String(t).match(/\[[^\]]+\]/g)||[]))];
  const range=codes.length?(codes.length<=4?codes.join(' · '):`${codes[0]} ~ ${codes[codes.length-1]}`):'';
  const parts=['출처', '교육부 「2022 개정 교육과정 [별책10] 실과(기술·가정)/정보과 교육과정」', c.subject, c.area, c.family];
  if(range)parts.push(`성취기준 ${range}`);
  el.provenance.textContent=parts.filter(Boolean).join(' · ');
}
function answerField(target){return target?.closest?.('.inline-input,.group-input,.ki-input,#typingInput')||null;}
function answerFields(){return [...el.content.querySelectorAll('.inline-input,.group-input,.ki-input,#typingInput')].filter(x=>!x.disabled);}
function makeFieldKey(field,index){const task=currentTask(),taskId=task?engine.taskId(task):'none';return [taskId,state.ui.stage,state.ui.mode,index].join('|');}
function prepareAnswerFields(){
  const fields=answerFields();
  fields.forEach((field,index)=>{
    field.dataset.fieldKey=makeFieldKey(field,index);
    if(!field.closest('.answer-field-wrap')){
      const wrap=document.createElement('span');wrap.className='answer-field-wrap'+(field.tagName==='TEXTAREA'?' block':'')+(field.classList.contains('inline-input')?' inline':'');
      field.parentNode.insertBefore(wrap,field);wrap.appendChild(field);
      const note=document.createElement('small');note.className='field-note';wrap.appendChild(note);
    }
    const expected=field.dataset.answer||'';
    const ch=Math.max(8,Math.min(30,[...expected].length||18));field.style.setProperty('--answer-ch',String(ch));
    const draft=CL.storage.getDraft(state,field.dataset.fieldKey);if(draft!==''&&field.value==='')field.value=draft;
    const saved=CL.storage.getFieldGrade(state,field.dataset.fieldKey);if(saved)applyFieldGrade(field,saved,saved.expected,false);
  });
  if(fields.length&&state.ui.mode!=='source'&&state.ui.mode!=='mask')requestAnimationFrame(()=>{if(!el.content.contains(document.activeElement)){const f=fields.find(x=>!CL.storage.getFieldGrade(state,x.dataset.fieldKey))||fields[0];focusAnswerField(f,false);}});
}
function focusAnswerField(field,smooth=true){if(!field)return;try{field.focus({preventScroll:true});}catch(_){field.focus();}if(typeof field.select==='function'&&field.value)field.select();field.scrollIntoView({block:'center',behavior:smooth?'smooth':'auto'});}
function nextAnswerField(field){const fields=answerFields(),i=fields.indexOf(field);for(let n=i+1;n<fields.length;n++){const g=CL.storage.getFieldGrade(state,fields[n].dataset.fieldKey);if(!g||g.status!=='correct')return fields[n];}return fields[i+1]||null;}
function clearFieldState(field){resetFieldVisual(field);if(field.dataset.fieldKey)CL.storage.clearFieldGrade(state,field.dataset.fieldKey);}
function gradeSingleAnswerField(field){
  const task=currentTask();if(!task||!field)return null;let detail=null,matchedItem=null;
  if(field.id==='typingInput'&&task.type==='ki'){
    const values=String(field.value||'').split(/\n+/).map(x=>x.trim()),g=CL.grading.gradeSetDetailed(values,task.group.items.map(x=>x.text));
    detail={status:g.status,reason:g.status==='unknown'?'empty':'meaning',expected:task.group.items.map(x=>x.text).join(' / ')};
  }else{
    const expected=fixedExpectedForField(field,task);
    if(expected)detail=CL.grading.classifyDetailed(field.value,expected);
    else{
      const items=expectedItemsForField(field,task),claimed=claimedExpectedNorms(field);detail=CL.grading.bestMatch(field.value,items.map(x=>x.text),claimed);
      if(detail.answerIndex!=null)matchedItem=items[detail.answerIndex];
    }
  }
  if(!detail)return null;
  const expected=detail.expected||fixedExpectedForField(field,task)||'';applyFieldGrade(field,detail,expected,true);
  if(matchedItem)CL.storage.recordItem(state,matchedItem.lineId,detail.status);else if(field.dataset.lineId)CL.storage.recordItem(state,field.dataset.lineId,detail.status);
  if(detail.status!=='correct'&&state.ui.retry)engine.scheduleRetry(task);
  el.feedback.textContent=statusLabel(detail.status,detail.reason)+(detail.status==='correct'?'':expected?` · 정답 ${expected}`:'');el.feedback.className='feedback '+statusClass(detail.status);
  persist();
  if(detail.status==='correct'){const next=nextAnswerField(field);if(next)setTimeout(()=>focusAnswerField(next,true),60);}
  return detail;
}
function installAnswerInputUX(){
  let tabNav=false;
  el.content.addEventListener('input',e=>{const field=answerField(e.target);if(!field)return;CL.storage.setDraft(state,field.dataset.fieldKey||'',field.value);clearFieldState(field);persist();});
  el.content.addEventListener('keydown',e=>{
    const field=answerField(e.target);if(!field)return;
    if(e.key==='Tab'){tabNav=true;setTimeout(()=>{const active=answerField(document.activeElement);if(active)active.scrollIntoView({block:'center',behavior:'smooth'});tabNav=false;},0);return;}
    if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    if(e.isComposing||e.keyCode===229)return;
    e.preventDefault();gradeSingleAnswerField(field);
  });
  el.content.addEventListener('focusin',e=>{const field=answerField(e.target);if(field&&tabNav)setTimeout(()=>field.scrollIntoView({block:'center',behavior:'smooth'}),0);});
  el.content.addEventListener('click',e=>{const field=answerField(e.target);if(!field)return;if(field.dataset.firstClickSelectDone==='1')return;field.dataset.firstClickSelectDone='1';if(typeof field.select==='function')field.select();});
}
function changeScope(mutator){persist();mutator();syncFamilies(state.ui.family);state.ui.family=el.family.value;syncStages(state.ui.stage);state.ui.stage=el.stage.value;CL.storage.restoreScopeRound(state);rebuild(CL.storage.scopeTask(state));}
function filterChange(kind){changeScope(()=>{if(kind==='subject')state.ui.subject=el.subject.value;if(kind==='area')state.ui.area=el.area.value;});}
initSelectors();CL.storage.restoreScopeRound(state);engine.rebuild(CL.storage.scopeTask(state));render();installAnswerInputUX();
el.subject.onchange=()=>filterChange('subject');
el.area.onchange=()=>filterChange('area');
el.family.onchange=()=>changeScope(()=>{state.ui.family=el.family.value;});
el.stage.onchange=()=>changeScope(()=>{state.ui.stage=el.stage.value;});
el.zoom.onchange=()=>{applyZoom();persist();};el.retry.onchange=()=>{state.ui.retry=el.retry.checked;persist();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
el.check.onclick=check;el.reveal.onclick=reveal;
el.next.onclick=()=>{engine.next();revealed=false;render();};
el.prev.onclick=()=>{engine.prev();revealed=false;render();};
el.round.onclick=()=>{engine.nextRound();revealed=false;render();};
el.source.onclick=sourceInfo;el.closeSource.onclick=()=>el.dialog.close();
if(location.protocol!=='file:')window.addEventListener('load',async()=>{
  try{
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('curriloop-')).map(k=>caches.delete(k)));
    }
  }catch(_){}
});
})();

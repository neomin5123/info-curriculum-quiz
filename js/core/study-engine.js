(function(){
  const CL=window.CurriLoop=window.CurriLoop||{};
  function makeEngine(data,state){
    const lineMap=new Map(data.lines.map(l=>[l.lineId,l]));
    const kiGroups=data.knowledgeUnderstandingGroups||[];
    const subjects=[...new Set(data.lines.map(l=>l.subject))];
    const labels=Object.fromEntries(data.lines.map(l=>[l.subject,l.subjectLabel]));
    const contentAreas=[...new Set(data.lines.map(l=>l.area))].filter(a=>a!=='과목 공통');
    const familyGroups={
      'character-goals':{label:'성격 + 목표',families:['성격','목표'],scope:'common'},
      'content-system':{label:'내용체계',families:['핵심 아이디어','지식·이해','과정·기능','가치·태도'],scope:'area'},
      'standards':{label:'성취기준',families:['성취기준'],scope:'area'},
      'content-standards':{label:'내용체계 + 성취기준',families:['핵심 아이디어','지식·이해','과정·기능','가치·태도','성취기준'],scope:'area'},
      'explain-consider':{label:'성취기준 해설 + 적용 시 고려사항',families:['해설','고려사항'],scope:'area'},
      'teaching-eval':{label:'교수학습 + 평가',families:['교수·학습','평가'],scope:'common'}
    };
    const familyGroupOrder=['character-goals','content-system','standards','content-standards','explain-consider','teaching-eval'];
    let queue=[],cursor=0,retryCounts={};

    function taskId(t){
      if(t.type==='ki')return `KI:${t.group.groupId}`;
      if(t.type==='content-system')return `CS:${t.group.subject}:${t.group.area}:${t.focus?.id||'whole'}`;
      if(t.type==='content-standards')return `CST:${t.group.subject}:${t.group.area}`;
      if(t.type==='whole-group')return `WG:${t.group.familyGroup}:${t.group.subject}:${t.group.area}`;
      return `LINE:${t.line.lineId}`;
    }
    function groupDef(id){return familyGroups[id]||null;}
    function groupLabel(id){return groupDef(id)?.label||id;}
    function selectedSubjects(){return state.ui.subject==='all'?subjects:[state.ui.subject];}
    function selectedAreas(){return state.ui.area==='all'?contentAreas:[state.ui.area];}
    function groupAvailable(id,subjectSel=state.ui.subject,areaSel=state.ui.area){
      const def=groupDef(id);if(!def)return false;
      const subs=subjectSel==='all'?subjects:[subjectSel];
      if(def.scope==='common'){
        if(areaSel!=='all')return false;
        return data.lines.some(l=>subs.includes(l.subject)&&l.area==='과목 공통'&&def.families.includes(l.family));
      }
      const ars=areaSel==='all'?contentAreas:[areaSel];
      return data.lines.some(l=>subs.includes(l.subject)&&ars.includes(l.area)&&def.families.includes(l.family));
    }
    function lineMatchesGroup(line,id){const def=groupDef(id);return !!def&&def.families.includes(line.family);}
    function itemFromLine(l){return {lineId:l.lineId,text:l.sourceText,family:l.family,sourceDoc:l.sourceDoc||'',recallable:(l.keywords||[]).some(k=>k.active)};}
    function buildContentSystemGroup(subject,area){
      const coreIdeas=data.lines.filter(l=>l.subject===subject&&l.area===area&&l.family==='핵심 아이디어').map(itemFromLine);
      const rowOrder=['지식·이해','과정·기능','가치·태도'];
      const rows=rowOrder.map(family=>({family,items:data.lines.filter(l=>l.subject===subject&&l.area===area&&l.family===family).map(itemFromLine)})).filter(r=>r.items.length);
      const items=[...coreIdeas,...rows.flatMap(r=>r.items)];if(!items.length)return null;
      return {groupId:`CS:${subject}:${area}`,subject,subjectLabel:labels[subject],area,familyGroup:'content-system',label:'내용체계',prompt:`${area} 영역의 내용체계를 완성하시오.`,coreIdeas,rows,items,itemCount:items.length};
    }
    function contentSystemRecallUnits(group){
      const units=[];
      (group.coreIdeas||[]).filter(it=>it.recallable).forEach(it=>units.push({id:`LINE:${it.lineId}`,kind:'line',family:'핵심 아이디어',lineIds:[it.lineId]}));
      const ki=group.rows.find(r=>r.family==='지식·이해');
      if(ki?.items?.length)units.push({id:`KI:${group.subject}:${group.area}`,kind:'ki',family:'지식·이해',lineIds:ki.items.map(x=>x.lineId)});
      group.rows.filter(r=>r.family!=='지식·이해').forEach(r=>r.items.filter(it=>it.recallable).forEach(it=>units.push({id:`LINE:${it.lineId}`,kind:'line',family:r.family,lineIds:[it.lineId]})));
      return units;
    }
    function buildContentSystemTasks(subject,area,stage){
      const group=buildContentSystemGroup(subject,area);if(!group)return[];
      const lineIds=group.items.filter(x=>x.recallable||x.family==='지식·이해').map(x=>x.lineId);
      return [{type:'content-system',group,focus:{id:stage,kind:stage,lineIds}}];
    }
    function buildWholeGroup(subject,area,familyGroup){
      const def=groupDef(familyGroup);if(!def)return null;
      const actualArea=def.scope==='common'?'과목 공통':area;
      const sections=def.families.map(family=>({family,items:data.lines.filter(l=>l.subject===subject&&l.area===actualArea&&l.family===family).map(itemFromLine)})).filter(s=>s.items.length);
      const items=sections.flatMap(s=>s.items);if(!items.length)return null;
      return {groupId:`WG:${familyGroup}:${subject}:${actualArea}`,subject,subjectLabel:labels[subject],area:actualArea,familyGroup,label:def.label,prompt:`${def.label}를 모두 회상하시오.`,sections,items,itemCount:items.length};
    }
    function buildContentStandardsGroup(subject,area){
      const content=buildContentSystemGroup(subject,area);
      const standards=data.lines.filter(l=>l.subject===subject&&l.area===area&&l.family==='성취기준').map(itemFromLine);
      if(!content&&!standards.length)return null;
      return {groupId:`CST:${subject}:${area}`,subject,subjectLabel:labels[subject],area,familyGroup:'content-standards',label:'내용체계 + 성취기준',prompt:`${area} 영역의 내용체계와 성취기준을 모두 회상하시오.`,content,standards,items:[...(content?.items||[]),...standards]};
    }
    function buildContentStandardsTasks(subject,area,stage){
      const group=buildContentStandardsGroup(subject,area);if(!group)return[];
      const contentLineIds=(group.content?.items||[]).filter(x=>x.recallable||x.family==='지식·이해').map(x=>x.lineId);
      const standardLineIds=(group.standards||[]).filter(x=>x.recallable).map(x=>x.lineId);
      return [{type:'content-standards',group,focus:{id:stage,kind:stage,contentLineIds,standardLineIds}}];
    }
    function buildWholeTasks(){
      const u=state.ui,id=u.family,def=groupDef(id),out=[];if(!def)return out;
      selectedSubjects().forEach(subject=>{
        if(def.scope==='common'){
          const g=buildWholeGroup(subject,'과목 공통',id);if(g)out.push({type:'whole-group',group:g});return;
        }
        selectedAreas().forEach(area=>{
          if(id==='content-system'){const g=buildContentSystemGroup(subject,area);if(g)out.push({type:'content-system',group:g});}
          else if(id==='content-standards'){const g=buildContentStandardsGroup(subject,area);if(g)out.push({type:'content-standards',group:g});}
          else {const g=buildWholeGroup(subject,area,id);if(g)out.push({type:'whole-group',group:g});}
        });
      });
      return out;
    }
    function buildLineTasks(){
      const u=state.ui,def=groupDef(u.family),out=[],consumedKI=new Set();if(!def)return out;
      data.lines.forEach(line=>{
        if(u.subject!=='all'&&line.subject!==u.subject)return;
        if(def.scope==='common'){
          if(u.area!=='all'||line.area!=='과목 공통')return;
        }else{
          if(line.area==='과목 공통')return;
          if(u.area!=='all'&&line.area!==u.area)return;
        }
        if(!lineMatchesGroup(line,u.family))return;
        if(line.family==='지식·이해'){
          const g=kiGroups.find(x=>x.subject===line.subject&&x.area===line.area);
          if(!g||consumedKI.has(g.groupId))return;
          consumedKI.add(g.groupId);out.push({type:'ki',group:g});
        }else out.push({type:'line',line});
      });
      return out;
    }
    function basePool(){
      if(state.ui.family==='content-system'){
        const out=[];
        selectedSubjects().forEach(subject=>selectedAreas().forEach(area=>out.push(...buildContentSystemTasks(subject,area,state.ui.stage))));
        return out;
      }
      if(state.ui.family==='content-standards'){
        const out=[];
        selectedSubjects().forEach(subject=>selectedAreas().forEach(area=>out.push(...buildContentStandardsTasks(subject,area,state.ui.stage))));
        return out;
      }
      return state.ui.stage==='whole'?buildWholeTasks():buildLineTasks();
    }
    function rebuild(preserveId){const pool=basePool();queue=pool.slice();retryCounts={};const idx=preserveId?queue.findIndex(t=>taskId(t)===preserveId):-1;cursor=idx>=0?idx:0;return queue;}
    function current(){return queue[cursor]||null;}
    function selectedSet(line){
      const stage=state.ui.stage;
      if(line.presentation){let sets=stage==='practical'&&line.presentation.practicalSets.length?line.presentation.practicalSets:line.presentation.coreSets;if(!sets.length)sets=line.presentation.practicalSets;if(!sets.length)return null;return sets[(Math.max(1,state.round||1)-1)%sets.length];}
      let sets=stage==='practical'&&line.practicalSets.length?line.practicalSets:line.coreSets;if(!sets.length)sets=line.practicalSets;if(!sets.length)return null;return sets[(Math.max(1,state.round||1)-1)%sets.length];
    }
    function keywordsForSet(line,set){
      if(!set)return[];
      if(line.presentation&&set.unitIds){const map=new Map(line.presentation.units.map(u=>[u.unitId,u]));return set.unitIds.map(id=>map.get(id)).filter(Boolean).sort((a,b)=>a.start-b.start);}
      const map=new Map(line.keywords.map(k=>[k.keywordId,k]));return set.keywordIds.map(id=>map.get(id)).filter(Boolean).sort((a,b)=>a.start-b.start);
    }
    function recallUnitsForLine(line,stage=state.ui.stage){
      if(stage==='whole'){
        if(line.presentation?.units?.length)return line.presentation.units.slice().sort((a,b)=>a.start-b.start);
        return line.keywords.filter(k=>k.active).slice().sort((a,b)=>a.start-b.start);
      }
      const set=selectedSet(line);
      return keywordsForSet(line,set);
    }
    function scheduleRetry(task){if(!state.ui.retry)return;const id=taskId(task),count=retryCounts[id]||0;if(count>=CL.config.maxRetriesPerTaskPerRound)return;retryCounts[id]=count+1;queue.splice(Math.min(cursor+1+CL.config.retryDelay,queue.length),0,task);}
    function next(){if(!queue.length)return null;if(cursor<queue.length-1){cursor++;return current();}state.round=(state.round||1)+1;rebuild();return current();}
    function prev(){if(cursor>0)cursor--;return current();}
    function goTo(index){if(!Number.isInteger(index)||index<0||index>=queue.length)return null;cursor=index;return current();}
    function nextRound(){state.round=(state.round||1)+1;rebuild();return current();}
    function stats(){return {cursor:queue.length?cursor+1:0,total:queue.length,round:state.round||1};}
    return {data,state,lineMap,subjects,labels,areas:contentAreas,familyGroups,familyGroupOrder,groupDef,groupLabel,groupAvailable,buildContentSystemGroup,contentSystemRecallUnits,buildContentSystemTasks,buildWholeGroup,buildContentStandardsGroup,buildContentStandardsTasks,basePool,rebuild,current,taskId,selectedSet,keywordsForSet,recallUnitsForLine,scheduleRetry,next,prev,goTo,nextRound,stats,get queue(){return queue;}};
  }
  CL.study={makeEngine};
})();

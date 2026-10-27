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
    // An all-subject area option is a subject/area pair, not just an area name.
    function areaScope(value){const m=/^subject-area:([^:]+):(.+)$/.exec(String(value||''));return m?{subject:m[1],area:m[2]}:null;}
    function selectedSubjects(){const selected=areaScope(state.ui.area);return selected?[selected.subject]:(state.ui.subject==='all'?subjects:[state.ui.subject]);}
    function areasForSubject(subject){const lines=data.lines.filter(l=>subject==='all'||l.subject===subject);return [...new Set(lines.map(l=>l.area).filter(x=>x!=='과목 공통'))];}
    function selectedAreas(){const selected=areaScope(state.ui.area);return selected?[selected.area]:(state.ui.area==='all'?contentAreas:[state.ui.area]);}
    function groupAvailable(id,subjectSel=state.ui.subject,areaSel=state.ui.area){
      const def=groupDef(id);if(!def)return false;
      const selected=areaScope(areaSel);
      const subs=selected?[selected.subject]:(subjectSel==='all'?subjects:[subjectSel]);
      if(def.scope==='common'){
        if(areaSel!=='all')return false;
        return data.lines.some(l=>subs.includes(l.subject)&&l.area==='과목 공통'&&def.families.includes(l.family));
      }
      const ars=selected?[selected.area]:(areaSel==='all'?contentAreas:[areaSel]);
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
        const selected=areaScope(u.area);
        if(selected ? line.subject!==selected.subject : u.subject!=='all'&&line.subject!==u.subject)return;
        if(def.scope==='common'){
          if(u.area!=='all'||line.area!=='과목 공통')return;
        }else{
          if(line.area==='과목 공통')return;
          if(u.area!=='all'&&line.area!==(selected?.area||u.area))return;
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
    // Presentation-only cloze boundary repair: never rewrite curriculum text or policy grades.
    // Long phrases are rendered as shorter, source-exact concept spans when reliable
    // keyword offsets are available. The persisted source data stays untouched.
    function conciseClozeUnits(line,units,maxUnits=Infinity){
      const result=[];
      for(const u of units){
        // Curated source-exact repairs for malformed or low-information long blanks.
        // Only the rendered answer spans change; source text and stored units remain intact.
        const approved={
          'MI-01-AC-ST-03-PU-01':['피지컬 컴퓨팅'],
          'MI-01-AC-EX-02-PU-05':['피지컬 컴퓨팅 시스템'],
          'MI-02-CS-PF-02-PU-01':['수집','분류','저장'],
          'MI-02-CS-PF-03-PU-01':['구조화','의미 해석'],
          'MI-02-AC-EX-02-PU-03':['데이터의 종류','공통점'],
          'MI-03-CS-PF-01-PU-01':['초기 상태','현재 상태','목표 상태'],
          'MI-03-AC-EX-03-PU-03':['순차적으로 저장할 수 있는 구조'],
          'MI-04-CS-KI-02-PU-02':['윤리적 편향성'],
          'MI-04-AC-EX-03-PU-05':['장단점','결론'],
          'HI-03-AC-EX-03-PU-01':['객체 지향','필요성'],
          'HI-04-CS-KI-02-PU-02':['데이터','기계학습 모델'],
          'MI-01-CS-PF-01-PU-01':["구성요소"],
          'MI-01-AC-EX-01-PU-02':["시스템으로 확장"],
          'MI-02-AC-EX-02-PU-04':["구분하여 저장", "활용"],
          'MI-03-CS-KI-02-PU-04':["생활을 더욱 편리하게"],
          'MI-03-AC-ST-05-PU-01':["순차적으로 저장할 수 있는 구조"],
          'MI-04-CS-KI-02-PU-01':["데이터"],
          'MI-04-AC-EX-03-PU-03':["법적", "사회적", "윤리적"],
          'MI-05-CS-PF-01-PU-01':["직업의 변화"],
          'MI-05-CS-PF-03-PU-01':["다른 사람을 보호하는 방법"],
          'MI-05-AC-ST-02-PU-01':["안전한 생활을 위한 규칙"],
          'MI-05-AC-EX-01-PU-04':["스마트폰 중독", "인터넷 중독", "게임 과몰입"],
          'MI-TE-DIR-06-PU-01':["사회문제"],
          'MI-TE-MET-03-PU-01':["프로그래밍", "문제 해결"],
          'HI-02-CS-PF-03-PU-01':["빅데이터", "분석", "시각화"],
          'HI-02-AC-ST-02-PU-02':["안전하게 관리하는 사례"],
          'HI-02-AC-EX-02-PU-02':["암호화", "복호화"],
          'HI-03-CS-PF-02-PU-01':["수행 과정", "효율성"],
          'HI-03-CS-PF-04-PU-01':["제어 구조", "다차원 데이터 구조"],
          'HI-03-CS-PF-05-PU-01':["클래스"],
          'HI-03-AC-ST-02-PU-01':["알고리즘의 특징", "효율"],
          'HI-TE-DIR-04-PU-01':["사회문제"]
        };
        const phrases=approved[u.unitId];
        if(phrases){
          let cursor=u.start, spans=[];
          for(const phrase of phrases){
            const pos=line.sourceText.indexOf(phrase,cursor);
            if(pos<0||pos+phrase.length>u.end){spans=[];break;}
            spans.push({start:pos,end:pos+phrase.length,text:phrase});cursor=pos+phrase.length;
          }
          if(spans.length===phrases.length){
            for(const k of spans)result.push({...u,...k,unitId:`${u.unitId}:curated:${k.start}`});
            continue;
          }
        }
        if(String(u.text||'').length<=16){result.push(u);continue;}
        const keys=(line.keywords||[]).filter(k=>
          Number.isInteger(k.start)&&Number.isInteger(k.end)&&
          k.start>=u.start&&k.end<=u.end&&
          k.end>k.start&&k.text===line.sourceText.slice(k.start,k.end)&&
          (k.text.trim().length>=4||k.text==='통신')&&k.text.trim().length<=12
        ).sort((a,b)=>(b.end-b.start)-(a.end-a.start)||a.start-b.start);
        const chosen=[];
        for(const k of keys){
          if(chosen.every(x=>k.end<=x.start||k.start>=x.end))chosen.push(k);
          if(chosen.length>=2)break;
        }
        if(!chosen.length){result.push(u);continue;}
        for(const k of chosen.sort((a,b)=>a.start-b.start)){
          result.push({...u,text:k.text,start:k.start,end:k.end,unitId:`${u.unitId}:short:${k.keywordId}`,sourceKeywordIds:[k.keywordId]});
        }
      }
      return result.sort((a,b)=>a.start-b.start).slice(0,maxUnits);
    }
    function keywordsForSet(line,set){
      if(!set)return[];
      if(line.presentation&&set.unitIds){const map=new Map(line.presentation.units.map(u=>[u.unitId,u]));return conciseClozeUnits(line,set.unitIds.map(id=>map.get(id)).filter(Boolean),3);}
      const map=new Map(line.keywords.map(k=>[k.keywordId,k]));return set.keywordIds.map(id=>map.get(id)).filter(Boolean).sort((a,b)=>a.start-b.start);
    }
    function recallUnitsForLine(line,stage=state.ui.stage){
      if(stage==='whole'){
        if(line.presentation?.units?.length)return conciseClozeUnits(line,line.presentation.units.slice());
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
    return {data,state,lineMap,subjects,labels,areas:contentAreas,areasForSubject,familyGroups,familyGroupOrder,groupDef,groupLabel,groupAvailable,buildContentSystemGroup,contentSystemRecallUnits,buildContentSystemTasks,buildWholeGroup,buildContentStandardsGroup,buildContentStandardsTasks,basePool,rebuild,current,taskId,selectedSet,keywordsForSet,recallUnitsForLine,scheduleRetry,next,prev,goTo,nextRound,stats,get queue(){return queue;}};
  }
  CL.study={makeEngine};
})();

(function(){
  const CL=window.CurriLoop=window.CurriLoop||{};
  function makeEngine(data,state){
    const lineMap=new Map(data.lines.map(l=>[l.lineId,l]));
    const kiGroups=data.knowledgeUnderstandingGroups||[];
    const subjects=[...new Set(data.lines.map(l=>l.subject))];
    const labels=Object.fromEntries(data.lines.map(l=>[l.subject,l.subjectLabel]));
    const areas=[...new Set(data.lines.map(l=>l.area))];
    const families=[...new Set(data.lines.map(l=>l.family))];
    const contentSystemFamilies=new Set(['지식·이해','과정·기능','가치·태도']);
    let queue=[],cursor=0,retryCounts={};

    function taskId(t){
      if(t.type==='ki-all')return `KIALL:${t.group.subject}`;
      return t.type==='ki'?`KI:${t.group.groupId}`:`LINE:${t.line.lineId}`;
    }
    function familyMatches(lineFamily,requested){
      if(requested==='all')return true;
      if(requested==='content-system')return contentSystemFamilies.has(lineFamily);
      return lineFamily===requested;
    }
    function aggregateKI(subject){
      const groups=kiGroups.filter(g=>g.subject===subject);
      if(!groups.length)return null;
      const items=[];
      groups.forEach(g=>g.items.forEach(it=>items.push({...it,area:g.area,groupId:g.groupId})));
      return {
        groupId:`${subject==='middle-info'?'MI':'HI'}-KI-ALL`,subject,subjectLabel:labels[subject],area:'전체 영역',family:'지식·이해',
        prompt:`${labels[subject]}의 전체 영역 지식·이해 내용 요소를 모두 쓰시오.`,groups,items,itemCount:items.length,
        grading:{mode:'UNORDERED_EXACT_SET',orderSensitive:false,uniqueAnswersRequired:true,allItemsRequiredForGroupComplete:true,partialItemMasteryAllowed:true}
      };
    }
    function basePool(){
      const u=state.ui,out=[];
      const selectedSubjects=u.subject==='all'?subjects:[u.subject];
      if(u.family==='지식·이해'&&u.area==='all'&&u.stage==='ki-all'){
        selectedSubjects.forEach(subject=>{const g=aggregateKI(subject);if(g)out.push({type:'ki-all',group:g});});
        return out;
      }
      const consumedKI=new Set();
      data.lines.forEach(line=>{
        if(u.subject!=='all'&&line.subject!==u.subject)return;
        if(u.area!=='all'&&line.area!==u.area)return;
        if(!familyMatches(line.family,u.family))return;
        if(line.family==='지식·이해'){
          const g=kiGroups.find(x=>x.subject===line.subject&&x.area===line.area);
          if(!g||consumedKI.has(g.groupId))return;
          consumedKI.add(g.groupId);out.push({type:'ki',group:g});
        }else out.push({type:'line',line});
      });
      return out;
    }
    function rebuild(preserveId){
      const pool=basePool();queue=pool.slice();retryCounts={};
      const idx=preserveId?queue.findIndex(t=>taskId(t)===preserveId):-1;cursor=idx>=0?idx:0;return queue;
    }
    function current(){return queue[cursor]||null;}
    function selectedSet(line){
      const stage=state.ui.stage;
      if(line.presentation){
        let sets=stage==='practical'&&line.presentation.practicalSets.length?line.presentation.practicalSets:line.presentation.coreSets;
        if(!sets.length)sets=line.presentation.practicalSets;
        if(!sets.length)return null;
        const offset=Math.max(0,(state.round||1)-1);return sets[offset%sets.length];
      }
      let sets=stage==='practical'&&line.practicalSets.length?line.practicalSets:line.coreSets;
      if(!sets.length)sets=line.practicalSets;
      if(!sets.length)return null;
      const offset=Math.max(0,(state.round||1)-1);return sets[offset%sets.length];
    }
    function keywordsForSet(line,set){
      if(!set)return[];
      if(line.presentation&&set.unitIds){
        const map=new Map(line.presentation.units.map(u=>[u.unitId,u]));
        return set.unitIds.map(id=>map.get(id)).filter(Boolean).sort((a,b)=>a.start-b.start);
      }
      const map=new Map(line.keywords.map(k=>[k.keywordId,k]));
      return set.keywordIds.map(id=>map.get(id)).filter(Boolean).sort((a,b)=>a.start-b.start);
    }
    function scheduleRetry(task){
      if(!state.ui.retry)return;const id=taskId(task),count=retryCounts[id]||0;
      if(count>=CL.config.maxRetriesPerTaskPerRound)return;retryCounts[id]=count+1;
      const at=Math.min(cursor+1+CL.config.retryDelay,queue.length);queue.splice(at,0,task);
    }
    function next(){if(!queue.length)return null;if(cursor<queue.length-1){cursor++;return current();}state.round=(state.round||1)+1;rebuild();return current();}
    function prev(){if(cursor>0)cursor--;return current();}
    function nextRound(){state.round=(state.round||1)+1;rebuild();return current();}
    function setCursorByTaskId(id){const i=queue.findIndex(t=>taskId(t)===id);if(i>=0)cursor=i;}
    function stats(){const unique=new Set(queue.map(taskId));return {cursor:cursor+1,total:queue.length,unique:unique.size,round:state.round||1};}
    return {data,state,lineMap,subjects,labels,areas,families,contentSystemFamilies,basePool,rebuild,current,taskId,selectedSet,keywordsForSet,scheduleRetry,next,prev,nextRound,setCursorByTaskId,stats,get queue(){return queue;}};
  }
  CL.study={makeEngine};
})();

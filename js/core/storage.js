(function(){
  'use strict';
  const CL=window.CurriLoop=window.CurriLoop||{};
  function localDateKey(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
  function addDays(key,days){const [y,m,d]=String(key||localDateKey()).split('-').map(Number),dt=new Date(y,m-1,d,12);dt.setDate(dt.getDate()+Number(days||0));return localDateKey(dt);}
  function earlierDate(a,b){if(!a)return b;if(!b)return a;return a<=b?a:b;}
  function fresh(){return {version:CL.config.appVersion,ui:{subject:'middle-info',area:'컴퓨팅 시스템',family:'content-system',stage:'single',mode:'cloze',retry:true,zoom:100,mainTab:'study'},round:1,progress:{},itemProgress:{},drafts:{},fieldGrades:{},draftDate:localDateKey(),scopeRounds:{},scopeTasks:{},answerSerial:0,fieldRetries:{},fieldRetryCounts:{},reviewSchedule:{},reviewHistory:{}};}
  function migrateUi(ui){
    const out=Object.assign({},ui||{});
    const familyMap={'핵심 아이디어':'content-system','지식·이해':'content-system','과정·기능':'content-system','가치·태도':'content-system','성취기준':'standards','해설':'explain-consider','고려사항':'explain-consider','성격':'character-goals','목표':'character-goals','교수·학습':'teaching-eval','평가':'teaching-eval','all':'content-system'};
    if(familyMap[out.family])out.family=familyMap[out.family];
    if(['content-table','ki-area','ki-all'].includes(out.stage))out.stage='whole';
    if(!['single','practical','whole'].includes(out.stage))out.stage='single';
    if(out.area==='과목 공통')out.area='all';
    const z=Number(out.zoom);out.zoom=[85,90,100,110,125].includes(z)?z:100;
    out.mainTab=out.mainTab==='review'?'review':'study';
    return out;
  }
  function load(){
    try{
      const raw=localStorage.getItem(CL.config.storageKey);if(!raw)return fresh();
      const p=JSON.parse(raw),base=fresh(),today=localDateKey();
      const storedDraftDate=String(p.draftDate||today);
      const dayChanged=storedDraftDate!==today;
      return Object.assign(base,p,{
        ui:Object.assign(base.ui,migrateUi(p.ui)),
        progress:p.progress||{},
        itemProgress:p.itemProgress||{},
        drafts:dayChanged?{}:(p.drafts||{}),
        fieldGrades:dayChanged?{}:(p.fieldGrades||{}),
        draftDate:today,
        scopeRounds:p.scopeRounds||{},
        scopeTasks:p.scopeTasks||{},
        answerSerial:Number(p.answerSerial||0),
        fieldRetries:p.fieldRetries||{},
        fieldRetryCounts:p.fieldRetryCounts||{},
        reviewSchedule:p.reviewSchedule||{},
        reviewHistory:p.reviewHistory||{}
      });
    }catch(e){return fresh();}
  }
  function save(state){try{state.version=CL.config.appVersion;localStorage.setItem(CL.config.storageKey,JSON.stringify(state));}catch(e){console.warn('CurriLoop save failed',e);}}
  function normalizeStatus(result){if(result===true)return 'correct';if(result===false)return 'wrong';return ['correct','near','unknown','wrong','duplicate'].includes(String(result))?String(result):'wrong';}
  function recordInto(bucket,id,result){const status=normalizeStatus(result),p=bucket[id]||{attempts:0,correct:0,near:0,unknown:0,wrong:0,duplicate:0};p.attempts++;p[status]=Number(p[status]||0)+1;p.lastResult=status;p.updatedAt=new Date().toISOString();bucket[id]=p;return p;}
  function record(state,id,result){return recordInto(state.progress,id,result);}
  function ensureReviewItem(state,id,result){
    if(!id)return null;
    state.reviewSchedule=state.reviewSchedule||{};
    const today=localDateKey(),tomorrow=addDays(today,1),status=normalizeStatus(result);
    let r=state.reviewSchedule[id];
    if(!r){
      r={lineId:id,stage:0,dueDate:tomorrow,lastReviewedDate:'',lastStudyDate:today,lastStatus:status,reviewCount:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      state.reviewSchedule[id]=r;
    }else{
      r.lastStudyDate=today;r.lastStatus=status;r.updatedAt=new Date().toISOString();
      if(['wrong','unknown','duplicate','near'].includes(status))r.dueDate=earlierDate(r.dueDate,tomorrow);
    }
    return r;
  }
  function recordItem(state,id,result){const p=recordInto(state.itemProgress,id,result);ensureReviewItem(state,id,result);return p;}
  function scopeKey(ui){const u=ui||{};return [u.subject||'middle-info',u.area||'all',u.family||'content-system',u.stage||'single'].join('|');}
  function noteScopeRound(state){state.scopeRounds=state.scopeRounds||{};state.scopeRounds[scopeKey(state.ui)]=Math.max(1,Number(state.round||1));}
  function restoreScopeRound(state){state.scopeRounds=state.scopeRounds||{};state.round=Math.max(1,Number(state.scopeRounds[scopeKey(state.ui)]||1));return state.round;}
  function noteScopeTask(state,taskId){if(!taskId)return;state.scopeTasks=state.scopeTasks||{};state.scopeTasks[scopeKey(state.ui)]=taskId;}
  function scopeTask(state){return state.scopeTasks?.[scopeKey(state.ui)]||'';}
  function setDraft(state,key,value){state.drafts=state.drafts||{};state.draftDate=localDateKey();if(value==='')delete state.drafts[key];else state.drafts[key]=String(value);}
  function getDraft(state,key){return state.drafts?.[key]??'';}
  function setFieldGrade(state,key,grade){state.fieldGrades=state.fieldGrades||{};state.draftDate=localDateKey();if(!grade)delete state.fieldGrades[key];else state.fieldGrades[key]={...grade,updatedAt:new Date().toISOString()};}
  function getFieldGrade(state,key){return state.fieldGrades?.[key]||null;}
  function clearFieldGrade(state,key){if(state.fieldGrades)delete state.fieldGrades[key];}

  function dueReviewItems(state,date=localDateKey()){
    return Object.values(state.reviewSchedule||{}).filter(r=>r&&r.lineId&&String(r.dueDate||'')<=date).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  }
  function completeDailyReview(state,id,result){
    if(!id)return null;
    state.reviewSchedule=state.reviewSchedule||{};state.reviewHistory=state.reviewHistory||{};
    const intervals=(CL.config.reviewIntervalsDays||[1,3,7,14,21,30]).map(Number);
    const today=localDateKey(),status=normalizeStatus(result);
    const r=state.reviewSchedule[id]||{lineId:id,stage:0,dueDate:today,lastReviewedDate:'',lastStudyDate:today,lastStatus:status,reviewCount:0};
    let stage=Math.max(0,Math.min(intervals.length-1,Number(r.stage||0)));
    if(status==='correct')stage=Math.min(intervals.length-1,stage+1);
    else if(status==='near')stage=Math.max(0,stage-1);
    else stage=0;
    const days=intervals[stage]||1;
    Object.assign(r,{stage,dueDate:addDays(today,days),lastReviewedDate:today,lastStatus:status,reviewCount:Number(r.reviewCount||0)+1,updatedAt:new Date().toISOString()});
    state.reviewSchedule[id]=r;
    const h=state.reviewHistory[today]||{attempts:0,correct:0,near:0,unknown:0,wrong:0,duplicate:0};
    h.attempts++;h[status]=Number(h[status]||0)+1;state.reviewHistory[today]=h;
    return r;
  }
  function clearStudyInputs(state){
    state.drafts={};state.fieldGrades={};state.draftDate=localDateKey();
  }
  function clearReviewData(state){
    state.progress={};state.itemProgress={};state.answerSerial=0;state.fieldRetries={};state.fieldRetryCounts={};state.reviewSchedule={};state.reviewHistory={};
  }
  CL.storage={fresh,load,save,record,recordItem,normalizeStatus,scopeKey,noteScopeRound,restoreScopeRound,noteScopeTask,scopeTask,setDraft,getDraft,setFieldGrade,getFieldGrade,clearFieldGrade,localDateKey,addDays,ensureReviewItem,dueReviewItems,completeDailyReview,clearStudyInputs,clearReviewData};
})();

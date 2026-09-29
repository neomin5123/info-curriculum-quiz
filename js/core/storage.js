(function(){
  'use strict';
  const CL=window.CurriLoop=window.CurriLoop||{};
  function fresh(){return {version:CL.config.appVersion,ui:{subject:'middle-info',area:'컴퓨팅 시스템',family:'content-system',stage:'single',mode:'cloze',retry:true,zoom:100,mainTab:'study'},round:1,progress:{},itemProgress:{},drafts:{},fieldGrades:{},scopeRounds:{},scopeTasks:{},answerSerial:0,fieldRetries:{},fieldRetryCounts:{}};}
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
  function load(){try{const raw=localStorage.getItem(CL.config.storageKey);if(!raw)return fresh();const p=JSON.parse(raw),base=fresh();return Object.assign(base,p,{ui:Object.assign(base.ui,migrateUi(p.ui)),progress:p.progress||{},itemProgress:p.itemProgress||{},drafts:p.drafts||{},fieldGrades:p.fieldGrades||{},scopeRounds:p.scopeRounds||{},scopeTasks:p.scopeTasks||{},answerSerial:Number(p.answerSerial||0),fieldRetries:p.fieldRetries||{},fieldRetryCounts:p.fieldRetryCounts||{}});}catch(e){return fresh();}}
  function save(state){try{state.version=CL.config.appVersion;localStorage.setItem(CL.config.storageKey,JSON.stringify(state));}catch(e){console.warn('CurriLoop save failed',e);}}
  function normalizeStatus(result){if(result===true)return 'correct';if(result===false)return 'wrong';return ['correct','near','unknown','wrong','duplicate'].includes(String(result))?String(result):'wrong';}
  function recordInto(bucket,id,result){const status=normalizeStatus(result),p=bucket[id]||{attempts:0,correct:0,near:0,unknown:0,wrong:0,duplicate:0};p.attempts++;p[status]=Number(p[status]||0)+1;p.lastResult=status;p.updatedAt=new Date().toISOString();bucket[id]=p;return p;}
  function record(state,id,result){return recordInto(state.progress,id,result);}
  function recordItem(state,id,result){return recordInto(state.itemProgress,id,result);}
  function scopeKey(ui){const u=ui||{};return [u.subject||'middle-info',u.area||'all',u.family||'content-system',u.stage||'single'].join('|');}
  function noteScopeRound(state){state.scopeRounds=state.scopeRounds||{};state.scopeRounds[scopeKey(state.ui)]=Math.max(1,Number(state.round||1));}
  function restoreScopeRound(state){state.scopeRounds=state.scopeRounds||{};state.round=Math.max(1,Number(state.scopeRounds[scopeKey(state.ui)]||1));return state.round;}
  function noteScopeTask(state,taskId){if(!taskId)return;state.scopeTasks=state.scopeTasks||{};state.scopeTasks[scopeKey(state.ui)]=taskId;}
  function scopeTask(state){return state.scopeTasks?.[scopeKey(state.ui)]||'';}
  function setDraft(state,key,value){state.drafts=state.drafts||{};if(value==='')delete state.drafts[key];else state.drafts[key]=String(value);}
  function getDraft(state,key){return state.drafts?.[key]??'';}
  function setFieldGrade(state,key,grade){state.fieldGrades=state.fieldGrades||{};if(!grade)delete state.fieldGrades[key];else state.fieldGrades[key]={...grade,updatedAt:new Date().toISOString()};}
  function getFieldGrade(state,key){return state.fieldGrades?.[key]||null;}
  function clearFieldGrade(state,key){if(state.fieldGrades)delete state.fieldGrades[key];}
  CL.storage={fresh,load,save,record,recordItem,normalizeStatus,scopeKey,noteScopeRound,restoreScopeRound,noteScopeTask,scopeTask,setDraft,getDraft,setFieldGrade,getFieldGrade,clearFieldGrade};
})();

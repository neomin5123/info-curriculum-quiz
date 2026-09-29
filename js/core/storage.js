(function(){
  const CL=window.CurriLoop=window.CurriLoop||{};
  function fresh(){return {version:CL.config.appVersion,ui:{subject:'middle-info',area:'컴퓨팅 시스템',family:'content-system',stage:'single',mode:'cloze',retry:true,zoom:100},round:1,progress:{},itemProgress:{}};}
  function migrateUi(ui){
    const out=Object.assign({},ui||{});
    const familyMap={'핵심 아이디어':'content-system','지식·이해':'content-system','과정·기능':'content-system','가치·태도':'content-system','성취기준':'standards','해설':'explain-consider','고려사항':'explain-consider','성격':'character-goals','목표':'character-goals','교수·학습':'teaching-eval','평가':'teaching-eval','all':'content-system'};
    if(familyMap[out.family])out.family=familyMap[out.family];
    if(['content-table','ki-area','ki-all'].includes(out.stage))out.stage='whole';
    if(!['single','practical','whole'].includes(out.stage))out.stage='single';
    if(out.area==='과목 공통')out.area='all';
    const z=Number(out.zoom);out.zoom=[85,90,100,110,125].includes(z)?z:100;
    return out;
  }
  function load(){try{const raw=localStorage.getItem(CL.config.storageKey);if(!raw)return fresh();const p=JSON.parse(raw);return Object.assign(fresh(),p,{ui:Object.assign(fresh().ui,migrateUi(p.ui)),progress:p.progress||{},itemProgress:p.itemProgress||{}});}catch(e){return fresh();}}
  function save(state){try{localStorage.setItem(CL.config.storageKey,JSON.stringify(state));}catch(e){console.warn('CurriLoop save failed',e);}}
  function record(state,id,result){const p=state.progress[id]||{attempts:0,correct:0,wrong:0};p.attempts++;if(result)p.correct++;else p.wrong++;p.lastResult=!!result;p.updatedAt=new Date().toISOString();state.progress[id]=p;}
  function recordItem(state,id,result){const p=state.itemProgress[id]||{attempts:0,correct:0,wrong:0};p.attempts++;if(result)p.correct++;else p.wrong++;p.lastResult=!!result;p.updatedAt=new Date().toISOString();state.itemProgress[id]=p;}
  CL.storage={fresh,load,save,record,recordItem};
})();

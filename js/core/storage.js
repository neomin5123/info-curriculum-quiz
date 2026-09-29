(function(){
  const CL=window.CurriLoop=window.CurriLoop||{};
  function fresh(){return {version:CL.config.appVersion,ui:{subject:'middle-info',area:'컴퓨팅 시스템',family:'지식·이해',stage:'ki-area',mode:'cloze',retry:true},round:1,progress:{},itemProgress:{}};}
  function load(){try{const raw=localStorage.getItem(CL.config.storageKey);if(!raw)return fresh();const p=JSON.parse(raw);return Object.assign(fresh(),p,{ui:Object.assign(fresh().ui,p.ui||{}),progress:p.progress||{},itemProgress:p.itemProgress||{}});}catch(e){return fresh();}}
  function save(state){try{localStorage.setItem(CL.config.storageKey,JSON.stringify(state));}catch(e){console.warn('CurriLoop save failed',e);}}
  function record(state,id,result){const p=state.progress[id]||{attempts:0,correct:0,wrong:0};p.attempts++;if(result)p.correct++;else p.wrong++;p.lastResult=!!result;p.updatedAt=new Date().toISOString();state.progress[id]=p;}
  function recordItem(state,id,result){const p=state.itemProgress[id]||{attempts:0,correct:0,wrong:0};p.attempts++;if(result)p.correct++;else p.wrong++;p.lastResult=!!result;p.updatedAt=new Date().toISOString();state.itemProgress[id]=p;}
  CL.storage={fresh,load,save,record,recordItem};
})();

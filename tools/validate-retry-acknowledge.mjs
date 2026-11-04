import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('js/app.js','utf8');
const start=source.indexOf('function retryEntries('),end=source.indexOf('function reviewUnitsForLine(',start);
assert(start>=0&&end>start);
let focusCount=0, renderCount=0, saveCount=0;
const makeClassList=()=>({members:new Set(),add(...v){v.forEach(x=>this.members.add(x))},remove(...v){v.forEach(x=>this.members.delete(x))}});
const input={value:'',classList:makeClassList(),disabled:false};
const button={textContent:'확인',disabled:false,dataset:{},focus(){focusCount++}};
const later={disabled:false},collapse={disabled:false};
const panel={dataset:{},classList:makeClassList(),querySelector(sel){
  if(sel==='.retry-card-input')return input;
  if(sel==='[data-retry-grade]')return button;
  return null;
},querySelectorAll(sel){
  if(sel==='.retry-card-input')return [input];
  if(sel==='[data-retry-later],[data-retry-collapse]')return [later,collapse];
  return [];
}};
const dock={querySelector(sel){if(sel.startsWith('[data-retry-panel='))return panel;return null}};
const ctx={
  state:{fieldRetries:{A:{kind:'single',correctAnswer:'지지도',lastWrongSerial:1,dueAt:0},B:{kind:'single',correctAnswer:'군집 분석',lastWrongSerial:2,dueAt:0}},answerSerial:2},
  activeRetryCardId:'A',pendingRetryAcknowledgment:null,
  el:{retryDock:dock},CSS:{escape:s=>s},
  CL:{config:{retryDelay:0,maxRetriesPerTaskPerRound:2},grading:{
    classifyDetailed:(given,expected)=>({status:given===expected?'correct':'wrong',expected}),
    gradeSetDetailed:()=>{throw Error('not used in single test')}
  },storage:{save(){saveCount++}}},
  showRetryResult(){},setRetryFeedback(){},renderReviewPage(){},
  renderRetryDock(){renderCount++},persist(){},
  esc:x=>x
};
vm.createContext(ctx);
vm.runInContext(source.slice(start,end),ctx);
// DOM render is replaced by a counter; behavior tested here is the transition contract.
ctx.renderRetryDock=()=>{renderCount++};
// Wrong answer must stay visible and should not advance automatically.
input.value='틀린 답';
ctx.gradeRetryCard('A');
assert.equal(renderCount,0);
assert.equal(ctx.activeRetryCardId,'A');
assert.equal(ctx.pendingRetryAcknowledgment.id,'A');
assert.equal(button.textContent,'확인 · 다음 카드');
assert.equal(input.disabled,true);
assert.equal(button.disabled,false);
assert.equal(focusCount,1);
assert.ok(ctx.state.fieldRetries.A);
ctx.gradeRetryCard('A'); // second click acknowledges
assert.equal(ctx.activeRetryCardId,'B');
assert.equal(ctx.pendingRetryAcknowledgment,null);
assert.equal(renderCount,1);
// Correct answer also stays until acknowledgement and then switches to A.
input.disabled=false;panel.dataset.gradingLock='';button.textContent='확인';input.value='군집 분석';
ctx.gradeRetryCard('B');
assert.equal(ctx.activeRetryCardId,'B');
assert.equal(renderCount,1);
ctx.acknowledgeRetryCard('B');
assert.equal(ctx.activeRetryCardId,'A');
assert.equal(renderCount,2);
// Retry cap cannot remove the current card before acknowledgment.
ctx.state.fieldRetries.A.retryAttempts=1;
input.disabled=false;panel.dataset.gradingLock='';input.value='오답';
ctx.gradeRetryCard('A');
assert.equal(ctx.pendingRetryAcknowledgment.removeOnAck,true);
assert.ok(ctx.state.fieldRetries.A);
ctx.acknowledgeRetryCard('A');
assert.equal(ctx.state.fieldRetries.A,undefined);
assert.equal(ctx.activeRetryCardId,'B');
assert.equal(renderCount,3);
console.log(`PASS: incorrect/ correct remain until confirm, max retry deferred, next card opens; saves ${saveCount}`);

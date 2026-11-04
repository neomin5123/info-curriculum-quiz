import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('js/app.js','utf8');
function get(name,next){const a=src.indexOf(`function ${name}(`),b=src.indexOf(`function ${next}(`,a+1);assert(a>=0&&b>a,`missing ${name}`);return src.slice(a,b);}
const dock={innerHTML:'',classList:{values:new Set(),add(v){this.values.add(v)},remove(v){this.values.delete(v)}},querySelector(){return null}};
const ctx={state:{ui:{retry:true,subject:'mi',area:'algorithm',family:'content',stage:'whole',mode:'cloze'},round:1,answerSerial:0,fieldRetries:{},fieldRetryCounts:{}},activeRetryCardId:'',el:{retryDock:dock},CL:{config:{retryDelay:0,maxRetriesPerTaskPerRound:2},grading:{}},engine:{taskId(){return 'task-1'},lineMap:new Map()},currentTask(){return {line:{lineId:'line-1'}}},taskContext(){return {family:'핵심 아이디어',area:'알고리즘과 프로그래밍'}},answerFields(){return []},fixedExpectedForField(f){return f.dataset.answer},expectedItemsForField(){return []},esc(x){return String(x)},retryMeta(){return '알고리즘과 프로그래밍 · 핵심 아이디어'},retryCardPanelHtml(){return '<input class="retry-card-input">'},requestAnimationFrame(){}};
vm.createContext(ctx);
vm.runInContext(get('retryEntries','retryAnswerList')+get('retryDockVisibleEntries','setRetryFeedback')+get('retryIdForField','dueRetryForCurrentTask'),ctx);
function wrong(id){ctx.state.answerSerial++;const field={dataset:{fieldKey:id,answer:'자동화',lineId:id},classList:{contains(){return false}},id:''};ctx.scheduleFieldRetry(field,'wrong',{expected:'자동화'});ctx.renderRetryDock();}
for(let i=1;i<=8;i++)wrong('field-'+i);
assert.equal(Object.keys(ctx.state.fieldRetries).length,8,'all wrong answers must be saved');
assert.equal((dock.innerHTML.match(/<section class="retry-card /g)||[]).length,6,'dock displays up to six');
assert.match(dock.innerHTML,/data-retry-id="field-8\|round:1"/,'newest error visible');
assert.doesNotMatch(dock.innerHTML,/data-retry-id="field-1\|round:1"/,'older error remains saved but not pinned');
assert.doesNotMatch(dock.innerHTML,/retry-card expanded/,'no automatic expansion');
assert.equal(ctx.retryEntries({dueOnly:true})[0][0],'field-8|round:1');
// A formerly completed card must be regenerated on a new wrong answer, even after the old count reaches the cap.
delete ctx.state.fieldRetries['field-8|round:1'];ctx.state.fieldRetryCounts['field-8|round:1']=2;wrong('field-8');
assert(ctx.state.fieldRetries['field-8|round:1'],'a repeated wrong answer should create a new card');
assert.match(dock.innerHTML,/data-retry-id="field-8\|round:1"/);
ctx.activeRetryCardId='field-8|round:1';ctx.renderRetryDock();assert.match(dock.innerHTML,/retry-card expanded/,'manual open still works');
ctx.state.ui.retry=false;ctx.renderRetryDock();assert.equal(dock.innerHTML,'','OFF hides dock');
console.log('PASS newest wrong card first, >6 cards retained, repeat error regenerated, manual open, OFF');

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('js/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
function functionSource(name,next){
  const a=source.indexOf(`function ${name}(`),b=source.indexOf(`function ${next}(`,a+1);
  assert(a>=0&&b>a,`${name} source boundary`);
  return source.slice(a,b);
}
const dock={innerHTML:'',classList:{classes:new Set(),add(v){this.classes.add(v)},remove(v){this.classes.delete(v)}},querySelector(){return null}};
const ctx={
  state:{ui:{retry:true},fieldRetries:{x:{dueAt:0,section:'핵심 아이디어',scope:{area:'데이터'}}},answerSerial:1},
  activeRetryCardId:'',
  el:{retryDock:dock},
  retryEntries(){return Object.entries(ctx.state.fieldRetries)},
  retryMeta(){return '데이터 · 핵심 아이디어'},
  retryCardPanelHtml(){return '<input class="retry-card-input">'},
  esc:s=>String(s),
  CSS:{escape:s=>s},
  requestAnimationFrame(){},
  persist(){},
};
vm.createContext(ctx);
vm.runInContext(functionSource('retryDockVisibleEntries','renderRetryDock')+functionSource('renderRetryDock','setRetryFeedback'),ctx);
ctx.renderRetryDock();
assert.equal(dock.innerHTML,'','wrong answer should not automatically show a card');
assert(!dock.classList.classes.has('has-cards'));
ctx.activeRetryCardId='x';
ctx.renderRetryDock();
assert.match(dock.innerHTML,/retry-card expanded" data-retry-id="x"/,'explicit selection opens the review panel');
assert(dock.classList.classes.has('has-cards'));
ctx.activeRetryCardId='';
ctx.renderRetryDock();
assert.equal(dock.innerHTML,'','closing an explicitly opened panel hides dock');
assert(!dock.classList.classes.has('has-cards'));
assert.doesNotMatch(functionSource('scheduleFieldRetry','dueRetryForCurrentTask'),/activeRetryCardId\s*=\s*id/);
assert.match(html,/<small>복습 탭<\/small>/);
assert.match(html,/직접 선택할 때만 열립니다/);
console.log('PASS retry records are silent; the dock opens only when explicitly selected and closes cleanly');

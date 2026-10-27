import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const db=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8'));
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('data/generated/exam-data.js','utf8'),sandbox);
const deployed=sandbox.window.CURRILOOP_EXAM_DATA;
assert.equal(deployed.questions.length,db.questions.length);
const ids=['2026-B-02','2026-B-03','2026-B-05'];
const html=fs.readFileSync('js/app.js','utf8');
assert.match(html,/const ready=q.solutionStatus==='solved'/);
assert.match(html,/정답 미입력/);
assert.match(html,/데이터 불일치 감지/);
for(const id of ids){
 const source=db.questions.find(q=>q.id===id);
 const generated=deployed.questions.find(q=>q.id===id);
 assert(source&&generated,`not found: ${id}`);
 assert.equal(generated.solutionStatus,'solved',`deployment pending: ${id}`);
 assert.equal(generated.answer,source.answer,`deployment answer mismatch: ${id}`);
 assert(generated.answer.trim().length>0,`empty answer: ${id}`);
 const ready=generated.solutionStatus==='solved';
 const escaped=generated.answer.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 const rendered=ready?`<div class="exam-sheet-answer-text">${escaped}</div>`:'<em>정답 미입력</em>';
 assert(rendered.includes('exam-sheet-answer-text')&&!rendered.includes('정답 미입력'),`render failure: ${id}`);
 console.log(`PASS ${id}: source + bundled payload + answer-sheet branch`);
}
const year2026=deployed.questions.filter(q=>q.year===2026&&q.part==='B');
assert.equal(year2026.filter(q=>q.solutionStatus==='solved').length,year2026.length);
console.log(`Build50 exam-answer-sheet regression PASS, 2026 B: ${year2026.length} solved`);

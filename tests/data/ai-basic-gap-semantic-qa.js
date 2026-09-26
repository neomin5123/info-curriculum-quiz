const assert = require('assert');
global.window = {};
require('../../data/curriculum/2022/curriculum.js');
const R = require('../../js/engines/recall-engine.js');
const I = require('../../js/engines/intensity-engine.js');
const C = require('../../data/learning-aids/gap-intensity.js');

const subject = window.CURRILOOP_CURRICULUM_DATA['ai-basic'];
const rows = [];
for (const [area, groups] of Object.entries(subject)) {
  for (const [sourceGroup, sections] of Object.entries(groups)) {
    for (const section of sections) {
      for (const line of section.lines || []) rows.push({area, sourceGroup, section, line});
    }
  }
}
assert.equal(rows.length, 96, 'ai-basic official sentence count');
const exact = rows.filter(x => R.memoryTier(x.section.title, x.sourceGroup).key === 'exact');
const guided = rows.filter(x => R.memoryTier(x.section.title, x.sourceGroup).key !== 'exact');
assert.equal(exact.length, 44, 'ai-basic exact-recall sentence count');
assert.equal(guided.length, 52, 'ai-basic semantic-gap sentence count');
assert.equal(Object.keys(C.lineOverrides || {}).filter(id => id.startsWith('AI-')).length, 52, 'every non-exact ai-basic line has a semantic override');

for (const {section, sourceGroup, line} of guided) {
  const override = C.lineOverrides[line.id];
  assert(Array.isArray(override) && override.length > 0, `missing semantic override: ${line.id}`);
  const easyEntries = (line.easy || []).map((answer, i) => ({answer, gapId:(line.gapIds?.easy || [])[i]}));
  const normalEntries = (line.normal || []).map((answer, i) => ({answer, gapId:(line.gapIds?.normal || [])[i]}));
  const unionAnswers = new Set([...easyEntries, ...normalEntries].map(x => x.answer));
  for (const answer of override) assert(unionAnswers.has(answer), `override must reuse existing gap inventory: ${line.id} / ${answer}`);
  const seen = new Set();
  const candidates = [...easyEntries, ...normalEntries].filter(entry => {
    const key = String(entry.answer || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const selected = I.selectCoreEntries(line, candidates, section.title, sourceGroup, R.memoryTier(section.title, sourceGroup).key);
  assert.deepStrictEqual(selected.map(x => x.answer), candidates.filter(x => override.includes(x.answer)).map(x => x.answer), `semantic override not applied: ${line.id}`);
  const maskedChars = I.hiddenCoverage(line.text, selected);
  assert(maskedChars < 0.55, `semantic core mask hides too much of a line: ${line.id} ${(maskedChars*100).toFixed(1)}%`);
}

for (const {line} of exact) assert(!C.lineOverrides[line.id], `exact-recall line must not be weakened by semantic override: ${line.id}`);

// High-value distinctions/lists/processes are preserved explicitly.
assert.deepStrictEqual(C.lineOverrides['AI-02-AC-EX-02'], ['결측치','이상치','속성','선별','전처리']);
assert.deepStrictEqual(C.lineOverrides['AI-02-AC-EX-03'], ['지도학습','비지도학습','강화학습','분류','예측','군집']);
assert.deepStrictEqual(C.lineOverrides['AI-03-AC-EX-02'], ['인간의 편향성','알고리즘','데이터','인공지능 개발자','사용자','운영⋅관리자','사회적 책임','공정성']);
assert.deepStrictEqual(C.lineOverrides['AI-04-AC-EX-01'], ['2015년','유엔 총회','17개의 주요 목표','169개의 세부 목표']);
assert.deepStrictEqual(C.lineOverrides['AI-04-AC-EX-02'], ['문제 정의','전처리','알고리즘 선정','모델 생성','성능 평가']);
assert.deepStrictEqual(C.lineOverrides['AI-TE-EVM-02'], ['정량적 평가','정성적 평가','모델 학습과 적용이 반복적','즉시 피드백','결과물의 개선']);

const stats = {};
for (const {section, sourceGroup, line} of guided) {
  const title = section.title;
  const easyEntries = (line.easy || []).map((answer, i) => ({answer, gapId:(line.gapIds?.easy || [])[i]}));
  const normalEntries = (line.normal || []).map((answer, i) => ({answer, gapId:(line.gapIds?.normal || [])[i]}));
  const seen = new Set();
  const candidates = [...easyEntries, ...normalEntries].filter(x => !seen.has(x.answer) && seen.add(x.answer));
  const selected = I.selectCoreEntries(line, candidates, title, sourceGroup, R.memoryTier(title, sourceGroup).key);
  const cov = I.hiddenCoverage(line.text, selected);
  (stats[title] ||= []).push(cov);
}
for (const [k,v] of Object.entries(stats)) stats[k] = +(v.reduce((a,b)=>a+b,0)/v.length*100).toFixed(1);
console.log('ai-basic gap semantic QA passed:', {officialSentences:rows.length, exactRecall:exact.length, semanticOverrides:guided.length, avgMaskPctBySection:stats});

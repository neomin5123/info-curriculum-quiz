const assert = require('assert');
global.window = {};
require('../../data/curriculum/2022/curriculum.js');
const R = require('../../js/engines/recall-engine.js');
const I = require('../../js/engines/intensity-engine.js');
const C = require('../../data/learning-aids/gap-intensity.js');

const subject = window.CURRILOOP_CURRICULUM_DATA['data-science'];
const rows = [];
for (const [area, groups] of Object.entries(subject)) {
  for (const [sourceGroup, sections] of Object.entries(groups)) {
    for (const section of sections) {
      for (const line of section.lines || []) rows.push({area, sourceGroup, section, line});
    }
  }
}
assert.equal(rows.length, 104, 'data-science official sentence count');
const exact = rows.filter(x => R.memoryTier(x.section.title, x.sourceGroup).key === 'exact');
const guided = rows.filter(x => R.memoryTier(x.section.title, x.sourceGroup).key !== 'exact');
assert.equal(exact.length, 45, 'data-science exact-recall sentence count');
assert.equal(guided.length, 59, 'data-science semantic-gap sentence count');
assert.equal(Object.keys(C.lineOverrides || {}).filter(id => id.startsWith('DS-')).length, 59, 'every non-exact data-science line has a semantic override');

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

// High-value distinctions, metrics and processes remain explicit while generic wording is not promoted to core blanks.
assert.deepStrictEqual(C.lineOverrides['DS-01-AC-EX-01'], ['정형 데이터','비정형 데이터']);
assert.deepStrictEqual(C.lineOverrides['DS-02-AC-EX-01'], ['편향성','자료형','통계적 특성']);
assert.deepStrictEqual(C.lineOverrides['DS-02-AC-CO-03'], ['이상치','결측치','분석 방법']);
assert.deepStrictEqual(C.lineOverrides['DS-03-AC-EX-01'], ['군집 내 유사성','군집 간 상이성']);
assert.deepStrictEqual(C.lineOverrides['DS-03-AC-EX-02'], ['지지도','신뢰도','향상도']);
assert.deepStrictEqual(C.lineOverrides['DS-03-AC-EX-03'], ['평가 방법','예측률','정확도']);
assert.deepStrictEqual(C.lineOverrides['DS-04-AC-EX-02'], ['성찰','수정','일반화','공유']);
assert.deepStrictEqual(C.lineOverrides['DS-TE-MET-01'], ['문제기반학습','프로젝트 기반학습','디자인기반학습','짝 프로그래밍','탐구학습']);

const stats = {};
for (const {section, sourceGroup, line} of guided) {
  const easyEntries = (line.easy || []).map((answer, i) => ({answer, gapId:(line.gapIds?.easy || [])[i]}));
  const normalEntries = (line.normal || []).map((answer, i) => ({answer, gapId:(line.gapIds?.normal || [])[i]}));
  const seen = new Set();
  const candidates = [...easyEntries, ...normalEntries].filter(x => !seen.has(x.answer) && seen.add(x.answer));
  const selected = I.selectCoreEntries(line, candidates, section.title, sourceGroup, R.memoryTier(section.title, sourceGroup).key);
  const cov = I.hiddenCoverage(line.text, selected);
  (stats[section.title] ||= []).push(cov);
}
for (const [k,v] of Object.entries(stats)) stats[k] = +(v.reduce((a,b)=>a+b,0)/v.length*100).toFixed(1);
console.log('data-science gap semantic QA passed:', {officialSentences:rows.length, exactRecall:exact.length, semanticOverrides:guided.length, avgMaskPctBySection:stats});

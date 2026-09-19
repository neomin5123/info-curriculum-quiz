'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = {window:{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'data/curriculum-data.js'),'utf8'), ctx);
const data = ctx.window.CURRILOOP_CURRICULUM_DATA;
const COMMON_AREA = ctx.window.CURRILOOP_COMMON_AREA || '과목 공통';

const isStandard = s => String(s?.title || '').trim() === '성취기준';
const isGuidance = s => {
  const t=String(s?.title||'');
  return t.includes('성취기준 해설') || t.includes('성취기준 적용 시 고려');
};
function select(unit, group) {
  if (group === 'content-system') return unit['content-system'] || [];
  if (group === 'achievement') return (unit.achievement || []).filter(isStandard);
  if (group === 'core-achievement') return [...(unit['content-system'] || []), ...(unit.achievement || []).filter(isStandard)];
  if (group === 'achievement-guidance') return (unit.achievement || []).filter(isGuidance);
  throw new Error('unexpected group');
}
let checked=0;
for (const [subject, subjectData] of Object.entries(data)) {
  for (const [area, unit] of Object.entries(subjectData)) {
    if (area === COMMON_AREA) continue;
    const c=select(unit,'content-system');
    const a=select(unit,'achievement');
    const ca=select(unit,'core-achievement');
    const g=select(unit,'achievement-guidance');
    if (!c.length || !a.length) throw new Error(`missing required core groups: ${subject}/${area}`);
    if (c.some(isStandard) || c.some(isGuidance)) throw new Error(`content leakage: ${subject}/${area}`);
    if (a.some(s => !isStandard(s))) throw new Error(`achievement leakage: ${subject}/${area}`);
    if (g.some(s => !isGuidance(s))) throw new Error(`guidance leakage: ${subject}/${area}`);
    if (ca.length !== c.length + a.length) throw new Error(`combined size mismatch: ${subject}/${area}`);
    if (ca.some(isGuidance)) throw new Error(`combined guidance leakage: ${subject}/${area}`);
    checked++;
  }
}
if (checked !== 27) throw new Error(`expected 27 subject areas, got ${checked}`);

const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
// v6.9.2 regression invariants that must survive later core-flow presentation changes.
for (const expected of [
  'if (studyMode !== "original" || area === COMMON_AREA) return null;',
  'CORE_FLOW_MAP',
  'core-achievement',
  'achievement-guidance'
]) if (!app.includes(expected)) throw new Error(`v6.9.2 regression invariant missing: ${expected}`);

// Flow metadata must not be inserted into official curriculum source files.
for (const f of ['data/curriculum-data.js','data/supplemental-data.js']) {
  const src=fs.readFileSync(path.join(root,f),'utf8');
  if (src.includes('CORE_FLOW_MAP') || src.includes('핵심 흐름')) throw new Error(`flow metadata leaked into ${f}`);
}
console.log(`v6.9.2 regression QA: OK (${checked} curriculum areas checked)`);

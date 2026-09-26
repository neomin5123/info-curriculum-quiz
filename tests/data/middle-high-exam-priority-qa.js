const assert = require('assert');
global.window = {};
require('../../data/curriculum/2022/curriculum.js');
const R = require('../../js/engines/recall-engine.js');
const I = require('../../js/engines/intensity-engine.js');
const C = require('../../data/learning-aids/gap-intensity.js');
const E = require('../../data/learning-aids/exam-recall-profiles.js');

const all = [];
for (const [subjectId, subject] of Object.entries(window.CURRILOOP_CURRICULUM_DATA || {})) {
  for (const [area, groups] of Object.entries(subject || {})) {
    for (const [sourceGroup, sections] of Object.entries(groups || {})) {
      for (const section of sections || []) {
        for (const line of section.lines || []) all.push({subjectId, area, sourceGroup, section, line});
      }
    }
  }
}
const byId = new Map(all.map(x => [x.line.id, x]));

function selectedAnswers(id) {
  const row = byId.get(id);
  assert(row, `missing curriculum line: ${id}`);
  const {line, section, sourceGroup} = row;
  const seen = new Set();
  const candidates = [
    ...(line.easy || []).map((answer, i) => ({answer, gapId:(line.gapIds?.easy || [])[i]})),
    ...(line.normal || []).map((answer, i) => ({answer, gapId:(line.gapIds?.normal || [])[i]}))
  ].filter(entry => {
    const key=String(entry.answer || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
  return I.selectCoreEntries(line, candidates, section.title, sourceGroup, R.memoryTier(section.title, sourceGroup).key).map(x => x.answer);
}
function mustSelect(id, terms) {
  const got = selectedAnswers(id);
  for (const term of terms) assert(got.includes(term), `${id} must keep exam-important term in core bank: ${term} / got=${JSON.stringify(got)}`);
}

// 실제 생산 답안으로 확인된 핵심 표현은 core bank에서도 탈락하지 않는다.
mustSelect('MI-03-CS-KI-02', ['자동화']);
mustSelect('MI-03-CS-VA-01', ['추상화']);
mustSelect('MI-TE-EVD-03', ['평가 루브릭']);
mustSelect('MI-05-CS-KN-02', ['디지털 윤리']);
mustSelect('MI-05-CS-KN-03', ['저작권']);
mustSelect('HI-01-AC-ST-03', ['피지컬 컴퓨팅']);
mustSelect('HI-02-CS-KI-01', ['압축','암호화']);
mustSelect('HI-02-CS-KN-01', ['압축','암호화']);

// 시험지에 제시된 cue도 학습 가치는 유지하되, profile에서 직접 생산량을 부풀리지 않는다.
mustSelect('MI-03-AC-CO-01', ['문제 발견','상태 정의','핵심요소 추출']);
mustSelect('MI-03-AC-CO-02', ['학생의 수준','적합한 프로그래밍 언어']);
mustSelect('MI-TE-DIR-05', ['학생의 디지털 역량 수준','추가적인 교육 기회']);
mustSelect('HI-TE-EVM-05', ['학습자의 최소 성취수준','난이도에 따른 평가기준을 세분화']);
for (const id of ['MI-03-AC-CO-01','MI-03-AC-CO-02','HI-03-AC-ST-02']) {
  assert.notEqual(E.lineProfiles[id]?.demandKind,'production',`${id} quoted/visible cue must not inflate direct production demand`);
  assert.equal(E.lineProfiles[id]?.trainingMaxUnits,2,`${id} cue must stop at 2-set combination`);
}

// Directly tested exact categories remain exact-recall tiers.
for (const id of ['MI-02-CS-KN-01','MI-05-CS-KN-02','MI-05-CS-KN-03','HI-01-CS-KN-02','HI-01-AC-ST-03','HI-03-AC-ST-06']) {
  const row=byId.get(id); assert(row, `missing exact exam line: ${id}`);
  assert.equal(R.memoryTier(row.section.title, row.sourceGroup).key, 'exact', `direct exam item must remain exact: ${id}`);
}

const corpusText = all.map(x => x.line.text).join('\n');
assert(corpusText.includes('학생의 디지털 역량 수준을 파악하여'), 'repaired digital-competence direction missing');
assert(corpusText.includes('학습 부진, 느린 학습자가 참여할 수 있고'), 'repaired slow-learner evaluation sentence missing');
assert.deepStrictEqual(C.lineOverrides['MI-03-AC-CO-02'], ['학생의 수준','적합한 프로그래밍 언어','초등학교 실과','프로젝트의 수준']);

console.log('middle/high exam-priority QA passed:', {productionCoreChecks:8, cuePriorityChecks:4, exactLocks:6, repairedCorpusGaps:12});

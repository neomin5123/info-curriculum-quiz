'use strict';
const assert=require('assert');
const E=require('../../data/learning-aids/exam-recall-profiles.js');

assert.deepEqual([...E.pilotSubjects],['middle-info','high-info']);

// 2024 A: 실제 생산 정답
const auto=E.getProfile({subjectKey:'middle-info',lineId:'MI-03-CS-KI-02',sectionTitle:'핵심 아이디어',sourceGroup:'content-system'});
assert(auto.directExam && auto.demandKind==='production' && auto.observedMaxUnits===1 && auto.trainingMaxUnits===2 && auto.pinnedAnswers.includes('자동화'));
const value=E.getProfile({subjectKey:'middle-info',lineId:'MI-03-CS-VA-01',sectionTitle:'가치·태도',sourceGroup:'content-system'});
assert(value.demandKind==='production' && value.observedMaxUnits===1 && value.trainingMaxUnits===2 && value.pinnedAnswers.includes('추상화'));

// 2024 B: 시험지에 제시된 단서를 "3개/2개 직접 인출"로 오인하면 안 된다.
const steps=E.getProfile({subjectKey:'middle-info',lineId:'MI-03-AC-CO-01',sectionTitle:'성취기준 적용 시 고려 사항',sourceGroup:'achievement'});
assert(steps.demandKind==='cue' && steps.observedMaxUnits===1 && steps.trainingMaxUnits===2 && steps.pinnedAnswers.length===0);
assert.deepEqual([...steps.priorityAnswers],['문제 발견','상태 정의','핵심요소 추출']);
const learner=E.getProfile({subjectKey:'middle-info',lineId:'MI-03-AC-CO-02',sectionTitle:'성취기준 적용 시 고려 사항',sourceGroup:'achievement'});
assert(learner.demandKind==='cue' && learner.observedMaxUnits===1 && learner.trainingMaxUnits===2 && learner.pinnedAnswers.length===0);

// 2025 B: 루브릭은 고등이 아니라 중학교 공통 평가의 방향이다.
const rubric=E.getProfile({subjectKey:'middle-info',lineId:'MI-TE-EVD-03',sectionTitle:'평가의 방향',sourceGroup:'teaching-evaluation'});
assert(rubric.demandKind==='production' && rubric.pinnedAnswers.join('|')==='평가 루브릭');
assert(!Object.prototype.hasOwnProperty.call(E.lineProfiles,'HI-TE-EVD-02'),'2025 B rubric must not be mis-mapped to high-info');

// 2026 A: 중학교 디지털 문화 직접 답
const ethics=E.getProfile({subjectKey:'middle-info',lineId:'MI-05-CS-KN-02',sectionTitle:'지식·이해',sourceGroup:'content-system'});
const copyright=E.getProfile({subjectKey:'middle-info',lineId:'MI-05-CS-KN-03',sectionTitle:'지식·이해',sourceGroup:'content-system'});
assert(ethics.pinnedAnswers.join('|')==='디지털 윤리' && ethics.observedMaxUnits===1);
assert(copyright.pinnedAnswers.join('|')==='저작권' && copyright.observedMaxUnits===1);

// 2026 A: 고등 사물인터넷. 성취기준 빈칸은 '피지컬 컴퓨팅' 1개다.
const iotStandard=E.getProfile({subjectKey:'high-info',lineId:'HI-01-AC-ST-03',sectionTitle:'성취기준',sourceGroup:'achievement'});
assert(iotStandard.demandKind==='production' && iotStandard.observedMaxUnits===1 && iotStandard.trainingMaxUnits===2);
assert.deepEqual([...iotStandard.pinnedAnswers],['피지컬 컴퓨팅']);
const iotContent=E.getProfile({subjectKey:'high-info',lineId:'HI-01-CS-KN-02',sectionTitle:'지식·이해',sourceGroup:'content-system'});
assert(iotContent.demandKind==='production' && iotContent.observedMaxUnits===3 && iotContent.trainingMaxUnits===3);
assert.deepEqual([...iotContent.pinnedAnswers],['사물인터넷 시스템','구성','동작 원리']);
const reportPortfolio=E.getProfile({subjectKey:'high-info',lineId:'HI-TE-EVM-03',sectionTitle:'평가 방법',sourceGroup:'teaching-evaluation'});
assert(reportPortfolio.observedMaxUnits===2 && reportPortfolio.trainingMaxUnits===3);
assert.deepEqual([...reportPortfolio.pinnedAnswers],['보고서','포트폴리오']);

// 2026 A 정렬 성취기준은 제시문이지 정렬/효율을 빈칸으로 생산한 문제가 아니다.
const sort=E.getProfile({subjectKey:'high-info',lineId:'HI-03-AC-ST-02',sectionTitle:'성취기준',sourceGroup:'achievement'});
assert(sort.demandKind==='cue' && sort.observedMaxUnits===1 && sort.trainingMaxUnits===2 && sort.pinnedAnswers.length===0);

// 2026 B: 압축·암호화는 실제 2단위 생산.
for (const [id,title,group] of [
  ['HI-02-CS-KI-01','핵심 아이디어','content-system'],
  ['HI-02-CS-KN-01','지식·이해','content-system'],
  ['HI-02-AC-CO-01','성취기준 적용 시 고려 사항','achievement']
]) {
  const p=E.getProfile({subjectKey:'high-info',lineId:id,sectionTitle:title,sourceGroup:group});
  assert(p.demandKind==='production' && p.observedMaxUnits===2 && p.trainingMaxUnits===3,`${id} compression/encryption demand`);
  assert.deepEqual([...p.pinnedAnswers],['압축','암호화']);
}

// 직접 근거 없는 문장은 기출을 빙자해 3~4개까지 늘리지 않는다.
for (const [title,group] of [
  ['핵심 아이디어','content-system'],['가치·태도','content-system'],['지식·이해','content-system'],
  ['성취기준','achievement'],['성취기준 해설','achievement'],['성취기준 적용 시 고려 사항','achievement'],
  ['평가 방법','teaching-evaluation'],['목표','character-goal']
]) {
  const fallback=E.getProfile({subjectKey:'high-info',lineId:'NO-DIRECT-EVIDENCE',sectionTitle:title,sourceGroup:group});
  assert(!fallback.directExam && fallback.observedMaxUnits===1 && fallback.trainingMaxUnits===2,`${title} fallback must be 1→2`);
}
assert.equal(E.getProfile({subjectKey:'ai-basic',lineId:'X',sectionTitle:'핵심 아이디어',sourceGroup:'content-system'}),null,'pilot must not silently alter the remaining four subjects');

const kinds=Object.values(E.lineProfiles).reduce((out,p)=>(out[p.demandKind]=(out[p.demandKind]||0)+1,out),{});
console.log('exam recall profile QA passed:',{directProfiles:Object.keys(E.lineProfiles).length,kinds,families:Object.keys(E.familyProfiles).length,pilot:E.pilotSubjects});

'use strict';
const assert = require('assert');
const L = require('../../js/engines/learning-engine.js');
const P = require('../../js/engines/practical-engine.js');

const day = L.DAY_MS;
const t0 = new Date('2026-09-15T09:00:00+09:00').getTime();
let item = {};
let r = L.applyMasteryEvent(item, 'correct', t0, 'a'); item = r.item;
assert.equal(item.correctStreak, 1); assert.equal(item.nextReviewAt, t0 + day);
r = L.applyMasteryEvent(item, 'correct', t0 + 2 * 60 * 60 * 1000, 'b'); item = r.item;
assert.equal(item.correctStreak, 1, 'same-day/non-due correct must not raise streak');
r = L.applyMasteryEvent(item, 'correct', t0 + day + 1, 'c'); item = r.item;
assert.equal(item.correctStreak, 2); assert.equal(item.nextReviewAt, t0 + day + 1 + 3 * day);
r = L.applyMasteryEvent(item, 'near', t0 + 2 * day, 'd'); item = r.item;
assert.equal(item.correctStreak, 2, 'near must not raise mastery'); assert.equal(item.nearCount, 1);
r = L.applyMasteryEvent(item, 'unknown', t0 + 3 * day, 'u'); item = r.item;
assert.equal(item.unknownCount, 1); assert.equal(item.correctStreak, 0, 'unknown must reset recall streak'); assert.equal(item.wrongCount, 0, 'unknown must not be typed-wrong history');
r = L.applyMasteryEvent(item, 'wrong', t0 + 5 * day, 'e'); item = r.item;
assert.equal(item.correctStreak, 0); assert.equal(item.mastered, false);
assert.deepEqual(L.REVIEW_INTERVALS, [1,3,7,14,30,60]);

assert.equal(P.inferPriority('필요'), 0);
assert.equal(P.inferPriority('활용된다'), 0);
assert.equal(P.inferPriority('비교·분석한다'), 3);
assert.equal(P.inferPriority('평가 루브릭'), 3);
assert.equal(P.inferPriority('컴퓨팅 사고력', {coreLike:true}), 3);
let stat = P.noteResult({}, 'correct', '2026-09-15', t0);
assert.equal(stat.shown, 1); assert.equal(stat.successDays.length, 1);
stat = P.noteResult(stat, 'correct', '2026-09-15', t0 + 1000);
assert.equal(stat.shown, 2); assert.equal(stat.successDays.length, 1, 'same day must not count as spaced success');
stat = P.noteResult(stat, 'correct', '2026-09-16', t0 + day);
assert.equal(stat.successDays.length, 2);
assert.equal(P.desiredBlankCount(40, 5, [stat]), 3);
assert.equal(P.desiredBlankCount(40, 5, [stat], {sourceGroup:'achievement', sectionTitle:'성취기준 해설'}), 1);
assert.equal(P.desiredBlankCount(40, 5, [stat], {sourceGroup:'achievement', sectionTitle:'성취기준 적용 시 고려 사항'}), 1);
let unknownStat = P.noteResult({}, 'unknown', '2026-09-15', t0);
assert.equal(unknownStat.unknown, 1); assert.equal(unknownStat.shown, 1);

const deduped = L.dedupeReviewByLine([
  {item:{type:'subject',subjectKey:'middle-info',area:'데이터',sourceGroup:'content-system',lineId:'x'}, state:{wrongCount:1}},
  {item:{type:'subject',subjectKey:'middle-info',area:'데이터',sourceGroup:'content-system',lineId:'x'}, state:{wrongCount:4}}
], r => r.state.wrongCount);
assert.equal(deduped.length, 1); assert.equal(deduped[0].state.wrongCount, 4);

// Daily review plan must not be consumed by a practical answer.
// If a practical success actually advanced a due schedule today, v6.8.1 can recover it into today's plan.
const practicalAdvanced = {
  correctStreak: 2,
  lastSuccessAt: t0,
  nextReviewAt: t0 + 3 * day,
  lastEventToken: `subject|${t0}|1|x`
};
assert.equal(L.wasScheduleAdvancedTodayOutsideReview(practicalAdvanced, t0 + 1000), true);
assert.equal(L.isDailyReviewCandidate(practicalAdvanced, t0 + 1000), true);

// Extra practice before the due date must not be mistaken for today's scheduled review.
const extraPractice = {
  correctStreak: 2,
  lastSuccessAt: t0,
  nextReviewAt: t0 + 2 * day, // not recomputed from this success
  lastEventToken: `subject|${t0}|2|y`
};
assert.equal(L.wasScheduleAdvancedTodayOutsideReview(extraPractice, t0 + 1000), false);
assert.equal(L.isDailyReviewCandidate(extraPractice, t0 + 1000), false);

console.log('learning-engine tests: OK');
const G = require('../../js/engines/grading-engine.js');
assert.equal(G.classify('비교 분석한다', '비교·분석한다'), 'correct');
assert.equal(G.classify('인공지능 학스', '인공지능 학습'), 'near');
assert.equal(G.classify('설계', '구현'), 'wrong');
assert.equal(G.classify('탐구', '탐색'), 'wrong');
assert.equal(G.classify('', '구현'), 'unknown');

const recallSectionItem={type:'recall-section',subjectKey:'middle-info',area:'알고리즘과 프로그래밍',sourceGroup:'content-system',sectionTitle:'지식·이해'};
assert.equal(L.reviewLineKey(recallSectionItem),'recall-section|middle-info|알고리즘과 프로그래밍|content-system|지식·이해');
assert.equal(L.reviewLineKeyFromConceptKey('recall-section|middle-info|알고리즘과 프로그래밍|content-system|지식·이해'),'recall-section|middle-info|알고리즘과 프로그래밍|content-system|지식·이해');

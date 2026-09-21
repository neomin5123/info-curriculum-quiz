"use strict";
const assert = require('assert');
const R = require('../../js/engines/review-engine.js');
const H = require('../../js/engines/history-engine.js');
const S = require('../../js/engines/storage-engine.js');

const now = new Date('2026-09-16T09:00:00+09:00').getTime();
const bucket = R.nextDueBucket([
  {conceptKey:'a',lineKey:'L1',nextReviewAt:now + 24*60*60*1000},
  {conceptKey:'b',lineKey:'L1',nextReviewAt:now + 25*60*60*1000},
  {conceptKey:'c',lineKey:'L2',nextReviewAt:now + 26*60*60*1000}
], now);
assert.equal(bucket.count, 2, 'same source line should dedupe in next-review count');
assert.equal(R.relativeDayLabel(bucket.dayKey, now), '내일');

const lineNow = Date.now();
const linePicked = R.selectLineReviewRecords([
  {lineKey:'L',conceptKey:'old',nextReviewAt:lineNow-1000,lastResult:'correct',wrongCount:0},
  {lineKey:'L',conceptKey:'advanced',nextReviewAt:lineNow+3*24*60*60*1000,lastResult:'correct',wrongCount:0}
], lineNow);
assert.equal(linePicked.length, 0, 'stale sibling gaps must not force daily line review after one sibling advances');

const advancedTodayNotRepeated = R.selectLineReviewRecords([
  {lineKey:'TODAY',conceptKey:'advanced-today',nextReviewAt:lineNow+24*60*60*1000,lastResult:'correct',wrongCount:0,advancedToday:true}
], lineNow);
assert.equal(advancedTodayNotRepeated.length, 0, 'an item advanced to a future date today must not be repeated in the same-day long-term review');
const failurePicked = R.selectLineReviewRecords([
  {lineKey:'L',conceptKey:'wrong',nextReviewAt:lineNow-1000,lastResult:'wrong',wrongCount:2},
  {lineKey:'L',conceptKey:'future',nextReviewAt:lineNow+3*24*60*60*1000,lastResult:'correct',wrongCount:0}
], lineNow);
assert.equal(failurePicked[0].conceptKey, 'wrong', 'explicit due failure must override line-level future schedule');


const cumulativeNow = new Date('2026-09-21T12:00:00+09:00').getTime();
const cumulative = R.selectCumulativeReviewRecords([
  {lineKey:'A1',lastSeenAt:cumulativeNow-8*24*60*60*1000,wrongCount:2,unknownCount:0,nearCount:0,mastered:false,item:{subjectKey:'middle-info',area:'데이터'}},
  {lineKey:'A2',lastSeenAt:cumulativeNow-7*24*60*60*1000,wrongCount:0,unknownCount:0,nearCount:0,mastered:true,item:{subjectKey:'middle-info',area:'데이터'}},
  {lineKey:'B1',lastSeenAt:cumulativeNow-6*24*60*60*1000,wrongCount:1,unknownCount:0,nearCount:0,mastered:false,item:{subjectKey:'middle-info',area:'인공지능'}},
  {lineKey:'C1',lastSeenAt:cumulativeNow-5*24*60*60*1000,wrongCount:0,unknownCount:1,nearCount:0,mastered:false,item:{subjectKey:'high-info',area:'데이터'}},
  {lineKey:'TODAY',lastSeenAt:cumulativeNow-60*60*1000,wrongCount:9,item:{subjectKey:'middle-info',area:'데이터'}}
], {now:cumulativeNow,limit:3,excludeLineKeys:['A2']});
assert.equal(cumulative.length,3,'consolidation must build an actual mixed retrieval set');
assert(!cumulative.some(x=>x.lineKey==='A2' || x.lineKey==='TODAY'),'cumulative set must exclude scheduled/today items');
assert(new Set(cumulative.map(x=>`${x.item.subjectKey}|${x.item.area}`)).size>=2,'cumulative set should prefer scope diversity');

assert.deepEqual(R.summarizePracticalStates([
  {practicalInitialStatus:'correct'}, {practicalInitialStatus:'near'}, {practicalInitialStatus:'wrong'}, {practicalInitialStatus:'unknown'}
]), {correct:1, near:1, wrong:1, unknown:1});

const records = [
  {attempts:2,resolved:false,lastWrongAt:'2026-09-15T00:00:00Z',context:'b'},
  {attempts:5,resolved:false,lastWrongAt:'2026-09-14T00:00:00Z',context:'a'}
];
assert.equal(H.sortRecords(records,'weak')[0].attempts, 5);
assert.equal(H.isWeak(records[0], {}), true);

const sortable = [
  {key:'a',conceptKey:'a',attempts:5,resolved:false,lastWrongAt:'2026-09-14T00:00:00Z',context:'a'},
  {key:'b',conceptKey:'b',attempts:2,resolved:false,lastWrongAt:'2026-09-15T00:00:00Z',context:'b'}
];
const sortMastery = {a:{lastSeenAt:new Date('2026-09-15T01:00:00Z').getTime()}, b:{lastSeenAt:new Date('2026-09-16T01:00:00Z').getTime()}};
assert.equal(H.sortRecords(sortable,'weak','wrong',sortMastery)[0].key, 'a', 'wrong sort should prioritize wrong count');
assert.equal(H.sortRecords(sortable,'weak','recent',sortMastery)[0].key, 'b', 'recent sort should use lastSeenAt');
assert.equal(H.sortRecords(sortable,'weak','oldest',sortMastery)[0].key, 'a', 'oldest sort should use lastSeenAt ascending');

const payload = S.buildBackupPayload({appVersion:'6.11.1',history:[],mastery:{},practicalStats:{},practiceSourceLink:{'SRC-1':{deficit:2}},practiceQuestionStats:{version:1,questions:{'PB-001':{attempts:1}}},gradingOverrides:{x:{mode:'wrong'}},practicalExamProgress:{completedSinceChallenge:2},plannerState:{version:1,completedSectionIds:[]}});
assert.equal(payload.schemaVersion, 10);
assert.equal(S.schemaSupported(7), true, 'v1~v7 backups must remain importable');
assert.equal(S.schemaSupported(9), true);
assert.equal(S.schemaSupported(10), true);
assert.equal(S.schemaSupported(11), false);
assert.equal(payload.gradingOverrides.x.mode, 'wrong');
assert.equal(payload.practiceSourceLink['SRC-1'].deficit, 2, 'practice-source link state must be backed up');
assert.equal(payload.practiceQuestionStats.questions['PB-001'].attempts, 1, 'practice question stats must be backed up');
assert.equal(payload.plannerState.version,1,'planner state must be backed up');
console.log('support-engine tests: OK');

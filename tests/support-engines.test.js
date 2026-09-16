"use strict";
const assert = require('assert');
const R = require('../js/review-engine.js');
const H = require('../js/history-engine.js');
const S = require('../js/storage-engine.js');

const now = new Date('2026-09-16T09:00:00+09:00').getTime();
const bucket = R.nextDueBucket([
  {conceptKey:'a',lineKey:'L1',nextReviewAt:now + 24*60*60*1000},
  {conceptKey:'b',lineKey:'L1',nextReviewAt:now + 25*60*60*1000},
  {conceptKey:'c',lineKey:'L2',nextReviewAt:now + 26*60*60*1000}
], now);
assert.equal(bucket.count, 2, 'same source line should dedupe in next-review count');
assert.equal(R.relativeDayLabel(bucket.dayKey, now), '내일');
assert.deepEqual(R.summarizePracticalStates([
  {practicalInitialStatus:'correct'}, {practicalInitialStatus:'near'}, {practicalInitialStatus:'wrong'}, {practicalInitialStatus:'unknown'}
]), {correct:1, near:1, wrong:1, unknown:1});

const records = [
  {attempts:2,resolved:false,lastWrongAt:'2026-09-15T00:00:00Z',context:'b'},
  {attempts:5,resolved:false,lastWrongAt:'2026-09-14T00:00:00Z',context:'a'}
];
assert.equal(H.sortRecords(records,'weak')[0].attempts, 5);
assert.equal(H.isWeak(records[0], {}), true);

const payload = S.buildBackupPayload({appVersion:'6.9.0',history:[],mastery:{},practicalStats:{},gradingOverrides:{x:{mode:'wrong'}},practicalExamProgress:{completedSinceChallenge:2}});
assert.equal(payload.schemaVersion, 8);
assert.equal(S.schemaSupported(7), true, 'v1~v7 backups must remain importable');
assert.equal(S.schemaSupported(8), true);
assert.equal(S.schemaSupported(9), false);
assert.equal(payload.gradingOverrides.x.mode, 'wrong');
console.log('support-engine tests: OK');

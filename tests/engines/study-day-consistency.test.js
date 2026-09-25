'use strict';
process.env.TZ='Asia/Seoul';
const assert=require('assert');
const D=require('../../js/engines/day-engine.js');
const L=require('../../js/engines/learning-engine.js');
const R=require('../../js/engines/review-engine.js');
const P=require('../../js/engines/planner-engine.js');
const H=require('../../js/engines/history-engine.js');
assert.equal(D.STUDY_DAY_START_HOUR,4,'study day boundary');
const points=[
 ['2026-09-25T00:00:00+09:00','2026-09-24'],['2026-09-25T03:59:59+09:00','2026-09-24'],
 ['2026-09-25T04:00:00+09:00','2026-09-25'],['2026-09-25T23:59:59+09:00','2026-09-25']
];
for(const [iso,key] of points){const t=new Date(iso).getTime();assert.equal(D.studyDayKey(t),key,`day ${iso}`);assert.equal(L.localDayKey(t),key,`learning ${iso}`);assert.equal(R.localDayKey(t),key,`review ${iso}`);assert.equal(P.localDayKey(t),key,`planner ${iso}`);}
const a=new Date('2026-09-25T03:50:00+09:00').getTime(), b=new Date('2026-09-25T04:10:00+09:00').getTime();
assert.equal(H.wrongDayCount({wrongEvents:[{at:a},{at:a+9*60*1000}]}),1,'history before 04:00 same study day');
assert.equal(H.wrongDayCount({wrongEvents:[{at:a},{at:b}]}),2,'history crosses 04:00');
console.log('study-day consistency: OK (04:00 across day/learning/review/planner/history)');

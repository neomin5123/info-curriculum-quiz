import assert from 'node:assert/strict';
import fs from 'node:fs';
const l=JSON.parse(fs.readFileSync('data/audits/2026-10-26-build-37-composite-review.json','utf8'));
const q=JSON.parse(fs.readFileSync('data/exams/major-exams-2014-2026.json','utf8')).questions;
const map=new Map(q.map(x=>[x.id,x]));
assert.equal(l.cumulative_A_count,18);assert.equal(l.new_A_ids.length,0);
assert.equal(new Set(l.all_A_ids).size,18);assert.equal(l.new_checks.length,4);
for(const c of l.new_checks){assert.equal(c.grade,'B_partial');assert.ok(c.verified_subparts.length);assert.ok(c.unverified_subparts.length);assert.ok(map.has(c.id));}
const A5=map.get('2026-A-05');assert.match(A5.text,/평가기준을 세분화/);assert.match(A5.answer,/list\[i\] = list\[least\]/);
const A7=map.get('2026-A-07');assert.match(A7.text,/포트폴리오|활동 결과물/);assert.match(A7.answer,/보고서법/);
const A8=map.get('2026-A-08');assert.match(A8.text,/긴급 데이터의 시작 위치/);assert.match(A8.solution,/표준상 의미/);
assert.equal(12000+500,12500);assert.match(A8.answer,/12,500/);
const A9=map.get('2026-A-09');assert.match(A9.text,/기술적 문제해결능력/);assert.match(A9.answer,/디지털 문화 소양/);
console.log('Build37 partial-review boundaries PASS');

'use strict';
const assert = require('assert');
global.window = {};
require('../../data/curriculum/2022/curriculum.js');
const S = require('../../js/engines/structure-engine.js');
const data = window.CURRILOOP_CURRICULUM_DATA;

assert.equal(S.extractStandardCode('[9정03-05] 데이터를 순차적으로 저장한다.'), '9정03-05');
assert.equal(S.stripStandardCode('[9정03-05] 데이터를 순차적으로 저장한다.'), '데이터를 순차적으로 저장한다.');

const areas = ['컴퓨팅 시스템','데이터','알고리즘과 프로그래밍','인공지능','디지털 문화'];
for (const area of areas) {
  const pool = S.buildQuestionPool(data, area);
  const disc = pool.filter(q => q.kind === 'discriminate');
  const link = pool.filter(q => q.kind === 'connect');
  assert(disc.length > 0, `${area}: discrimination questions`);
  assert(link.length > 0, `${area}: connection questions`);
  for (const q of disc) {
    assert(S.CATEGORY_TITLES.includes(q.answer), `${area}: category answer`);
    assert(q.choices.includes(q.answer), `${area}: category answer in choices`);
    assert(!/^\s*\[9정/.test(q.prompt), `${area}: no achievement code in category prompt`);
  }
  for (const q of link) {
    assert(q.answerCode, `${area}: linked code`);
    assert(!/^\s*\[9정/.test(q.prompt), `${area}: commentary code hidden`);
    assert(q.choices.some(choice => choice.value === q.answer), `${area}: correct standard choice exists`);
    assert(q.choices.length >= 2 && q.choices.length <= 4, `${area}: compact connection choices`);
  }
  const session = S.buildSession(data, area, {limit:8, nonce:1});
  assert(session.length > 0 && session.length <= 8, `${area}: session length`);
  assert.equal(new Set(session.map(q => q.id)).size, session.length, `${area}: no duplicate in session`);
  assert(session.some(q => q.kind === 'connect'), `${area}: includes connection`);
}

console.log('structure-engine: OK');

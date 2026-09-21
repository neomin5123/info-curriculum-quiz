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
  const standardElements = pool.filter(q => q.kind === 'standard-elements');
  const commentary = pool.filter(q => q.kind === 'commentary-connect');
  assert(standardElements.length >= 3, `${area}: standard-content links`);
  assert(commentary.length > 0, `${area}: commentary links`);
  assert(!pool.some(q => q.kind === 'discriminate'), `${area}: trivial category discrimination removed`);
  assert(!pool.some(q => q.kind === 'element-connect'), `${area}: single element cue questions removed`);

  for (const q of standardElements) {
    assert(q.multiSelect === true, `${area}: standard-content uses multi-select`);
    assert(Array.isArray(q.answers) && q.answers.length >= 1, `${area}: standard-content answers`);
    assert(Array.isArray(q.answerElements) && q.answerElements.length === q.answers.length, `${area}: element-answer alignment`);
    assert(q.choices.length >= q.answers.length && q.choices.length <= 6, `${area}: compact content choices`);
    for (const answer of q.answers) assert(q.choices.some(choice => choice.value === answer), `${area}: all linked elements in choices`);
    assert(!/^\s*\[9정/.test(q.prompt), `${area}: no standard code leaked`);
  }

  for (const q of commentary) {
    assert(q.multiSelect === false, `${area}: commentary is single-select`);
    assert(q.answerCode, `${area}: commentary linked code`);
    assert(!/^\s*\[9정/.test(q.prompt), `${area}: commentary code hidden`);
    assert(q.choices.some(choice => choice.value === q.answer), `${area}: correct standard choice exists`);
    assert(q.choices.length >= 2 && q.choices.length <= 4, `${area}: compact commentary choices`);
  }

  const session = S.buildSession(data, area, {limit:6, nonce:1});
  assert(session.length >= 4 && session.length <= 6, `${area}: compact session length`);
  assert.equal(new Set(session.map(q => q.id)).size, session.length, `${area}: no duplicate in session`);
  assert(session.some(q => q.kind === 'standard-elements'), `${area}: includes standard-content link`);
  assert(session.some(q => q.kind === 'commentary-connect'), `${area}: includes commentary link`);
}

// 대표 통합 연결: 9정02-04는 내용체계에서 구조화·해석 및 데이터 기반 관점과 연결된다.
const dataPool = S.buildQuestionPool(data, '데이터');
const q204 = dataPool.find(q => q.kind === 'standard-elements' && q.answerCode === '9정02-04');
assert(q204, '9정02-04 standard-content question');
for (const id of ['MI-02-CS-KN-03','MI-02-CS-PF-03','MI-02-CS-VA-02']) assert(q204.answers.includes(id), `9정02-04 linked ${id}`);

console.log('structure-engine: OK');

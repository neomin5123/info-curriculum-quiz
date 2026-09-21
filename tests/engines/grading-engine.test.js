'use strict';
const assert = require('assert');
const G = require('../../js/engines/grading-engine.js');

function expectStatus(user, expected, status, reason = null) {
  const result = G.classifyDetailed(user, expected);
  assert.equal(result.status, status, `${user} -> ${expected}: expected ${status}, got ${result.status}/${result.reason}`);
  if (reason) assert.equal(result.reason, reason, `${user} -> ${expected}: expected reason ${reason}, got ${result.reason}`);
}

// Exact normalization remains strict enough for punctuation/spacing differences.
expectStatus('비교 분석한다', '비교·분석한다', 'correct');

// Flexible grace cases generalized from real study-error patterns.
expectStatus('기술 발전', '기술의 발전', 'near', 'particle');
expectStatus('기술 발달', '기술의 발전', 'near', 'synonym');
expectStatus('구분하기', '구별하기', 'near', 'synonym');
expectStatus('특징', '특성', 'near', 'synonym');
expectStatus('별화', '변화', 'near', 'typo');
expectStatus('구현되는 에이전트', '구현된 에이전트', 'near');
expectStatus('에이전트', '구현된 에이전트', 'near', 'partial');
expectStatus('생활 속 문제 해결', '실생활 문제 해결', 'near');
expectStatus('진로', '진로 결정', 'near', 'partial');
expectStatus('찾아내는 데 도움', '찾는 데 도움', 'near');
expectStatus('유의해야 할', '주의해야 할 위험 요소', 'near');
expectStatus('탐구', '탐색', 'wrong');
expectStatus('발견', '탐색', 'wrong');
expectStatus('처리 가능한 형태', '해결 가능한 형태', 'wrong');
expectStatus('다양한 해결 전략', '다양한 설계 전략', 'wrong');
expectStatus('구성되는 컴퓨팅 시스템', '동작하는 컴퓨팅 시스템', 'wrong');

// Concept/stage substitutions must still be real errors.
expectStatus('활용', '선택', 'wrong');
expectStatus('설계', '구현', 'wrong');
expectStatus('선택', '수집', 'wrong');
expectStatus('표현', '구현', 'wrong');
expectStatus('분석', '구조화', 'wrong');
expectStatus('인공지능 시스템', '인공지능 학습', 'wrong');
expectStatus('문제 해결', '문제 분석', 'wrong');
expectStatus('자세', '가치', 'wrong');
expectStatus('', '디지털 윤리', 'unknown', 'empty');

console.log('grading-engine tests: OK');

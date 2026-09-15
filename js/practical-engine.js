(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopPracticalEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const LOW_VALUE_EXACT = new Set([
    '필요','도움','중요','가능','사용','제공','활용','이용','된다','한다','있다','없다','높인다','기른다','돕는다',
    '개념','기능','역할','의미','자세','태도','관점','방법','과정','결과','목적','수준','요소','내용','활동','경험','기회','사항'
  ]);
  const GENERIC_PREDICATES = /^(활용(?:된다|한다|하기)?|사용(?:된다|한다|하기)?|이용(?:된다|한다|하기)?|필요(?:하다|한)?|중요(?:하다|한)?|가능(?:하다|한)?|제공(?:한다|된다|하기)?)$/;
  const HIGH_VALUE_ACTION = /(분석|비교|설계|구현|평가|선택|탐색|발견|추출|구조화|표현|수집|가공|분류|처리|개발|검증|예측|학습|해결|적용|판단|설명|추론|모델링|시뮬레이션)/;
  const NAMED_METHOD = /(학습|평가|루브릭|포트폴리오|프로젝트|언플러그드|알고리즘|데이터|인공지능|컴퓨팅|프로그래밍|소프트웨어|시스템|디지털|네트워크|암호|정렬|탐색)/;

  function compact(value) {
    return String(value || '').normalize('NFKC').replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g, '').trim();
  }

  // 0: 실전 제외, 1: 낮은 빈도, 2: 일반 중요, 3: 최우선
  function inferPriority(answer, options = {}) {
    const raw = String(answer || '').trim();
    const token = compact(raw);
    if (!token) return 0;
    if (options.explicitPriority !== undefined && options.explicitPriority !== null) {
      return Math.max(0, Math.min(3, Number(options.explicitPriority) || 0));
    }
    if (LOW_VALUE_EXACT.has(token) || GENERIC_PREDICATES.test(token)) return 0;
    if (options.coreLike) return 3;
    if (token.length <= 1) return 0;
    const lineToken = compact(options.lineText || '');
    const sourceGroup = String(options.sourceGroup || '');
    // 내용체계의 짧은 공식 요소는 그 항목 자체가 인출 대상이다.
    if (sourceGroup === 'content-system' && lineToken.length <= 18 && token.length >= 2) return 3;
    if (HIGH_VALUE_ACTION.test(token)) return 3;
    if (sourceGroup === 'teaching-evaluation' && NAMED_METHOD.test(token)) return 3;
    if (NAMED_METHOD.test(token) || token.length >= 4) return 2;
    return 1;
  }

  function scoreTarget(stat = {}, priority = 2, options = {}) {
    const shown = Number(stat.shown || 0);
    const wrong = Number(stat.wrong || 0);
    const lastResult = stat.lastResult || '';
    let score = shown === 0 ? 7 : Math.max(0, 4 - shown) * 0.8;
    score += priority * 2.4;
    score += lastResult === 'wrong' ? 6 : lastResult === 'near' ? 2.5 : 0;
    score += Math.min(5, wrong) * 0.9;
    if (options.wasLastCombo) score -= 3.5;
    score += Number(options.jitter || 0);
    return score;
  }

  function uniqueSuccessDays(stats = []) {
    const days = new Set();
    stats.forEach(stat => (Array.isArray(stat?.successDays) ? stat.successDays : []).forEach(day => day && days.add(day)));
    return days.size;
  }

  function desiredBlankCount(visibleChars, candidateCount, lineStats = []) {
    let desired = Number(visibleChars || 0) >= 30 ? 2 : 1;
    const spacedDays = uniqueSuccessDays(lineStats);
    if (spacedDays >= 2) desired += 1;
    if (spacedDays >= 4) desired += 1;
    return Math.max(1, Math.min(4, Number(candidateCount || 0), desired));
  }

  function coverageLimit(lineStats = []) {
    const days = uniqueSuccessDays(lineStats);
    return days >= 3 ? 0.42 : 0.30;
  }

  function noteResult(stat = {}, status, dayKey, now = Date.now(), countShown = true) {
    const next = {...stat};
    if (countShown) next.shown = Number(next.shown || 0) + 1;
    if (status === 'correct') {
      next.correct = Number(next.correct || 0) + 1;
      const days = new Set(Array.isArray(next.successDays) ? next.successDays : []);
      if (dayKey) days.add(dayKey);
      next.successDays = [...days].sort().slice(-12);
    } else if (status === 'near') {
      next.near = Number(next.near || 0) + 1;
    } else if (status === 'wrong') {
      next.wrong = Number(next.wrong || 0) + 1;
    }
    next.lastResult = status;
    next.lastResultAt = now;
    return next;
  }

  return {
    compact,
    inferPriority,
    scoreTarget,
    uniqueSuccessDays,
    desiredBlankCount,
    coverageLimit,
    noteResult
  };
});

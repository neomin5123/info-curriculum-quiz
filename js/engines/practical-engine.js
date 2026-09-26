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
  const APPLICATION_DISTINCTIVE = /(프로젝트|포트폴리오|보고서|언플러그드|문제기반|협력학습|토론|토의|서.?논술|수행평가|관찰평가|동료평가|자기평가|루브릭|연계|재구성|학습자|수준|초등학교|중학교|고등학교|디지털 도구|온라인|오프라인|누적|기록)/;

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
    const lineToken = compact(options.lineText || '');
    const sourceGroup = String(options.sourceGroup || '');
    const sectionTitle = String(options.sectionTitle || '');

    let priority = 1;
    if (options.coreLike) priority = 3;
    else if (sourceGroup === 'content-system' && lineToken.length <= 18 && token.length >= 2) priority = 3;
    else if (HIGH_VALUE_ACTION.test(token)) priority = 3;
    else if (sourceGroup === 'teaching-evaluation' && NAMED_METHOD.test(token)) priority = 3;
    else if (NAMED_METHOD.test(token) || token.length >= 4) priority = 2;

    // 성취기준은 정확 인출을 유지하고, 해설/적용 고려사항은 핵심 단서 위주로 강도를 낮춘다.
    if (sourceGroup === 'achievement' && sectionTitle.includes('적용 시 고려')) {
      if (APPLICATION_DISTINCTIVE.test(raw)) return Math.max(2, priority);
      return Math.min(priority, 2);
    }
    if (sourceGroup === 'achievement' && sectionTitle.includes('해설')) {
      if (NAMED_METHOD.test(token)) return Math.max(2, priority);
      return Math.min(priority, 2);
    }
    return priority;
  }

  function scoreTarget(stat = {}, priority = 2, options = {}) {
    const shown = Number(stat.shown || 0);
    const wrong = Number(stat.wrong || 0);
    const unknown = Number(stat.unknown || 0);
    const lastResult = stat.lastResult || '';
    let score = shown === 0 ? 7 : Math.max(0, 4 - shown) * 0.8;
    score += priority * 2.4;
    score += lastResult === 'wrong' ? 6 : lastResult === 'unknown' ? 4.5 : lastResult === 'near' ? 2.5 : 0;
    score += Math.min(5, wrong) * 0.9;
    score += Math.min(5, unknown) * 0.65;
    if (options.wasLastCombo) score -= 3.5;
    score += Number(options.jitter || 0);
    return score;
  }

  function uniqueSuccessDays(stats = []) {
    const days = new Set();
    stats.forEach(stat => (Array.isArray(stat?.successDays) ? stat.successDays : []).forEach(day => day && days.add(day)));
    return days.size;
  }

  function desiredBlankCount(visibleChars, candidateCount, lineStats = [], options = {}) {
    let desired = Number(visibleChars || 0) >= 30 ? 2 : 1;
    const spacedDays = uniqueSuccessDays(lineStats);
    if (spacedDays >= 2) desired += 1;
    if (spacedDays >= 4) desired += 1;
    const sourceGroup = String(options.sourceGroup || '');
    const sectionTitle = String(options.sectionTitle || '');
    if (sourceGroup === 'achievement' && sectionTitle.includes('적용 시 고려')) desired = 1;
    else if (sourceGroup === 'achievement' && sectionTitle.includes('해설')) desired = Math.min(spacedDays >= 3 ? 2 : 1, desired);
    return Math.max(1, Math.min(4, Number(candidateCount || 0), desired));
  }

  function coverageLimit(lineStats = []) {
    const days = uniqueSuccessDays(lineStats);
    return days >= 3 ? 0.42 : 0.30;
  }


  function examCoreCoverage(items = []) {
    const core = (items || []).filter(item => item && item.examCore);
    if (!core.length) return false;
    return core.every(item => Number(item.stat?.correct || 0) > 0);
  }

  // 기출 기반 숙련 조합:
  // 1) 핵심 원자를 아직 한 번씩 회수하지 못했으면 항상 1세트
  // 2) 핵심 원자 1회 회수 + 서로 다른 성공일 2일 이상이면 2세트
  // 3) 성공일 4일 이상이면 기출 관찰 최대 + 1 안전마진(trainingMaxUnits)까지
  function desiredExamSetCount(candidateCount, itemStats = [], profile = {}) {
    const count = Math.max(0, Number(candidateCount || 0));
    if (!count) return 0;
    const observed = Math.max(1, Number(profile.observedMaxUnits || 1));
    const trainingMax = Math.max(1, Math.min(count, Number(profile.trainingMaxUnits || observed + 1)));
    const stats = (itemStats || []).map(item => item?.stat || item || {});
    const spacedDays = uniqueSuccessDays(stats);
    const covered = examCoreCoverage(itemStats);
    if (!covered || spacedDays < 2) return 1;
    if (spacedDays < 4) return Math.min(trainingMax, Math.max(2, Math.min(observed, 2)));
    return trainingMax;
  }

  // blank 수는 기출 profile이 결정한다. coverage는 난이도 기준이 아니라 문맥 소실 방지용 마지막 안전장치다.
  // 실제 답안 생산(production) 근거가 있는 문장만 더 넓게 허용하고,
  // recognition/cue/pattern은 제시문을 과도하게 지우지 않도록 더 보수적으로 제한한다.
  function examCoverageLimit(profile = {}) {
    return profile?.productionEvidence || profile?.demandKind === 'production' ? 0.55 : 0.35;
  }

  // 짧은 exact line처럼 실제 시험이 원문 대부분을 생산하도록 요구한 경우에는
  // 관찰된 production 단위까지만 coverage rail을 넘을 수 있다. +α 원자는 이 예외를 받지 않는다.
  function isObservedProductionSet(entries = [], profile = {}) {
    if (!(profile?.productionEvidence || profile?.demandKind === 'production')) return false;
    const observed = Math.max(1, Number(profile.observedMaxUnits || 1));
    return entries.length > 0 && entries.length <= observed && entries.every(entry => Boolean(entry?.pinned));
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
    } else if (status === 'unknown') {
      next.unknown = Number(next.unknown || 0) + 1;
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
    examCoreCoverage,
    desiredExamSetCount,
    examCoverageLimit,
    isObservedProductionSet,
    noteResult
  };
});

(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopRecallEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function normalize(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g, '')
      .trim();
  }

  function splitAchievement(text) {
    const raw = String(text || '').trim();
    const match = raw.match(/^(\[[^\]]+\])\s*(.*)$/s);
    return match ? {code:match[1], body:match[2].trim()} : {code:'', body:raw};
  }

  function memoryTier(sectionTitle, sourceGroup = '') {
    const title = String(sectionTitle || '').trim();
    if (title === '지식·이해' || title === '과정·기능' || title === '성취기준') {
      return {key:'exact', label:'정확 암기', description:'핵심 명사·행동동사·항목 자체를 빠짐없이 회상'};
    }
    if (title === '목표' || title === '핵심 아이디어' || title === '가치·태도' ||
        title.includes('성취기준 해설') || title.includes('성취기준 적용 시 고려')) {
      return {key:'coreplus', label:'키워드 +@', description:'핵심어와 관계·열거·구별점을 회상'};
    }
    if (title === '성격' || sourceGroup === 'teaching-evaluation' || /교수|평가/.test(title)) {
      return {key:'keyword', label:'키워드', description:'과목 고유 원칙과 출제 가능한 키워드 중심'};
    }
    return {key:'coreplus', label:'키워드 +@', description:'핵심어와 관계를 중심으로 회상'};
  }

  function holisticKind(sectionTitle) {
    const title = String(sectionTitle || '').trim();
    if (title === '지식·이해' || title === '과정·기능') return 'list';
    if (title === '성취기준') return 'achievement';
    return '';
  }

  function pairScore(user, expected, classifier) {
    if (!String(user || '').trim()) return null;
    const detail = classifier ? classifier(user, expected, []) : null;
    if (detail?.status === 'correct') return {status:'correct', score:300 + Number(detail.confidence || 1), detail};
    if (detail?.status === 'near') return {status:'near', score:200 + Number(detail.confidence || 0), detail};
    const u = normalize(user), e = normalize(expected);
    if (!u || !e) return null;
    // Wrong answers never become a positive match. Similarity is only used to attach a diagnostic target.
    let shared = 0;
    const set = new Set([...e]);
    [...u].forEach(ch => { if (set.has(ch)) shared += 1; });
    const diagnostic = shared / Math.max(u.length, e.length, 1);
    return {status:'wrong', score:diagnostic, detail:detail || {status:'wrong', reason:'meaning', confidence:1}};
  }

  function matchRecallList(userEntries, expectedItems, classifier) {
    const users = (userEntries || []).map((value, index) => ({index, value:String(value || '').trim()}));
    const expected = (expectedItems || []).map((value, index) => ({index, value:String(value || '').trim()}));
    const positivePairs = [];
    const wrongPairs = [];

    users.forEach(u => expected.forEach(e => {
      const scored = pairScore(u.value, e.value, classifier);
      if (!scored) return;
      const row = {userIndex:u.index, expectedIndex:e.index, userValue:u.value, expectedValue:e.value, ...scored};
      if (scored.status === 'correct' || scored.status === 'near') positivePairs.push(row);
      else wrongPairs.push(row);
    }));

    positivePairs.sort((a,b) => b.score - a.score || a.userIndex - b.userIndex || a.expectedIndex - b.expectedIndex);
    const usedUsers = new Set(), usedExpected = new Set();
    const matches = [];
    positivePairs.forEach(pair => {
      if (usedUsers.has(pair.userIndex) || usedExpected.has(pair.expectedIndex)) return;
      usedUsers.add(pair.userIndex); usedExpected.add(pair.expectedIndex); matches.push(pair);
    });

    const unmatchedUsers = users.filter(u => u.value && !usedUsers.has(u.index));
    const missing = expected.filter(e => !usedExpected.has(e.index));
    const diagnosticAssignments = [];
    const diagnosticExpected = new Set();
    unmatchedUsers.forEach(u => {
      const candidates = wrongPairs
        .filter(p => p.userIndex === u.index && !diagnosticExpected.has(p.expectedIndex))
        .sort((a,b) => b.score - a.score);
      if (candidates[0]) {
        diagnosticExpected.add(candidates[0].expectedIndex);
        diagnosticAssignments.push(candidates[0]);
      }
    });

    const byUser = new Map(matches.map(m => [m.userIndex, m]));
    diagnosticAssignments.forEach(m => { if (!byUser.has(m.userIndex)) byUser.set(m.userIndex, m); });
    const byExpected = new Map(matches.map(m => [m.expectedIndex, m]));

    const allMatched = missing.length === 0 && unmatchedUsers.length === 0 && matches.length === expected.length;
    const exactAll = allMatched && matches.every(m => m.status === 'correct');
    const matchedExpectedOrder = matches.slice().sort((a,b) => a.userIndex - b.userIndex).map(m => m.expectedIndex);
    const orderCorrect = allMatched && matchedExpectedOrder.every((expectedIndex, userRank) => expectedIndex === userRank);

    return {
      users,
      expected,
      matches,
      byUser,
      byExpected,
      missing,
      unmatchedUsers,
      diagnosticAssignments,
      contentComplete:allMatched,
      contentExact:exactAll,
      orderCorrect,
      perfect:exactAll && orderCorrect,
      nearCount:matches.filter(m => m.status === 'near').length
    };
  }

  function sectionStatus(result) {
    if (!result) return 'unknown';
    if (result.perfect) return 'correct';
    if (result.contentComplete) return 'near';
    if ((result.unmatchedUsers || []).length) return 'wrong';
    return 'unknown';
  }

  function parseFreeRecallText(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line.replace(/^\s*(?:[-*•▪▫‣⁃]|\d{1,2}\s*[.)]|[①-⑳])\s*/, '').trim())
      .filter(Boolean);
  }

  // 6과목 통회상 공통 장기 상태.
  // streak 1: 최초 정확 인출, 2~3: 서로 다른 날짜의 재인출이 누적되는 안정화 구간,
  // streak 4: 1일→3일→7일 간격을 거친 뒤 다시 정확히 인출한 상태.
  function recallMasteryStage(source) {
    const item = source && typeof source === 'object' ? source : {};
    const streak = Number(item.correctStreak || 0);
    if (streak >= 4) return {key:'mastered', label:'숙달', description:'7일 이상 간격의 통회상까지 다시 성공'};
    if (streak >= 2) return {key:'stabilizing', label:'안정화 중', description:'날짜를 건너 재인출 중 · 아직 장기 숙달 아님'};
    if (streak >= 1) return {key:'learned', label:'학습됨', description:'최초 정확 통회상 성공'};
    if (Number(item.correctCount || 0) > 0) return {key:'relearn', label:'재학습 필요', description:'이전 성공 뒤 현재 연속 재인출이 끊긴 상태'};
    return {key:'new', label:'학습 전', description:'아직 정확 통회상 성공 기록 없음'};
  }

  function isRecallMastered(source) {
    return recallMasteryStage(source).key === 'mastered';
  }

  function positionGrade(user, expected, classifier) {
    const detail = classifier ? classifier(user, expected, []) : null;
    return detail || {status:normalize(user) === normalize(expected) ? 'correct' : (normalize(user) ? 'wrong' : 'unknown'), reason:'exact', confidence:1};
  }

  return {
    normalize,
    splitAchievement,
    memoryTier,
    holisticKind,
    matchRecallList,
    sectionStatus,
    parseFreeRecallText,
    recallMasteryStage,
    isRecallMastered,
    positionGrade
  };
});

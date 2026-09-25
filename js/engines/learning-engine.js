(function(root, factory) {
  const dayEngine = (typeof module === 'object' && module.exports) ? require('./day-engine.js') : root?.CurriLoopDayEngine;
  const api = factory(dayEngine);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopLearningEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(DayEngine) {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

  const localDayKey = DayEngine?.studyDayKey || DayEngine?.localDayKey;
  if (typeof localDayKey !== 'function') throw new Error('CurriLoopDayEngine is required');

  function reviewIntervalDays(streak) {
    const index = Math.max(0, Math.min(REVIEW_INTERVALS.length - 1, Number(streak || 1) - 1));
    return REVIEW_INTERVALS[index];
  }

  function normalizeMasteryItem(source) {
    const item = source && typeof source === 'object' ? {...source} : {};
    return {
      ...item,
      correctCount: Number(item.correctCount || 0),
      nearCount: Number(item.nearCount || 0),
      unknownCount: Number(item.unknownCount || 0),
      wrongCount: Number(item.wrongCount || 0),
      correctStreak: Number(item.correctStreak || 0),
      mastered: Boolean(item.mastered),
      nextReviewAt: Number(item.nextReviewAt || 0),
      lastSeenAt: Number(item.lastSeenAt || 0),
      lastSuccessAt: Number(item.lastSuccessAt || 0)
    };
  }

  // status: correct | near | unknown | wrong
  // exact retrieval only advances the long-term schedule. 'near' is neither a failure nor mastery evidence.
  // 'unknown' is a recall failure for scheduling, but is kept separate from a typed wrong answer/history.
  function applyMasteryEvent(source, status, now = Date.now(), eventToken = '') {
    const item = normalizeMasteryItem(source);
    if (eventToken && item.lastEventToken === eventToken) return {item, changed:false, due:false};
    item.lastEventToken = eventToken || String(now);
    item.lastSeenAt = now;

    if (status === 'correct') {
      item.correctCount += 1;
      item.lastSuccessAt = now;
      const due = !item.nextReviewAt || now >= item.nextReviewAt;
      if (due) item.correctStreak += 1;
      item.mastered = item.correctStreak >= 2;
      if (due) item.nextReviewAt = now + reviewIntervalDays(item.correctStreak) * DAY_MS;
      item.lastResult = 'correct';
      return {item, changed:true, due};
    }

    if (status === 'near') {
      item.nearCount += 1;
      item.lastResult = 'near';
      // Do not advance mastery. Avoid an immediate same-screen due loop; recheck later the same day.
      const softRecheckAt = now + 6 * 60 * 60 * 1000;
      if (!item.nextReviewAt || item.nextReviewAt <= now || item.nextReviewAt > softRecheckAt) item.nextReviewAt = softRecheckAt;
      return {item, changed:true, due:false};
    }

    if (status === 'unknown') {
      item.unknownCount += 1;
      item.correctStreak = 0;
      item.mastered = false;
      item.nextReviewAt = now + 6 * 60 * 60 * 1000;
      item.lastResult = 'unknown';
      return {item, changed:true, due:true};
    }

    item.wrongCount += 1;
    item.correctStreak = 0;
    item.mastered = false;
    item.nextReviewAt = now;
    item.lastResult = 'wrong';
    return {item, changed:true, due:true};
  }

  function masteryEventScope(item) {
    return String(item?.lastEventToken || "").split("|", 1)[0] || "";
  }

  // 오늘 비복습 학습에서 "원래 복습 시점이었던 항목"의 일정이 실제로 전진했는지 판별한다.
  // 단순 추가 연습은 nextReviewAt이 lastSuccessAt 기준으로 다시 계산되지 않으므로 제외된다.
  function wasScheduleAdvancedTodayOutsideReview(item, now = Date.now()) {
    const source = normalizeMasteryItem(item);
    const successAt = Number(source.lastSuccessAt || 0);
    const nextReviewAt = Number(source.nextReviewAt || 0);
    const streak = Number(source.correctStreak || 0);
    if (!successAt || !nextReviewAt || streak < 2) return false;
    if (localDayKey(successAt) !== localDayKey(now)) return false;
    const scope = masteryEventScope(source);
    if (scope !== "subject" && scope !== "practical-retry") return false;
    const expected = successAt + reviewIntervalDays(streak) * DAY_MS;
    return Math.abs(nextReviewAt - expected) <= 60 * 1000;
  }

  function isDailyReviewCandidate(item, now = Date.now()) {
    const source = normalizeMasteryItem(item);
    const dueAt = Number(source.nextReviewAt || 0);
    return (dueAt > 0 && dueAt <= now) || wasScheduleAdvancedTodayOutsideReview(source, now);
  }

  function wasExactSuccessToday(item, now = Date.now()) {
    const timestamp = Number(item?.lastSuccessAt || 0);
    return timestamp > 0 && localDayKey(timestamp) === localDayKey(now);
  }

  function reviewLineKey(item) {
    if (!item) return '';
    if (item.type === 'general') return `general|${item.generalId || item.conceptKey || item.key || ''}`;
    if (item.type === 'recall-section') return ['recall-section', item.subjectKey || '', item.area || '', item.sourceGroup || item.groupKey || '', item.sectionTitle || ''].join('|');
    return [item.subjectKey || '', item.area || '', item.sourceGroup || item.groupKey || '', item.lineId || ''].join('|');
  }


  function reviewLineKeyFromConceptKey(conceptKey) {
    const parts = String(conceptKey || '').split('|');
    if (parts[0] === 'general') return `general|${parts.slice(1).join('|')}`;
    if (parts[0] === 'recall-section' && parts.length >= 5) return parts.join('|');
    if (parts[0] === 'subject' && parts.length >= 5) return [parts[1], parts[2], parts[3], parts[4]].join('|');
    return String(conceptKey || '');
  }
  function dedupeReviewByLine(records, scoreFn) {
    const best = new Map();
    (records || []).forEach(record => {
      if (!record?.item) return;
      const key = reviewLineKey(record.item);
      const score = Number(scoreFn ? scoreFn(record) : 0);
      const previous = best.get(key);
      if (!previous || score > previous.score) best.set(key, {...record, score});
    });
    return [...best.values()];
  }

  return {
    DAY_MS,
    REVIEW_INTERVALS: [...REVIEW_INTERVALS],
    localDayKey,
    reviewIntervalDays,
    normalizeMasteryItem,
    applyMasteryEvent,
    masteryEventScope,
    wasScheduleAdvancedTodayOutsideReview,
    isDailyReviewCandidate,
    wasExactSuccessToday,
    reviewLineKey,
    reviewLineKeyFromConceptKey,
    dedupeReviewByLine
  };
});

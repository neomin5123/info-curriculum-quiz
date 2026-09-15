(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopLearningEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

  function localDayKey(timestamp = Date.now()) {
    const d = new Date(Number(timestamp) || Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

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
      wrongCount: Number(item.wrongCount || 0),
      correctStreak: Number(item.correctStreak || 0),
      mastered: Boolean(item.mastered),
      nextReviewAt: Number(item.nextReviewAt || 0),
      lastSeenAt: Number(item.lastSeenAt || 0),
      lastSuccessAt: Number(item.lastSuccessAt || 0)
    };
  }

  // status: correct | near | wrong
  // exact retrieval only advances the long-term schedule. 'near' is neither a failure nor mastery evidence.
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

    item.wrongCount += 1;
    item.correctStreak = 0;
    item.mastered = false;
    item.nextReviewAt = now;
    item.lastResult = 'wrong';
    return {item, changed:true, due:true};
  }

  function wasExactSuccessToday(item, now = Date.now()) {
    const timestamp = Number(item?.lastSuccessAt || 0);
    return timestamp > 0 && localDayKey(timestamp) === localDayKey(now);
  }

  function reviewLineKey(item) {
    if (!item) return '';
    if (item.type === 'general') return `general|${item.generalId || item.conceptKey || item.key || ''}`;
    return [item.subjectKey || '', item.area || '', item.sourceGroup || item.groupKey || '', item.lineId || ''].join('|');
  }


  function reviewLineKeyFromConceptKey(conceptKey) {
    const parts = String(conceptKey || '').split('|');
    if (parts[0] === 'general') return `general|${parts.slice(1).join('|')}`;
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
    wasExactSuccessToday,
    reviewLineKey,
    reviewLineKeyFromConceptKey,
    dedupeReviewByLine
  };
});

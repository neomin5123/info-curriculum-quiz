(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopHistoryEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function wrongCount(item) {
    const attempts = Number(item?.attempts || 0);
    const events = Array.isArray(item?.wrongEvents) ? item.wrongEvents.length : 0;
    const archived = Number(item?.archivedWrongEvents || 0);
    return Math.max(attempts, events + archived);
  }

  function wrongDayCount(item) {
    const timestamps = [];
    if (Array.isArray(item?.wrongEvents)) item.wrongEvents.forEach(event => { if (event?.at) timestamps.push(event.at); });
    if (item?.firstWrongAt) timestamps.push(item.firstWrongAt);
    if (item?.lastWrongAt) timestamps.push(item.lastWrongAt);
    const days = new Set();
    timestamps.forEach(value => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return;
      days.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    });
    return days.size;
  }

  function timeValue(value) {
    const n = new Date(value || 0).getTime();
    return Number.isFinite(n) ? n : 0;
  }

  function lastStudyTime(item, masteryItem) {
    return timeValue(masteryItem?.lastSeenAt || item?.lastWrongAt || item?.resolvedAt || item?.firstWrongAt);
  }

  function sortRecords(list, filter, sortMode = 'weak', mastery = {}) {
    return [...(list || [])].sort((a,b) => {
      const masteryA = mastery?.[a?.conceptKey || a?.key] || {};
      const masteryB = mastery?.[b?.conceptKey || b?.key] || {};
      const labelDiff = () => String(a?.context || a?.question || '').localeCompare(String(b?.context || b?.question || ''), 'ko');

      if (sortMode === 'recent' || sortMode === 'oldest') {
        const ta = lastStudyTime(a, masteryA);
        const tb = lastStudyTime(b, masteryB);
        const timeDiff = sortMode === 'recent' ? tb - ta : ta - tb;
        if (timeDiff) return timeDiff;
        const wrongDiff = wrongCount(b) - wrongCount(a);
        return wrongDiff || labelDiff();
      }

      if (sortMode === 'wrong') {
        if (Boolean(a?.resolved) !== Boolean(b?.resolved)) return a?.resolved ? 1 : -1;
        const wrongDiff = wrongCount(b) - wrongCount(a);
        if (wrongDiff) return wrongDiff;
        const recentDiff = lastStudyTime(b, masteryB) - lastStudyTime(a, masteryA);
        return recentDiff || labelDiff();
      }

      // 기본값: 기존 취약 우선 정렬을 그대로 유지한다.
      if (filter === 'resolved') {
        const resolvedDiff = timeValue(b?.resolvedAt || b?.lastWrongAt) - timeValue(a?.resolvedAt || a?.lastWrongAt);
        if (resolvedDiff) return resolvedDiff;
        return wrongCount(b) - wrongCount(a);
      }
      if (Boolean(a?.resolved) !== Boolean(b?.resolved)) return a?.resolved ? 1 : -1;
      const wrongDiff = wrongCount(b) - wrongCount(a);
      if (wrongDiff) return wrongDiff;
      const dayDiff = wrongDayCount(b) - wrongDayCount(a);
      if (dayDiff) return dayDiff;
      const recentDiff = lastStudyTime(b, masteryB) - lastStudyTime(a, masteryA);
      if (recentDiff) return recentDiff;
      return labelDiff();
    });
  }

  function isWeak(item, masteryItem) {
    if (!item || item.resolved) return false;
    return Number(item.attempts || 0) >= 2 || Number(masteryItem?.wrongCount || 0) >= 2;
  }

  return { wrongCount, wrongDayCount, timeValue, lastStudyTime, sortRecords, isWeak };
});

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

  function sortRecords(list, filter) {
    return [...(list || [])].sort((a,b) => {
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
      const recentDiff = timeValue(b?.lastWrongAt) - timeValue(a?.lastWrongAt);
      if (recentDiff) return recentDiff;
      return String(a?.context || a?.question || '').localeCompare(String(b?.context || b?.question || ''), 'ko');
    });
  }

  function isWeak(item, masteryItem) {
    if (!item || item.resolved) return false;
    return Number(item.attempts || 0) >= 2 || Number(masteryItem?.wrongCount || 0) >= 2;
  }

  return { wrongCount, wrongDayCount, timeValue, sortRecords, isWeak };
});

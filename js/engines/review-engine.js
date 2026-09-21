(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopReviewEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function localDayKey(timestamp = Date.now()) {
    const d = new Date(Number(timestamp) || Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function nextDueBucket(entries = [], now = Date.now()) {
    const usable = (entries || [])
      .map(entry => ({
        ...entry,
        nextReviewAt:Number(entry?.nextReviewAt || 0),
        lineKey:String(entry?.lineKey || entry?.conceptKey || '')
      }))
      .filter(entry => entry.nextReviewAt > now && entry.lineKey);
    if (!usable.length) return null;
    usable.sort((a,b) => a.nextReviewAt - b.nextReviewAt);
    const dayKey = localDayKey(usable[0].nextReviewAt);
    const sameDay = usable.filter(entry => localDayKey(entry.nextReviewAt) === dayKey);
    const seen = new Set();
    const deduped = sameDay.filter(entry => {
      if (seen.has(entry.lineKey)) return false;
      seen.add(entry.lineKey);
      return true;
    });
    return {
      dayKey,
      timestamp:Math.min(...deduped.map(entry => entry.nextReviewAt)),
      count:deduped.length
    };
  }

  function relativeDayLabel(dayKey, now = Date.now()) {
    const today = localDayKey(now);
    const tomorrow = localDayKey(new Date(new Date(now).getFullYear(), new Date(now).getMonth(), new Date(now).getDate() + 1).getTime());
    if (dayKey === today) return '오늘';
    if (dayKey === tomorrow) return '내일';
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dayKey || ''));
    return match ? `${Number(match[2])}/${Number(match[3])}` : String(dayKey || '');
  }

  function summarizePracticalStates(states = []) {
    const summary = {correct:0, near:0, wrong:0, unknown:0};
    (states || []).forEach(state => {
      const status = state?.practicalInitialStatus || state?.status;
      if (Object.prototype.hasOwnProperty.call(summary, status)) summary[status] += 1;
    });
    return summary;
  }

  return { localDayKey, nextDueBucket, relativeDayLabel, summarizePracticalStates };
});

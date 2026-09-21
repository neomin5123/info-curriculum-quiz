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

  function selectLineReviewRecords(records = [], now = Date.now()) {
    const grouped = new Map();
    (records || []).forEach(record => {
      if (!record?.lineKey) return;
      if (!grouped.has(record.lineKey)) grouped.set(record.lineKey, []);
      grouped.get(record.lineKey).push(record);
    });
    const selected = [];
    grouped.forEach(group => {
      const failureDue = group.filter(record => {
        const dueAt = Number(record.nextReviewAt || 0);
        return dueAt > 0 && dueAt <= now && ["wrong","unknown","near"].includes(record.lastResult);
      });
      let candidates = failureDue;
      if (!candidates.length) {
        const scheduled = group.filter(record => Number(record.nextReviewAt || 0) > 0);
        if (!scheduled.length) return;
        const lineDueAt = Math.max(...scheduled.map(record => Number(record.nextReviewAt || 0)));
        // 같은 문장의 어떤 빈칸이 오늘 정확 인출되어 미래 일정으로 전진했다면
        // 그 문장은 오늘 다시 장기 복습하지 않는다. 다음 실제 due 날짜에 다시 꺼낸다.
        if (lineDueAt > now) return;
        candidates = scheduled;
      }
      const severity = state => state === "wrong" ? 3 : state === "unknown" ? 2 : state === "near" ? 1 : 0;
      candidates.sort((a,b) => severity(b.lastResult) - severity(a.lastResult) || Number(b.wrongCount || 0) - Number(a.wrongCount || 0) || Number(a.nextReviewAt || 0) - Number(b.nextReviewAt || 0));
      if (candidates[0]) selected.push(candidates[0]);
    });
    return selected;
  }


  function selectCumulativeReviewRecords(records = [], {now = Date.now(), limit = 6, excludeLineKeys = []} = {}) {
    const today = localDayKey(now);
    const excluded = new Set(excludeLineKeys || []);
    const bestByLine = new Map();
    (records || []).forEach(record => {
      const lineKey = String(record?.lineKey || record?.conceptKey || '');
      const lastSeenAt = Number(record?.lastSeenAt || record?.state?.lastSeenAt || 0);
      if (!lineKey || excluded.has(lineKey) || !lastSeenAt || localDayKey(lastSeenAt) === today || record?.successfulToday) return;
      const state = record?.state || record || {};
      const ageDays = Math.max(1, Math.floor((now - lastSeenAt) / (24 * 60 * 60 * 1000)));
      const failures = Number(state.wrongCount || 0) * 5 + Number(state.unknownCount || 0) * 3 + Number(state.nearCount || 0) * 1.5;
      const fragile = state.mastered ? 0 : 3;
      const score = Math.min(30, ageDays) + failures + fragile;
      const previous = bestByLine.get(lineKey);
      if (!previous || score > previous.score) bestByLine.set(lineKey, {...record, lineKey, score});
    });
    const candidates = [...bestByLine.values()].sort((a,b) => b.score - a.score);
    const picked = [];
    const scopeCounts = new Map();
    while (candidates.length && picked.length < Math.max(0, Number(limit || 0))) {
      let bestIndex = 0, bestScore = -Infinity;
      candidates.forEach((record,index) => {
        const item = record.item || {};
        const scope = `${item.subjectKey || record.subjectKey || ''}|${item.area || record.area || ''}`;
        const diversityPenalty = Number(scopeCounts.get(scope) || 0) * 4;
        const adjusted = Number(record.score || 0) - diversityPenalty;
        if (adjusted > bestScore) { bestScore = adjusted; bestIndex = index; }
      });
      const [chosen] = candidates.splice(bestIndex,1);
      if (!chosen) break;
      picked.push(chosen);
      const item = chosen.item || {};
      const scope = `${item.subjectKey || chosen.subjectKey || ''}|${item.area || chosen.area || ''}`;
      scopeCounts.set(scope, Number(scopeCounts.get(scope) || 0) + 1);
    }
    return picked;
  }


  function reviewSkipAction(item = {}) {
    const input = item && typeof item === 'object' ? item : {};
    if (!input._skippedOnce) return {action:'requeue', nextItem:{...input, _skippedOnce:true}};
    if (input._dailyReview) return {action:'defer-next-day', nextItem:null};
    return {action:'finish', nextItem:null};
  }

  function summarizePracticalStates(states = []) {
    const summary = {correct:0, near:0, wrong:0, unknown:0};
    (states || []).forEach(state => {
      const status = state?.practicalInitialStatus || state?.status;
      if (Object.prototype.hasOwnProperty.call(summary, status)) summary[status] += 1;
    });
    return summary;
  }

  return { localDayKey, nextDueBucket, relativeDayLabel, selectLineReviewRecords, selectCumulativeReviewRecords, reviewSkipAction, summarizePracticalStates };
});

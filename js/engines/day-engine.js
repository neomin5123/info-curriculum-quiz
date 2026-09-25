(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopDayEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const STUDY_DAY_START_HOUR = 4;
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_MS = 24 * HOUR_MS;

  // CurriLoop의 학습일은 현지 시각 오전 4시에 바뀐다.
  // 00:00~03:59는 전날 학습일로 취급한다.
  function studyDayKey(timestamp = Date.now(), startHour = STUDY_DAY_START_HOUR) {
    const raw = Number(timestamp);
    const base = Number.isFinite(raw) ? raw : Date.now();
    const hour = Math.max(0, Math.min(23, Number(startHour || 0)));
    const d = new Date(base - hour * HOUR_MS);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function parseDayKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    if (!match) return null;
    // 정오를 사용하면 학습일 경계(04:00)와 DST 경계의 영향을 받지 않고 날짜 산술을 할 수 있다.
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  }

  function formatCalendarDay(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function shiftDayKey(dayKey, deltaDays) {
    const d = parseDayKey(dayKey);
    if (!d) return '';
    d.setDate(d.getDate() + Number(deltaDays || 0));
    return formatCalendarDay(d);
  }

  function signedDayDistance(fromKey, toKey) {
    const a = parseDayKey(fromKey), b = parseDayKey(toKey);
    if (!a || !b) return 0;
    return Math.round((b.getTime() - a.getTime()) / DAY_MS);
  }

  function dayDistance(fromKey, toKey) {
    return Math.max(0, signedDayDistance(fromKey, toKey));
  }

  function nextStudyDayStart(timestamp = Date.now(), startHour = STUDY_DAY_START_HOUR) {
    const key = studyDayKey(timestamp, startHour);
    const next = parseDayKey(shiftDayKey(key, 1));
    if (!next) return 0;
    next.setHours(Math.max(0, Math.min(23, Number(startHour || 0))), 0, 0, 0);
    return next.getTime();
  }

  return {
    STUDY_DAY_START_HOUR,
    HOUR_MS,
    DAY_MS,
    studyDayKey,
    localDayKey:studyDayKey,
    parseDayKey,
    shiftDayKey,
    signedDayDistance,
    dayDistance,
    nextStudyDayStart
  };
});

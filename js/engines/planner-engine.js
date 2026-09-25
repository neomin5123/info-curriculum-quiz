(function(root, factory) {
  const dayEngine = (typeof module === 'object' && module.exports) ? require('./day-engine.js') : root?.CurriLoopDayEngine;
  const api = factory(dayEngine);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopPlannerEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(DayEngine) {
  'use strict';

  const MIN_TARGET_LINES = 8;
  const DEFAULT_TARGET_LINES = 18;
  const MAX_TARGET_LINES = 22;
  const HIGH_ACCURACY = 0.85;
  const STABLE_ACCURACY = 0.70;
  const KIND_WEIGHTS = Object.freeze({core:0.35, recall:0.55, structure:0.10});
  const DEFAULT_EXAM_DAY_KEY = '2026-11-28';
  const FIRST_PASS_BUFFER_DAYS = 21;

  // v7.6.4: 하루 분량은 단순 문장 수가 아니라 실제 학습 부담 점수로 계산한다.
  // 기존 targetLines 저장값(8~22)은 그대로 승계하되 의미만 '학습량 점수'로 전환한다.
  function lineWorkload(line, sourceGroup = '', sectionTitle = '', subjectKey = '') {
    const text = String(line?.text || '').replace(/\s+/g, ' ').trim();
    const length = text.length;
    let score = length <= 30 ? 0.8 : length <= 60 ? 1.0 : length <= 100 ? 1.25 : length <= 160 ? 1.6 : length <= 240 ? 2.0 : 2.4;

    if (sectionTitle === '성취기준') score += 0.35;
    else if (sectionTitle === '성취기준 해설') score += 0.45;
    else if (/성취기준 적용 시 고려 사항/.test(sectionTitle)) score += 0.35;
    else if (sourceGroup === 'teaching-evaluation') score += 0.25;
    else if (sourceGroup === 'character-goal') score += 0.20;

    const coreGaps = Array.isArray(line?.easy) ? line.easy.length : 0;
    score += Math.min(0.60, Math.max(0, coreGaps - 3) * 0.10);

    let weighted = score * 0.7;
    // v7.8: 6과목 모두 지식·이해 / 과정·기능 / 성취기준을 통회상으로 운영한다.
    // 짧은 내용 요소도 목록 전체를 자유회상해야 하므로 지나치게 가볍게 계산하지 않는다.
    if (sectionTitle === '지식·이해' || sectionTitle === '과정·기능') weighted = Math.max(weighted, 0.9);
    if (sectionTitle === '성취기준') weighted = Math.max(weighted, 1.2);
    return Math.max(0.4, Math.round(weighted * 10) / 10);
  }

  const localDayKey = DayEngine?.studyDayKey || DayEngine?.localDayKey;
  const parseDayKey = DayEngine?.parseDayKey;
  const dayDistance = DayEngine?.dayDistance;
  const signedDayDistance = DayEngine?.signedDayDistance;
  const shiftDayKey = DayEngine?.shiftDayKey;
  if (![localDayKey, parseDayKey, dayDistance, signedDayDistance, shiftDayKey].every(fn => typeof fn === 'function')) {
    throw new Error('CurriLoopDayEngine is required');
  }


  function selectNextSectionBatch(sections, completedIds, targetWorkload) {
    const completed = completedIds instanceof Set ? completedIds : new Set(completedIds || []);
    const firstIndex = (sections || []).findIndex(section => !completed.has(section.id));
    if (firstIndex < 0) return [];
    const first = sections[firstIndex];
    const candidates = [];
    for (let i = firstIndex; i < sections.length; i++) {
      const item = sections[i];
      if (completed.has(item.id)) continue;
      if (item.subjectKey !== first.subjectKey || item.area !== first.area) break;
      candidates.push(item);
    }
    if (!candidates.length) return [];
    const sessionTarget = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(targetWorkload || DEFAULT_TARGET_LINES)));
    const totalCandidateLoad = candidates.reduce((sum,item) => sum + Number(item.workloadScore || item.lineCount || 0), 0);
    const selected = [];
    let workload = 0;
    // 영역 경계를 넘지 않는다. 목표보다 5점 이내로만 무거운 영역은 작은 꼬리 세션을 만들지 않고 한 번에 끝낸다.
    if (totalCandidateLoad <= sessionTarget + 5) return candidates.slice();
    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i];
      const itemLoad = Number(item.workloadScore || item.lineCount || 0);
      const projected = workload + itemLoad;
      const remainingAfter = totalCandidateLoad - projected;
      if (selected.length && projected > sessionTarget + 5) break;
      if (selected.length && workload >= sessionTarget * 0.7 && remainingAfter > 0 && remainingAfter < 6) break;
      selected.push(item);
      workload = projected;
      if (workload >= sessionTarget) break;
    }
    return selected.length ? selected : [first];
  }

  function remainingSessionEstimate(sections, state, targetWorkload) {
    const normalized = normalizeState(state);
    const completed = new Set(normalized.completedSectionIds || []);
    let sessions = 0;
    const bySubject = {};
    if (normalized.activeSession?.sectionIds?.length) {
      sessions += 1;
      normalized.activeSession.sectionIds.forEach(id => completed.add(String(id)));
      const key = String(normalized.activeSession.subjectKey || '');
      if (key) bySubject[key] = (bySubject[key] || 0) + 1;
    }
    for (let guard = 0; guard < 1000 && completed.size < (sections || []).length; guard++) {
      const batch = selectNextSectionBatch(sections, completed, targetWorkload);
      if (!batch.length) break;
      sessions += 1;
      const key = String(batch[0]?.subjectKey || '');
      if (key) bySubject[key] = (bySubject[key] || 0) + 1;
      batch.forEach(item => completed.add(item.id));
    }
    return {sessions, completedCount:completed.size, bySubject};
  }

  function projectedNewStudyDays(state, deadlineDayKey, now = Date.now()) {
    const normalized = normalizeState(state, now);
    const today = localDayKey(now);
    const days = signedDayDistance(today, deadlineDayKey);
    if (days < 0) return 0;
    let cycle = Math.max(0, Math.min(6, Number(normalized.cycleStudyDayKeys?.length || 0)));
    let available = 0;
    for (let offset = 0; offset <= days; offset++) {
      const dayKey = shiftDayKey(today, offset);
      // 이미 오늘 새 세션을 시작했고 진행 중 세션도 없다면 오늘 추가 새 진도 슬롯은 없다.
      if (offset === 0 && !normalized.activeSession?.sectionIds?.length && normalized.lastNewSessionStartDayKey === today) continue;
      if (offset === 0 && normalized.consolidationDayKey === today) continue;
      if (cycle >= 6) { cycle = 0; continue; }
      available += 1;
      cycle += 1;
    }
    return available;
  }

  function completionDayFromSessionCount(state, sessionsNeeded, now = Date.now()) {
    const normalized = normalizeState(state, now);
    let remaining = Math.max(0, Number(sessionsNeeded || 0));
    if (!remaining) return localDayKey(now);
    let cycle = Math.max(0, Math.min(6, Number(normalized.cycleStudyDayKeys?.length || 0)));
    let cursor = localDayKey(now);
    for (let guard = 0; guard < 365 && remaining > 0; guard++) {
      const offset = guard;
      if (offset === 0 && !normalized.activeSession?.sectionIds?.length && normalized.lastNewSessionStartDayKey === cursor) {
        cursor = shiftDayKey(cursor, 1);
        continue;
      }
      if (offset === 0 && normalized.consolidationDayKey === cursor) {
        cursor = shiftDayKey(cursor, 1);
        continue;
      }
      if (cycle >= 6) {
        cycle = 0;
      } else {
        remaining -= 1;
        cycle += 1;
        if (remaining <= 0) return cursor;
      }
      cursor = shiftDayKey(cursor, 1);
    }
    return cursor;
  }

  // legacy signature compatibility: workload-only callers still get a conservative estimate.
  function estimateCompletionDayKey(state, remainingWorkload, targetWorkload, now = Date.now()) {
    const normalized = normalizeState(state, now);
    const sessionsNeeded = Math.max(0, Math.ceil(Number(remainingWorkload || 0) / Math.max(1, Number(targetWorkload || normalized.targetLines || DEFAULT_TARGET_LINES))));
    return completionDayFromSessionCount(normalized, sessionsNeeded, now);
  }

  function estimateCompletionForSections(sections, state, targetWorkload, now = Date.now()) {
    const estimate = remainingSessionEstimate(sections, state, targetWorkload);
    return {...estimate, dayKey:completionDayFromSessionCount(state, estimate.sessions, now)};
  }

  function deadlineGuidance(sections, state, {examDayKey = DEFAULT_EXAM_DAY_KEY, bufferDays = FIRST_PASS_BUFFER_DAYS, now = Date.now()} = {}) {
    const normalized = normalizeState(state, now);
    const progress = progressSummary(sections, normalized);
    const deadlineDayKey = shiftDayKey(examDayKey, -Math.abs(Number(bufferDays || 0)));
    const today = localDayKey(now);
    const daysToExam = signedDayDistance(today, examDayKey);
    const daysToDeadline = signedDayDistance(today, deadlineDayKey);
    const remainingWorkload = Math.max(0, Math.round((Number(progress.totalWorkload || 0) - Number(progress.completedWorkload || 0)) * 10) / 10);
    if (remainingWorkload <= 0) {
      return {status:'complete', examDayKey, deadlineDayKey, daysToExam, daysToDeadline, remainingWorkload:0, availableStudyDays:0, requiredDailyWorkload:0, targetFloor:0, estimatedCompletionDayKey:today, remainingSessions:0, minimumSessions:0};
    }

    const availableStudyDays = projectedNewStudyDays(normalized, deadlineDayKey, now);
    const currentEstimate = estimateCompletionForSections(sections, normalized, normalized.targetLines, now);
    const maxEstimate = estimateCompletionForSections(sections, normalized, MAX_TARGET_LINES, now);
    let targetFloor = normalized.targetLines;
    let feasibleTarget = null;
    for (let target = Math.max(MIN_TARGET_LINES, normalized.targetLines); target <= MAX_TARGET_LINES; target += 1) {
      const estimate = estimateCompletionForSections(sections, normalized, target, now);
      if (signedDayDistance(estimate.dayKey, deadlineDayKey) >= 0) { feasibleTarget = target; break; }
    }
    if (feasibleTarget != null) targetFloor = feasibleTarget;
    else targetFloor = MAX_TARGET_LINES;

    const guidedEstimate = estimateCompletionForSections(sections, normalized, targetFloor, now);
    const requiredDailyWorkload = availableStudyDays > 0 ? remainingWorkload / availableStudyDays : Infinity;
    let status = 'on-track';
    if (daysToDeadline < 0 || !availableStudyDays || signedDayDistance(maxEstimate.dayKey, deadlineDayKey) < 0) status = 'critical';
    else if (targetFloor > normalized.targetLines) status = 'boost';

    return {
      status, examDayKey, deadlineDayKey, daysToExam, daysToDeadline, remainingWorkload, availableStudyDays,
      requiredDailyWorkload:Number.isFinite(requiredDailyWorkload) ? Math.round(requiredDailyWorkload * 10) / 10 : Infinity,
      targetFloor,
      // 홈의 예상 완료일은 '현재 기본 목표'가 아니라 실제 플래너가 적용할 D-day 보정 목표를 반영한다.
      estimatedCompletionDayKey:guidedEstimate.dayKey,
      remainingSessions:guidedEstimate.sessions,
      baseCompletionDayKey:currentEstimate.dayKey,
      baseRemainingSessions:currentEstimate.sessions,
      minimumSessions:maxEstimate.sessions,
      minimumCompletionDayKey:maxEstimate.dayKey
    };
  }

  function sectionId(subjectKey, area, sourceGroup, sectionTitle, index) {
    return ['plan-section', subjectKey, area, sourceGroup, sectionTitle || '', index].join('|');
  }

  function buildStudySections(curriculumData, subjectOrder, commonArea) {
    const out = [];
    (subjectOrder || Object.keys(curriculumData || {})).forEach(subjectKey => {
      const subject = curriculumData?.[subjectKey];
      if (!subject) return;
      const areaEntries = Object.entries(subject);
      const ordered = areaEntries;
      ordered.forEach(([area, unit]) => {
        const sourceDefs = area === commonArea
          ? [['character-goal', unit?.['character-goal'] || []], ['teaching-evaluation', unit?.['teaching-evaluation'] || []]]
          : [['content-system', unit?.['content-system'] || []], ['achievement', unit?.achievement || []]];
        sourceDefs.forEach(([sourceGroup, sections]) => {
          (sections || []).forEach((section, index) => {
            const lines = section?.lines || [];
            if (!lines.length) return;
            const workloadScore = Math.round(lines.reduce((sum, line) => sum + lineWorkload(line, sourceGroup, String(section?.title || ''), subjectKey), 0) * 10) / 10;
            out.push({
              id:sectionId(subjectKey, area, sourceGroup, section?.title || '', index),
              subjectKey,
              area,
              sourceGroup,
              sectionTitle:String(section?.title || ''),
              sectionIndex:index,
              lineCount:lines.length,
              workloadScore,
              lineIds:lines.map(line => line?.id).filter(Boolean)
            });
          });
        });
      });
    });
    return out;
  }

  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function normalizePerformance(source) {
    const input = source && typeof source === 'object' ? source : {};
    const records = {};
    if (input.records && typeof input.records === 'object') {
      Object.entries(input.records).slice(0, 1200).forEach(([key, record]) => {
        if (!key || !record || typeof record !== 'object') return;
        const kind = ['core','recall','structure'].includes(record.kind) ? record.kind : 'core';
        records[String(key)] = {
          kind,
          score:clamp01(record.score),
          status:String(record.status || ''),
          at:Number(record.at || 0)
        };
      });
    }
    return {records};
  }


  function cloneJsonLike(value, fallback = null) {
    try { return JSON.parse(JSON.stringify(value)); } catch { return fallback; }
  }

  function normalizeStudyProgress(progress) {
    const input = progress && typeof progress === 'object' ? progress : {};
    const draftFields = {};
    if (input.draftFields && typeof input.draftFields === 'object' && !Array.isArray(input.draftFields)) {
      Object.entries(input.draftFields).slice(0, 1200).forEach(([key, value]) => {
        if (!key || !value || typeof value !== 'object' || Array.isArray(value)) return;
        const safe = {};
        Object.entries(value).forEach(([k,v]) => {
          if (['string','number','boolean'].includes(typeof v) || v == null) safe[k] = v;
        });
        draftFields[String(key)] = safe;
      });
    }
    const gradedRecall = {};
    if (input.gradedRecall && typeof input.gradedRecall === 'object' && !Array.isArray(input.gradedRecall)) {
      Object.entries(input.gradedRecall).slice(0, 100).forEach(([key, value]) => {
        if (key && ['correct','near','wrong','unknown'].includes(String(value))) gradedRecall[String(key)] = String(value);
      });
    }
    const lastFocus = input.lastFocus && typeof input.lastFocus === 'object'
      ? {sectionIndex:Math.max(0, Number(input.lastFocus.sectionIndex || 0)), lineIndex:Math.max(0, Number(input.lastFocus.lineIndex || 0))}
      : null;
    return {
      stepIndex:Math.max(0, Number(input.stepIndex || 0)),
      stepKey:String(input.stepKey || ''),
      stepLabel:String(input.stepLabel || ''),
      updatedAt:Number(input.updatedAt || 0),
      draftFields,
      gradedRecall,
      structureSession:cloneJsonLike(input.structureSession, null),
      lastFocus
    };
  }

  function normalizeActiveSession(session) {
    if (!session || typeof session !== 'object') return null;
    return {
      ...session,
      sectionIds:Array.isArray(session.sectionIds) ? session.sectionIds.map(String) : [],
      performance:normalizePerformance(session.performance),
      studyProgress:normalizeStudyProgress(session.studyProgress)
    };
  }

  function normalizeDayKeys(values, limit = 180) {
    if (!Array.isArray(values)) return [];
    const seen = new Set();
    const out = [];
    values.forEach(value => {
      const key = String(value || '');
      if (!parseDayKey(key) || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    out.sort();
    return out.slice(-Math.max(1, Number(limit || 180)));
  }

  function normalizeState(source, now = Date.now()) {
    const state = source && typeof source === 'object' ? {...source} : {};
    return {
      version:5,
      firstDayKey:String(state.firstDayKey || localDayKey(now)), // legacy: v7.6.4 이하 백업 호환
      targetLines:Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(state.targetLines || DEFAULT_TARGET_LINES))),
      completedSectionIds:Array.isArray(state.completedSectionIds) ? [...new Set(state.completedSectionIds.map(String))] : [],
      activeSession:normalizeActiveSession(state.activeSession),
      completedSessions:Array.isArray(state.completedSessions) ? state.completedSessions.slice(-120) : [],
      fastStreak:Math.max(0, Number(state.fastStreak || 0)),
      recoveryDayKey:String(state.recoveryDayKey || ''),
      studyDayKeys:normalizeDayKeys(state.studyDayKeys, 180),
      cycleStudyDayKeys:normalizeDayKeys(state.cycleStudyDayKeys, 6),
      consolidationDayKey:String(state.consolidationDayKey || ''),
      lastNewSessionStartDayKey:String(state.lastNewSessionStartDayKey || ''),
      updatedAt:Number(state.updatedAt || 0)
    };
  }

  function plannerDayIndex(state, now = Date.now()) {
    // v7.6.5부터 정리 주기는 달력 경과일이 아니라 실제 학습일로 운영한다.
    // 이 값은 호환용으로 '현재 주기의 일반 학습일 수'를 반환한다.
    return normalizeState(state, now).cycleStudyDayKeys.length;
  }

  function isConsolidationDay(state, now = Date.now()) {
    const normalized = normalizeState(state, now);
    const today = localDayKey(now);
    // 정리 학습을 시작한 날에는 하루가 끝날 때까지 새 진도를 열지 않는다.
    if (normalized.consolidationDayKey === today) return true;
    // 여섯 번째 일반 학습일 당일에는 정리일이 아니다. 그 다음 '실제 학습일'이 정리일이다.
    return normalized.cycleStudyDayKeys.length >= 6 && !normalized.cycleStudyDayKeys.includes(today);
  }

  function recordStudyActivity(state, now = Date.now()) {
    const normalized = normalizeState(state, now);
    const today = localDayKey(now);
    if (normalized.studyDayKeys.includes(today)) return normalized;

    const consolidationPending = isConsolidationDay(normalized, now);
    normalized.studyDayKeys = normalizeDayKeys([...normalized.studyDayKeys, today], 180);
    if (consolidationPending) {
      // 정리일은 전체 학습일 이력에는 남기되 다음 6일 주기에는 포함하지 않는다.
      normalized.consolidationDayKey = today;
      normalized.cycleStudyDayKeys = [];
    } else if (!normalized.cycleStudyDayKeys.includes(today)) {
      normalized.cycleStudyDayKeys = normalizeDayKeys([...normalized.cycleStudyDayKeys, today], 6);
    }
    normalized.updatedAt = now;
    return normalized;
  }

  function dailyReviewBudget(targetLines) {
    // 암기 속도가 느려져도 복습 용량까지 함께 급감시키지 않는다.
    // 새 진도를 먼저 줄이고, 장기 기억을 위한 재인출 용량은 최소 20개를 유지한다.
    const target = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(targetLines || DEFAULT_TARGET_LINES)));
    return Math.max(20, Math.min(30, Math.round(20 + (target - MIN_TARGET_LINES) * 0.5)));
  }

  function reviewUnlockAllowance(targetLines) {
    return Math.max(1, Math.floor(dailyReviewBudget(targetLines) * 0.25));
  }

  function reviewLoadDecision(targetLines, dueCount = 0) {
    const target = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(targetLines || DEFAULT_TARGET_LINES)));
    const budget = dailyReviewBudget(target);
    const backlog = Math.max(0, Number(dueCount || 0));
    if (backlog > budget * 2) {
      return {mode:'pause', budget, backlog, effectiveTargetLines:0, reason:`복습 적체가 오늘 예산의 2배를 넘어 새 진도를 멈춥니다.`};
    }
    if (backlog > budget * 1.5) {
      const reduced = Math.max(MIN_TARGET_LINES, Math.round(target * 0.5));
      if (reduced >= target && target <= MIN_TARGET_LINES) {
        return {mode:'pause', budget, backlog, effectiveTargetLines:0, reason:'새 원문량이 이미 최소치인데 복습 적체가 커서 오늘은 새 진도를 멈춥니다.'};
      }
      return {mode:'heavy-reduce', budget, backlog, effectiveTargetLines:reduced, reason:'복습 적체가 커서 오늘 새 원문량을 절반 수준으로 줄입니다.'};
    }
    if (backlog > budget) {
      const reduced = Math.max(MIN_TARGET_LINES, Math.round(target * 0.75));
      const reason = reduced < target ? '복습이 평소보다 많아 오늘 새 원문량을 줄입니다.' : '새 원문량은 이미 최소치이므로 더 늘리지 않고 복습을 우선합니다.';
      return {mode:'light-reduce', budget, backlog, effectiveTargetLines:reduced, reason};
    }
    return {mode:'normal', budget, backlog, effectiveTargetLines:target, reason:'복습 부담이 안정적입니다.'};
  }

  function reviewPauseThreshold(targetLines) {
    return dailyReviewBudget(targetLines) * 2;
  }

  function paceDecision({state, dueCount = 0, now = Date.now(), targetFloor = 0} = {}) {
    const normalized = normalizeState(state, now);
    const load = reviewLoadDecision(normalized.targetLines, dueCount);
    // 실제 학습일 6일을 채운 뒤의 다음 학습일은, 미완료 세션이 있어도 누적 정리를 먼저 한다.
    if (isConsolidationDay(normalized, now)) return {allowNew:false, mode:'consolidation', effectiveTargetLines:0, reviewBudget:load.budget, reason:'실제 학습일 6일을 채워 오늘은 누적 혼합 점검일입니다.'};
    if (normalized.activeSession?.sectionIds?.length) return {allowNew:true, mode:'continue', effectiveTargetLines:normalized.targetLines, reviewBudget:load.budget, reason:'진행 중인 범위를 먼저 마칩니다.'};
    const today = localDayKey(now);
    if (normalized.recoveryDayKey === today) return {allowNew:false, mode:'review-recovery', effectiveTargetLines:0, reviewBudget:load.budget, reason:'오늘은 복습 적체를 해소하는 회복일입니다.'};
    if (load.mode === 'pause') return {allowNew:false, mode:'review-recovery', effectiveTargetLines:0, reviewBudget:load.budget, reason:`복습 ${load.backlog}개가 쌓여 새 진도를 잠시 멈춥니다.`};
    // 하루에 새로 시작하는 자동 진도 세션은 최대 1개다.
    // 전날 시작한 미완료 세션을 오늘 마치는 것은 오늘의 새 세션 시작으로 세지 않는다.
    // 다만 심한 복습 적체는 이 제한보다 먼저 review-recovery로 표시한다.
    if (normalized.lastNewSessionStartDayKey === today) return {allowNew:false, mode:'daily-new-complete', effectiveTargetLines:0, reviewBudget:load.budget, reason:'오늘 시작한 새 범위를 이미 학습했습니다. 남은 복습만 마치고 오늘 학습을 종료합니다.'};
    if (load.mode === 'heavy-reduce' || load.mode === 'light-reduce') return {allowNew:true, mode:'new-reduced', effectiveTargetLines:load.effectiveTargetLines, reviewBudget:load.budget, reason:load.reason};
    const deadlineFloor = Math.max(0, Math.min(MAX_TARGET_LINES, Number(targetFloor || 0)));
    if (deadlineFloor > normalized.targetLines) return {allowNew:true, mode:'deadline-boost', effectiveTargetLines:deadlineFloor, reviewBudget:load.budget, reason:`시험 역산상 첫 회독 권장 마감에 맞추기 위해 오늘 학습량을 ${deadlineFloor}점으로 보정합니다.`};
    return {allowNew:true, mode:'new', effectiveTargetLines:normalized.targetLines, reviewBudget:load.budget, reason:'복습 부담이 안정적이어서 새 범위를 추가합니다.'};
  }

  function createNextSession(sections, state, dueCount = 0, now = Date.now(), options = {}) {
    const normalized = normalizeState(state, now);
    if (normalized.activeSession?.sectionIds?.length) return {...normalized.activeSession, continued:true};
    const decision = paceDecision({state:normalized, dueCount, now, targetFloor:Number(options?.targetFloor || 0)});
    if (!decision.allowNew) return null;
    const completed = new Set(normalized.completedSectionIds);
    const sessionTarget = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(decision.effectiveTargetLines || normalized.targetLines)));
    const selected = selectNextSectionBatch(sections, completed, sessionTarget);
    if (!selected.length) return null;
    const first = selected[0];
    const selectedWorkload = Math.round(selected.reduce((sum,item) => sum + Number(item.workloadScore || item.lineCount || 0), 0) * 10) / 10;
    return {
      id:`plan-session|${selected.map(item => item.id).join('~')}`,
      sectionIds:selected.map(item => item.id),
      subjectKey:first.subjectKey,
      area:first.area,
      sourceGroups:[...new Set(selected.map(item => item.sourceGroup))],
      lineCount:selected.reduce((sum,item) => sum + Number(item.lineCount || 0), 0),
      workloadScore:selectedWorkload,
      targetWorkloadAtStart:sessionTarget,
      targetLinesAtStart:sessionTarget, // v7.6.3 이하 백업/복원 호환용 legacy alias
      paceMode:decision.mode,
      startedDayKey:localDayKey(now),
      startedAt:now,
      continued:false
    };
  }

  function startSession(state, session, now = Date.now()) {
    const normalized = normalizeState(state, now);
    if (!session) return normalized;
    const alreadyActive = Boolean(normalized.activeSession?.sectionIds?.length);
    const today = localDayKey(now);
    normalized.activeSession = {...session, startedDayKey:session.startedDayKey || today, startedAt:Number(session.startedAt || now), studyProgress:normalizeStudyProgress(session.studyProgress)};
    // activeSession을 이어가는 호출은 새 세션으로 세지 않는다. 실제로 새 세션을 시작할 때만 기록한다.
    if (!alreadyActive) normalized.lastNewSessionStartDayKey = today;
    normalized.updatedAt = now;
    return normalized;
  }


  function noteSessionStudyProgress(state, progress = {}, now = Date.now()) {
    const normalized = normalizeState(state, now);
    if (!normalized.activeSession?.sectionIds?.length) return normalized;
    const current = normalizeStudyProgress(normalized.activeSession.studyProgress);
    const merged = {
      ...current,
      ...progress,
      draftFields:progress.draftFields !== undefined ? {...current.draftFields, ...progress.draftFields} : current.draftFields,
      gradedRecall:progress.gradedRecall !== undefined ? progress.gradedRecall : current.gradedRecall,
      structureSession:progress.structureSession !== undefined ? progress.structureSession : current.structureSession,
      lastFocus:progress.lastFocus !== undefined ? progress.lastFocus : current.lastFocus,
      updatedAt:Number(now || Date.now())
    };
    normalized.activeSession.studyProgress = normalizeStudyProgress(merged);
    normalized.updatedAt = now;
    return normalized;
  }

  function assessmentScore(status, explicitAccuracy = null) {
    if (Number.isFinite(Number(explicitAccuracy))) return clamp01(explicitAccuracy);
    if (status === 'correct') return 1;
    if (status === 'near') return 0.65;
    return 0;
  }

  function noteSessionAssessment(state, assessment = {}, now = Date.now()) {
    const normalized = normalizeState(state, now);
    if (!normalized.activeSession?.sectionIds?.length) return normalized;
    const key = String(assessment.key || '').trim();
    if (!key) return normalized;
    const performance = normalizePerformance(normalized.activeSession.performance);
    // 목표량 조절에는 첫 시도만 반영한다. 재시도 성공으로 최초 실패를 덮어쓰지 않는다.
    if (performance.records[key]) return normalized;
    const kind = ['core','recall','structure'].includes(assessment.kind) ? assessment.kind : 'core';
    performance.records[key] = {
      kind,
      score:assessmentScore(String(assessment.status || ''), assessment.accuracy),
      status:String(assessment.status || ''),
      at:Number(now || Date.now())
    };
    normalized.activeSession.performance = performance;
    normalized.updatedAt = now;
    return normalized;
  }

  function sessionPerformanceSummary(session) {
    const performance = normalizePerformance(session?.performance);
    const groups = {
      core:{sum:0,count:0,weight:KIND_WEIGHTS.core},
      recall:{sum:0,count:0,weight:KIND_WEIGHTS.recall},
      structure:{sum:0,count:0,weight:KIND_WEIGHTS.structure}
    };
    Object.values(performance.records).forEach(record => {
      const group = groups[record.kind] || groups.core;
      group.sum += clamp01(record.score);
      group.count += 1;
    });
    let weighted = 0, weights = 0, evidenceCount = 0;
    Object.values(groups).forEach(group => {
      evidenceCount += group.count;
      if (!group.count) return;
      const mean = group.sum / group.count;
      weighted += mean * group.weight;
      weights += group.weight;
      group.mean = mean;
    });
    const accuracy = weights ? weighted / weights : null;
    return {
      accuracy,
      percent:accuracy == null ? null : Math.round(accuracy * 100),
      evidenceCount,
      sufficient:evidenceCount >= 3,
      byKind:Object.fromEntries(Object.entries(groups).map(([kind,g]) => [kind,{count:g.count, percent:g.count ? Math.round((g.mean || 0) * 100) : null}]))
    };
  }

  function adaptPace(targetLines, fastStreak, daysSpent, performance) {
    let target = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(targetLines || DEFAULT_TARGET_LINES)));
    let streak = Math.max(0, Number(fastStreak || 0));
    const hasEvidence = Boolean(performance?.sufficient && Number.isFinite(Number(performance?.accuracy)));
    const accuracy = hasEvidence ? Number(performance.accuracy) : null;
    let delta = 0;
    let reason = '';

    if (!hasEvidence) {
      streak = 0;
      if (daysSpent >= 3) delta = -2;
      else if (daysSpent === 2) delta = -1;
      reason = daysSpent === 1
        ? '정답 데이터가 충분하지 않아 새 학습량 목표를 유지했습니다.'
        : `완료까지 ${daysSpent}일이 걸렸고 정답 데이터가 부족해 학습량 목표를 ${Math.abs(delta)}점 줄였습니다.`;
    } else if (daysSpent === 1) {
      if (accuracy >= HIGH_ACCURACY) {
        streak += 1;
        if (streak >= 3) { delta = 1; streak = 0; }
        reason = delta > 0
          ? `1일 완료와 높은 첫 인출 정확도(${performance.percent}%)가 반복되어 학습량 목표를 1점 늘렸습니다.`
          : `1일 완료 · 첫 인출 정확도 ${performance.percent}%로 안정적입니다. 같은 수준이 반복되면 학습량 목표를 조금 늘립니다.`;
      } else if (accuracy >= STABLE_ACCURACY) {
        streak = 0;
        reason = `1일에 끝냈지만 첫 인출 정확도 ${performance.percent}%라 학습량 목표는 유지합니다.`;
      } else {
        streak = 0;
        delta = accuracy < 0.55 ? -2 : -1;
        reason = `1일에 끝냈지만 첫 인출 정확도 ${performance.percent}%가 낮아 학습량 목표를 ${Math.abs(delta)}점 줄였습니다.`;
      }
    } else if (daysSpent === 2) {
      streak = 0;
      if (accuracy >= HIGH_ACCURACY) {
        delta = 0;
        reason = `이틀이 걸렸지만 첫 인출 정확도 ${performance.percent}%가 높아 학습량 목표를 유지합니다.`;
      } else if (accuracy >= STABLE_ACCURACY) {
        delta = -1;
        reason = `이틀 소요 · 첫 인출 정확도 ${performance.percent}%로 학습량 목표를 1점 줄였습니다.`;
      } else {
        delta = -2;
        reason = `이틀 소요 · 첫 인출 정확도 ${performance.percent}%가 낮아 학습량 목표를 2점 줄였습니다.`;
      }
    } else {
      streak = 0;
      if (accuracy >= HIGH_ACCURACY) delta = -1;
      else if (accuracy >= STABLE_ACCURACY) delta = -2;
      else delta = -3;
      reason = `${daysSpent}일 소요 · 첫 인출 정확도 ${performance.percent}%를 함께 반영해 학습량 목표를 ${Math.abs(delta)}점 줄였습니다.`;
    }

    const nextTarget = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, target + delta));
    return {targetLines:nextTarget, fastStreak:streak, delta:nextTarget - target, reason, performance};
  }

  function completeActiveSession(state, now = Date.now()) {
    const normalized = normalizeState(state, now);
    const session = normalized.activeSession;
    if (!session?.sectionIds?.length) return {state:normalized, changed:false, daysSpent:0, performance:sessionPerformanceSummary(null), pace:null};
    const today = localDayKey(now);
    const daysSpent = dayDistance(session.startedDayKey || today, today) + 1;
    const performance = sessionPerformanceSummary(session);
    const pace = adaptPace(normalized.targetLines, normalized.fastStreak, daysSpent, performance);
    const completed = new Set(normalized.completedSectionIds);
    session.sectionIds.forEach(id => completed.add(id));
    normalized.completedSectionIds = [...completed];
    normalized.completedSessions.push({
      sessionId:session.id,
      sectionIds:[...session.sectionIds],
      lineCount:Number(session.lineCount || 0),
      workloadScore:Number(session.workloadScore || session.lineCount || 0),
      startedDayKey:session.startedDayKey || today,
      completedDayKey:today,
      daysSpent,
      firstRecallAccuracy:performance.percent,
      evidenceCount:performance.evidenceCount,
      paceDelta:pace.delta
    });
    normalized.targetLines = pace.targetLines;
    normalized.fastStreak = pace.fastStreak;
    normalized.activeSession = null;
    normalized.updatedAt = now;
    return {state:normalized, changed:true, daysSpent, performance, pace};
  }


  function completesArea(sections, state, session = null) {
    const normalized = normalizeState(state);
    const current = session || normalized.activeSession;
    if (!current?.subjectKey || !current?.area) return false;
    const covered = new Set([...(normalized.completedSectionIds || []), ...((current.sectionIds || []).map(String))]);
    const areaSections = (sections || []).filter(item => item.subjectKey === current.subjectKey && item.area === current.area);
    return areaSections.length > 0 && areaSections.every(item => covered.has(item.id));
  }

  function progressSummary(sections, state) {
    const normalized = normalizeState(state);
    const completed = new Set(normalized.completedSectionIds);
    const totalSections = (sections || []).length;
    const completedSections = (sections || []).filter(section => completed.has(section.id)).length;
    const totalLines = (sections || []).reduce((sum,item) => sum + Number(item.lineCount || 0), 0);
    const completedLines = (sections || []).filter(section => completed.has(section.id)).reduce((sum,item) => sum + Number(item.lineCount || 0), 0);
    const totalWorkload = (sections || []).reduce((sum,item) => sum + Number(item.workloadScore || item.lineCount || 0), 0);
    const completedWorkload = (sections || []).filter(section => completed.has(section.id)).reduce((sum,item) => sum + Number(item.workloadScore || item.lineCount || 0), 0);
    return {totalSections, completedSections, totalLines, completedLines, totalWorkload:Math.round(totalWorkload*10)/10, completedWorkload:Math.round(completedWorkload*10)/10, percent:totalWorkload ? Math.round(completedWorkload / totalWorkload * 100) : 0};
  }

  return {
    MIN_TARGET_LINES,
    DEFAULT_TARGET_LINES,
    MAX_TARGET_LINES,
    HIGH_ACCURACY,
    STABLE_ACCURACY,
    DEFAULT_EXAM_DAY_KEY,
    FIRST_PASS_BUFFER_DAYS,
    lineWorkload,
    localDayKey,
    dayDistance,
    signedDayDistance,
    shiftDayKey,
    buildStudySections,
    normalizeState,
    plannerDayIndex,
    isConsolidationDay,
    recordStudyActivity,
    dailyReviewBudget,
    reviewUnlockAllowance,
    deadlineGuidance,
    projectedNewStudyDays,
    estimateCompletionDayKey,
    estimateCompletionForSections,
    remainingSessionEstimate,
    selectNextSectionBatch,
    reviewLoadDecision,
    reviewPauseThreshold,
    paceDecision,
    createNextSession,
    startSession,
    noteSessionAssessment,
    noteSessionStudyProgress,
    sessionPerformanceSummary,
    adaptPace,
    completeActiveSession,
    completesArea,
    progressSummary
  };
});

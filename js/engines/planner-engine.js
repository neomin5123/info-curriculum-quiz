(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopPlannerEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const MIN_TARGET_LINES = 8;
  const DEFAULT_TARGET_LINES = 18;
  const MAX_TARGET_LINES = 22;
  const HIGH_ACCURACY = 0.85;
  const STABLE_ACCURACY = 0.70;
  const KIND_WEIGHTS = Object.freeze({core:0.35, recall:0.55, structure:0.10});

  function localDayKey(timestamp = Date.now()) {
    const d = new Date(Number(timestamp) || Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function parseDayKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  }

  function dayDistance(fromKey, toKey) {
    const a = parseDayKey(fromKey), b = parseDayKey(toKey);
    if (!a || !b) return 0;
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)));
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
            out.push({
              id:sectionId(subjectKey, area, sourceGroup, section?.title || '', index),
              subjectKey,
              area,
              sourceGroup,
              sectionTitle:String(section?.title || ''),
              sectionIndex:index,
              lineCount:lines.length,
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

  function normalizeActiveSession(session) {
    if (!session || typeof session !== 'object') return null;
    return {
      ...session,
      sectionIds:Array.isArray(session.sectionIds) ? session.sectionIds.map(String) : [],
      performance:normalizePerformance(session.performance)
    };
  }

  function normalizeState(source, now = Date.now()) {
    const state = source && typeof source === 'object' ? {...source} : {};
    return {
      version:2,
      firstDayKey:String(state.firstDayKey || localDayKey(now)),
      targetLines:Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(state.targetLines || DEFAULT_TARGET_LINES))),
      completedSectionIds:Array.isArray(state.completedSectionIds) ? [...new Set(state.completedSectionIds.map(String))] : [],
      activeSession:normalizeActiveSession(state.activeSession),
      completedSessions:Array.isArray(state.completedSessions) ? state.completedSessions.slice(-120) : [],
      fastStreak:Math.max(0, Number(state.fastStreak || 0)),
      recoveryDayKey:String(state.recoveryDayKey || ''),
      updatedAt:Number(state.updatedAt || 0)
    };
  }

  function plannerDayIndex(state, now = Date.now()) {
    return dayDistance(state?.firstDayKey || localDayKey(now), localDayKey(now));
  }

  function isConsolidationDay(state, now = Date.now()) {
    return plannerDayIndex(state, now) % 7 === 6;
  }

  function dailyReviewBudget(targetLines) {
    // 암기 속도가 느려져도 복습 용량까지 함께 급감시키지 않는다.
    // 새 진도를 먼저 줄이고, 장기 기억을 위한 재인출 용량은 최소 20개를 유지한다.
    const target = Math.max(MIN_TARGET_LINES, Math.min(MAX_TARGET_LINES, Number(targetLines || DEFAULT_TARGET_LINES)));
    return Math.max(20, Math.min(30, Math.round(20 + (target - MIN_TARGET_LINES) * 0.5)));
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

  function paceDecision({state, dueCount = 0, now = Date.now()} = {}) {
    const normalized = normalizeState(state, now);
    const load = reviewLoadDecision(normalized.targetLines, dueCount);
    if (normalized.activeSession?.sectionIds?.length) return {allowNew:true, mode:'continue', effectiveTargetLines:normalized.targetLines, reviewBudget:load.budget, reason:'진행 중인 범위를 먼저 마칩니다.'};
    if (normalized.recoveryDayKey === localDayKey(now)) return {allowNew:false, mode:'review-recovery', effectiveTargetLines:0, reviewBudget:load.budget, reason:'오늘은 복습 적체를 해소하는 회복일입니다.'};
    if (isConsolidationDay(normalized, now)) return {allowNew:false, mode:'consolidation', effectiveTargetLines:0, reviewBudget:load.budget, reason:'오늘은 7일 주기의 누적 혼합 점검일입니다.'};
    if (load.mode === 'pause') return {allowNew:false, mode:'review-recovery', effectiveTargetLines:0, reviewBudget:load.budget, reason:`복습 ${load.backlog}개가 쌓여 새 진도를 잠시 멈춥니다.`};
    if (load.mode === 'heavy-reduce' || load.mode === 'light-reduce') return {allowNew:true, mode:'new-reduced', effectiveTargetLines:load.effectiveTargetLines, reviewBudget:load.budget, reason:load.reason};
    return {allowNew:true, mode:'new', effectiveTargetLines:normalized.targetLines, reviewBudget:load.budget, reason:'복습 부담이 안정적이어서 새 범위를 추가합니다.'};
  }

  function createNextSession(sections, state, dueCount = 0, now = Date.now()) {
    const normalized = normalizeState(state, now);
    if (normalized.activeSession?.sectionIds?.length) return {...normalized.activeSession, continued:true};
    const decision = paceDecision({state:normalized, dueCount, now});
    if (!decision.allowNew) return null;
    const completed = new Set(normalized.completedSectionIds);
    const firstIndex = (sections || []).findIndex(section => !completed.has(section.id));
    if (firstIndex < 0) return null;
    const first = sections[firstIndex];
    const selected = [];
    const sessionTarget = Math.max(MIN_TARGET_LINES, Number(decision.effectiveTargetLines || normalized.targetLines));
    let lines = 0;
    for (let i = firstIndex; i < sections.length; i++) {
      const item = sections[i];
      if (completed.has(item.id)) continue;
      if (item.subjectKey !== first.subjectKey || item.area !== first.area) break;
      const projected = lines + Number(item.lineCount || 0);
      if (selected.length && lines >= sessionTarget && projected > sessionTarget + 5) break;
      if (selected.length && lines < sessionTarget && projected > sessionTarget + 5) break;
      selected.push(item);
      lines = projected;
    }
    if (!selected.length) selected.push(first);
    return {
      id:`plan-session|${selected.map(item => item.id).join('~')}`,
      sectionIds:selected.map(item => item.id),
      subjectKey:first.subjectKey,
      area:first.area,
      sourceGroups:[...new Set(selected.map(item => item.sourceGroup))],
      lineCount:selected.reduce((sum,item) => sum + Number(item.lineCount || 0), 0),
      targetLinesAtStart:sessionTarget,
      paceMode:decision.mode,
      startedDayKey:localDayKey(now),
      startedAt:now,
      continued:false
    };
  }

  function startSession(state, session, now = Date.now()) {
    const normalized = normalizeState(state, now);
    if (!session) return normalized;
    normalized.activeSession = {...session, startedDayKey:session.startedDayKey || localDayKey(now), startedAt:Number(session.startedAt || now)};
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
        ? '정답 데이터가 충분하지 않아 새 원문 목표량을 유지했습니다.'
        : `완료까지 ${daysSpent}일이 걸렸고 정답 데이터가 부족해 목표량을 ${Math.abs(delta)}문장 줄였습니다.`;
    } else if (daysSpent === 1) {
      if (accuracy >= HIGH_ACCURACY) {
        streak += 1;
        if (streak >= 3) { delta = 1; streak = 0; }
        reason = delta > 0
          ? `1일 완료와 높은 첫 인출 정확도(${performance.percent}%)가 반복되어 목표량을 1문장 늘렸습니다.`
          : `1일 완료 · 첫 인출 정확도 ${performance.percent}%로 안정적입니다. 같은 수준이 반복되면 목표량을 조금 늘립니다.`;
      } else if (accuracy >= STABLE_ACCURACY) {
        streak = 0;
        reason = `1일에 끝냈지만 첫 인출 정확도 ${performance.percent}%라 목표량은 유지합니다.`;
      } else {
        streak = 0;
        delta = accuracy < 0.55 ? -2 : -1;
        reason = `1일에 끝냈지만 첫 인출 정확도 ${performance.percent}%가 낮아 목표량을 ${Math.abs(delta)}문장 줄였습니다.`;
      }
    } else if (daysSpent === 2) {
      streak = 0;
      if (accuracy >= HIGH_ACCURACY) {
        delta = 0;
        reason = `이틀이 걸렸지만 첫 인출 정확도 ${performance.percent}%가 높아 목표량을 유지합니다.`;
      } else if (accuracy >= STABLE_ACCURACY) {
        delta = -1;
        reason = `이틀 소요 · 첫 인출 정확도 ${performance.percent}%로 목표량을 1문장 줄였습니다.`;
      } else {
        delta = -2;
        reason = `이틀 소요 · 첫 인출 정확도 ${performance.percent}%가 낮아 목표량을 2문장 줄였습니다.`;
      }
    } else {
      streak = 0;
      if (accuracy >= HIGH_ACCURACY) delta = -1;
      else if (accuracy >= STABLE_ACCURACY) delta = -2;
      else delta = -3;
      reason = `${daysSpent}일 소요 · 첫 인출 정확도 ${performance.percent}%를 함께 반영해 목표량을 ${Math.abs(delta)}문장 줄였습니다.`;
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
    return {totalSections, completedSections, totalLines, completedLines, percent:totalLines ? Math.round(completedLines / totalLines * 100) : 0};
  }

  return {
    MIN_TARGET_LINES,
    DEFAULT_TARGET_LINES,
    MAX_TARGET_LINES,
    HIGH_ACCURACY,
    STABLE_ACCURACY,
    localDayKey,
    dayDistance,
    buildStudySections,
    normalizeState,
    plannerDayIndex,
    isConsolidationDay,
    dailyReviewBudget,
    reviewLoadDecision,
    reviewPauseThreshold,
    paceDecision,
    createNextSession,
    startSession,
    noteSessionAssessment,
    sessionPerformanceSummary,
    adaptPace,
    completeActiveSession,
    completesArea,
    progressSummary
  };
});

(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopPracticeEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function normalize(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’→↔+]+/g, '')
      .trim();
  }

  function containsNormalized(haystack, needle) {
    const h = normalize(haystack), n = normalize(needle);
    return !!n && h.includes(n);
  }

  function isNegatedForbidden(answer, term) {
    const a = normalize(answer), t = normalize(term);
    if (!a || !t || !a.includes(t)) return false;
    const tails = ['가아니라','이아니라','은아니라','는아니라','아니라','가아님','이아님','아님','하는것이아니라','하는게아니라','하는것은아니라','하는것이아니다','하는것이아님','하지않','하면안','해서는안','해서안'];
    return tails.some(tail => a.includes(t + tail));
  }

  function forbiddenHit(answer, unit) {
    return (unit?.forbiddenConfusions || []).find(term => containsNormalized(answer, term) && !isNegatedForbidden(answer, term)) || '';
  }

  function negatedForbiddenHit(answer, unit) {
    return (unit?.forbiddenConfusions || []).find(term => containsNormalized(answer, term) && isNegatedForbidden(answer, term)) || '';
  }

  function gradeAnyOf(answer, spec) {
    const pool = Array.isArray(spec?.pool) ? spec.pool : [];
    const found = [];
    for (const item of pool) {
      if (containsNormalized(answer, item)) found.push(item);
    }
    const unique = [...new Set(found.map(normalize))];
    const need = Math.max(1, Number(spec?.count || 1));
    return {ok: unique.length >= need, foundCount: unique.length, need};
  }

  function gradeRequiredConcepts(answer, concepts) {
    const list = Array.isArray(concepts) ? concepts.filter(Boolean) : [];
    if (!list.length) return {ok:false, matched:0, total:0, missing:[]};
    const missing = list.filter(term => !containsNormalized(answer, term));
    return {ok: missing.length === 0, matched:list.length - missing.length, total:list.length, missing};
  }

  // 필수 키워드가 모두 들어 있어도 그 내용을 명시적으로 부정하면 정답으로 처리하지 않는다.
  // 자동채점은 의미를 완전히 해석할 수 없으므로, 명시적 부정/배제 표현이 있으면 보수적으로 near로 유예한다.
  function hasContradictionMarker(answer) {
    const text = String(answer || '').normalize('NFKC').toLowerCase();
    if (!text.trim()) return false;
    const patterns = [
      /정답(?:이|은|는)?\s*아니/,
      /(?:^|[\s,.;:!?])아니(?:다|며|고|라|라고|ㄴ|인)/,
      /(?:^|[\s,.;:!?])아닌(?:\s|$)/,
      /하지\s*않/,
      /하지않/,
      /(?:^|[\s,.;:!?])안\s+(?:한다|된다|된다|해야|된다|쓴다|쓰는|사용|활용|수행|평가|분석|설계|구현|탐색|수집|선택|구조화|표현|비교|고려|필요)/,
      /(?:않는다|않다|않음|못한다|못함)/,
      /(?:제외|배제|금지|불필요|틀렸|틀리다|오답)/
    ];
    return patterns.some(re => re.test(text));
  }

  function contradictionMarkerCount(answer) {
    const text = String(answer || '').normalize('NFKC').toLowerCase();
    if (!text.trim()) return 0;
    const normalized = normalize(text);
    const terms = ['아니','않','못한다','못함','제외','배제','금지','불필요','틀렸','틀리다','오답'];
    let count = 0;
    for (const term of terms) {
      let from = 0;
      while (true) {
        const at = normalized.indexOf(term, from);
        if (at < 0) break;
        count += 1;
        from = at + Math.max(1, term.length);
      }
    }
    // 띄어 쓴 부정 '안 한다/안 된다'는 normalize 뒤 단순 '안'만 세면 '방안' 같은 명사와 충돌하므로 원문에서 경계가 있는 경우만 센다.
    const spaced = text.match(/(?:^|[\s,.;:!?])안\s+(?=[가-힣a-z])/g);
    count += spaced ? spaced.length : 0;
    return count;
  }

  function contrastIsSafe(answer, unit) {
    const negatedTerms = (unit?.forbiddenConfusions || []).filter(term => isNegatedForbidden(answer, term));
    if (!negatedTerms.length) return false;
    const answerCount = contradictionMarkerCount(answer);
    const keyCount = contradictionMarkerCount(unit?.key || '');
    // 금지 혼동어 자체에 ‘제외/금지’ 같은 부정 의미가 들어 있을 수 있으므로,
    // 그 표현 자체의 마커 + 그것을 뒤집는 ‘아니라/하지 않는다’ 1개까지는 대비 표현으로 허용한다.
    const contrastAllowance = negatedTerms.reduce((sum, term) => sum + contradictionMarkerCount(term) + 1, 0);
    return answerCount <= keyCount + contrastAllowance;
  }

  function exactOrNear(answer, unit, gradingEngine) {
    const aliases = Array.isArray(unit?.acceptedVariants) ? unit.acceptedVariants : [];
    if (gradingEngine?.classifyDetailed) return gradingEngine.classifyDetailed(answer, unit?.key || '', aliases);
    const candidates = [unit?.key || '', ...aliases];
    if (candidates.some(candidate => normalize(candidate) === normalize(answer))) return {status:'correct', reason:'exact'};
    return {status:'wrong', reason:'meaning'};
  }

  function gradeAnswer(answer, unit, points, gradingEngine) {
    const raw = String(answer || '').trim();
    if (!raw) return {status:'unknown', earned:0, points, reason:'empty'};
    const forbidden = forbiddenHit(raw, unit);
    if (forbidden) return {status:'wrong', earned:0, points, reason:'forbidden', forbidden};
    const negatedForbidden = negatedForbiddenHit(raw, unit);
    if (negatedForbidden && contrastIsSafe(raw, unit) && containsNormalized(raw, unit?.key || '')) {
      return {status:'correct', earned:points, points, reason:'contrast-correct', contrasted:negatedForbidden};
    }

    if (unit?.anyOf) {
      const direct = exactOrNear(raw, unit, gradingEngine);
      if (direct.status === 'correct') return {status:'correct', earned:points, points, reason:'accepted'};
      const result = gradeAnyOf(raw, unit.anyOf);
      if (result.ok && negatedForbidden && contrastIsSafe(raw, unit)) return {status:'correct', earned:points, points, reason:'contrast-anyOf', detail:result, contrasted:negatedForbidden};
      if (result.ok && hasContradictionMarker(raw)) return {status:'near', earned:0, points, reason:'contradiction-check', detail:result};
      return result.ok
        ? {status:'correct', earned:points, points, reason:'anyOf', detail:result}
        : {status: result.foundCount ? 'near' : 'wrong', earned:0, points, reason:'anyOf', detail:result};
    }

    if (Array.isArray(unit?.requiredConcepts) && unit.requiredConcepts.length) {
      const direct = exactOrNear(raw, unit, gradingEngine);
      if (direct.status === 'correct') return {status:'correct', earned:points, points, reason:'accepted'};
      const result = gradeRequiredConcepts(raw, unit.requiredConcepts);
      if (result.ok && negatedForbidden && contrastIsSafe(raw, unit)) return {status:'correct', earned:points, points, reason:'contrast-concepts', detail:result, contrasted:negatedForbidden};
      if (result.ok && hasContradictionMarker(raw)) return {status:'near', earned:0, points, reason:'contradiction-check', detail:result};
      if (result.ok) return {status:'correct', earned:points, points, reason:'concepts', detail:result};
      return {status: result.matched ? 'near' : direct.status, earned:0, points, reason:'concepts', detail:result};
    }

    const direct = exactOrNear(raw, unit, gradingEngine);
    return {status:direct.status, earned:direct.status === 'correct' ? points : 0, points, reason:direct.reason || 'meaning'};
  }

  function gradeQuestion(question, answers, gradingEngine) {
    const tasks = Array.isArray(question?.tasks) ? question.tasks : [];
    const units = Array.isArray(question?.answerUnits) ? question.answerUnits : [];
    const results = [];
    let earned = 0, total = 0;
    for (const task of tasks) {
      const points = Number(task.points || 0);
      const unit = units.find(item => item.taskId === task.id) || {taskId:task.id,key:''};
      const result = gradeAnswer(answers?.[task.id] || '', unit, points, gradingEngine);
      results.push({task, unit, ...result});
      earned += result.earned;
      total += points;
    }
    const correctCount = results.filter(r => r.status === 'correct').length;
    const unknownCount = results.filter(r => r.status === 'unknown').length;
    const nearCount = results.filter(r => r.status === 'near').length;
    const wrongCount = results.filter(r => r.status === 'wrong').length;
    return {earned,total,results,correctCount,unknownCount,nearCount,wrongCount,perfect:total > 0 && earned === total};
  }

  function filterQuestions(questions, filters) {
    const f = filters || {};
    return (questions || []).filter(q => {
      const subjects = Array.isArray(q.subjects) ? q.subjects : [q.subject].filter(Boolean);
      const areas = Array.isArray(q.areas) ? q.areas : [q.area].filter(Boolean);
      if (f.subject && f.subject !== 'all' && !subjects.includes(f.subject)) return false;
      if (f.area && f.area !== 'all' && !areas.includes(f.area)) return false;
      if (f.version === '2022' && q.comparison2015) return false;
      if (f.version === 'comparison' && !q.comparison2015) return false;
      return true;
    });
  }

  function shuffleIds(items, randomFn) {
    const rng = typeof randomFn === 'function' ? randomFn : Math.random;
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  return {normalize, containsNormalized, isNegatedForbidden, gradeAnyOf, gradeRequiredConcepts, hasContradictionMarker, contradictionMarkerCount, contrastIsSafe, gradeAnswer, gradeQuestion, filterQuestions, shuffleIds};
});

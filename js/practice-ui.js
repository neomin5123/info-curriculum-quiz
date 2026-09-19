(function(root) {
  'use strict';

  const bank = root.CURRILOOP_PRACTICE_BANK || {meta:{},questions:[]};
  const Engine = root.CurriLoopPracticeEngine;
  const GradingEngine = root.CurriLoopGradingEngine;
  if (!Engine) throw new Error('CurriLoop 연습 문제 엔진을 불러오지 못했습니다.');

  const UI_KEY = 'curriloop-practice-ui-v1';
  const STATS_KEY = 'curriloop-practice-stats-v1';
  const subjectLabels = {
    'all':'전체',
    'middle-info':'중학교 정보','high-info':'고등학교 정보','ai-basic':'인공지능 기초',
    'data-science':'데이터 과학','software-life':'소프트웨어와 생활','info-science':'정보과학'
  };
  const patternLabels = {
    R1:'정확 회상', R2:'구조 분류', R3:'대응·매핑', R4:'구별', R5:'사례 적용',
    R6:'오류 탐지·수정', R7:'평가·피드백', R8:'전공 통합', R9:'15·22 비교'
  };
  const difficultyLabels = {D1:'D1 회상',D2:'D2 판별',D3:'D3 적용',D4:'D4 복합',D5:'D5 실전'};

  let filtered = [];
  let order = [];
  let index = 0;
  let graded = false;
  let lastGrade = null;
  let initialized = false;
  let weakLinkEnabled = true;
  let lastGradeSignature = '';
  let drafts = {};
  let draftSaveTimer = 0;
  let stats = loadJson(STATS_KEY, {version:1,questions:{},totalAttempts:0,totalPerfect:0});

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || '') || fallback; } catch { return fallback; }
  }
  function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function bridge() { return root.CurriLoopPracticeBridge || null; }
  function answerSignatureFor(q, answers) {
    return JSON.stringify((q?.tasks || []).map(task => [task.id, String(answers?.[task.id] || '').trim()]));
  }
  function collectVisibleAnswers(q) {
    const answers = {};
    if (!q) return answers;
    q.tasks.forEach(task => {
      answers[task.id] = document.querySelector(`.practice-answer[data-task-id="${CSS.escape(task.id)}"]`)?.value || '';
    });
    return answers;
  }
  function storeDraft(q, answers) {
    if (!q) return;
    const values = answers || {};
    const hasText = q.tasks.some(task => String(values[task.id] || '').trim());
    const sig = answerSignatureFor(q, values);
    // 이미 채점한 동일 답안은 초안이 아니다. 사용자가 채점 뒤 수정한 경우만 다시 초안으로 저장한다.
    if (!hasText || (graded && lastGradeSignature && sig === lastGradeSignature)) delete drafts[q.questionId];
    else drafts[q.questionId] = Object.fromEntries(q.tasks.map(task => [task.id, String(values[task.id] || '')]));
  }
  function captureCurrentDraft() {
    const q = currentQuestion();
    if (!q) return;
    storeDraft(q, collectVisibleAnswers(q));
  }
  function restoreDraft(q) {
    const saved = drafts?.[q?.questionId];
    if (!saved || !q) return;
    q.tasks.forEach(task => {
      const input = document.querySelector(`.practice-answer[data-task-id="${CSS.escape(task.id)}"]`);
      if (input && Object.prototype.hasOwnProperty.call(saved, task.id)) input.value = String(saved[task.id] || '');
    });
  }
  function scheduleDraftPersist() {
    clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(() => { captureCurrentDraft(); persistUi(); }, 160);
  }
  function currentFilters() {
    return {
      subject: document.getElementById('practiceSubject')?.value || 'all',
      area: document.getElementById('practiceArea')?.value || 'all',
      pattern: document.getElementById('practicePattern')?.value || 'all',
      difficulty: document.getElementById('practiceDifficulty')?.value || 'all',
      version: document.getElementById('practiceVersion')?.value || 'all'
    };
  }
  function persistUi(extra = {}) {
    const state = {version:3,filters:currentFilters(),order,index,weakLinkEnabled,drafts,...extra,savedAt:new Date().toISOString()};
    saveJson(UI_KEY, state);
  }
  function restoreUi() {
    const saved = loadJson(UI_KEY, null);
    if (!saved || typeof saved !== 'object') return false;
    weakLinkEnabled = saved.weakLinkEnabled !== false;
    drafts = saved.drafts && typeof saved.drafts === 'object' && !Array.isArray(saved.drafts) ? saved.drafts : {};
    const f = saved.filters || {};
    const setIf = (id, value) => {
      const el = document.getElementById(id);
      if (el && [...el.options].some(o => o.value === value)) el.value = value;
    };
    setIf('practiceSubject', f.subject || 'all');
    populateAreas(f.area || 'all');
    setIf('practicePattern', f.pattern || 'all');
    setIf('practiceDifficulty', f.difficulty || 'all');
    setIf('practiceVersion', f.version || 'all');
    const base = Engine.filterQuestions(bank.questions, currentFilters());
    const validIds = new Set(base.map(q => q.questionId));
    order = Array.isArray(saved.order) ? saved.order.filter(id => validIds.has(id)) : [];
    base.forEach(q => { if (!order.includes(q.questionId)) order.push(q.questionId); });
    index = Math.min(Math.max(0, Number(saved.index || 0)), Math.max(0, order.length - 1));
    return true;
  }

  function populateAreas(preferred = 'all') {
    const select = document.getElementById('practiceArea');
    if (!select) return;
    const subject = document.getElementById('practiceSubject')?.value || 'all';
    const areas = [...new Set(bank.questions.filter(q => subject === 'all' || q.subject === subject).map(q => q.area))]
      .sort((a,b) => a.localeCompare(b,'ko'));
    select.innerHTML = '<option value="all">전체</option>' + areas.map(area => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`).join('');
    if ([...select.options].some(o => o.value === preferred)) select.value = preferred;
  }

  function currentQuestionPriority(question) {
    if (!weakLinkEnabled || !question) return 0;
    return Math.max(0, Number(bridge()?.questionPriority?.(question) || 0));
  }

  function linkedOrder(questions, forceShuffle = false) {
    const list = Array.isArray(questions) ? questions : [];
    const ids = list.map(q => q.questionId);
    const b = bridge();
    if (!weakLinkEnabled || !b?.weightedQuestionIds) return forceShuffle ? Engine.shuffleIds(ids) : ids;
    const hasWeakness = list.some(q => Number(b.questionPriority?.(q) || 0) > 0.05);
    if (!forceShuffle && !hasWeakness) return ids;
    return b.weightedQuestionIds(list);
  }

  function syncWeakLinkButton() {
    const button = document.getElementById('practiceWeakLinkButton');
    if (!button) return;
    button.textContent = weakLinkEnabled ? '취약 연동 켬' : '취약 연동 끔';
    button.setAttribute('aria-pressed', weakLinkEnabled ? 'true' : 'false');
    button.classList.toggle('active', weakLinkEnabled);
  }

  function toggleWeakLink() {
    weakLinkEnabled = !weakLinkEnabled;
    syncWeakLinkButton();
    rebuild({keepCurrent:true, shuffle:weakLinkEnabled});
  }

  function rebuild({keepCurrent=false, shuffle=false} = {}) {
    captureCurrentDraft();
    const previousId = keepCurrent ? currentQuestion()?.questionId : '';
    filtered = Engine.filterQuestions(bank.questions, currentFilters());
    order = linkedOrder(filtered, shuffle);
    if (previousId && order.includes(previousId)) index = order.indexOf(previousId);
    else index = Math.min(index, Math.max(0, order.length - 1));
    graded = false; lastGrade = null; lastGradeSignature = '';
    syncWeakLinkButton();
    persistUi();
    render();
  }

  function questionById(id) { return bank.questions.find(q => q.questionId === id) || null; }
  function currentQuestion() { return questionById(order[index]); }

  function statusLabel(status) {
    return ({correct:'정답',near:'표기·요소 확인',wrong:'오답',unknown:'모름'})[status] || status;
  }

  function renderStats() {
    const total = Number(stats.totalAttempts || 0);
    const perfect = Number(stats.totalPerfect || 0);
    const seen = Object.keys(stats.questions || {}).filter(id => Number(stats.questions[id]?.attempts || 0) > 0).length;
    const text = document.getElementById('practiceStats');
    if (text) text.textContent = `풀이 ${total}회 · 만점 ${perfect}회 · 경험 ${seen}/100문항`;
  }

  function renderEmpty() {
    const area = document.getElementById('practiceQuestionArea');
    if (!area) return;
    area.innerHTML = `<div class="practice-empty"><strong>조건에 맞는 문제가 없습니다.</strong><span>필터를 넓혀 주세요.</span></div>`;
    const progress = document.getElementById('practiceProgress');
    if (progress) progress.textContent = '0 / 0';
  }

  function render() {
    renderStats();
    const count = document.getElementById('practiceFilteredCount');
    if (count) count.textContent = `${order.length}문항`;
    if (!order.length) { renderEmpty(); return; }
    const q = currentQuestion();
    if (!q) { renderEmpty(); return; }
    const progress = document.getElementById('practiceProgress');
    if (progress) progress.textContent = `${index + 1} / ${order.length}`;
    const prev = document.getElementById('practicePrevButton');
    const next = document.getElementById('practiceNextButton');
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= order.length - 1;

    const badges = [
      subjectLabels[q.subject] || q.subject,
      q.area,
      patternLabels[q.patternType] || q.patternType,
      difficultyLabels[q.difficulty] || q.difficulty,
      q.examStyle,
      q.comparison2015 ? '15·22 비교' : '2022 개정'
    ];
    const qStat = stats.questions?.[q.questionId] || {};
    const priority = currentQuestionPriority(q);
    const linkedHint = weakLinkEnabled && priority > 0.05 ? `<span class="practice-linked-priority" title="원문 학습·복습 기록을 반영한 출제 우선도">취약 연동 ${priority.toFixed(1)}</span>` : '';
    const prior = qStat.attempts ? `<span class="practice-prior">이전 최고 ${Number(qStat.bestScore || 0)}/${Number(qStat.maxScore || 0)}점 · ${qStat.attempts}회</span>` : '';
    const taskHtml = q.tasks.map((task, i) => {
      const multiline = q.examStyle === '4점형' || String(task.prompt || '').length > 38;
      const input = multiline
        ? `<textarea class="practice-answer" data-task-id="${escapeHtml(task.id)}" rows="3" placeholder="답안을 입력하세요." aria-label="${escapeHtml(task.prompt)}"></textarea>`
        : `<input class="practice-answer" data-task-id="${escapeHtml(task.id)}" type="text" autocomplete="off" spellcheck="false" placeholder="답안을 입력하세요." aria-label="${escapeHtml(task.prompt)}">`;
      return `<div class="practice-task">
        <div class="practice-task-head"><span class="practice-task-num">${String.fromCharCode(97+i)}.</span><strong>${escapeHtml(task.prompt)}</strong><span>${Number(task.points || 0)}점</span></div>
        ${input}<div class="practice-task-feedback" data-feedback-for="${escapeHtml(task.id)}"></div>
      </div>`;
    }).join('');
    const validation = q.validationStatus === 'v0.6-production-ready-2022'
      ? '<span class="practice-validation ready">2022 검수완료</span>'
      : '<span class="practice-validation legacy">비교근거 제한</span>';
    const area = document.getElementById('practiceQuestionArea');
    area.innerHTML = `<article class="practice-card" data-question-id="${escapeHtml(q.questionId)}">
      <div class="practice-meta-row"><div class="practice-badges">${badges.map(b => `<span>${escapeHtml(b)}</span>`).join('')}</div>${validation}</div>
      <div class="practice-id-row"><span>${escapeHtml(q.questionId)}</span>${prior}${linkedHint}</div>
      <h2 class="practice-stem">${escapeHtml(q.stem)}</h2>
      <div class="practice-tasks">${taskHtml}</div>
      <div class="practice-actions">
        <button class="btn primary" type="button" onclick="gradePracticeQuestion()">채점</button>
        <button class="btn soft" type="button" onclick="markPracticeUnknown()">모름</button>
        <button class="btn" type="button" onclick="openPracticeSource()">근거 원문 보기</button>
      </div>
      <section id="practiceExplanation" class="practice-explanation hidden" aria-live="polite"></section>
    </article>`;
    restoreDraft(q);
    bindAnswerKeys();
    graded = false; lastGrade = null; lastGradeSignature = '';
    syncWeakLinkButton();
    persistUi();
  }

  function bindAnswerKeys() {
    document.querySelectorAll('.practice-answer').forEach(input => {
      input.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); grade(); }
        else if (input.tagName === 'INPUT' && event.key === 'Enter') { event.preventDefault(); grade(); }
      });
      input.addEventListener('input', scheduleDraftPersist);
      input.addEventListener('blur', () => { captureCurrentDraft(); persistUi(); });
    });
  }

  function collectAnswers(q) { return collectVisibleAnswers(q); }

  function feedbackHtml(result) {
    const unit = result.unit || {};
    const cls = result.status === 'correct' ? 'good' : result.status === 'near' ? 'near' : result.status === 'unknown' ? 'unknown' : 'bad';
    let extra = '';
    if (result.reason === 'concepts' && result.detail?.missing?.length) extra = `<div class="practice-missing">빠진 핵심: ${result.detail.missing.map(escapeHtml).join(', ')}</div>`;
    if (result.reason === 'anyOf' && result.detail) extra = `<div class="practice-missing">확인된 항목 ${result.detail.foundCount}/${result.detail.need}</div>`;
    if (result.forbidden) extra = `<div class="practice-missing">혼동 주의: ${escapeHtml(result.forbidden)}</div>`;
    return `<div class="practice-feedback ${cls}"><strong>${statusLabel(result.status)} · ${result.earned}/${result.points}점</strong>
      <div><b>정답:</b> ${escapeHtml(unit.key || '')}</div>${extra}
      <div class="practice-rationale">${escapeHtml(unit.rationale || '')}</div></div>`;
  }

  function recordGrade(q, grade) {
    stats.questions = stats.questions || {};
    const prev = stats.questions[q.questionId] || {attempts:0,bestScore:0,maxScore:grade.total,lastScore:0,lastAt:null,perfect:0};
    prev.attempts = Number(prev.attempts || 0) + 1;
    prev.maxScore = grade.total;
    prev.lastScore = grade.earned;
    prev.bestScore = Math.max(Number(prev.bestScore || 0), grade.earned);
    prev.lastAt = new Date().toISOString();
    if (grade.perfect) prev.perfect = Number(prev.perfect || 0) + 1;
    stats.questions[q.questionId] = prev;
    stats.totalAttempts = Number(stats.totalAttempts || 0) + 1;
    if (grade.perfect) stats.totalPerfect = Number(stats.totalPerfect || 0) + 1;
    saveJson(STATS_KEY, stats);
  }

  function grade() {
    const q = currentQuestion();
    if (!q) return;
    const answers = collectAnswers(q);
    const signature = answerSignatureFor(q, answers);
    const isNewAttempt = signature !== lastGradeSignature;
    const result = Engine.gradeQuestion(q, answers, GradingEngine);
    lastGrade = result; graded = true;
    result.results.forEach(item => {
      const target = document.querySelector(`[data-feedback-for="${CSS.escape(item.task.id)}"]`);
      if (target) target.innerHTML = feedbackHtml(item);
      const input = document.querySelector(`.practice-answer[data-task-id="${CSS.escape(item.task.id)}"]`);
      if (input) {
        input.classList.remove('answer-correct','answer-near','answer-wrong','answer-unknown');
        input.classList.add(`answer-${item.status}`);
      }
    });
    const exp = document.getElementById('practiceExplanation');
    if (exp) {
      const source = q.sourceIds.map(id => `<code>${escapeHtml(id)}</code>`).join(' ');
      exp.classList.remove('hidden');
      exp.innerHTML = `<div class="practice-score-line"><strong>${result.earned} / ${result.total}점</strong><span>${result.perfect ? '전부 정확합니다.' : '정답·근거를 확인하고 다시 인출해 보세요.'}</span></div>
        <p>${escapeHtml(q.explanation || '')}</p>
        <div class="practice-source-line"><b>근거:</b> ${source} · ${q.sourceType.map(escapeHtml).join(', ')}</div>`;
    }
    let linkResult = null;
    if (isNewAttempt) {
      recordGrade(q, result);
      linkResult = bridge()?.recordGrade?.(q, result) || null;
      lastGradeSignature = signature;
      delete drafts[q.questionId];
    }
    if (exp && linkResult?.linked) {
      exp.insertAdjacentHTML('beforeend', `<div class="practice-link-note">원문 복습 연동: ${Number(linkResult.linked)}개 근거 문장을 오늘 복습에 추가했습니다.</div>`);
    }
    renderStats();
    syncWeakLinkButton();
    persistUi();
  }

  function markUnknown() {
    const q = currentQuestion();
    if (!q) return;
    q.tasks.forEach(task => {
      const input = document.querySelector(`.practice-answer[data-task-id="${CSS.escape(task.id)}"]`);
      if (input) input.value = '';
    });
    grade();
  }

  function move(delta) {
    if (!order.length) return;
    captureCurrentDraft();
    index = Math.min(Math.max(0,index + delta), order.length - 1);
    graded = false; lastGrade = null; lastGradeSignature = '';
    persistUi(); render();
    document.getElementById('practiceQuestionArea')?.scrollIntoView({block:'start',behavior:'smooth'});
  }

  function shuffle() {
    if (!order.length) return;
    captureCurrentDraft();
    const current = currentQuestion()?.questionId;
    const questions = order.map(questionById).filter(Boolean);
    order = linkedOrder(questions, true);
    index = current && order.includes(current) ? order.indexOf(current) : 0;
    lastGradeSignature = '';
    persistUi(); render();
  }

  function restart() {
    captureCurrentDraft();
    index = 0;
    if (weakLinkEnabled) {
      const questions = Engine.filterQuestions(bank.questions, currentFilters());
      order = linkedOrder(questions, false);
    }
    lastGradeSignature = '';
    persistUi(); render();
  }

  function locateSource(q) {
    const data = root.CURRILOOP_CURRICULUM_DATA || {};
    const wanted = Array.isArray(q?.sourceIds) ? q.sourceIds : [];
    const scanArea = (subjectKey, areaName) => {
      const groups = data?.[subjectKey]?.[areaName];
      if (!groups) return null;
      for (const [groupKey, sections] of Object.entries(groups)) {
        if (!Array.isArray(sections)) continue;
        for (const section of sections) for (const line of section.lines || []) {
          if (!wanted.includes(line.id)) continue;
          const mappedGroup = groupKey === 'achievement' ? 'achievement' : groupKey === 'teaching-evaluation' ? 'teaching-evaluation' : groupKey === 'character-goal' ? 'character-goal' : 'content-system';
          return {id:line.id, subject:q.subject, area:areaName, group:mappedGroup};
        }
      }
      return null;
    };
    const preferred = scanArea(q.subject, q.area);
    if (preferred) return preferred;
    for (const areaName of Object.keys(data?.[q.subject] || {})) {
      const found = scanArea(q.subject, areaName);
      if (found) return found;
    }
    return {id:wanted[0] || '', subject:q.subject, area:q.area, group:'achievement'};
  }

  function openSource() {
    const q = currentQuestion();
    if (!q) return;
    if (root.CurriLoopSourceModal?.openIds) {
      root.CurriLoopSourceModal.openIds(q.sourceIds || [], {
        title:'근거 원문 보기',
        meta:[q.questionId, subjectLabels[q.subject] || q.subject, q.area].filter(Boolean).join(' · '),
        subject:q.subject,
        note:q.comparison2015
          ? '강조된 문장은 2022 개정 쪽 직접 근거입니다. 2015 개정 비교 근거는 기출 인용 범위로 제한되어 문제의 비교근거 제한 배지와 함께 관리합니다.'
          : '강조된 문장이 이 문제의 2022 개정 직접 근거입니다. 팝업을 닫으면 작성 중인 답안과 문제 위치가 그대로 유지됩니다.'
      });
    }
  }

  function onFilterChange(sourceChanged=false) {
    const preferred = sourceChanged ? 'all' : (document.getElementById('practiceArea')?.value || 'all');
    if (sourceChanged) populateAreas(preferred);
    rebuild({keepCurrent:false});
  }

  function init() {
    if (initialized) return;
    initialized = true;
    populateAreas('all');
    const restored = restoreUi();
    syncWeakLinkButton();
    if (restored && order.length) {
      filtered = Engine.filterQuestions(bank.questions, currentFilters());
      render();
    } else {
      rebuild({keepCurrent:false});
    }
  }

  function onShow() { init(); render(); }

  root.CurriLoopPracticeUI = {init,onShow,render,rebuild,grade,markUnknown,move,shuffle,restart,openSource,onFilterChange,toggleWeakLink};
  root.onPracticeFilterChange = onFilterChange;
  root.gradePracticeQuestion = grade;
  root.markPracticeUnknown = markUnknown;
  root.previousPracticeQuestion = () => move(-1);
  root.nextPracticeQuestion = () => move(1);
  root.shufflePracticeQuestions = shuffle;
  root.restartPracticeQuestions = restart;
  root.openPracticeSource = openSource;
  root.togglePracticeWeakLink = toggleWeakLink;
})(typeof globalThis !== 'undefined' ? globalThis : window);

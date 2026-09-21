(function(root) {
  'use strict';

  const bank = root.CURRILOOP_PRACTICE_BANK || {meta:{},questions:[]};
  const Engine = root.CurriLoopPracticeEngine;
  const GradingEngine = root.CurriLoopGradingEngine;
  if (!Engine) throw new Error('CurriLoop 연습 문제 엔진을 불러오지 못했습니다.');

  const UI_KEY = 'curriloop-practice-ui-v1';
  const STATS_KEY = 'curriloop-practice-stats-v1';
  const EXAM_SET_POINTS = 20;
  const subjectLabels = {
    'all':'전체',
    'middle-info':'중학교 정보','high-info':'고등학교 정보','2015-middle-info':'2015 중학교 정보','2015-high-info':'2015 고등학교 정보','ai-basic':'인공지능 기초',
    'data-science':'데이터 과학','software-life':'소프트웨어와 생활','info-science':'정보과학'
  };
  // 교육과정 원문에 제시된 과목별 영역 순서. 연습문제 필터도 이 순서를 그대로 따른다.
  const areaOrderBySubject = {
    'middle-info':['컴퓨팅 시스템','데이터','알고리즘과 프로그래밍','인공지능','디지털 문화'],
    'high-info':['컴퓨팅 시스템','데이터','알고리즘과 프로그래밍','인공지능','디지털 문화'],
    'ai-basic':['인공지능의 이해','인공지능과 학습','인공지능의 사회적 영향','인공지능 프로젝트'],
    'data-science':['데이터 과학의 이해','데이터 준비와 분석','데이터 모델링과 평가','데이터 과학 프로젝트'],
    'software-life':['세상을 변화시키는 소프트웨어','창작을 지원하는 소프트웨어','현상을 분석하는 소프트웨어','모의 실험하는 소프트웨어','가치를 창출하는 소프트웨어'],
    'info-science':['프로그래밍','데이터 구조','알고리즘','정보과학 프로젝트']
  };

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
  let setMode = false;
  let setIds = [];
  let setAnswers = {};
  let setSubmitted = false;
  let setGrades = {};
  let setNotice = '';
  let stats = loadJson(STATS_KEY, {version:1,questions:{},totalAttempts:0,totalPerfect:0});

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || '') || fallback; } catch { return fallback; }
  }
  function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  // 문제 본문은 기본적으로 전부 escape하고, 출제용 제한 마크업만 후처리한다.
  // {{u:...}} = 밑줄. 임의 HTML은 허용하지 않는다.
  function renderExamText(value) {
    return escapeHtml(value).replace(/\{\{u:([\s\S]*?)\}\}/g, '<u>$1</u>');
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
    const answers = collectVisibleAnswers(q);
    if (setMode) {
      setAnswers[q.questionId] = Object.fromEntries(q.tasks.map(task => [task.id, String(answers[task.id] || '')]));
      return;
    }
    storeDraft(q, answers);
  }
  function restoreDraft(q) {
    const saved = setMode ? setAnswers?.[q?.questionId] : drafts?.[q?.questionId];
    if (!saved || !q) return;
    q.tasks.forEach(task => {
      const input = document.querySelector(`.practice-answer[data-task-id="${CSS.escape(task.id)}"]`);
      if (input && Object.prototype.hasOwnProperty.call(saved, task.id)) input.value = String(saved[task.id] || '');
    });
  }
  function scheduleDraftPersist() {
    clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(() => { captureCurrentDraft(); persistUi(); syncSetControls(); }, 160);
  }
  function currentFilters() {
    return {
      subject: document.getElementById('practiceSubject')?.value || 'all',
      area: document.getElementById('practiceArea')?.value || 'all',
      version: document.getElementById('practiceVersion')?.value || 'all'
    };
  }
  function persistUi(extra = {}) {
    const state = {version:5,filters:currentFilters(),order,index,weakLinkEnabled,drafts,setMode,setIds,setAnswers,setSubmitted,...extra,savedAt:new Date().toISOString()};
    saveJson(UI_KEY, state);
  }
  function restoreUi() {
    const saved = loadJson(UI_KEY, null);
    if (!saved || typeof saved !== 'object') return false;
    weakLinkEnabled = saved.weakLinkEnabled !== false;
    drafts = saved.drafts && typeof saved.drafts === 'object' && !Array.isArray(saved.drafts) ? saved.drafts : {};
    setMode = saved.setMode === true;
    setIds = Array.isArray(saved.setIds) ? saved.setIds.map(String) : [];
    setAnswers = saved.setAnswers && typeof saved.setAnswers === 'object' && !Array.isArray(saved.setAnswers) ? saved.setAnswers : {};
    setSubmitted = saved.setSubmitted === true;
    setGrades = {};
    const f = saved.filters || {};
    const setIf = (id, value) => {
      const el = document.getElementById(id);
      if (el && [...el.options].some(o => o.value === value)) el.value = value;
    };
    setIf('practiceSubject', f.subject || 'all');
    populateAreas(f.area || 'all');
    setIf('practiceVersion', f.version || 'all');
    const allIds = new Set((bank.questions || []).map(q => q.questionId));
    if (setMode) {
      setIds = setIds.filter(id => allIds.has(id));
      if (setIds.length) {
        const restoredPoints = setIds.reduce((sum, id) => sum + Number(questionById(id)?.points || 0), 0);
        if (restoredPoints === EXAM_SET_POINTS) {
          order = [...setIds];
          index = Math.min(Math.max(0, Number(saved.index || 0)), Math.max(0, order.length - 1));
          if (setSubmitted) {
            for (const id of setIds) {
              const q = questionById(id);
              if (q) setGrades[id] = Engine.gradeQuestion(q, setAnswers[id] || {}, GradingEngine);
            }
          }
          return true;
        }
      }
      setMode = false; setIds = []; setSubmitted = false; setAnswers = {}; setGrades = {};
    }
    const base = Engine.filterQuestions(bank.questions, currentFilters());
    const validIds = new Set(base.map(q => q.questionId));
    order = Array.isArray(saved.order) ? saved.order.filter(id => validIds.has(id)) : [];
    base.forEach(q => { if (!order.includes(q.questionId)) order.push(q.questionId); });
    index = Math.min(Math.max(0, Number(saved.index || 0)), Math.max(0, order.length - 1));
    return true;
  }

  function scopesFor(q) {
    return Engine.questionScopes ? Engine.questionScopes(q) : (Array.isArray(q?.curriculumScopes) ? q.curriculumScopes : []);
  }

  function populateAreas(preferred = 'all') {
    const select = document.getElementById('practiceArea');
    if (!select) return;
    const subject = document.getElementById('practiceSubject')?.value || 'all';
    const present = new Set(bank.questions.flatMap(q => scopesFor(q)
      .filter(scope => subject === 'all' || scope.subject === subject)
      .map(scope => scope.area))
      .filter(area => area && area !== '과목 공통'));
    let areas;
    if (subject !== 'all' && areaOrderBySubject[subject]) {
      areas = areaOrderBySubject[subject].filter(area => present.has(area));
      // 향후 교육과정 데이터에 새 영역이 추가되어도 누락되지 않도록 미등록 영역만 뒤에 붙인다.
      [...present].forEach(area => { if (!areas.includes(area)) areas.push(area); });
    } else {
      // 전체 과목에서는 과목의 공식 순서를 차례로 합치고, 동명 영역은 한 번만 보여 준다.
      areas = [];
      Object.keys(areaOrderBySubject).forEach(key => areaOrderBySubject[key].forEach(area => {
        if (present.has(area) && !areas.includes(area)) areas.push(area);
      }));
      [...present].forEach(area => { if (!areas.includes(area)) areas.push(area); });
    }
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
    button.disabled = setMode;
  }

  function setAnsweredQuestionCount() {
    return setIds.filter(id => {
      const q = questionById(id);
      const answers = setAnswers[id] || {};
      return q && q.tasks.some(task => String(answers[task.id] || '').trim());
    }).length;
  }

  function setScore() {
    const grades = Object.values(setGrades || {});
    return grades.reduce((acc, grade) => ({earned:acc.earned + Number(grade?.earned || 0), total:acc.total + Number(grade?.total || 0)}), {earned:0,total:0});
  }

  function setPointTotal(ids = setIds) {
    return (ids || []).reduce((sum, id) => sum + Number(questionById(id)?.points || 0), 0);
  }

  function syncSetControls() {
    const setButton = document.getElementById('practiceSetButton');
    const submitButton = document.getElementById('practiceSetSubmitButton');
    const status = document.getElementById('practiceSetStatus');
    const shuffleButton = document.getElementById('practiceShuffleButton');
    const subject = document.getElementById('practiceSubject');
    const area = document.getElementById('practiceArea');
    const version = document.getElementById('practiceVersion');
    if (setButton) {
      setButton.textContent = setMode ? '세트 종료' : `실전 세트 ${EXAM_SET_POINTS}점`;
      setButton.classList.toggle('active', setMode);
      setButton.setAttribute('aria-pressed', setMode ? 'true' : 'false');
    }
    if (submitButton) {
      submitButton.classList.toggle('hidden', !setMode);
      submitButton.disabled = !setMode || setSubmitted;
      submitButton.textContent = setSubmitted ? '제출 완료' : '세트 제출';
    }
    if (shuffleButton) shuffleButton.disabled = setMode;
    [subject,area,version].forEach(el => { if (el) el.disabled = setMode; });
    if (status) {
      if (!setMode) status.textContent = setNotice;
      else if (!setSubmitted) status.textContent = `답안 작성 ${setAnsweredQuestionCount()}/${setIds.length}문항 · 총 ${setPointTotal()}점 · 마지막에 일괄 채점`;
      else { const score = setScore(); status.textContent = `세트 점수 ${score.earned}/${score.total}점`; }
    }
  }

  function toggleWeakLink() {
    if (setMode) return;
    weakLinkEnabled = !weakLinkEnabled;
    syncWeakLinkButton();
    rebuild({keepCurrent:true, shuffle:weakLinkEnabled});
  }

  function rebuild({keepCurrent=false, shuffle=false} = {}) {
    if (setMode) return;
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
    const validIds = new Set((bank.questions || []).map(q => q.questionId));
    const current = Object.entries(stats.questions || {}).filter(([id]) => validIds.has(id));
    const total = current.reduce((sum,[,item]) => sum + Number(item?.attempts || 0), 0);
    const perfect = current.reduce((sum,[,item]) => sum + Number(item?.perfect || 0), 0);
    const seen = current.filter(([,item]) => Number(item?.attempts || 0) > 0).length;
    const text = document.getElementById('practiceStats');
    if (text) text.textContent = `풀이 ${total}회 · 경험 ${seen}/${bank.questions.length}문항`;
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
    if (count) count.textContent = setMode ? `실전 세트 · ${setPointTotal()}점 · ${order.length}문항` : `${order.length}문항`;
    syncSetControls();
    if (!order.length) { renderEmpty(); return; }
    const q = currentQuestion();
    if (!q) { renderEmpty(); return; }
    const progress = document.getElementById('practiceProgress');
    if (progress) progress.textContent = `${index + 1} / ${order.length}`;
    const prev = document.getElementById('practicePrevButton');
    const next = document.getElementById('practiceNextButton');
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= order.length - 1;

    const scopeBadges = scopesFor(q).map(scope => `${subjectLabels[scope.subject] || scope.subject} · ${scope.area}`);
    const score = Number(q.points || (q.tasks || []).reduce((sum, task) => sum + Number(task.points || 0), 0));
    const badges = [
      ...scopeBadges,
      `${score}점`,
      q.comparison2015 ? '15·22 비교' : '2022 개정'
    ];
    const qStat = stats.questions?.[q.questionId] || {};
    const priority = currentQuestionPriority(q);
    const linkedHint = weakLinkEnabled && priority > 0.05 ? `<span class="practice-linked-priority" title="원문·과목/영역·공식 원문 층위의 누적 취약도를 반영한 출제 우선도">취약 연동 ${priority.toFixed(1)}</span>` : '';
    const prior = qStat.attempts ? `<span class="practice-prior">이전 최고 ${Number(qStat.bestScore || 0)}/${Number(qStat.maxScore || 0)}점 · ${qStat.attempts}회</span>` : '';
    const taskHtml = q.tasks.map((task, i) => {
      const multiline = Number(task.points || 0) >= 2 || String(task.prompt || '').length > 38;
      const readonly = setMode && setSubmitted ? ' readonly' : '';
      const input = multiline
        ? `<textarea class="practice-answer" data-task-id="${escapeHtml(task.id)}" rows="3" placeholder="답안을 입력하세요." aria-label="${escapeHtml(task.prompt)}"${readonly}></textarea>`
        : `<input class="practice-answer" data-task-id="${escapeHtml(task.id)}" type="text" autocomplete="off" spellcheck="false" placeholder="답안을 입력하세요." aria-label="${escapeHtml(task.prompt)}"${readonly}>`;
      return `<div class="practice-task">
        <div class="practice-task-head"><span class="practice-task-num">${String.fromCharCode(97+i)}.</span><strong>${escapeHtml(task.prompt)}</strong><span>${Number(task.points || 0)}점</span></div>
        ${input}<div class="practice-task-feedback" data-feedback-for="${escapeHtml(task.id)}"></div>
      </div>`;
    }).join('');
    const validation = q.comparison2015
      ? '<span class="practice-validation ready">전환근거 검수</span>'
      : '<span class="practice-validation ready">실전형 검수완료</span>';
    const actionHtml = setMode
      ? (setSubmitted
        ? `<span class="practice-set-note">세트 제출 답안입니다.</span><button class="btn" type="button" onclick="openPracticeSource()">근거 원문 보기</button>`
        : `<span class="practice-set-note">실전 세트에서는 정답과 근거를 제출 전까지 공개하지 않습니다.</span>`)
      : `<button class="btn primary" type="button" onclick="gradePracticeQuestion()">채점</button>
        <button class="btn soft" type="button" onclick="markPracticeUnknown()">모름</button>
        <button class="btn" type="button" onclick="openPracticeSource()">근거 원문 보기</button>`;
    const area = document.getElementById('practiceQuestionArea');
    area.innerHTML = `<article class="practice-card" data-question-id="${escapeHtml(q.questionId)}">
      <div class="practice-meta-row"><div class="practice-badges">${badges.map(b => `<span>${escapeHtml(b)}</span>`).join('')}</div>${validation}</div>
      <div class="practice-id-row"><span>${escapeHtml(q.questionId)}</span>${prior}${linkedHint}</div>
      <div class="practice-stem">${renderExamText(q.stem)}</div>
      <div class="practice-tasks">${taskHtml}</div>
      <div class="practice-actions">${actionHtml}</div>
      <section id="practiceExplanation" class="practice-explanation hidden" aria-live="polite"></section>
    </article>`;
    restoreDraft(q);
    bindAnswerKeys();
    graded = false; lastGrade = null; lastGradeSignature = '';
    if (setMode && setSubmitted && setGrades[q.questionId]) renderStoredSetGrade(q, setGrades[q.questionId]);
    syncWeakLinkButton();
    syncSetControls();
    persistUi();
  }

  function bindAnswerKeys() {
    document.querySelectorAll('.practice-answer').forEach(input => {
      input.addEventListener('keydown', event => {
        if (setMode) {
          if (!setSubmitted && (event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); submitSet(); }
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); grade(); }
        else if (input.tagName === 'INPUT' && event.key === 'Enter') { event.preventDefault(); grade(); }
      });
      input.addEventListener('input', scheduleDraftPersist);
      input.addEventListener('blur', () => { captureCurrentDraft(); persistUi(); syncSetControls(); });
    });
  }

  function collectAnswers(q) { return collectVisibleAnswers(q); }

  function feedbackHtml(result) {
    const cls = result.status === 'correct' ? 'good' : result.status === 'near' ? 'near' : result.status === 'unknown' ? 'unknown' : 'bad';
    const unitResults = Array.isArray(result.unitResults) && result.unitResults.length
      ? result.unitResults
      : [{unit:result.unit || {}, status:result.status, earned:result.earned, points:result.points, reason:result.reason, detail:result.detail, forbidden:result.forbidden}];
    const detailHtml = unitResults.map((item, index) => {
      const unit = item.unit || {};
      let extra = '';
      if (item.reason === 'concepts' && item.detail?.missing?.length) extra = `<div class="practice-missing">빠진 핵심: ${item.detail.missing.map(escapeHtml).join(', ')}</div>`;
      if (item.reason === 'anyOf' && item.detail) extra = `<div class="practice-missing">확인된 항목 ${item.detail.foundCount}/${item.detail.need}</div>`;
      if (item.forbidden) extra = `<div class="practice-missing">혼동 주의: ${escapeHtml(item.forbidden)}</div>`;
      const label = unit.label ? escapeHtml(unit.label) : `채점 요소 ${index + 1}`;
      return `<div class="practice-unit-feedback"><div><b>${label} (${Number(item.points || 0)}점):</b> ${statusLabel(item.status)}</div>
        <div><b>정답:</b> ${escapeHtml(unit.key || '')}</div>${extra}
        <div class="practice-rationale">${escapeHtml(unit.rationale || '')}</div></div>`;
    }).join('');
    return `<div class="practice-feedback ${cls}"><strong>${statusLabel(result.status)} · ${result.earned}/${result.points}점</strong>${detailHtml}</div>`;
  }

  function renderStoredSetGrade(q, result) {
    if (!q || !result) return;
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
        <div class="practice-explanation-actions"><button class="btn soft" type="button" onclick="openPracticeExplanation()">통합 해설 보기</button></div>
        <div class="practice-source-line"><b>근거:</b> ${source} · ${q.sourceType.map(escapeHtml).join(', ')}</div>`;
    }
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
    if (setMode) return;
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
        <div class="practice-explanation-actions"><button class="btn soft" type="button" onclick="openPracticeExplanation()">통합 해설 보기</button></div>
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
    if (setMode) return;
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
    if (setMode || !order.length) return;
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
    if (!setMode && weakLinkEnabled) {
      const questions = Engine.filterQuestions(bank.questions, currentFilters());
      order = linkedOrder(questions, false);
    }
    lastGradeSignature = '';
    persistUi(); render();
  }

  function startSet() {
    if (setMode) return;
    captureCurrentDraft();
    const pool = Engine.filterQuestions(bank.questions, currentFilters());
    const availablePoints = pool.reduce((sum, q) => sum + Number(q?.points || 0), 0);
    setIds = Engine.buildExamSet ? Engine.buildExamSet(pool, {targetPoints:EXAM_SET_POINTS}) : [];
    if (!setIds.length || setPointTotal(setIds) !== EXAM_SET_POINTS) {
      setIds = [];
      setNotice = `현재 필터의 총 배점은 ${availablePoints}점이며, ${EXAM_SET_POINTS}점 실전 세트를 정확히 구성할 수 없습니다. 필터를 넓혀 주세요.`;
      syncSetControls();
      persistUi();
      return;
    }
    setNotice = '';
    setAnswers = {};
    setGrades = {};
    setSubmitted = false;
    setMode = true;
    order = [...setIds];
    index = 0;
    graded = false; lastGrade = null; lastGradeSignature = '';
    persistUi(); render();
  }

  function endSet() {
    if (!setMode) return;
    setNotice = '';
    captureCurrentDraft();
    setMode = false;
    setIds = [];
    setAnswers = {};
    setGrades = {};
    setSubmitted = false;
    filtered = Engine.filterQuestions(bank.questions, currentFilters());
    order = linkedOrder(filtered, false);
    index = 0;
    persistUi(); render();
  }

  function toggleSet() {
    if (setMode) endSet();
    else startSet();
  }

  function submitSet() {
    if (!setMode || setSubmitted || !setIds.length) return;
    captureCurrentDraft();
    const grades = {};
    for (const id of setIds) {
      const q = questionById(id);
      if (!q) continue;
      const gradeResult = Engine.gradeQuestion(q, setAnswers[id] || {}, GradingEngine);
      grades[id] = gradeResult;
      recordGrade(q, gradeResult);
      bridge()?.recordGrade?.(q, gradeResult);
    }
    setGrades = grades;
    setSubmitted = true;
    persistUi();
    render();
  }

  function locateSource(q) {
    const data = root.CURRILOOP_CURRICULUM_DATA || {};
    const data2015 = root.CURRILOOP_CURRICULUM_2015?.subjects || {};
    const wanted = Array.isArray(q?.sourceIds) ? q.sourceIds : [];
    const scanArea = (subjectKey, areaName) => {
      const groups = data?.[subjectKey]?.[areaName];
      if (!groups) return null;
      for (const [groupKey, sections] of Object.entries(groups)) {
        if (!Array.isArray(sections)) continue;
        for (const section of sections) for (const line of section.lines || []) {
          if (!wanted.includes(line.id)) continue;
          const mappedGroup = groupKey === 'achievement' ? 'achievement' : groupKey === 'teaching-evaluation' ? 'teaching-evaluation' : groupKey === 'character-goal' ? 'character-goal' : 'content-system';
          return {id:line.id, subject:subjectKey, area:areaName, group:mappedGroup};
        }
      }
      return null;
    };
    const subjects = Array.isArray(q.subjects) ? q.subjects : [q.subject].filter(Boolean);
    const areas = Array.isArray(q.areas) ? q.areas : [q.area].filter(Boolean);
    for (const subjectKey of subjects) {
      for (const preferredArea of areas) {
        const preferred = scanArea(subjectKey, preferredArea);
        if (preferred) return preferred;
      }
      for (const areaName of Object.keys(data?.[subjectKey] || {})) {
        const found = scanArea(subjectKey, areaName);
        if (found) return found;
      }
    }
    for (const [subjectKey, subject] of Object.entries(data2015)) {
      for (const [areaName, groups] of Object.entries(subject || {})) {
        for (const [groupKey, sections] of Object.entries(groups || {})) {
          if (!Array.isArray(sections)) continue;
          for (const section of sections) for (const line of section.lines || []) {
            if (wanted.includes(line.id)) return {id:line.id, subject:subjectKey, area:areaName, group:groupKey};
          }
        }
      }
    }
    return {id:wanted[0] || '', subject:subjects[0] || '', area:areas[0] || '', group:'achievement'};
  }

  function openSource() {
    if (setMode && !setSubmitted) return;
    const q = currentQuestion();
    if (!q) return;
    if (root.CurriLoopSourceModal?.openIds) {
      const scopes = scopesFor(q);
      root.CurriLoopSourceModal.openIds(q.sourceIds || [], {
        title:'근거 원문 보기',
        meta:[q.questionId, ...scopes.map(scope => `${subjectLabels[scope.subject] || scope.subject} · ${scope.area}`)].filter(Boolean).join(' · '),
        subject:scopes[0]?.subject || '',
        note:q.comparison2015
          ? '강조된 문장은 2015·2022 개정의 직접 비교 근거입니다. 2015 자료는 v7.4 전환 참조 corpus의 내용 체계 및 비교형 기출에 필요한 성취기준·해설 범위를 표시합니다.'
          : '강조된 문장이 이 문제의 2022 개정 직접 근거입니다. 팝업을 닫으면 작성 중인 답안과 문제 위치가 그대로 유지됩니다.'
      });
    }
  }


  function openExplanation() {
    if (setMode && !setSubmitted) return;
    const q = currentQuestion();
    if (!q || !graded && !setSubmitted) return;
    const backdrop = document.getElementById('practiceExplanationModalBackdrop');
    const title = document.getElementById('practiceExplanationModalTitle');
    const meta = document.getElementById('practiceExplanationModalMeta');
    const body = document.getElementById('practiceExplanationModalBody');
    if (!backdrop || !title || !meta || !body) return;
    const result = setMode ? setGrades?.[q.questionId] : lastGrade;
    const earned = Number(result?.earned || 0);
    const total = Number(result?.total || q.points || 0);
    const detail = q.explanationDetail || {};
    const scored = new Map();
    (result?.results || []).forEach(taskResult => (taskResult?.unitResults || []).forEach(unitResult => {
      if (unitResult?.unit?.unitId) scored.set(unitResult.unit.unitId, unitResult);
    }));
    const unitHtml = (q.answerUnits || []).map((unit, idx) => {
      const unitResult = scored.get(unit.unitId);
      const status = unitResult?.status || 'unknown';
      const earnedUnit = Number(unitResult?.earned || 0);
      return `<section class="practice-explanation-unit">
        <div class="practice-explanation-unit-head"><strong>${idx+1}. ${escapeHtml(unit.label || `채점 요소 ${idx+1}`)}</strong><span>${earnedUnit}/1점 · ${escapeHtml(statusLabel(status))}</span></div>
        <div class="practice-explanation-answer"><b>정답</b> ${escapeHtml(unit.key || '')}</div>
        <p>${escapeHtml(unit.rationale || '')}</p>
      </section>`;
    }).join('');
    const sourceTypes = [...new Set(q.sourceType || [])].map(escapeHtml).join(' · ');
    const sourceIds = (q.sourceIds || []).map(id => `<code>${escapeHtml(id)}</code>`).join(' ');
    title.textContent = `${q.questionId} 통합 해설`;
    meta.textContent = `${earned}/${total}점 · ${(q.curriculumScopes || []).map(scope => `${subjectLabels[scope.subject] || scope.subject} · ${scope.area}`).join(' / ')}`;
    body.innerHTML = `<section class="practice-explanation-summary"><h3>해결 흐름</h3><p>${escapeHtml(q.explanation || '')}</p></section>
      <section class="practice-explanation-scoreguide"><h3>1점 단위 채점 기준</h3>${unitHtml}</section>
      <section class="practice-explanation-note"><h3>교육과정 근거</h3><p>${sourceTypes || '공식 원문'}</p><div class="practice-source-line">${sourceIds}</div><div class="practice-explanation-actions"><button class="btn" type="button" onclick="closePracticeExplanation(); openPracticeSource();">근거 원문 열기</button></div></section>
      ${detail.examPoint ? `<section class="practice-explanation-note"><h3>임용형 포인트</h3><p>${escapeHtml(detail.examPoint)}</p></section>` : ''}
      ${detail.watchOut ? `<section class="practice-explanation-note"><h3>혼동 주의</h3><p>${escapeHtml(detail.watchOut)}</p></section>` : ''}`;
    backdrop.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeExplanation(event) {
    if (event && event.target && event.target.id !== 'practiceExplanationModalBackdrop') return;
    document.getElementById('practiceExplanationModalBackdrop')?.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  function onFilterChange(sourceChanged=false) {
    if (setMode) return;
    setNotice = '';
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

  root.CurriLoopPracticeUI = {init,onShow,render,rebuild,grade,markUnknown,move,shuffle,restart,openSource,openExplanation,closeExplanation,onFilterChange,toggleWeakLink,startSet,endSet,toggleSet,submitSet};
  root.onPracticeFilterChange = onFilterChange;
  root.gradePracticeQuestion = grade;
  root.markPracticeUnknown = markUnknown;
  root.previousPracticeQuestion = () => move(-1);
  root.nextPracticeQuestion = () => move(1);
  root.shufflePracticeQuestions = shuffle;
  root.restartPracticeQuestions = restart;
  root.openPracticeSource = openSource;
  root.openPracticeExplanation = openExplanation;
  root.closePracticeExplanation = closeExplanation;
  root.togglePracticeWeakLink = toggleWeakLink;
  root.togglePracticeExamSet = toggleSet;
  root.submitPracticeExamSet = submitSet;
})(typeof globalThis !== 'undefined' ? globalThis : window);

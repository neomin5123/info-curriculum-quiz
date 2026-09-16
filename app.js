"use strict";
// -------------------------
  // 1) 과목 / 영역 목록
  // -------------------------
  const subjectAreas = {
    "middle-info": ["컴퓨팅 시스템", "데이터", "알고리즘과 프로그래밍", "인공지능", "디지털 문화"],
    "high-info": ["컴퓨팅 시스템", "데이터", "알고리즘과 프로그래밍", "인공지능", "디지털 문화"],
    "ai-basic": ["인공지능의 이해", "인공지능과 학습", "인공지능의 사회적 영향", "인공지능 프로젝트"],
    "data-science": ["데이터 과학의 이해", "데이터 준비와 분석", "데이터 모델링과 평가", "데이터 과학 프로젝트"],
    "software-life": ["세상을 변화시키는 소프트웨어", "창작을 지원하는 소프트웨어", "현상을 분석하는 소프트웨어", "모의 실험하는 소프트웨어", "가치를 창출하는 소프트웨어"],
    "info-science": ["프로그래밍", "데이터 구조", "알고리즘", "정보과학 프로젝트"]
  };

  const subjectLabels = {
    "all":"전체",
    "middle-info":"중학교 정보", "high-info":"고등학교 정보", "ai-basic":"인공지능 기초",
    "data-science":"데이터 과학", "software-life":"소프트웨어와 생활", "info-science":"정보과학"
  };

  // -------------------------
  // 2) 교육과정 데이터
  // line(text, 핵심 키워드, 정밀 키워드)
  // 기존 핵심·정밀·야~호!는 그대로 유지하고, 실전은 수동 빈칸 후보를 학습 이력에 따라 회전시킨다.
  // -------------------------

  const subjectSourceMeta = {
    "middle-info": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 공통 교육과정 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "high-info": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 일반 선택 과목 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "ai-basic": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 진로 선택 과목 인공지능 기초", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "data-science": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 진로 선택 과목 데이터 과학", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "software-life": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 융합 선택 과목 소프트웨어와 생활", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "info-science": {book:"별책20", label:"2022 개정 [별책20] 과학 계열 선택 과목 교육과정 · 정보과학", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="}
  };

  const SHUFFLE_SESSION_KEY = "curriloop-shuffle-bags-v1";
  function loadShuffleBags() {
    try { return JSON.parse(sessionStorage.getItem(SHUFFLE_SESSION_KEY) || "{}") || {}; }
    catch { return {}; }
  }
  function saveShuffleBags() {
    try { sessionStorage.setItem(SHUFFLE_SESSION_KEY, JSON.stringify(shuffleBags)); } catch {}
  }

  const curriculumData = window.CURRILOOP_CURRICULUM_DATA;
  const generalBank = window.CURRILOOP_GENERAL_BANK;
  const COMMON_AREA = window.CURRILOOP_COMMON_AREA || "과목 공통";
  const SUBJECT_GROUPS = ["character-goal", "content-system", "achievement", "teaching-evaluation"];
  const groupLabels = {
    "character-goal":"성격·목표",
    "content-system":"내용 체계",
    "achievement":"성취기준",
    "teaching-evaluation":"교수학습·평가"
  };

  // -------------------------
  // 4) 상태
  // -------------------------
  let currentTab = "general";
  let currentAreaIndex = 0;
  let currentRandomUnit = null;
  let studyMode = "original"; // original | mask | trace | fill
  let lastStudyFocus = null; // {sectionIndex, lineIndex}
  const fieldState = {}; // key -> {value,status}
  const shuffleBags = loadShuffleBags();
  let generalIndex = 0;
  let generalGraded = false;
  let generalLastGradedValue = "";
  let generalCorrectCounted = false;
  let generalWrongCounted = false;
  let generalUnknownCounted = false;
  let generalShuffleState = null;
  let reviewQueue = [];
  let reviewPosition = -1;
  let reviewActive = false;
  let activeReviewConceptKey = null;
  let reviewGraded = false;
  let reviewLastStatus = "";
  let pendingServiceWorker = null;
  let storageWarningShown = false;
  const APP_VERSION = "6.9.0";
  const MANUAL_GAP_REVIEW = "2026-09-16 / v6.9.0 채점·복습 정제: 핵심 행동어 엄격화, 모름 분리, 3세트 기출 체크, 해설·적용 고려사항 강도 차등";
  let gradingEventSerial = 0;
  let statePersistenceReady = false;

  const LearningEngine = window.CurriLoopLearningEngine;
  const PracticalEngine = window.CurriLoopPracticalEngine;
  const GradingEngine = window.CurriLoopGradingEngine;
  const ReviewEngine = window.CurriLoopReviewEngine;
  const HistoryEngine = window.CurriLoopHistoryEngine;
  const StorageEngine = window.CurriLoopStorageEngine;
  if (!LearningEngine || !PracticalEngine || !GradingEngine || !ReviewEngine || !HistoryEngine || !StorageEngine) throw new Error("CurriLoop 학습 엔진 모듈을 불러오지 못했습니다.");

  const PRACTICAL_STATS_KEY = "curriloop-practical-stats-v1";
  const PRACTICAL_RETRY_KEY = "curriloop-practical-retry-v2";
  const DAILY_REVIEW_PLAN_KEY = "curriloop-daily-review-plan-v1";
  const GRADING_OVERRIDE_KEY = "curriloop-grading-overrides-v1";
  const PRACTICAL_EXAM_PROGRESS_KEY = "curriloop-practical-exam-progress-v1";
  const practicalComboCache = new Map();
  const practicalPresentationTokens = new Map();
  let practicalPresentationSerial = 0;
  let practicalGradeSerial = 0; // v6.8.0부터 채점 빈칸 수가 아니라 완료한 실전 문장 수
  let practicalRetryQueue = [];
  let activePracticalRetry = null;
  const practicalCompletedLineTokens = new Set();
  let activePracticalExamChallenge = null;
  let practicalExamOfferedSetKey = "";
  const practicalCountedCompletedSets = new Set();
  let practicalSetRecoveryCount = 0;
  let practicalSummaryUnitKey = "";

  // -------------------------
  // 5) 공통 유틸
  // -------------------------
  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\s,.;:!?·ㆍ・∙‧⋅\-_/()\[\]{}'"“”‘’]+/g, "")
      .trim();
  }

  function makeGradingEventToken(scope, conceptKey, signature) {
    gradingEventSerial += 1;
    return `${scope}|${Date.now()}|${gradingEventSerial}|${stableHash(`${conceptKey}|${signature}`)}`;
  }

  function showTab(tab) {
    currentTab = tab;

    const pages = {
      general: document.getElementById("generalPage"),
      subject: document.getElementById("subjectPage"),
      history: document.getElementById("historyPage")
    };

    const tabs = {
      general: document.getElementById("generalTab"),
      subject: document.getElementById("subjectTab"),
      history: document.getElementById("historyTab")
    };

    Object.entries(pages).forEach(([key, page]) => {
      page.classList.toggle("hidden", key !== tab);
    });

    Object.entries(tabs).forEach(([key, button]) => {
      const selected = key === tab;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
    });

    if (tab === "subject") {
      renderStudy();
      requestAnimationFrame(updateStickyMetrics);
      requestAnimationFrame(maybeShowPracticalRetry);
    } else {
      hidePracticalRetryPanel();
    }

    if (tab === "history") {
      renderHistory();
    }
    scheduleStateSave();
  }

  function goHome() {
    showTab("general");
    requestAnimationFrame(() => window.scrollTo({top:0, left:0, behavior:"auto"}));
  }

  function getCurrentSubject() { return document.getElementById("subjectSelect").value; }
  function getCurrentGroup() { return document.getElementById("groupSelect").value; }
  function getCurrentDifficulty() { return document.getElementById("difficultySelect").value; }
  function getStudyMode() { return studyMode; }
  function isInputStudyMode(mode = studyMode) { return mode === "fill" || mode === "trace"; }
  function isScoredStudyMode(mode = studyMode) { return mode === "fill"; }

  function areasForSubject(subject, group = getCurrentGroup()) {
    const regular = subjectAreas[subject] || [];
    if (group === "character-goal" || group === "teaching-evaluation") return curriculumData[subject]?.[COMMON_AREA] ? [COMMON_AREA] : [];
    if (group === "content-system" || group === "achievement") return [...regular];
    return curriculumData[subject]?.[COMMON_AREA] ? [COMMON_AREA, ...regular] : [...regular];
  }

  function getAllUnits(group = getCurrentGroup()) {
    return Object.keys(subjectAreas).flatMap(subject =>
      areasForSubject(subject, group).map(area => ({ subject, area }))
    );
  }

  function encodeUnit(subject, area) {
    return `unit::${subject}::${area}`;
  }

  function decodeUnit(value) {
    if (!value || !value.startsWith("unit::")) return null;
    const [, subject, ...areaParts] = value.split("::");
    return { subject, area: areaParts.join("::") };
  }


  function unitKey(unit) {
    return `${unit.subject}::${unit.area}`;
  }

  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function chooseRandomUnit() {
    const subject = getCurrentSubject();
    const group = getCurrentGroup();
    let pool = subject === "all"
      ? getAllUnits(group)
      : areasForSubject(subject, group).map(area => ({ subject, area }));

    const bagKey = `${subject}|${group}`;
    const validKeys = new Set(pool.map(unitKey));

    let bag = (shuffleBags[bagKey] || []).filter(key => validKeys.has(key));
    if (!bag.length) {
      bag = shuffleArray(pool.map(unitKey));

      // 새 회차 첫 단원이 직전 단원과 같으면 가능한 경우 뒤로 보낸다.
      const previousKey = currentRandomUnit ? unitKey(currentRandomUnit) : null;
      if (bag.length > 1 && previousKey && bag[bag.length - 1] === previousKey) {
        [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
      }
    }

    const pickedKey = bag.pop();
    shuffleBags[bagKey] = bag;
    saveShuffleBags();

    currentRandomUnit = pool.find(unit => unitKey(unit) === pickedKey) || pool[0] || null;
    currentAreaIndex = 0;
  }

  function getUnitSequence() {
    const subject = getCurrentSubject();
    const group = getCurrentGroup();
    const selectedArea = document.getElementById("areaSelect").value;

    if (selectedArea === "random") {
      if (!currentRandomUnit) chooseRandomUnit();
      return currentRandomUnit ? [currentRandomUnit] : [];
    }

    const decoded = decodeUnit(selectedArea);
    if (decoded) return [decoded];

    if (subject === "all") return getAllUnits(group);

    const areas = areasForSubject(subject, group);
    if (selectedArea === "all") return areas.map(area => ({ subject, area }));
    return selectedArea ? [{ subject, area: selectedArea }] : [];
  }

  function getCurrentUnit() {
    const sequence = getUnitSequence();
    if (!sequence.length) return { subject: "", area: "" };
    currentAreaIndex = Math.max(0, Math.min(currentAreaIndex, sequence.length - 1));
    return sequence[currentAreaIndex];
  }


  function onSubjectChange() {
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    currentAreaIndex = 0;
    currentRandomUnit = null;
    fillAreaSelect();
    renderStudy();
    scheduleStateSave();
  }


  function fillAreaSelect() {
    const select = document.getElementById("areaSelect");
    const subject = getCurrentSubject();
    const groupKey = getCurrentGroup();
    const previous = select.value;

    select.innerHTML = "";

    const all = document.createElement("option");
    all.value = "all";
    all.textContent = groupKey === "character-goal" || groupKey === "teaching-evaluation" ? "전체 과목" : "전체 단원";
    select.appendChild(all);

    const random = document.createElement("option");
    random.value = "random";
    random.textContent = groupKey === "character-goal" || groupKey === "teaching-evaluation" ? "랜덤 과목" : "랜덤 단원";
    select.appendChild(random);

    if (subject === "all") {
      Object.keys(subjectAreas).forEach(subjectKey => {
        const areas = areasForSubject(subjectKey, groupKey);
        if (!areas.length) return;
        const optgroup = document.createElement("optgroup");
        optgroup.label = subjectLabels[subjectKey];
        areas.forEach(area => {
          const op = document.createElement("option");
          op.value = encodeUnit(subjectKey, area);
          op.textContent = area === COMMON_AREA ? `${subjectLabels[subjectKey]} · 과목 공통` : `${subjectLabels[subjectKey]} · ${area}`;
          optgroup.appendChild(op);
        });
        select.appendChild(optgroup);
      });
    } else {
      areasForSubject(subject, groupKey).forEach(area => {
        const op = document.createElement("option");
        op.value = area;
        op.textContent = area;
        select.appendChild(op);
      });
    }

    const optionValues = [...select.options].map(o => o.value);
    select.value = optionValues.includes(previous) ? previous : "all";
  }

  function onAreaChange() {
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    currentAreaIndex = 0;

    if (document.getElementById("areaSelect").value === "random") {
      chooseRandomUnit();
    } else {
      currentRandomUnit = null;
    }

    renderStudy();
    scheduleStateSave();
  }

  function onGroupChange() {
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    currentAreaIndex = 0;
    currentRandomUnit = null;
    fillAreaSelect();
    renderStudy();
    scheduleStateSave();
  }

  function onDifficultyChange() {
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    hidePracticalRetryPanel();
    const focusSnapshot = lastStudyFocus ? {...lastStudyFocus} : null;
    renderStudy();

    if (isInputStudyMode() && focusSnapshot) {
      requestAnimationFrame(() => focusMatchingLine(focusSnapshot));
    }
    scheduleStateSave();
  }

  function moveUnit(delta) {
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    if (document.getElementById("areaSelect").value === "random") {
      if (delta > 0) {
        chooseRandomUnit();
        renderStudy();
        if (isInputStudyMode()) requestAnimationFrame(() => focusFirstEmpty());
      }
      return;
    }
    const sequence = getUnitSequence();
    currentAreaIndex = Math.max(0, Math.min(sequence.length - 1, currentAreaIndex + delta));
    renderStudy();
    if (isInputStudyMode()) requestAnimationFrame(() => focusFirstEmpty());
    scheduleStateSave();
  }

  function setStudyMode(mode) {
    if (!["original", "mask", "trace", "fill"].includes(mode)) return;

    if (document.getElementById("areaSelect").value === "random" && !currentRandomUnit) {
      chooseRandomUnit();
    }

    studyMode = mode;
    renderStudy();

    if (isInputStudyMode()) {
      if (window.matchMedia("(max-width: 720px)").matches) toggleMobileSettings(true);
      requestAnimationFrame(() => focusFirstEmpty());
    }
    scheduleStateSave();
  }

  function clearCurrentUnitState(mode = studyMode) {
    const unit = getCurrentUnit();
    if (!unit.subject || !unit.area) return;
    const difficulty = getCurrentDifficulty();
    const selectedGroup = getCurrentGroup();
    const groups = selectedGroup === "all"
      ? (unit.area === COMMON_AREA ? ["character-goal", "teaching-evaluation"] : ["content-system", "achievement"])
      : [selectedGroup];
    const basePrefixes = groups.map(group => [unit.subject, unit.area, group, difficulty].join("|") + "|");
    const tracePrefixes = basePrefixes.map(prefix => `trace|${prefix}`);

    Object.keys(fieldState).forEach(key => {
      if (mode === "trace") {
        if (tracePrefixes.some(prefix => key.startsWith(prefix))) delete fieldState[key];
      } else if (mode === "fill") {
        if (basePrefixes.some(prefix => key.startsWith(prefix))) delete fieldState[key];
      }
    });
  }

  function updateStudyControls() {
    const modeButtons = {
      original: document.getElementById("originalButton"),
      mask: document.getElementById("maskButton"),
      trace: document.getElementById("traceButton"),
      fill: document.getElementById("fillButton")
    };
    Object.entries(modeButtons).forEach(([mode, button]) => {
      if (!button) return;
      const active = studyMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const gradeButton = document.getElementById("gradeAllButton");
    const resetButton = document.getElementById("resetUnitButton");
    const nextPracticalButton = document.getElementById("nextPracticalSetButton");
    const score = document.getElementById("scoreText");
    if (gradeButton) gradeButton.classList.toggle("hidden", studyMode !== "fill");
    if (resetButton) resetButton.classList.toggle("hidden", !isInputStudyMode());
    if (nextPracticalButton && !(studyMode === "fill" && getCurrentDifficulty() === "practical")) nextPracticalButton.classList.add("hidden");
    if (score) score.classList.toggle("hidden-mode-score", studyMode !== "fill");
  }

  function getUnitData(subject, area, group) {
    const unit = curriculumData[subject]?.[area];
    if (!unit) return [];
    const tagged = (sections, sourceGroup) => (sections || []).map(section => ({
      ...section,
      _sourceGroup: sourceGroup,
      lines: (section.lines || []).map(line => ({...line, _sourceGroup: sourceGroup, _sectionTitle: section.title || ""}))
    }));
    if (group === "all") {
      if (area === COMMON_AREA) return [
        ...tagged(unit["character-goal"], "character-goal"),
        ...tagged(unit["teaching-evaluation"], "teaching-evaluation")
      ];
      return [
        ...tagged(unit["content-system"], "content-system"),
        ...tagged(unit.achievement, "achievement")
      ];
    }
    return tagged(unit[group], group);
  }

  function stableHash(value) {
    let hash = 2166136261;
    const str = String(value || "");
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function makeLineStableId(sectionTitle, lineText, explicitId = "") {
    return explicitId || `${stableHash(sectionTitle)}-${stableHash(lineText)}`;
  }

  function loadPracticalStats() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PRACTICAL_STATS_KEY) || "{}");
      const stats = parsed && typeof parsed === "object" ? parsed : {};
      stats.targets = stats.targets && typeof stats.targets === "object" ? stats.targets : {};
      stats.lines = stats.lines && typeof stats.lines === "object" ? stats.lines : {};
      // v1은 화면 노출도 shown으로 세었다. v2부터 실제 제출만, v3부터 모름을 오답과 분리한다.
      if (Number(stats._version || 0) < 3) {
        Object.values(stats.targets).forEach(stat => {
          if (!stat || typeof stat !== "object") return;
          stat.unknown = Number(stat.unknown || 0);
          stat.shown = Number(stat.correct || 0) + Number(stat.wrong || 0) + Number(stat.near || 0) + stat.unknown;
          if (!Array.isArray(stat.successDays)) stat.successDays = [];
        });
        stats._version = 3;
        try { localStorage.setItem(PRACTICAL_STATS_KEY, JSON.stringify(stats)); } catch {}
      }
      return stats;
    } catch { return {_version:3, targets:{}, lines:{}}; }
  }

  const practicalStats = loadPracticalStats();

  function savePracticalStats() {
    safeSetLocalStorage(PRACTICAL_STATS_KEY, JSON.stringify(practicalStats));
  }

  function replacePracticalStats(next = {}) {
    Object.keys(practicalStats).forEach(key => delete practicalStats[key]);
    if (next && typeof next === "object" && !Array.isArray(next)) {
      Object.entries(next).forEach(([key, value]) => { practicalStats[key] = cloneJson(value, value); });
    }
    practicalStats.targets = practicalStats.targets && typeof practicalStats.targets === "object" ? practicalStats.targets : {};
    practicalStats.lines = practicalStats.lines && typeof practicalStats.lines === "object" ? practicalStats.lines : {};
    if (Number(practicalStats._version || 0) < 3) {
      Object.values(practicalStats.targets).forEach(stat => {
        if (!stat || typeof stat !== "object") return;
        stat.unknown = Number(stat.unknown || 0);
        stat.shown = Number(stat.correct || 0) + Number(stat.wrong || 0) + Number(stat.near || 0) + stat.unknown;
        if (!Array.isArray(stat.successDays)) stat.successDays = [];
      });
      practicalStats._version = 3;
    }
    savePracticalStats();
  }

  function practicalLineKey(line) {
    const unit = getCurrentUnit();
    return `${unit.subject}|${unit.area}|${line?.id || stableHash(line?.text || "")}`;
  }

  function practicalTargetKey(line, gapId) {
    return `${practicalLineKey(line)}|${gapId}`;
  }

  // 실전 빈칸은 시험 가치 0~3으로 분류한다. 데이터에 practicalPriority가 있으면 그것을 우선하고,
  // 없으면 핵심 여부·공식 용어·행위어·문장 역할을 보수적으로 추정한다.
  function practicalEntryPriority(entry, line = null, coreLike = false) {
    const explicit = line?.practicalPriority?.[entry?.gapId] ?? line?.practicalPriority?.[entry?.answer];
    return PracticalEngine.inferPriority(entry?.answer, {
      explicitPriority: explicit,
      coreLike,
      sourceGroup: line?._sourceGroup || getCurrentGroup(),
      sectionTitle: line?._sectionTitle || "",
      lineText: line?.text || ""
    });
  }

  function isPracticalLowValueEntry(entry, line = null) {
    return practicalEntryPriority(entry, line, false) === 0;
  }

  function practicalPresentationToken(line) {
    return practicalPresentationTokens.get(practicalLineKey(line)) || "";
  }

  function rawConfiguredEntries(line, difficulty) {
    const configured = difficulty === "easy" ? (line?.easy || []) : (line?.normal || []);
    const ids = line?.gapIds?.[difficulty] || [];
    const seen = new Set();
    const entries = [];
    configured.forEach((answer, index) => {
      if (!answer || !line?.text?.includes(answer)) return;
      const key = normalize(answer);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({answer, gapId: ids[index] || `legacy-${stableHash(`${difficulty}|${line?.id || ""}|${index}`)}`});
    });
    return entries;
  }

  function practicalRenderedOccurrences(line, entries) {
    if (!entries.length) return [];
    const specs = entries.map(entry => ({...entry, aliases:[], sentence:false, compound:entry.answer.includes(" ")}));
    return findOccurrences(line.text, specs);
  }

  function practicalSelectionRendersEveryTarget(line, entries) {
    if (!entries.length) return false;
    const renderedIds = new Set(practicalRenderedOccurrences(line, entries).map(item => item.spec.gapId));
    return entries.every(entry => renderedIds.has(entry.gapId));
  }

  function practicalRenderedCharCount(line, entries) {
    return practicalRenderedOccurrences(line, entries).reduce((sum, item) => {
      const visible = line.text.slice(item.start, item.end);
      return sum + (normalize(visible).length || visible.length);
    }, 0);
  }

  function selectPracticalEntries(line) {
    const cacheKey = practicalLineKey(line);
    const cached = practicalComboCache.get(cacheKey);
    const rawNormal = rawConfiguredEntries(line, "normal");
    const rawEasy = rawConfiguredEntries(line, "easy");
    const easyTerms = rawEasy.map(entry => normalize(entry.answer));
    const source = rawNormal.length ? rawNormal : rawEasy;
    const base = source.map(entry => {
      const normalizedAnswer = normalize(entry.answer);
      const coreLike = easyTerms.some(term => term && (normalizedAnswer === term || normalizedAnswer.includes(term) || term.includes(normalizedAnswer)));
      return {...entry, coreLike, priority:practicalEntryPriority(entry, line, coreLike)};
    }).filter(entry => entry.priority > 0);
    if (!base.length) return [];

    if (cached?.length) {
      const byId = new Map(base.map(entry => [entry.gapId, entry]));
      const restored = cached.map(id => byId.get(id)).filter(Boolean);
      if (restored.length) {
        if (!practicalPresentationTokens.has(cacheKey)) practicalPresentationTokens.set(cacheKey, `p${++practicalPresentationSerial}`);
        return restored;
      }
    }

    practicalStats.targets = practicalStats.targets || {};
    practicalStats.lines = practicalStats.lines || {};
    const lineStats = practicalStats.lines[cacheKey] || {lastCombo:[], presentations:0};
    const scored = base.map(entry => {
      const key = practicalTargetKey(line, entry.gapId);
      const stat = practicalStats.targets[key] || {shown:0, correct:0, near:0, unknown:0, wrong:0, lastResult:"", successDays:[]};
      let score = PracticalEngine.scoreTarget(stat, entry.priority, {
        wasLastCombo:(lineStats.lastCombo || []).includes(entry.gapId),
        jitter:Math.random() * 0.55
      });
      // 중요도 1은 보조 후보다. 중요도 2~3이 충분하면 자연스럽게 뒤로 밀린다.
      if (entry.priority === 1) score -= 8;
      return {...entry, score};
    }).sort((a,b) => b.score - a.score);

    const statsForLine = base.map(entry => practicalStats.targets[practicalTargetKey(line, entry.gapId)] || {});
    const visibleChars = normalize(line.text).length || line.text.length || 1;
    const desired = PracticalEngine.desiredBlankCount(visibleChars, scored.length, statsForLine, {
      sourceGroup:line?._sourceGroup || getCurrentGroup(),
      sectionTitle:line?._sectionTitle || ""
    });
    const maxCoverage = PracticalEngine.coverageLimit(statsForLine);
    const maxChars = Math.max(2, Math.floor(visibleChars * maxCoverage));

    const selected = [];
    for (const entry of scored) {
      const tentative = [...selected, entry];
      if (!practicalSelectionRendersEveryTarget(line, tentative)) continue;
      if (practicalRenderedCharCount(line, tentative) > maxChars) continue;
      selected.push(entry);
      if (selected.length >= desired) break;
    }
    if (!selected.length) {
      const fallback = scored.find(entry => practicalRenderedCharCount(line, [entry]) <= maxChars) ||
        scored.slice().sort((a,b) => practicalRenderedCharCount(line, [a]) - practicalRenderedCharCount(line, [b]))[0];
      selected.push(fallback);
    }

    const combo = selected.map(entry => entry.gapId);
    practicalComboCache.set(cacheKey, combo);
    practicalPresentationTokens.set(cacheKey, `p${++practicalPresentationSerial}`);
    lineStats.lastCombo = combo;
    lineStats.presentations = Number(lineStats.presentations || 0) + 1;
    practicalStats.lines[cacheKey] = lineStats;
    // shown은 여기서 올리지 않는다. 실제 답안을 제출했을 때만 기록한다.
    savePracticalStats();
    return selected;
  }

  function recordPracticalTargetResult(line, gapId, result) {
    if (!line || !gapId) return;
    practicalStats.targets = practicalStats.targets || {};
    const key = practicalTargetKey(line, gapId);
    const stat = practicalStats.targets[key] || {shown:0, correct:0, near:0, unknown:0, wrong:0, lastResult:"", successDays:[]};
    practicalStats.targets[key] = PracticalEngine.noteResult(stat, result, LearningEngine.localDayKey(Date.now()), Date.now(), true);
    practicalStats._version = 3;
    savePracticalStats();
  }

  function persistPracticalRetryState() {
    try {
      sessionStorage.setItem(PRACTICAL_RETRY_KEY, JSON.stringify({serial:practicalGradeSerial, queue:practicalRetryQueue}));
    } catch {}
  }

  function restorePracticalRetryState() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(PRACTICAL_RETRY_KEY) || "null");
      if (parsed && typeof parsed === "object") {
        practicalGradeSerial = Number(parsed.serial || 0);
        practicalRetryQueue = Array.isArray(parsed.queue) ? parsed.queue.filter(item => item && item.conceptKey && item.correctAnswer) : [];
      }
    } catch {
      practicalGradeSerial = 0; practicalRetryQueue = [];
    }
  }

  function schedulePracticalRetry(record) {
    if (!record?.conceptKey || !record?.correctAnswer) return;
    const existing = practicalRetryQueue.find(item => item.conceptKey === record.conceptKey);
    // 현재 문장을 마친 뒤 최소 3~5개의 다른 문장을 풀고 다시 만나도록 한다.
    const dueAt = practicalGradeSerial + 4 + Math.floor(Math.random() * 3);
    if (existing) {
      Object.assign(existing, record);
      existing.dueAt = Math.min(Number(existing.dueAt || dueAt), dueAt);
      if (record.retryReason !== "near") existing.queuedFailures = Number(existing.queuedFailures || 0) + 1;
    } else {
      practicalRetryQueue.push({...record, dueAt, queuedFailures:record.retryReason === "near" ? 0 : 1, retryFailures:0});
    }
    persistPracticalRetryState();
  }

  function hidePracticalRetryPanel() {
    const panel = document.getElementById("practicalRetryPanel");
    const meta = document.getElementById("practicalRetryMeta");
    if (panel) panel.classList.add("hidden");
    if (meta) meta.textContent = "";
    activePracticalRetry = null;
  }

  function focusPracticalRetryInput() {
    const panel = document.getElementById("practicalRetryPanel");
    const input = document.getElementById("practicalRetryInput");
    if (!panel || panel.classList.contains("hidden") || !input) return;
    requestAnimationFrame(() => {
      input.focus({preventScroll:true});
      input.scrollIntoView({block:"center", behavior:"smooth"});
    });
  }

  function blankNth(text, answer, occurrence = 0) {
    const source = String(text || "");
    const target = String(answer || "");
    if (!target) return source;
    let from = 0, index = -1;
    for (let i = 0; i <= occurrence; i++) {
      index = source.indexOf(target, from);
      if (index < 0) break;
      from = index + target.length;
    }
    if (index < 0) return source;
    return source.slice(0, index) + "〔　　　　〕" + source.slice(index + target.length);
  }

  function maybeShowPracticalRetry() {
    const panel = document.getElementById("practicalRetryPanel");
    if (!panel) return;
    if (currentTab !== "subject" || getCurrentDifficulty() !== "practical" || studyMode !== "fill") {
      panel.classList.add("hidden");
      return;
    }
    if (activePracticalRetry && practicalRetryQueue.includes(activePracticalRetry)) return;
    const due = practicalRetryQueue
      .filter(item => Number(item.dueAt || 0) <= practicalGradeSerial)
      .sort((a,b) => Number(a.dueAt || 0) - Number(b.dueAt || 0))[0];
    if (!due) { panel.classList.add("hidden"); return; }
    activePracticalRetry = due;
    const meta = document.getElementById("practicalRetryMeta");
    const prompt = document.getElementById("practicalRetryPrompt");
    const input = document.getElementById("practicalRetryInput");
    const feedback = document.getElementById("practicalRetryFeedback");
    if (meta) {
      const subject = due.subjectLabel || subjectLabels[due.subjectKey] || due.subjectKey || "각론";
      const area = due.area || "영역 미상";
      const group = due.groupLabel || groupLabels[due.sourceGroup || due.groupKey] || due.sourceGroup || due.groupKey || "";
      meta.textContent = [`과목: ${subject}`, `영역: ${area}`, group ? `출제 항목: ${group}` : ""].filter(Boolean).join("  ·  ");
    }
    if (prompt) prompt.textContent = blankNth(due.context || "", due.correctAnswer, Number(due.answerOccurrence || 0));
    if (input) { input.value = ""; input.classList.remove("correct","wrong","unknown"); }
    if (feedback) feedback.textContent = "아까 헷갈린 부분을 한 번만 다시 꺼내 보세요.";
    panel.classList.remove("hidden");
    focusPracticalRetryInput();
  }

  function recordPracticalRetryStat(record, result) {
    practicalStats.targets = practicalStats.targets || {};
    const key = `${record.subjectKey}|${record.area}|${record.lineId}|${record.gapId}`;
    const stat = practicalStats.targets[key] || {shown:0, correct:0, near:0, unknown:0, wrong:0, lastResult:"", successDays:[]};
    practicalStats.targets[key] = PracticalEngine.noteResult(stat, result, LearningEngine.localDayKey(Date.now()), Date.now(), true);
    practicalStats._version = 3;
    savePracticalStats();
  }

  function gradePracticalRetry() {
    const item = activePracticalRetry;
    const input = document.getElementById("practicalRetryInput");
    const feedback = document.getElementById("practicalRetryFeedback");
    if (!item || !input) return;
    const grading = classifyRawAnswerDetailed(input.value, item.correctAnswer, item.aliases || []);
    const status = grading.status;
    const signature = `${normalize(input.value) || "__blank__"}|retry|${status}`;
    const eventToken = makeGradingEventToken("practical-retry", item.conceptKey, signature);
    const masteryItem = updateMastery(item.conceptKey, status, eventToken);
    recordPracticalRetryStat(item, status);

    if (status === "correct") {
      input.classList.add("correct");
      if (feedback) feedback.textContent = "회복 완료 ✓";
      const unit = getCurrentUnit();
      if (unit.subject === item.subjectKey && unit.area === item.area) practicalSetRecoveryCount += 1;
      practicalRetryQueue = practicalRetryQueue.filter(candidate => candidate !== item);
      activePracticalRetry = null;
      persistPracticalRetryState();
      setTimeout(() => {
        hidePracticalRetryPanel();
        maybeShowPracticalRetry();
        updateScore();
        maybeOfferPracticalExamChallenge();
        focusFirstEmpty();
      }, 650);
      return;
    }

    if (status === "near") {
      input.classList.add("correct");
      item.retryReason = "near";
      item.nearReason = grading.reason;
      item.nearRetries = Number(item.nearRetries || 0) + 1;
      const capReached = item.nearRetries >= 2;
      if (capReached) practicalRetryQueue = practicalRetryQueue.filter(candidate => candidate !== item);
      else item.dueAt = practicalGradeSerial + 3;
      if (feedback) feedback.textContent = capReached
        ? `유사 답안 유예 · ${nearReasonText(grading)} · 공식 표기: ${item.correctAnswer} · 이번 세션에서는 여기까지, 다음 복습에서 정확히 확인합니다.`
        : `유사 답안 유예 · ${nearReasonText(grading)} · 공식 표기: ${item.correctAnswer} · 몇 문장 뒤 한 번 더 확인합니다.`;
      activePracticalRetry = null;
      persistPracticalRetryState();
      setTimeout(() => { hidePracticalRetryPanel(); updateScore(); maybeOfferPracticalExamChallenge(); focusFirstEmpty(); }, capReached ? 1500 : 1250);
      return;
    }

    if (status === "unknown") {
      input.classList.add("unknown");
      item.retryReason = "unknown";
      item.dueAt = practicalGradeSerial + 3;
      if (feedback) feedback.textContent = `모름 · 정답: ${item.correctAnswer} · 오답 표현으로 기록하지 않고 몇 문장 뒤 다시 확인합니다.`;
      activePracticalRetry = null;
      persistPracticalRetryState();
      setTimeout(() => { hidePracticalRetryPanel(); updateScore(); maybeOfferPracticalExamChallenge(); focusFirstEmpty(); }, 1250);
      return;
    }

    input.classList.add("wrong");
    item.retryFailures = Number(item.retryFailures || 0) + 1;
    item.userAnswer = input.value;
    item.dueAt = practicalGradeSerial + 3;
    if (Number(masteryItem?.wrongCount || 0) >= 2) {
      addWrongHistory({...item, difficultyKey:"practical", difficultyLabel:"실전", attempts:Number(masteryItem.wrongCount || 2)}, eventToken);
    }
    if (feedback) feedback.textContent = `정답: ${item.correctAnswer} · 몇 문장 뒤 다시 확인합니다.`;
    activePracticalRetry = null;
    persistPracticalRetryState();
    setTimeout(() => {
      hidePracticalRetryPanel();
      updateScore();
      maybeOfferPracticalExamChallenge();
      focusFirstEmpty();
    }, 1250);
  }

  function deferPracticalRetry() {
    if (!activePracticalRetry) return;
    activePracticalRetry.dueAt = practicalGradeSerial + 2;
    activePracticalRetry = null;
    persistPracticalRetryState();
    hidePracticalRetryPanel();
    focusFirstEmpty();
  }

  function makeStateKey(sectionIndex, lineIndex, gapIndex, lineId = "", gapId = "", answerOccurrence = 0, sourceGroup = "", mode = "fill") {
    const unit = getCurrentUnit();
    const intrinsicGroup = sourceGroup || getCurrentGroup();
    const difficulty = getCurrentDifficulty();
    let base = lineId && gapId
      ? [unit.subject, unit.area, intrinsicGroup, difficulty, lineId, gapId, answerOccurrence].join("|")
      : [unit.subject, unit.area, intrinsicGroup, difficulty, sectionIndex, lineIndex, gapIndex].join("|");
    if (difficulty === "practical" && lineId) {
      const sections = getUnitData(unit.subject, unit.area, getCurrentGroup());
      const line = sections?.[sectionIndex]?.lines?.[lineIndex];
      const token = line ? practicalPresentationToken(line) : "";
      if (token) base += `|${token}`;
    }
    return mode === "trace" ? `trace|${base}` : base;
  }

  // -------------------------
  // 6) 빈칸 생성
  // -------------------------
  // 핵심(easy)과 정밀(normal)은 각 문장에 사람이 직접 지정한 빈칸만 사용한다.
  // 자동 형태소/어간/복합어 추론은 사용하지 않는다. 구형 hard는 저장 데이터 마이그레이션에서만 처리한다.
  const SAFE_GLOBAL_ALIASES = {
    "A*": ["A-star", "A star", "A스타", "에이스타"],
    "빅오 표기법": ["Big O 표기법", "Big-O 표기법", "Big O notation"]
  };

  function getSafeAliases(answer, lineAliases = {}) {
    return [
      ...(lineAliases?.[answer] || []),
      ...(SAFE_GLOBAL_ALIASES[answer] || [])
    ];
  }

  function splitSentenceUnits(text) {
    const source = String(text || "");
    const prefixMatch = source.match(/^(\[[^\]]+\]\s*)/);
    const prefix = prefixMatch ? prefixMatch[1] : "";
    const body = prefix ? source.slice(prefix.length) : source;
    const matches = body.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const sentences = matches.map(s => s.trim()).filter(Boolean);
    return { prefix, sentences: sentences.length ? sentences : [body.trim()].filter(Boolean) };
  }

  function hasCustomYaho(line) {
    return Array.isArray(line?.yaho) && line.yaho.length > 0;
  }

  function configuredGapEntries(line, difficulty) {
    if (difficulty === "practical") return selectPracticalEntries(line);
    if (difficulty === "yaho") {
      const answers = hasCustomYaho(line) ? line.yaho : splitSentenceUnits(line.text).sentences;
      const ids = line.gapIds?.yaho || [];
      return answers
        .map((answer, index) => ({
          answer,
          gapId: ids[index] || `y${String(index + 1).padStart(2, "0")}`
        }))
        .filter(entry => entry.answer && line.text.includes(entry.answer));
    }

    return rawConfiguredEntries(line, difficulty);
  }

  function buildGapSpecs(line, difficulty) {
    return configuredGapEntries(line, difficulty)
      .map(entry => ({
        ...entry,
        sentence: difficulty === "yaho",
        aliases: getSafeAliases(entry.answer, line.aliases),
        compound: difficulty === "yaho" || entry.answer.includes(" ")
      }))
      // 겹치는 수동 빈칸 판정에서는 더 긴 의미 단위를 우선한다.
      .sort((a,b) => b.answer.length - a.answer.length);
  }

  function findOccurrences(text, specs) {
    const found = [];
    specs.forEach((spec, specIndex) => {
      let from = 0;
      while (from < text.length) {
        const idx = text.indexOf(spec.answer, from);
        if (idx < 0) break;
        found.push({start:idx, end:idx+spec.answer.length, specIndex, spec});
        from = idx + spec.answer.length;
      }
    });

    // 같은 위치에서 겹치는 수동 빈칸은 더 긴 의미 단위를 우선한다.
    // 같은 핵심어가 문장에 여러 번 등장하면 모든 비중첩 occurrence를 가린다.
    found.sort((a,b) => a.start - b.start || (b.end-b.start) - (a.end-a.start));

    const accepted = [];
    let lastEnd = -1;
    found.forEach(item => {
      if (item.start < lastEnd) return;
      accepted.push(item);
      lastEnd = item.end;
    });
    return accepted;
  }

  function normalizeTrace(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim();
  }

  function createGapInput(spec, sectionIndex, lineIndex, gapIndex, lineId = "", answerOccurrence = 0, sourceGroup = "", sectionTitle = "", mode = "fill") {
    const traceMode = mode === "trace";
    const wrap = document.createElement("span");
    wrap.className = (traceMode ? "gap-wrap trace-gap-wrap" : "gap-wrap") + (spec.sentence ? " sentence-gap-wrap" : "");

    if (traceMode) {
      const guide = document.createElement("span");
      guide.className = "trace-guide";
      guide.textContent = spec.answer;
      guide.setAttribute("aria-hidden", "true");
      wrap.appendChild(guide);
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "gap-input" + (spec.sentence ? " sentence-gap" : "");
    const inputDifficulty = getCurrentDifficulty();
    input.dataset.difficulty = inputDifficulty;
    input.dataset.learningMode = mode;
    input.dataset.answer = spec.answer;
    input.dataset.gapId = spec.gapId || `legacy-${gapIndex}`;
    input.dataset.aliases = JSON.stringify(spec.aliases || []);
    input.dataset.stateKey = makeStateKey(sectionIndex, lineIndex, gapIndex, lineId, input.dataset.gapId, answerOccurrence, sourceGroup, mode);
    input.dataset.sectionIndex = String(sectionIndex);
    input.dataset.lineIndex = String(lineIndex);
    input.dataset.gapIndex = String(gapIndex);
    input.dataset.lineId = lineId;
    input.dataset.answerOccurrence = String(answerOccurrence);
    input.dataset.sourceGroup = sourceGroup || getCurrentGroup();
    input.dataset.lineKey = lineId || `${sectionIndex}|${lineIndex}`;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.enterKeyHint = "next";
    input.setAttribute("enterkeyhint", "next");
    input.setAttribute("aria-label", `${sectionTitle || "학습"} · ${lineIndex + 1}번째 문장 · ${gapIndex + 1}번째 ${traceMode ? "따라치기" : "빈칸"}`);

    const saved = fieldState[input.dataset.stateKey];
    if (saved) {
      input.value = saved.value || "";
      if (!traceMode && saved.status === "correct") input.classList.add("correct");
      if (!traceMode && saved.status === "wrong") input.classList.add("wrong");
      if (!traceMode && saved.status === "unknown") input.classList.add("unknown");
      if (traceMode && saved.status === "trace-correct") input.classList.add("trace-correct");
      if (traceMode && saved.status === "trace-wrong") input.classList.add("trace-wrong");
    }

    let selectedAllThisFocus = false;
    let pointerFocused = false;

    const selectFilledGapText = (markSelected = true) => {
      if (!input.value) return;
      if (markSelected) selectedAllThisFocus = true;
      requestAnimationFrame(() => {
        if (document.activeElement !== input || !input.value) return;
        try { input.setSelectionRange(0, input.value.length); }
        catch { input.select?.(); }
      });
    };

    input.addEventListener("pointerdown", () => {
      pointerFocused = document.activeElement !== input;
    });

    input.addEventListener("focus", () => {
      lastStudyFocus = { sectionIndex, lineIndex };
      selectedAllThisFocus = false;
      // 마우스로 처음 진입한 경우 첫 click에서만 전체 선택한다.
      // Tab/프로그램 이동으로 진입한 경우 focus 단계에서 1회 전체 선택한다.
      if (!pointerFocused) selectFilledGapText(true);
    });

    input.addEventListener("click", () => {
      if (!input.value) {
        pointerFocused = false;
        return;
      }
      if (!selectedAllThisFocus) {
        // 첫 클릭만 전체 선택. 두 번째 클릭부터는 계속 브라우저의 클릭 위치 커서를 유지한다.
        selectFilledGapText(true);
      }
      pointerFocused = false;
    });

    input.addEventListener("blur", () => {
      pointerFocused = false;
      selectedAllThisFocus = false;
    });

    input.addEventListener("input", () => {
      const state = fieldState[input.dataset.stateKey] || {};
      state.value = input.value;
      if (state.status) delete state.status;
      delete state.lastCountedSignature;
      fieldState[input.dataset.stateKey] = state;
      scheduleStateSave();
      input.classList.remove("correct", "wrong", "unknown", "trace-correct", "trace-wrong");
      const result = wrap.querySelector(".gap-result");
      if (result) result.remove();
      input.removeAttribute("aria-describedby");
      input.removeAttribute("aria-invalid");
      updateScore();
    });

    const checkTraceAndAdvance = () => {
      const ok = normalizeTrace(input.value) === normalizeTrace(spec.answer);
      const state = fieldState[input.dataset.stateKey] || {};
      state.value = input.value;
      state.status = ok ? "trace-correct" : "trace-wrong";
      fieldState[input.dataset.stateKey] = state;
      input.classList.toggle("trace-correct", ok);
      input.classList.toggle("trace-wrong", !ok);
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      scheduleStateSave();
      if (!ok) {
        input.focus();
        selectFilledGapText(true);
        return;
      }
      requestAnimationFrame(() => advanceAfterGrade(input));
    };

    const gradeAndAdvance = () => {
      const correct = gradeOne(input); // 빈 입력은 오답 표현이 아니라 ‘모름’으로 분리한다.
      if (!correct) {
        input.focus();
        selectFilledGapText(true);
        return;
      }
      notePracticalProblemCompletion(input);
      // 복습 세션은 이제 복습 탭 안에서만 진행하므로, 과거 reviewActive 상태가 일반 학습의 Enter 이동을 막지 않는다.
      // 실전 지연 재인출이 실제로 등장한 경우에만 그 입력칸을 우선한다.
      if (activePracticalRetry) { focusPracticalRetryInput(); return; }
      requestAnimationFrame(() => advanceAfterGrade(input));
    };

    input.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.keyCode === 13) {
        event.preventDefault();
        if (traceMode) checkTraceAndAdvance();
        else gradeAndAdvance();
      }
    });

    wrap.appendChild(input);
    if (!traceMode && saved?.status) appendResult(wrap, saved.status, spec.answer);
    return wrap;
  }

  function createMaskToken(spec, sentence = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mask-token" + (sentence ? " sentence-mask" : "");
    button.textContent = spec.answer;

    const hoverReveal = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const setHiddenA11y = () => {
      button.setAttribute("aria-pressed", "false");
      if (hoverReveal()) {
        button.setAttribute("aria-label", "가린 답. 마우스를 올리면 확인");
        button.title = "마우스를 올려 정답 확인";
      } else {
        button.setAttribute("aria-label", "가린 답. 눌러서 확인");
        button.title = "눌러서 정답 확인";
      }
    };
    setHiddenA11y();

    button.addEventListener("click", () => {
      // 마우스 환경에서는 hover 동안만 일시적으로 공개한다. 클릭으로 공개 상태를 고정하지 않는다.
      if (hoverReveal()) {
        button.classList.remove("revealed");
        setHiddenA11y();
        return;
      }

      // 터치/hover 불가 환경에서는 기존처럼 탭하여 확인하고 다시 탭하여 가린다.
      const revealed = button.classList.toggle("revealed");
      button.setAttribute("aria-pressed", revealed ? "true" : "false");
      button.setAttribute("aria-label", revealed ? `정답: ${spec.answer}. 다시 누르면 가리기` : "가린 답. 눌러서 확인");
      button.title = revealed ? "다시 눌러 가리기" : "눌러서 정답 확인";
    });
    return button;
  }

  function renderMaskLine(line, sectionIndex, lineIndex, sectionTitle = "", sourceGroup = "") {
    const p = document.createElement("div");
    p.className = "line-item mask-line";
    const difficulty = getCurrentDifficulty();
    const specs = buildGapSpecs(line, difficulty);

    if (difficulty === "yaho" && !hasCustomYaho(line)) {
      const sentenceUnits = splitSentenceUnits(line.text);
      if (sentenceUnits.prefix) p.appendChild(document.createTextNode(sentenceUnits.prefix));
      specs.forEach((spec, index) => {
        if (index > 0) p.appendChild(document.createTextNode(" "));
        p.appendChild(createMaskToken(spec, true));
      });
      return p;
    }

    const occurrences = findOccurrences(line.text, specs);
    if (!occurrences.length) {
      p.textContent = line.text;
      return p;
    }

    let cursor = 0;
    occurrences.forEach(o => {
      if (o.start > cursor) p.appendChild(document.createTextNode(line.text.slice(cursor, o.start)));
      p.appendChild(createMaskToken(o.spec, Boolean(o.spec.sentence)));
      cursor = o.end;
    });
    if (cursor < line.text.length) p.appendChild(document.createTextNode(line.text.slice(cursor)));
    return p;
  }

  function renderLine(line, sectionIndex, lineIndex, sectionTitle = "", sourceGroup = "", mode = studyMode) {
    const p = document.createElement("div");
    p.className = "line-item";
    const difficulty = getCurrentDifficulty();
    const specs = buildGapSpecs(line, difficulty);
    const lineId = makeLineStableId(sectionTitle, line.text, line.id || "");

    if (difficulty === "yaho" && !hasCustomYaho(line)) {
      const sentenceUnits = splitSentenceUnits(line.text);
      if (sentenceUnits.prefix) p.appendChild(document.createTextNode(sentenceUnits.prefix));
      specs.forEach((spec, index) => {
        if (index > 0) p.appendChild(document.createTextNode(" "));
        p.appendChild(createGapInput(spec, sectionIndex, lineIndex, index, lineId, index, sourceGroup, sectionTitle, mode));
      });
      return p;
    }

    const occurrences = findOccurrences(line.text, specs);
    if (!occurrences.length) {
      p.textContent = line.text;
      return p;
    }

    let cursor = 0;
    let gapIndex = 0;
    const gapOccurrences = {};

    occurrences.forEach(o => {
      if (o.start > cursor) p.appendChild(document.createTextNode(line.text.slice(cursor, o.start)));

      const occurrenceKey = o.spec.gapId || normalize(o.spec.answer);
      const answerOccurrence = gapOccurrences[occurrenceKey] || 0;
      gapOccurrences[occurrenceKey] = answerOccurrence + 1;

      p.appendChild(createGapInput(
        o.spec,
        sectionIndex,
        lineIndex,
        gapIndex++,
        lineId,
        answerOccurrence,
        sourceGroup,
        sectionTitle,
        mode
      ));

      cursor = o.end;
    });
    if (cursor < line.text.length) p.appendChild(document.createTextNode(line.text.slice(cursor)));
    return p;
  }

  // -------------------------
  // 7) 학습 화면 렌더링
  // -------------------------
  function renderStudy() {
    const unit = getCurrentUnit();
    const subject = unit.subject;
    const area = unit.area;
    const group = getCurrentGroup();
    const sections = getUnitData(subject, area, group);
    const studyArea = document.getElementById("studyArea");
    const sequence = getUnitSequence();

    const subjectLabel = subjectLabels[subject] || "과목";
    document.getElementById("studyTitle").textContent =
      subject && area ? `${subjectLabel} · ${area}` : "학습 내용";

    const statusByMode = {
      original: "",
      mask: window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "마우스를 올려 확인" : "눌러 확인",
      trace: window.matchMedia("(max-width: 720px)").matches ? "다음: 확인" : "Enter: 확인",
      fill: window.matchMedia("(max-width: 720px)").matches ? "다음: 채점" : "Enter: 채점"
    };
    const baseStatus = statusByMode[studyMode] || "";
    document.getElementById("studyStatus").textContent = getCurrentDifficulty() === "practical" && studyMode !== "original"
      ? `${baseStatus}${baseStatus ? " · " : ""}빈칸 회전`
      : baseStatus;

    const nav = document.getElementById("unitNav");
    const randomMode = document.getElementById("areaSelect").value === "random";
    nav.classList.toggle("hidden", !randomMode && sequence.length <= 1);

    if (randomMode && subject && area) {
      document.getElementById("unitNavTitle").textContent = `랜덤 · ${subjectLabel} · ${area}`;
      document.getElementById("prevUnit").disabled = true;
      document.getElementById("nextUnit").disabled = false;
      document.getElementById("nextUnit").textContent = "다음 랜덤 →";
    } else if (sequence.length > 1 && subject && area) {
      document.getElementById("unitNavTitle").textContent = `${currentAreaIndex + 1} / ${sequence.length} · ${subjectLabel} · ${area}`;
      document.getElementById("prevUnit").disabled = currentAreaIndex === 0;
      document.getElementById("nextUnit").disabled = currentAreaIndex === sequence.length - 1;
      document.getElementById("nextUnit").textContent = "다음 단원 →";
    } else {
      document.getElementById("nextUnit").textContent = "다음 단원 →";
    }

    const sourceButton = document.getElementById("sourceButton");
    if (sourceButton) {
      sourceButton.classList.toggle("hidden", !subject);
      if (subject) {
        const meta = subjectSourceMeta[subject];
        sourceButton.textContent = "공식 출처";
        sourceButton.href = meta?.url || "#";
        sourceButton.title = meta?.label || "공식 교육과정 출처";
        sourceButton.setAttribute("aria-label", `${subjectLabel}${area ? " · " + area : ""} 공식 교육과정 출처 새 탭에서 열기`);
      }
    }

    studyArea.innerHTML = "";

    if (!sections.length) {
      studyArea.innerHTML =
        `<div class="empty"><strong>${subjectLabel}${area ? " · " + area : ""}</strong> 원문 데이터는 아직 이 파일에 넣지 않았습니다.<br>` +
        `공식 원문을 추가하면 같은 화면에서 바로 학습·퀴즈가 작동합니다.</div>`;
      updateStudyControls();
      updateScore();
      return;
    }

    const table = document.createElement("table");
    table.className = "section-table";
    const tbody = document.createElement("tbody");

    sections.forEach((section, sectionIndex) => {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      th.textContent = section.title;
      th.scope = "row";

      const td = document.createElement("td");

      section.lines.forEach((line, lineIndex) => {
        if (studyMode === "mask") {
          td.appendChild(renderMaskLine(line, sectionIndex, lineIndex, section.title, section._sourceGroup || group));
        } else if (isInputStudyMode()) {
          td.appendChild(renderLine(line, sectionIndex, lineIndex, section.title, section._sourceGroup || group, studyMode));
        } else {
          const p = document.createElement("div");
          p.className = "line-item";
          p.dataset.lineId = line.id || makeLineStableId(section.title, line.text, "");
          p.textContent = line.text;
          td.appendChild(p);
        }
      });

      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    studyArea.appendChild(table);

    updateStudyControls();
    updateScore();
    maybeShowPracticalRetry();
    scheduleStateSave();
  }

  function difficultyLabel(value) {
    return ({ easy: "핵심", normal: "정밀", yaho: "야~호!", practical: "실전" })[value] || (value === "hard" ? "정밀" : value);
  }



  // -------------------------
  // 학습 화면 상태 복원
  // -------------------------
  const UI_STATE_KEY = "curriloop-ui-state-v1";
  const DRAFT_STATE_KEY = "curriloop-draft-state-v1";
  let stateSaveTimer = null;

  function parseStoredJson(storage, key, fallback = null) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function collectUiState() {
    return {
      version: 1,
      currentTab,
      subject: document.getElementById("subjectSelect")?.value || "all",
      area: document.getElementById("areaSelect")?.value || "all",
      group: document.getElementById("groupSelect")?.value || "all",
      difficulty: getCurrentDifficulty(),
      currentAreaIndex,
      currentRandomUnit,
      studyMode,
      lastStudyFocus,
      generalCategory: document.getElementById("generalCategory")?.value || "all",
      generalIndex,
      generalShuffleState,
      savedAt: new Date().toISOString()
    };
  }

  function collectDraftState() {
    return {
      version: 1,
      fieldState,
      generalAnswer: document.getElementById("generalAnswer")?.value || "",
      savedAt: new Date().toISOString()
    };
  }

  function saveCurrentState() {
    if (!statePersistenceReady) return;
    try { localStorage.setItem(UI_STATE_KEY, JSON.stringify(collectUiState())); } catch {}
    try { sessionStorage.setItem(DRAFT_STATE_KEY, JSON.stringify(collectDraftState())); } catch {}
  }

  function scheduleStateSave() {
    if (!statePersistenceReady) return;
    clearTimeout(stateSaveTimer);
    stateSaveTimer = setTimeout(saveCurrentState, 80);
  }

  function restoreUiState() {
    let saved = {};
    try { saved = parseStoredJson(localStorage, UI_STATE_KEY, {}); } catch { return null; }
    if (!saved || typeof saved !== "object") return null;

    const subject = (saved.subject === "all" || Object.prototype.hasOwnProperty.call(subjectAreas, saved.subject)) ? saved.subject : "all";
    document.getElementById("subjectSelect").value = subject || "all";
    if (["all", ...SUBJECT_GROUPS].includes(saved.group)) document.getElementById("groupSelect").value = saved.group;
    if (["easy","normal","yaho","practical"].includes(saved.difficulty)) document.getElementById("difficultySelect").value = saved.difficulty;
    if (["all","competency","history","hours","subjects"].includes(saved.generalCategory)) document.getElementById("generalCategory").value = saved.generalCategory;

    fillAreaSelect();
    const areaSelect = document.getElementById("areaSelect");
    if ([...areaSelect.options].some(option => option.value === saved.area)) areaSelect.value = saved.area;

    currentAreaIndex = Number.isFinite(Number(saved.currentAreaIndex)) ? Math.max(0, Number(saved.currentAreaIndex)) : 0;
    currentRandomUnit = saved.currentRandomUnit && typeof saved.currentRandomUnit === "object" ? saved.currentRandomUnit : null;
    studyMode = ["original","mask","trace","fill"].includes(saved.studyMode)
      ? saved.studyMode
      : (saved.quizMode ? "fill" : "original");
    lastStudyFocus = saved.lastStudyFocus && typeof saved.lastStudyFocus === "object" ? saved.lastStudyFocus : null;
    generalIndex = Number.isFinite(Number(saved.generalIndex)) ? Math.max(0, Number(saved.generalIndex)) : 0;
    generalShuffleState = saved.generalShuffleState && typeof saved.generalShuffleState === "object" ? saved.generalShuffleState : null;
    currentTab = ["general","subject","history"].includes(saved.currentTab) ? saved.currentTab : "general";
    return saved;
  }

  function restoreDraftState() {
    let draft = {};
    try { draft = parseStoredJson(sessionStorage, DRAFT_STATE_KEY, {}); } catch { return ""; }
    if (!draft || typeof draft !== "object") return "";
    if (draft.fieldState && typeof draft.fieldState === "object" && !Array.isArray(draft.fieldState)) {
      Object.entries(draft.fieldState).forEach(([key, value]) => {
        if (value && typeof value === "object") fieldState[key] = value;
      });
    }
    return typeof draft.generalAnswer === "string" ? draft.generalAnswer : "";
  }


  // -------------------------
  // 오답 히스토리
  // -------------------------
  // v6.0 이하 호환용 legacy 키. v6.1부터 학습 이력의 주 저장소는 IndexedDB다.
  const HISTORY_KEY = "coreloop-wrong-history-v1";
  const MASTERY_KEY = "coreloop-mastery-v1";
  const LEARNING_DB_NAME = "curriloop-learning-v1";
  const LEARNING_DB_VERSION = 1;
  const LEARNING_STORE = "kv";
  const LEARNING_STATE_KEY = "learning-state";
  const PREIMPORT_STATE_KEY = "preimport-backup";
  const MIGRATION_BACKUP_STATE_KEY = "legacy-migration-backup";
  const QUARANTINE_STATE_KEY = "migration-quarantine";
  // IndexedDB를 쓸 수 없는 환경의 원자적 fallback. history/mastery를 한 JSON 객체로 저장한다.
  const FALLBACK_STATE_KEY = "curriloop-learning-fallback-state-v1";
  const QUARANTINE_FALLBACK_KEY = "curriloop-migration-quarantine-v1";
  // v6.2: 기존 핵심의 큰 빈칸을 작은 stable gap으로 분할한 1회성 마이그레이션 버전.
  const CORE_SPLIT_MIGRATION_VERSION = 1;

  let learningDb = null;
  let learningStorageMode = "memory";
  let learningStateMemory = {history: [], mastery: {}, coreSplitMigrationVersion: 0, updatedAt: null};
  let learningPersistChain = Promise.resolve();
  let migrationQuarantineCount = 0;

  function safeSetLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("CurriLoop 설정 저장 실패", error);
      if (!storageWarningShown) {
        storageWarningShown = true;
        alert("브라우저 저장 공간이 부족해 설정을 저장하지 못했습니다. 학습 기록 백업을 확인해 주세요.");
      }
      return false;
    }
  }

  function openLearningDb() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB 미지원"));
      const request = indexedDB.open(LEARNING_DB_NAME, LEARNING_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(LEARNING_STORE)) db.createObjectStore(LEARNING_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB 열기 실패"));
    });
  }

  function idbGet(key) {
    if (!learningDb) return Promise.resolve(undefined);
    return new Promise((resolve, reject) => {
      const tx = learningDb.transaction(LEARNING_STORE, "readonly");
      const request = tx.objectStore(LEARNING_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB 읽기 실패"));
    });
  }

  function idbPut(key, value) {
    if (!learningDb) return Promise.reject(new Error("IndexedDB가 준비되지 않았습니다."));
    return new Promise((resolve, reject) => {
      const tx = learningDb.transaction(LEARNING_STORE, "readwrite");
      tx.objectStore(LEARNING_STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("IndexedDB 저장 실패"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB 저장 중단"));
    });
  }

  function idbDelete(key) {
    if (!learningDb) return Promise.resolve(false);
    return new Promise((resolve, reject) => {
      const tx = learningDb.transaction(LEARNING_STORE, "readwrite");
      tx.objectStore(LEARNING_STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("IndexedDB 삭제 실패"));
    });
  }

  function cloneJson(value, fallback) {
    try { return JSON.parse(JSON.stringify(value)); }
    catch { return fallback; }
  }

  function validLearningStateRecord(value) {
    return value && typeof value === "object" && Array.isArray(value.history) &&
      value.mastery && typeof value.mastery === "object" && !Array.isArray(value.mastery);
  }

  function learningStateSnapshot() {
    return {
      schemaVersion: 1,
      history: cloneJson(learningStateMemory.history, []),
      mastery: cloneJson(learningStateMemory.mastery, {}),
      coreSplitMigrationVersion: Number(learningStateMemory.coreSplitMigrationVersion || 0),
      updatedAt: new Date().toISOString()
    };
  }

  function persistFallbackLearningState(snapshot) {
    // 하나의 key에 하나의 snapshot을 써서 history/mastery 부분 성공 상태를 만들지 않는다.
    return safeSetLocalStorage(FALLBACK_STATE_KEY, JSON.stringify(snapshot));
  }

  function persistLearningState() {
    const snapshot = learningStateSnapshot();
    if (learningStorageMode === "indexeddb" && learningDb) {
      learningPersistChain = learningPersistChain
        .catch(() => {})
        .then(() => idbPut(LEARNING_STATE_KEY, snapshot))
        .catch(error => {
          console.error("CurriLoop IndexedDB 저장 실패, 원자적 localStorage fallback으로 전환", error);
          // 쓰기 실패 뒤에도 다음 재시작에서 최신 상태를 우선 복구할 수 있도록 단일 snapshot으로 보존한다.
          persistFallbackLearningState(snapshot);
          learningStorageMode = "localstorage";
          if (window.CurriLoopStorageStatus) window.CurriLoopStorageStatus.mode = learningStorageMode;
        });
      return true;
    }

    // IndexedDB를 사용할 수 없는 환경은 단일 JSON snapshot만 저장한다.
    return persistFallbackLearningState(snapshot);
  }

  async function persistLearningStateNow() {
    persistLearningState();
    await learningPersistChain.catch(() => {});
    return true;
  }

  async function storeMigrationQuarantine(records) {
    if (!records?.length) return;
    migrationQuarantineCount += records.length;
    const payload = {savedAt:new Date().toISOString(), records:cloneJson(records, [])};
    if (learningStorageMode === "indexeddb" && learningDb) {
      try {
        await idbPut(QUARANTINE_STATE_KEY, payload);
        return;
      } catch (error) {
        console.error("CurriLoop 격리 기록 IndexedDB 저장 실패", error);
      }
    }
    safeSetLocalStorage(QUARANTINE_FALLBACK_KEY, JSON.stringify(payload));
  }

  function loadMastery() {
    try {
      const raw = cloneJson(learningStateMemory.mastery, {});
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      const migrated = {};
      let changed = false;
      const seedCoreSplits = Number(learningStateMemory.coreSplitMigrationVersion || 0) < CORE_SPLIT_MIGRATION_VERSION;

      const merge = (key, item) => {
        const prev = migrated[key];
        if (!prev) { migrated[key] = {...item}; return; }
        const prevSeen = Number(prev.lastSeenAt || 0), nextSeen = Number(item.lastSeenAt || 0);
        migrated[key] = {
          ...prev,
          ...(nextSeen >= prevSeen ? item : {}),
          correctCount: Math.max(Number(prev.correctCount || 0), Number(item.correctCount || 0)),
          nearCount: Math.max(Number(prev.nearCount || 0), Number(item.nearCount || 0)),
          unknownCount: Math.max(Number(prev.unknownCount || 0), Number(item.unknownCount || 0)),
          wrongCount: Math.max(Number(prev.wrongCount || 0), Number(item.wrongCount || 0)),
          correctStreak: Math.max(Number(prev.correctStreak || 0), Number(item.correctStreak || 0)),
          mastered: Boolean(prev.mastered || item.mastered),
          nextReviewAt: Math.min(...[prev.nextReviewAt, item.nextReviewAt].map(Number).filter(v => v > 0).concat([0]).filter((v,i,a)=>v>0 || a.length===1)) || 0,
          lastSeenAt: Math.max(prevSeen, nextSeen)
        };
      };

      Object.entries(raw).forEach(([key,item]) => {
        let nextKey = key;
        if (key.startsWith("general|")) {
          const oldText = key.slice("general|".length);
          const q = generalBank.find(q => q.id === oldText || normalize(q.q) === oldText);
          if (q) nextKey = conceptKeyForGeneral(q.id);
        } else if (key.startsWith("subject|")) {
          nextKey = migrateSubjectConceptKey(key);
        }
        if (nextKey !== key) changed = true;
        const retiredSplitTargets = nextKey.startsWith("subject|")
          ? [...normalSplitTargetConceptKeys(nextKey), ...yahoSplitTargetConceptKeys(nextKey)]
          : [];
        // 폐기된 정밀 composite 또는 야~호! 전체문장 ID는 현재 자식 gap으로 이관한다.
        if (retiredSplitTargets.length) {
          retiredSplitTargets.forEach(targetKey => merge(targetKey, item || {}));
          changed = true;
        } else if (!nextKey.startsWith("subject|") || isCurrentSubjectConceptKey(nextKey)) {
          merge(nextKey, item || {});
        } else {
          // 더 이상 존재하지 않는 빈칸(예: 검수에서 제거된 기능어)은 학습 상태에서 정리한다.
          changed = true;
        }

        // v6.2에서 과거 '핵심'의 큰 의미 단위를 여러 작은 빈칸으로 나눈 경우,
        // 기존 composite ID 자체는 당시 정밀 기록을 위해 보존하고 새 핵심 자식들에게
        // 기존 숙련도를 한 번만 seed한다. 이후 정밀 학습 결과가 계속 전파되지는 않는다.
        if (seedCoreSplits && nextKey.startsWith("subject|")) {
          for (const targetKey of coreSplitTargetConceptKeys(nextKey)) {
            merge(targetKey, item || {});
            changed = true;
          }
        }
      });

      if (seedCoreSplits) {
        learningStateMemory.coreSplitMigrationVersion = CORE_SPLIT_MIGRATION_VERSION;
        changed = true;
      }

      if (changed || Object.keys(migrated).length !== Object.keys(raw).length) {
        learningStateMemory.mastery = migrated;
        persistLearningState();
      }
      return migrated;
    } catch {
      return {};
    }
  }

  function saveMastery(data) {
    learningStateMemory.mastery = cloneJson(data, {});
    return persistLearningState();
  }

  function resolveGapIdForLine(line, difficultyKey = "", answer = "", fallbackGapIndex = -1) {
    if (!line) return `legacy-${stableHash(`${difficultyKey}|${answer}|${fallbackGapIndex}`)}`;
    const target = normalize(answer);
    const levels = [...new Set([difficultyKey, "easy", "normal", "yaho"].filter(level => ["easy","normal","yaho"].includes(level)))];

    for (const level of levels) {
      const entries = configuredGapEntries(line, level);
      const matched = entries.find(entry => normalize(entry.answer) === target);
      if (matched?.gapId) return matched.gapId;
    }

    const ids = line.gapIds?.[difficultyKey] || [];
    if (fallbackGapIndex >= 0 && fallbackGapIndex < ids.length) return ids[fallbackGapIndex];

    return `legacy-${stableHash(`${line.id || ""}|${target}|${fallbackGapIndex}`)}`;
  }

  function conceptKeyForSubject(unit, sourceGroup, lineId, gapId, answerOccurrence = 0) {
    return ["subject", unit.subject, unit.area, sourceGroup, lineId, `gap:${gapId}`, answerOccurrence].join("|");
  }

  function buildLineIdentityIndex() {
    const byExplicit = new Map();
    const byLegacy = new Map();
    const byText = new Map();
    Object.entries(curriculumData).forEach(([subjectKey, subject]) => {
      Object.entries(subject).forEach(([areaName, area]) => {
        SUBJECT_GROUPS.forEach(sourceGroup => {
          (area[sourceGroup] || []).forEach(section => (section.lines || []).forEach(line => {
            const meta = {subjectKey, areaName, sourceGroup, sectionTitle:section.title, line};
            byExplicit.set(`${subjectKey}|${areaName}|${line.id}`, meta);
            if (line.legacyId) byLegacy.set(`${subjectKey}|${areaName}|${line.legacyId}`, meta);
            byText.set(`${subjectKey}|${areaName}|${line.text}`, meta);
          }));
        });
      });
    });
    return {byExplicit, byLegacy, byText};
  }

  const lineIdentityIndex = buildLineIdentityIndex();

  function findLineIdentity(subjectKey, areaName, lineId = "", context = "") {
    return lineIdentityIndex.byExplicit.get(`${subjectKey}|${areaName}|${lineId}`)
      || lineIdentityIndex.byLegacy.get(`${subjectKey}|${areaName}|${lineId}`)
      || (context ? lineIdentityIndex.byText.get(`${subjectKey}|${areaName}|${context}`) : null)
      || null;
  }

  function migrateSubjectConceptKey(key, context = "") {
    const parts = String(key || "").split("|");
    if (parts[0] !== "subject" || parts.length < 7) return key;

    const [, subjectKey, areaName, oldGroup, oldLineId, legacyIdentity, occurrence] = parts;
    const meta = findLineIdentity(subjectKey, areaName, oldLineId, context);
    if (!meta) return key;

    let gapId;
    if (String(legacyIdentity).startsWith("gap:")) {
      gapId = String(legacyIdentity).slice(4);
    } else {
      gapId = resolveGapIdForLine(meta.line, "", legacyIdentity, -1);
    }

    return conceptKeyForSubject(
      {subject:subjectKey, area:areaName},
      meta.sourceGroup || oldGroup,
      meta.line.id,
      gapId,
      Number(occurrence || 0)
    );
  }

  function coreSplitTargetConceptKeys(key) {
    const parts = String(key || "").split("|");
    if (parts[0] !== "subject" || parts.length < 7) return [];
    const [, subjectKey, areaName, sourceGroup, lineId, gapToken, occurrence] = parts;
    if (!String(gapToken || "").startsWith("gap:")) return [];
    const meta = findLineIdentity(subjectKey, areaName, lineId, "");
    if (!meta) return [];
    const oldGapId = String(gapToken).slice(4);
    const targets = meta.line.coreSplitMigrations?.[oldGapId];
    if (!Array.isArray(targets) || !targets.length) return [];
    return targets.map(gapId => conceptKeyForSubject(
      {subject:subjectKey, area:areaName},
      meta.sourceGroup || sourceGroup,
      meta.line.id,
      gapId,
      Number(occurrence || 0)
    ));
  }

  function normalSplitTargetConceptKeys(key) {
    const parts = String(key || "").split("|");
    if (parts[0] !== "subject" || parts.length < 7) return [];
    const [, subjectKey, areaName, sourceGroup, lineId, gapToken, occurrence] = parts;
    if (!String(gapToken || "").startsWith("gap:")) return [];
    const meta = findLineIdentity(subjectKey, areaName, lineId, "");
    if (!meta) return [];
    const oldGapId = String(gapToken).slice(4);
    const targets = meta.line.normalSplitMigrations?.[oldGapId];
    if (!Array.isArray(targets) || !targets.length) return [];
    return targets.map(gapId => conceptKeyForSubject(
      {subject:subjectKey, area:areaName},
      meta.sourceGroup || sourceGroup,
      meta.line.id,
      gapId,
      Number(occurrence || 0)
    ));
  }

  function yahoSplitTargetConceptKeys(key) {
    const parts = String(key || "").split("|");
    if (parts[0] !== "subject" || parts.length < 7) return [];
    const [, subjectKey, areaName, sourceGroup, lineId, gapToken, occurrence] = parts;
    if (!String(gapToken || "").startsWith("gap:")) return [];
    const meta = findLineIdentity(subjectKey, areaName, lineId, "");
    if (!meta) return [];
    const oldGapId = String(gapToken).slice(4);
    const targets = meta.line.yahoSplitMigrations?.[oldGapId];
    if (!Array.isArray(targets) || !targets.length) return [];
    return targets.map(gapId => conceptKeyForSubject(
      {subject:subjectKey, area:areaName},
      meta.sourceGroup || sourceGroup,
      meta.line.id,
      gapId,
      Number(occurrence || 0)
    ));
  }

  function isCurrentSubjectConceptKey(key) {
    const parts = String(key || "").split("|");
    if (parts[0] !== "subject" || parts.length < 7) return true;
    const [, subjectKey, areaName, , lineId, gapToken] = parts;
    if (!String(gapToken || "").startsWith("gap:")) return false;
    const meta = findLineIdentity(subjectKey, areaName, lineId, "");
    if (!meta) return false;
    const gapId = String(gapToken).slice(4);
    return ["easy","normal","yaho"].some(level => (meta.line.gapIds?.[level] || []).includes(gapId));
  }

  function conceptKeyForGeneral(questionOrId) {
    return `general|${String(questionOrId || "")}`;
  }

  function updateMastery(conceptKey, result, eventToken) {
    const now = Date.now();
    // 탭을 밤새 열어 둔 경우에도 그날 첫 학습 이벤트 전에 복습 계획을 먼저 고정한다.
    ensureDailyReviewPlan(now);
    const all = loadMastery();
    const status = result === true ? "correct" : result === false ? "wrong" : (result || "wrong");
    const applied = LearningEngine.applyMasteryEvent(all[conceptKey] || {}, status, now, eventToken);
    const item = applied.item;
    all[conceptKey] = item;
    saveMastery(all);
    if (status === "correct" && item.mastered) markHistoryResolved(conceptKey);
    return item;
  }

  function markHistoryResolved(conceptKey) {
    if (!conceptKey) return;
    const list = loadHistory();
    let changed = false;
    list.forEach(item => {
      if (item.conceptKey === conceptKey && !item.resolved) {
        item.resolved = true;
        item.resolvedAt = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) saveHistory(list);
  }



  const HISTORY_EVENT_LIMIT = 100;

  function normalizeStoredDifficulty(copy) {
    const legacyLabelMap = {"쉬움":"easy", "보통":"normal", "어려움":"normal", "핵심":"easy", "정밀":"normal", "야~호!":"yaho", "실전":"practical"};
    let key = copy.difficultyKey || legacyLabelMap[copy.difficultyLabel] || "";
    if (key === "hard") key = "normal";
    if (key && ["easy","normal","yaho","practical"].includes(key)) {
      if (copy.difficultyKey !== key || copy.difficultyLabel !== difficultyLabel(key)) {
        copy.difficultyKey = key;
        copy.difficultyLabel = difficultyLabel(key);
        return true;
      }
    }
    return false;
  }

  function normalizeWrongEvents(item) {
    const raw = Array.isArray(item.wrongEvents) ? item.wrongEvents : [];
    const events = raw
      .filter(event => event && typeof event === "object" && typeof event.at === "string")
      .map(event => ({
        at: event.at,
        userAnswer: typeof event.userAnswer === "string" ? event.userAnswer : "",
        difficultyKey: ["easy","normal","yaho","practical"].includes(event.difficultyKey) ? event.difficultyKey : ""
      }))
      .sort((a,b) => new Date(b.at || 0) - new Date(a.at || 0));

    if (!events.length && item.lastWrongAt) {
      events.push({
        at: item.lastWrongAt,
        userAnswer: typeof item.userAnswer === "string" ? item.userAnswer : "",
        difficultyKey: item.difficultyKey || ""
      });
    }
    return events.slice(0, HISTORY_EVENT_LIMIT);
  }

  function loadHistory() {
    try {
      const data = cloneJson(learningStateMemory.history, []);
      if (!Array.isArray(data)) return [];
      let changed = false;

      const invalidRecords = data.filter(item => !(item && typeof item === "object" && ["general","subject"].includes(item.type)));
      if (invalidRecords.length) {
        changed = true;
        storeMigrationQuarantine(invalidRecords);
      }

      const migratedBase = data
        .filter(item => item && typeof item === "object" && ["general","subject"].includes(item.type))
        .map(item => {
          const copy = {...item};

          if (copy.type === "general") {
            const q = generalBank.find(q => q.id === copy.generalId || q.q === copy.question || q.q === copy.context);
            if (q) {
              if (copy.generalId !== q.id || copy.key !== conceptKeyForGeneral(q.id)) changed = true;
              copy.generalId = q.id;
              copy.conceptKey = conceptKeyForGeneral(q.id);
              copy.key = copy.conceptKey;
              copy.categoryLabel = generalCategoryLabels[q.category] || copy.categoryLabel || "총론";
            }
          } else if (copy.type === "subject") {
            if (normalizeStoredDifficulty(copy)) changed = true;
            const meta = findLineIdentity(copy.subjectKey, copy.area, copy.lineId || "", copy.context || "");
            if (meta) {
              copy.lineId = meta.line.id;
              copy.sourceGroup = meta.sourceGroup;
              copy.groupKey = meta.sourceGroup;
              copy.groupLabel = groupLabels[meta.sourceGroup] || meta.sourceGroup;
              const oldKey = copy.conceptKey || copy.key || "";
              const oldParts = String(oldKey).split("|");
              const keyGapId = oldParts[0] === "subject" && String(oldParts[5] || "").startsWith("gap:")
                ? String(oldParts[5]).slice(4)
                : "";
              const nextGapId = copy.gapId || keyGapId || resolveGapIdForLine(
                meta.line,
                copy.difficultyKey || "",
                copy.answerText || copy.correctAnswer || "",
                Number(copy.gapIndex ?? -1)
              );
              copy.gapId = nextGapId;
              copy.conceptKey = conceptKeyForSubject(
                {subject:copy.subjectKey, area:copy.area},
                meta.sourceGroup,
                meta.line.id,
                nextGapId,
                Number(copy.answerOccurrence || 0)
              );
              copy.key = copy.conceptKey;
              if (oldKey !== copy.conceptKey) changed = true;
            }
          }

          const attempts = Math.max(1, Number(copy.attempts || 1));
          if (copy.attempts !== attempts) changed = true;
          copy.attempts = attempts;

          const wrongEvents = normalizeWrongEvents(copy);
          if (!Array.isArray(copy.wrongEvents) || copy.wrongEvents.length !== wrongEvents.length) changed = true;
          copy.wrongEvents = wrongEvents;

          const firstWrongAt = copy.firstWrongAt || [...wrongEvents].sort((a,b) => new Date(a.at || 0) - new Date(b.at || 0))[0]?.at || copy.lastWrongAt || null;
          if (copy.firstWrongAt !== firstWrongAt) changed = true;
          copy.firstWrongAt = firstWrongAt;
          copy.archivedWrongEvents = Math.max(0, Number(copy.archivedWrongEvents || 0));

          return copy;
        });

      // 과거 composite 오답은 현재의 분할된 stable gap들에 이어 준다.
      // 핵심/정밀 분할과 v6.6 야~호! 장문 청크 분할을 모두 지원한다.
      let migrated = migratedBase.flatMap(copy => {
        if (copy.type !== "subject" || !["easy","normal","yaho"].includes(copy.difficultyKey)) return [copy];
        const meta = findLineIdentity(copy.subjectKey, copy.area, copy.lineId || "", copy.context || "");
        const splitMap = copy.difficultyKey === "easy"
          ? meta?.line?.coreSplitMigrations
          : copy.difficultyKey === "normal"
            ? meta?.line?.normalSplitMigrations
            : meta?.line?.yahoSplitMigrations;
        const targets = splitMap?.[copy.gapId];
        if (!Array.isArray(targets) || !targets.length) return [copy];
        changed = true;
        const entries = configuredGapEntries(meta.line, copy.difficultyKey);
        return targets.map(gapId => {
          const entry = entries.find(candidate => candidate.gapId === gapId);
          const next = {...copy, gapId};
          next.answerText = entry?.answer || next.answerText;
          next.correctAnswer = entry?.answer || next.correctAnswer;
          next.conceptKey = conceptKeyForSubject(
            {subject:next.subjectKey, area:next.area},
            meta.sourceGroup,
            meta.line.id,
            gapId,
            Number(next.answerOccurrence || 0)
          );
          next.key = next.conceptKey;
          return next;
        });
      });

      const retiredGapRecords = migrated.filter(copy => copy.type === "subject" && !isCurrentSubjectConceptKey(copy.conceptKey || copy.key));
      if (retiredGapRecords.length) {
        migrated = migrated.filter(copy => copy.type !== "subject" || isCurrentSubjectConceptKey(copy.conceptKey || copy.key));
        storeMigrationQuarantine(retiredGapRecords.map(item => ({reason:"retired-gap", item})));
        changed = true;
      }

      if (migrated.length !== data.length) changed = true;

      const byKey = new Map();
      for (const item of migrated) {
        const key = item.key || item.conceptKey || `${item.type}|${item.context}|${item.correctAnswer}`;
        if (!byKey.has(key)) {
          byKey.set(key, item);
          continue;
        }

        const prev = byKey.get(key);
        const itemNewer = new Date(item.lastWrongAt || 0) > new Date(prev.lastWrongAt || 0);
        const newer = {...(itemNewer ? prev : item), ...(itemNewer ? item : prev)};

        const mergedEvents = [...(prev.wrongEvents || []), ...(item.wrongEvents || [])]
          .filter((event, index, all) => all.findIndex(candidate => candidate.at === event.at && candidate.userAnswer === event.userAnswer) === index)
          .sort((a,b) => new Date(b.at || 0) - new Date(a.at || 0));

        const overflow = Math.max(0, mergedEvents.length - HISTORY_EVENT_LIMIT);
        newer.wrongEvents = mergedEvents.slice(0, HISTORY_EVENT_LIMIT);
        newer.archivedWrongEvents = Number(prev.archivedWrongEvents || 0) + Number(item.archivedWrongEvents || 0) + overflow;
        newer.attempts = Math.max(Number(prev.attempts || 1), Number(item.attempts || 1));
        newer.firstWrongAt = [prev.firstWrongAt, item.firstWrongAt].filter(Boolean).sort((a,b) => new Date(a) - new Date(b))[0] || newer.lastWrongAt || null;
        newer.resolved = Boolean(prev.resolved && item.resolved);
        byKey.set(key, newer);
        changed = true;
      }

      const result = [...byKey.values()].sort((a,b) => new Date(b.lastWrongAt || 0) - new Date(a.lastWrongAt || 0));
      if (changed || result.length !== data.length) saveHistory(result);
      return result;
    } catch (error) {
      console.error("CurriLoop 오답 이력 읽기 실패", error);
      return [];
    }
  }

  function saveHistory(list) {
    // 개념 자체는 장기 보존하고, 상세 이벤트는 최근 HISTORY_EVENT_LIMIT개 + 누적 횟수로 유지한다.
    learningStateMemory.history = cloneJson(list, []);
    return persistLearningState();
  }

  async function initializeLearningStorage() {
    const legacyHistoryRaw = localStorage.getItem(HISTORY_KEY);
    const legacyMasteryRaw = localStorage.getItem(MASTERY_KEY);
    const fallbackRaw = localStorage.getItem(FALLBACK_STATE_KEY);
    let fallbackState = null;
    let usedLegacy = false;
    let recoveredFallback = false;

    try {
      if (fallbackRaw) {
        const parsed = JSON.parse(fallbackRaw);
        if (validLearningStateRecord(parsed)) fallbackState = parsed;
        else await storeMigrationQuarantine([{reason:"fallback-state-invalid", raw:fallbackRaw}]);
      }
    } catch {
      // 손상 fallback도 버리지 않고 별도 key에 보존한다.
      safeSetLocalStorage(QUARANTINE_FALLBACK_KEY, JSON.stringify({
        savedAt:new Date().toISOString(), reason:"fallback-state-json-parse", raw:fallbackRaw
      }));
      migrationQuarantineCount += 1;
    }

    try {
      learningDb = await openLearningDb();
      learningStorageMode = "indexeddb";
      const stored = await idbGet(LEARNING_STATE_KEY);

      // IDB 쓰기 실패로 남겨둔 fallback snapshot이 있으면 stale IDB보다 fallback을 우선한다.
      if (fallbackState) {
        recoveredFallback = true;
        learningStateMemory = {
          history: cloneJson(fallbackState.history, []),
          mastery: cloneJson(fallbackState.mastery, {}),
          coreSplitMigrationVersion: Number(fallbackState.coreSplitMigrationVersion || 0),
          updatedAt: fallbackState.updatedAt || null
        };
      } else if (validLearningStateRecord(stored)) {
        learningStateMemory = {
          history: cloneJson(stored.history, []),
          mastery: cloneJson(stored.mastery, {}),
          coreSplitMigrationVersion: Number(stored.coreSplitMigrationVersion || 0),
          updatedAt: stored.updatedAt || null
        };
      } else {
        usedLegacy = Boolean(legacyHistoryRaw || legacyMasteryRaw);
        let legacyHistory = [];
        let legacyMastery = {};

        try {
          legacyHistory = JSON.parse(legacyHistoryRaw || "[]");
          if (!Array.isArray(legacyHistory)) legacyHistory = [];
        } catch {
          await idbPut(QUARANTINE_STATE_KEY, {
            savedAt:new Date().toISOString(), reason:"legacy-history-json-parse", raw:legacyHistoryRaw
          });
          migrationQuarantineCount += 1;
        }

        try {
          legacyMastery = JSON.parse(legacyMasteryRaw || "{}");
          if (!legacyMastery || typeof legacyMastery !== "object" || Array.isArray(legacyMastery)) legacyMastery = {};
        } catch {
          await idbPut(QUARANTINE_STATE_KEY, {
            savedAt:new Date().toISOString(), reason:"legacy-mastery-json-parse", raw:legacyMasteryRaw
          });
          migrationQuarantineCount += 1;
        }

        if (usedLegacy) {
          await idbPut(MIGRATION_BACKUP_STATE_KEY, {
            savedAt:new Date().toISOString(), historyRaw:legacyHistoryRaw, masteryRaw:legacyMasteryRaw
          });
        }
        learningStateMemory = {history: legacyHistory, mastery: legacyMastery, coreSplitMigrationVersion:0, updatedAt:null};
      }

      // line/gap stable ID, hard→정밀 등 모든 호환 마이그레이션을 메모리에서 수행한다.
      learningStateMemory.history = loadHistory();
      learningStateMemory.mastery = loadMastery();
      await persistLearningStateNow();

      // IndexedDB에 실제 정상 기록된 뒤에만 구형/비상 fallback active key를 제거한다.
      const verified = await idbGet(LEARNING_STATE_KEY);
      if (validLearningStateRecord(verified)) {
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem(MASTERY_KEY);
        localStorage.removeItem(FALLBACK_STATE_KEY);
      }

      window.CurriLoopStorageStatus = {
        mode:learningStorageMode,
        migratedLegacy:usedLegacy,
        recoveredFallback,
        quarantine:migrationQuarantineCount
      };
    } catch (error) {
      console.error("IndexedDB 초기화 실패, localStorage fallback 사용", error);
      learningStorageMode = "localstorage";
      learningDb = null;

      if (fallbackState) {
        recoveredFallback = true;
        learningStateMemory = {
          history:cloneJson(fallbackState.history, []),
          mastery:cloneJson(fallbackState.mastery, {}),
          coreSplitMigrationVersion:Number(fallbackState.coreSplitMigrationVersion || 0),
          updatedAt:fallbackState.updatedAt || null
        };
      } else {
        try {
          const legacyHistory = JSON.parse(legacyHistoryRaw || "[]");
          learningStateMemory.history = Array.isArray(legacyHistory) ? legacyHistory : [];
        } catch {
          learningStateMemory.history = [];
          if (legacyHistoryRaw) await storeMigrationQuarantine([{reason:"legacy-history-json-parse", raw:legacyHistoryRaw}]);
        }
        try {
          const legacyMastery = JSON.parse(legacyMasteryRaw || "{}");
          learningStateMemory.mastery = legacyMastery && typeof legacyMastery === "object" && !Array.isArray(legacyMastery) ? legacyMastery : {};
        } catch {
          learningStateMemory.mastery = {};
          if (legacyMasteryRaw) await storeMigrationQuarantine([{reason:"legacy-mastery-json-parse", raw:legacyMasteryRaw}]);
        }
      }

      learningStateMemory.history = loadHistory();
      learningStateMemory.mastery = loadMastery();
      persistLearningState();
      window.CurriLoopStorageStatus = {
        mode:learningStorageMode, migratedLegacy:false, recoveredFallback, quarantine:migrationQuarantineCount
      };
    }
  }

  function addWrongHistory(entry, eventToken = "") {
    const list = loadHistory();
    const key = entry.key || entry.conceptKey;
    const existingIndex = list.findIndex(item => item.key === key);
    const now = new Date().toISOString();
    const wrongEvent = {
      at: now,
      userAnswer: typeof entry.userAnswer === "string" ? entry.userAnswer : "",
      difficultyKey: ["easy","normal","yaho","practical"].includes(entry.difficultyKey) ? entry.difficultyKey : ""
    };
    const payload = {
      ...entry,
      key,
      lastWrongAt: now,
      lastWrongEventToken: eventToken || entry.lastWrongEventToken || "",
      resolved: false,
      resolvedAt: null
    };

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const duplicatedEvent = Boolean(eventToken && existing.lastWrongEventToken === eventToken);
      // 같은 채점 이벤트의 재실행은 완전한 no-op이다. 최근 오답 시각도 바꾸지 않는다.
      if (duplicatedEvent) return existing;

      list.splice(existingIndex, 1);
      const events = [wrongEvent, ...(existing.wrongEvents || [])];
      const overflow = Math.max(0, events.length - HISTORY_EVENT_LIMIT);

      list.unshift({
        ...existing,
        ...payload,
        firstWrongAt: existing.firstWrongAt || existing.lastWrongAt || now,
        attempts: Number(existing.attempts || 1) + 1,
        wrongEvents: events.slice(0, HISTORY_EVENT_LIMIT),
        archivedWrongEvents: Number(existing.archivedWrongEvents || 0) + overflow
      });
    } else {
      list.unshift({
        ...payload,
        firstWrongAt: now,
        attempts: Math.max(1, Number(entry.attempts || 1)),
        wrongEvents: [wrongEvent],
        archivedWrongEvents: 0
      });
    }
    saveHistory(list);
  }

  function removeHistoryItem(key) {
    const list = loadHistory().filter(item => item.key !== key);
    saveHistory(list);
    renderHistory();
  }


  function isWeakHistoryItem(item, mastery = loadMastery()) {
    if (!item || item.resolved) return false;
    const masteryItem = mastery[item.conceptKey] || null;
    return HistoryEngine.isWeak(item, masteryItem);
  }

  function isReviewWorthyHistoryItem(item) {
    if (!item || item.type !== "subject") return true;
    return !isPracticalLowValueEntry(
      {answer:item.correctAnswer || item.answerText || ""},
      {text:item.context || ""}
    );
  }

  function reviewItemFromConceptKey(conceptKey) {
    const parts = String(conceptKey || "").split("|");
    if (parts[0] === "general" && parts[1]) {
      const q = generalBank.find(item => item.id === parts.slice(1).join("|"));
      if (!q) return null;
      return {
        type:"general", key:conceptKey, conceptKey, generalId:q.id,
        categoryLabel:generalCategoryLabels[q.category] || q.category,
        question:q.q, context:q.q, correctAnswer:q.display, attempts:0, resolved:false
      };
    }
    if (parts[0] !== "subject" || parts.length < 7) return null;
    const [, subjectKey, area, sourceGroup, lineId, gapToken, occurrenceRaw] = parts;
    if (!String(gapToken || "").startsWith("gap:")) return null;
    const gapId = String(gapToken).slice(4);
    const meta = findLineIdentity(subjectKey, area, lineId, "");
    if (!meta) return null;

    let difficultyKey = "normal";
    let answer = "";
    let aliases = [];
    for (const level of ["easy", "normal", "yaho"]) {
      const entry = configuredGapEntries(meta.line, level).find(candidate => candidate.gapId === gapId);
      if (entry) {
        difficultyKey = level;
        answer = entry.answer;
        aliases = getSafeAliases(answer, meta.line.aliases);
        break;
      }
    }
    if (!answer) return null;
    // 실전에서 제외한 저변별 일반어는 자동 복습 큐에서도 다시 요구하지 않는다.
    if (isPracticalLowValueEntry({answer}, meta.line)) return null;
    return {
      type:"subject", key:conceptKey, conceptKey, subjectKey, area,
      sourceGroup, groupKey:sourceGroup, groupLabel:groupLabels[sourceGroup] || sourceGroup,
      subjectLabel:subjectLabels[subjectKey] || subjectKey,
      lineId:meta.line.id, gapId, answerOccurrence:Number(occurrenceRaw || 0),
      difficultyKey, difficultyLabel:difficultyLabel(difficultyKey),
      context:meta.line.text, answerText:answer, correctAnswer:answer, aliases, attempts:0, resolved:false
    };
  }

  function reviewMetaText(item) {
    if (!item) return "";
    if (item.type === "general") return ["총론", item.categoryLabel].filter(Boolean).join(" · ");
    return [item.subjectLabel, item.area, item.groupLabel].filter(Boolean).join(" · ");
  }

  function renderReviewSession(completed = false) {
    const panel = document.getElementById("reviewSession");
    const prompt = document.getElementById("reviewPrompt");
    const meta = document.getElementById("reviewMeta");
    const progress = document.getElementById("reviewProgress");
    const input = document.getElementById("reviewAnswer");
    const feedback = document.getElementById("reviewFeedback");
    const primary = document.getElementById("reviewPrimaryButton");
    const skip = document.getElementById("reviewSkipButton");
    if (!panel || !prompt || !input || !feedback || !primary) return;

    if (completed) {
      panel.classList.remove("hidden");
      if (progress) progress.textContent = "완료";
      if (meta) meta.textContent = "";
      prompt.textContent = "오늘의 복습을 마쳤습니다.";
      input.value = "";
      input.className = "";
      input.readOnly = true;
      input.classList.add("hidden");
      primary.textContent = "복습 닫기";
      primary.onclick = stopReviewSession;
      if (skip) skip.classList.add("hidden");
      feedback.className = "review-feedback good";
      feedback.textContent = "필요한 항목만 다시 꺼냈습니다. 새 범위를 학습해도 좋습니다.";
      return;
    }

    const item = reviewQueue[reviewPosition];
    if (!reviewActive || !item) { panel.classList.add("hidden"); return; }
    panel.classList.remove("hidden");
    reviewGraded = false;
    reviewLastStatus = "";
    activeReviewConceptKey = item.conceptKey || null;
    if (progress) progress.textContent = `${Math.min(reviewPosition + 1, reviewQueue.length)} / ${reviewQueue.length}`;
    if (meta) meta.textContent = reviewMetaText(item);
    prompt.textContent = item.type === "general"
      ? (item.question || item.context || "")
      : blankNth(item.context || "", item.correctAnswer || item.answerText || "", Number(item.answerOccurrence || 0));
    input.classList.remove("hidden", "correct", "wrong", "unknown");
    input.readOnly = false;
    input.value = "";
    input.placeholder = item.type === "general" ? "필요한 답을 모두 입력" : "정답을 떠올려 입력";
    primary.textContent = "채점";
    primary.onclick = reviewPrimaryAction;
    if (skip) skip.classList.remove("hidden");
    feedback.className = "review-feedback";
    feedback.textContent = "Enter: 채점 · 채점 후 Enter: 다음";
    requestAnimationFrame(() => {
      if (currentTab === "history") {
        input.focus({preventScroll:true});
        input.scrollIntoView({block:"center", behavior:"smooth"});
      }
    });
  }

  function successfulLineKeysToday(mastery, now = Date.now()) {
    const keys = new Set();
    Object.entries(mastery || {}).forEach(([conceptKey, state]) => {
      if (!LearningEngine.wasExactSuccessToday(state, now)) return;
      keys.add(LearningEngine.reviewLineKeyFromConceptKey(conceptKey));
    });
    return keys;
  }

  function loadDailyReviewPlan() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DAILY_REVIEW_PLAN_KEY) || "null");
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items) || !Array.isArray(parsed.completed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function saveDailyReviewPlan(plan) {
    if (!plan) {
      localStorage.removeItem(DAILY_REVIEW_PLAN_KEY);
      return;
    }
    safeSetLocalStorage(DAILY_REVIEW_PLAN_KEY, JSON.stringify(plan));
  }

  function buildDailyReviewPlan(now = Date.now()) {
    const mastery = loadMastery();
    const records = Object.entries(mastery)
      .filter(([, state]) => LearningEngine.isDailyReviewCandidate(state, now))
      .map(([conceptKey, state]) => ({item:reviewItemFromConceptKey(conceptKey), state, conceptKey}))
      .filter(({item}) => Boolean(item));

    const deduped = LearningEngine.dedupeReviewByLine(records, record => {
      const state = record.state || {};
      const overdue = Number(state.nextReviewAt || 0) > 0 && Number(state.nextReviewAt || 0) <= now ? 1000 : 0;
      return overdue + Number(state.wrongCount || 0) * 10 + (state.lastResult === "wrong" ? 8 : state.lastResult === "unknown" ? 6 : state.lastResult === "near" ? 4 : 0);
    }).sort((a,b) => {
      const aDue = Number(a.state?.nextReviewAt || 0);
      const bDue = Number(b.state?.nextReviewAt || 0);
      const aOverdue = aDue > 0 && aDue <= now;
      const bOverdue = bDue > 0 && bDue <= now;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return aDue - bDue;
    });

    const plan = {
      version: 1,
      dayKey: LearningEngine.localDayKey(now),
      createdAt: now,
      items: deduped.map(record => ({
        conceptKey: record.item.conceptKey,
        lineKey: LearningEngine.reviewLineKey(record.item)
      })),
      completed: []
    };
    saveDailyReviewPlan(plan);
    return plan;
  }

  function ensureDailyReviewPlan(now = Date.now(), {force = false} = {}) {
    const dayKey = LearningEngine.localDayKey(now);
    const existing = loadDailyReviewPlan();
    if (!force && existing?.dayKey === dayKey) return existing;
    return buildDailyReviewPlan(now);
  }

  function remainingDailyReviewItems(now = Date.now()) {
    const plan = ensureDailyReviewPlan(now);
    const completed = new Set(plan.completed || []);
    return (plan.items || [])
      .filter(entry => entry?.conceptKey && !completed.has(entry.conceptKey))
      .map(entry => reviewItemFromConceptKey(entry.conceptKey))
      .filter(Boolean);
  }

  function markDailyReviewCompleted(conceptKey, now = Date.now()) {
    if (!conceptKey) return;
    const plan = ensureDailyReviewPlan(now);
    if (!(plan.items || []).some(entry => entry?.conceptKey === conceptKey)) return;
    if (!plan.completed.includes(conceptKey)) {
      plan.completed.push(conceptKey);
      saveDailyReviewPlan(plan);
    }
  }

  function startWrongReview(dueOnly = true) {
    const mastery = loadMastery();
    const now = Date.now();

    const completedLinesToday = successfulLineKeysToday(mastery, now);

    if (dueOnly) {
      reviewQueue = remainingDailyReviewItems(now).map(item => ({...item, _sessionFailures:0, _dailyReview:true}));
      if (!reviewQueue.length) { alert("오늘 복습할 항목이 없습니다."); return; }
    } else {
      const records = loadHistory()
        .filter(item => isWeakHistoryItem(item, mastery) && isReviewWorthyHistoryItem(item))
        // 오늘 이미 정확히 인출한 항목은 추가 보강에서 반복하지 않는다.
        .filter(item => !LearningEngine.wasExactSuccessToday(mastery[item.conceptKey], now))
        .filter(item => !completedLinesToday.has(LearningEngine.reviewLineKey(item)))
        .map(item => ({item, state:mastery[item.conceptKey] || {}}));
      reviewQueue = LearningEngine.dedupeReviewByLine(records, record => Number(record.state?.wrongCount || record.item?.attempts || 1))
        .sort((a,b) => Number(b.state?.wrongCount || b.item?.attempts || 1) - Number(a.state?.wrongCount || a.item?.attempts || 1))
        .map(({item}) => ({...item, _sessionFailures:0}));
      if (!reviewQueue.length) { alert("오늘 추가로 보강할 취약 항목이 없습니다."); return; }
    }

    reviewPosition = 0;
    reviewActive = true;
    reviewGraded = false;
    activeReviewConceptKey = reviewQueue[0]?.conceptKey || null;
    if (currentTab !== "history") showTab("history");
    renderReviewSession();
  }

  function startHistoryItemReview(key) {
    const item = loadHistory().find(entry => entry.key === key);
    if (!item) return;
    reviewQueue = [{...item, _sessionFailures:0}];
    reviewPosition = 0;
    reviewActive = true;
    reviewGraded = false;
    activeReviewConceptKey = item.conceptKey || null;
    showTab("history");
    renderReviewSession();
  }

  function currentReviewItem() {
    return reviewActive ? reviewQueue[reviewPosition] || null : null;
  }

  function gradeReviewAnswer() {
    const item = currentReviewItem();
    const input = document.getElementById("reviewAnswer");
    const feedback = document.getElementById("reviewFeedback");
    const primary = document.getElementById("reviewPrimaryButton");
    if (!item || !input || reviewGraded) return;

    let grading = {status:"unknown", reason:"empty"};
    if (item.type === "general") {
      const q = generalBank.find(q => q.id === item.generalId);
      if (normalize(input.value)) grading = {status:q && isGeneralAnswerCorrect(q, input.value) ? "correct" : "wrong", reason:"exact"};
    } else {
      grading = classifyRawAnswerDetailed(input.value, item.correctAnswer || item.answerText || "", item.aliases || []);
    }
    const status = grading.status;
    const success = status === "correct" || status === "near";
    const signature = `${normalize(input.value) || "__blank__"}|review|${status}`;
    const eventToken = makeGradingEventToken("review", item.conceptKey, signature);
    const masteryItem = updateMastery(item.conceptKey, status, eventToken);

    reviewGraded = true;
    reviewLastStatus = status;
    input.readOnly = true;
    input.classList.remove("correct","wrong","unknown");
    input.classList.add(success ? "correct" : status === "unknown" ? "unknown" : "wrong");
    if (primary) primary.textContent = "다음";

    if (success) {
      if (status === "correct") markDailyReviewCompleted(item.conceptKey, Date.now());
      if (feedback) {
        feedback.className = "review-feedback good";
        feedback.textContent = status === "near"
          ? `유사 답안 유예 · ${nearReasonText(grading)} · 공식 표기: ${item.correctAnswer || item.answerText || ""} · 오답은 쌓지 않고 숙련도도 올리지 않습니다.`
          : `✓ 정답 · ${item.correctAnswer || item.answerText || item.correctAnswer || ""}`;
        if (status === "near" && item.type === "subject") {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "grading-override-button";
          button.textContent = "오답으로 처리";
          button.addEventListener("click", () => forceCurrentReviewNearWrong());
          feedback.appendChild(document.createTextNode(" "));
          feedback.appendChild(button);
        }
      }
      if (status === "near" && !item._nearRetried) {
        const retry = {...item, _nearRetried:true};
        const insertAt = Math.min(reviewPosition + 4, reviewQueue.length);
        reviewQueue.splice(insertAt, 0, retry);
      }
      return;
    }

    const failures = Number(item._sessionFailures || 0) + 1;
    item._sessionFailures = failures;
    if (status === "wrong" && Number(masteryItem?.wrongCount || 0) >= 2) {
      addWrongHistory({
        ...item,
        key:item.key || item.conceptKey,
        conceptKey:item.conceptKey,
        userAnswer:input.value,
        correctAnswer:item.correctAnswer || item.answerText || "",
        attempts:Number(masteryItem.wrongCount || 2)
      }, eventToken);
    }
    if (failures < 2) {
      const retry = {...item, _sessionFailures:failures};
      const insertAt = Math.min(reviewPosition + 4, reviewQueue.length);
      reviewQueue.splice(insertAt, 0, retry);
    }
    if (feedback) {
      feedback.className = status === "unknown" ? "review-feedback" : "review-feedback bad";
      feedback.textContent = status === "unknown"
        ? `? 모름 · 정답: ${item.correctAnswer || item.answerText || ""} · 오답 표현으로 기록하지 않습니다.${failures < 2 ? " 몇 문제 뒤 한 번 더 확인합니다." : " 다음 복습에서도 다시 확인합니다."}`
        : `✕ 정답: ${item.correctAnswer || item.answerText || ""}${failures < 2 ? " · 몇 문제 뒤 한 번 더 확인합니다." : " · 다음 복습에서도 다시 확인합니다."}`;
    }
  }

  function forceCurrentReviewNearWrong() {
    const item = currentReviewItem();
    const input = document.getElementById("reviewAnswer");
    const feedback = document.getElementById("reviewFeedback");
    if (!item || !input || reviewLastStatus !== "near") return;
    const expected = item.correctAnswer || item.answerText || "";
    if (!rememberStrictGradingPair(input.value, expected)) return;
    const all = loadMastery();
    let masteryItem = LearningEngine.normalizeMasteryItem(all[item.conceptKey] || {});
    if (masteryItem.nearCount > 0) masteryItem.nearCount -= 1;
    const eventToken = makeGradingEventToken("review-override", item.conceptKey, `${normalize(input.value)}|wrong`);
    masteryItem = LearningEngine.applyMasteryEvent(masteryItem, "wrong", Date.now(), eventToken).item;
    all[item.conceptKey] = masteryItem;
    saveMastery(all);
    reviewLastStatus = "wrong";
    input.classList.remove("correct","unknown");
    input.classList.add("wrong");
    if (Number(masteryItem.wrongCount || 0) >= 2) {
      addWrongHistory({...item, userAnswer:input.value, correctAnswer:expected, attempts:Number(masteryItem.wrongCount || 2)}, eventToken);
    }
    if (feedback) {
      feedback.className = "review-feedback bad";
      feedback.textContent = `✕ 오답으로 변경 · 정답: ${expected} · 같은 표현은 다음부터 바로 오답 처리합니다.`;
    }
    renderHistory({passive:true});
  }

  function reviewPrimaryAction() {
    if (!reviewActive) { stopReviewSession(); return; }
    if (!reviewGraded) gradeReviewAnswer();
    else advanceWrongReview();
  }

  function advanceWrongReview() {
    if (!reviewActive) return;
    reviewPosition += 1;
    if (reviewPosition >= reviewQueue.length) {
      reviewActive = false;
      activeReviewConceptKey = null;
      reviewGraded = false;
      renderReviewSession(true);
      renderHistory();
      return;
    }
    renderReviewSession();
  }

  function skipReviewItem() {
    if (!reviewActive) return;
    // 건너뛴 항목은 학습 결과를 기록하지 않고 세션 맨 뒤로 한 번 보낸다.
    const item = currentReviewItem();
    if (item && !item._skippedOnce) reviewQueue.push({...item, _skippedOnce:true});
    reviewPosition += 1;
    if (reviewPosition >= reviewQueue.length) {
      reviewActive = false;
      activeReviewConceptKey = null;
      renderReviewSession(true);
      return;
    }
    renderReviewSession();
  }

  function stopReviewSession() {
    reviewActive = false;
    reviewQueue = [];
    reviewPosition = -1;
    activeReviewConceptKey = null;
    reviewGraded = false;
    const panel = document.getElementById("reviewSession");
    if (panel) panel.classList.add("hidden");
    renderHistory();
  }

  function openHistorySource(item) {
    if (!item) return;
    if (item.type === "general") {
      const index = generalBank.findIndex(q => q.id === item.generalId);
      if (index < 0) return;
      generalShuffleState = null;
      document.getElementById("generalCategory").value = "all";
      generalIndex = index;
      showTab("general");
      renderGeneral();
      return;
    }
    if (item.type !== "subject" || !item.subjectKey || !item.area) return;
    document.getElementById("subjectSelect").value = item.subjectKey;
    if (["all", ...SUBJECT_GROUPS].includes(item.sourceGroup || item.groupKey)) {
      document.getElementById("groupSelect").value = item.sourceGroup || item.groupKey;
    }
    fillAreaSelect();
    const areaSelect = document.getElementById("areaSelect");
    if ([...areaSelect.options].some(option => option.value === item.area)) areaSelect.value = item.area;
    currentAreaIndex = 0;
    currentRandomUnit = null;
    studyMode = "original";
    showTab("subject");
    requestAnimationFrame(() => {
      const target = [...document.querySelectorAll("#studyArea .line-item[data-line-id]")]
        .find(line => line.dataset.lineId === item.lineId);
      if (target) {
        target.classList.add("source-highlight");
        target.scrollIntoView({block:"center", behavior:"smooth"});
        setTimeout(() => target.classList.remove("source-highlight"), 1800);
      }
    });
  }

  function openCurrentReviewSource() {
    openHistorySource(currentReviewItem());
  }

  const PREIMPORT_BACKUP_KEY = "curriloop-preimport-backup-v1"; // v6.0 이하 fallback 호환

  async function getPreimportSnapshot() {
    if (learningStorageMode === "indexeddb" && learningDb) {
      try { return await idbGet(PREIMPORT_STATE_KEY); } catch { return null; }
    }
    try { return JSON.parse(localStorage.getItem(PREIMPORT_BACKUP_KEY) || "null"); } catch { return null; }
  }

  async function savePreimportSnapshot(snapshot) {
    if (learningStorageMode === "indexeddb" && learningDb) {
      await idbPut(PREIMPORT_STATE_KEY, snapshot);
      return true;
    }
    return safeSetLocalStorage(PREIMPORT_BACKUP_KEY, JSON.stringify(snapshot));
  }

  async function clearPreimportSnapshot() {
    if (learningStorageMode === "indexeddb" && learningDb) {
      try { await idbDelete(PREIMPORT_STATE_KEY); } catch {}
    }
    localStorage.removeItem(PREIMPORT_BACKUP_KEY);
  }

  async function refreshUndoImportButton() {
    const button = document.getElementById("undoImportButton");
    if (!button) return;
    const snapshot = await getPreimportSnapshot();
    button.classList.toggle("hidden", !snapshot);
  }

  async function undoLastImport() {
    const snapshot = await getPreimportSnapshot();
    if (!snapshot) {
      alert("되돌릴 백업 가져오기 기록이 없습니다.");
      await refreshUndoImportButton();
      return;
    }
    if (!confirm("마지막 백업 가져오기 직전의 학습 기록으로 되돌릴까요?")) return;

    const before = learningStateSnapshot();
    const beforePracticalStats = cloneJson(practicalStats, {});
    const beforeTheme = localStorage.getItem("coreloop-theme");
    const beforeGradingOverrides = loadGradingOverrides();
    const beforeExamProgress = loadPracticalExamProgress();

    try {
      if (!validLearningStateRecord(snapshot.learning)) throw new Error("복구본 학습 기록 형식이 올바르지 않습니다.");
      learningStateMemory = {
        history:cloneJson(snapshot.learning.history, []),
        mastery:cloneJson(snapshot.learning.mastery, {}),
        coreSplitMigrationVersion:Number(snapshot.learning.coreSplitMigrationVersion || 0),
        updatedAt:snapshot.learning.updatedAt || null
      };
      learningStateMemory.history = loadHistory();
      learningStateMemory.mastery = loadMastery();
      await persistLearningStateNow();
      replacePracticalStats(snapshot.practicalStats || {});
      if (snapshot.gradingOverrides && isPlainRecord(snapshot.gradingOverrides)) safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(snapshot.gradingOverrides));
      if (snapshot.practicalExamProgress && isPlainRecord(snapshot.practicalExamProgress)) safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(snapshot.practicalExamProgress));

      if (snapshot.theme === "light" || snapshot.theme === "dark") {
        safeSetLocalStorage("coreloop-theme", snapshot.theme);
        applyTheme(snapshot.theme);
      } else {
        localStorage.removeItem("coreloop-theme");
        applyTheme(preferredTheme());
      }

      await clearPreimportSnapshot();
      ensureDailyReviewPlan(Date.now(), {force:true});
      renderHistory();
      await refreshUndoImportButton();
      alert("백업 가져오기 직전의 기록으로 되돌렸습니다.");
    } catch (error) {
      console.error(error);
      learningStateMemory = {
        history:cloneJson(before.history, []),
        mastery:cloneJson(before.mastery, {}),
        coreSplitMigrationVersion:Number(before.coreSplitMigrationVersion || 0),
        updatedAt:before.updatedAt || null
      };
      await persistLearningStateNow();
      replacePracticalStats(beforePracticalStats);
      safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(beforeGradingOverrides));
      safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(beforeExamProgress));
      if (beforeTheme) localStorage.setItem("coreloop-theme", beforeTheme);
      else localStorage.removeItem("coreloop-theme");
      alert("가져오기 이전 기록을 복구하지 못했습니다. 현재 기록은 변경하지 않았습니다.");
    }
  }

  function isPlainRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isSafeBackupString(value, maxLength = 20000) {
    return value === undefined || value === null || (typeof value === "string" && value.length <= maxLength);
  }

  function validateBackupHistoryRecord(item) {
    if (!isPlainRecord(item) || !["general","subject"].includes(item.type)) return false;
    if (!["key","conceptKey","context","question","correctAnswer","answerText","userAnswer","area","subjectLabel","groupLabel","difficultyLabel","generalId","lineId","gapId","subjectKey","groupKey","sourceGroup","firstWrongAt","lastWrongAt","resolvedAt","lastWrongEventToken"]
      .every(field => isSafeBackupString(item[field]))) return false;

    const attempts = Number(item.attempts || 1);
    if (!Number.isFinite(attempts) || attempts < 0 || attempts > 10000000) return false;

    if (item.type === "subject" && (!item.subjectKey || !item.area)) return false;
    if (item.type === "general" && !(item.generalId || item.question || item.context)) return false;

    if (item.wrongEvents !== undefined) {
      if (!Array.isArray(item.wrongEvents) || item.wrongEvents.length > HISTORY_EVENT_LIMIT) return false;
      if (!item.wrongEvents.every(event =>
        isPlainRecord(event) &&
        typeof event.at === "string" &&
        isSafeBackupString(event.userAnswer, 20000) &&
        isSafeBackupString(event.difficultyKey, 20)
      )) return false;
    }
    return true;
  }

  function validateBackupMasteryRecord(value) {
    if (!isPlainRecord(value)) return false;
    for (const field of ["correctCount","nearCount","unknownCount","wrongCount","correctStreak","nextReviewAt","lastSeenAt","lastSuccessAt"]) {
      if (value[field] !== undefined) {
        const number = Number(value[field]);
        if (!Number.isFinite(number) || number < 0 || number > 1e15) return false;
      }
    }
    if (value.mastered !== undefined && typeof value.mastered !== "boolean") return false;
    return isSafeBackupString(value.lastResult, 20) && isSafeBackupString(value.lastEventToken, 500);
  }

  function validateBackupPracticalStats(value) {
    if (value === undefined || value === null) return true;
    if (!isPlainRecord(value)) return false;
    const targets = value.targets === undefined ? {} : value.targets;
    const lines = value.lines === undefined ? {} : value.lines;
    if (!isPlainRecord(targets) || !isPlainRecord(lines)) return false;
    if (Object.keys(targets).length > 50000 || Object.keys(lines).length > 10000) return false;

    for (const [key, stat] of Object.entries(targets)) {
      if (typeof key !== "string" || key.length > 2000 || !isPlainRecord(stat)) return false;
      for (const field of ["shown","correct","near","unknown","wrong","lastShownAt","lastResultAt"]) {
        if (stat[field] !== undefined) {
          const number = Number(stat[field]);
          if (!Number.isFinite(number) || number < 0 || number > 1e15) return false;
        }
      }
      if (!isSafeBackupString(stat.lastResult, 20)) return false;
      if (stat.successDays !== undefined && (!Array.isArray(stat.successDays) || stat.successDays.length > 30 || !stat.successDays.every(day => typeof day === "string" && day.length <= 20))) return false;
    }

    for (const [key, stat] of Object.entries(lines)) {
      if (typeof key !== "string" || key.length > 2000 || !isPlainRecord(stat)) return false;
      if (stat.presentations !== undefined) {
        const number = Number(stat.presentations);
        if (!Number.isFinite(number) || number < 0 || number > 1e9) return false;
      }
      if (stat.lastCombo !== undefined) {
        if (!Array.isArray(stat.lastCombo) || stat.lastCombo.length > 100 ||
            !stat.lastCombo.every(id => typeof id === "string" && id.length <= 500)) return false;
      }
    }
    return true;
  }

  function exportStudyData() {
    const history = loadHistory();
    const mastery = loadMastery();
    const payload = StorageEngine.buildBackupPayload({
      appVersion:APP_VERSION,
      coreSplitMigrationVersion:Number(learningStateMemory.coreSplitMigrationVersion || CORE_SPLIT_MIGRATION_VERSION),
      history, mastery, practicalStats:cloneJson(practicalStats, {}),
      gradingOverrides:loadGradingOverrides(), practicalExamProgress:loadPracticalExamProgress(),
      theme:localStorage.getItem("coreloop-theme") || null, exportedAt:new Date().toISOString()
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = LearningEngine.localDayKey(Date.now());
    a.href = url;
    a.download = `CurriLoop_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importStudyData(event) {
    const input = event?.target;
    const file = input?.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("백업 파일이 너무 큽니다(최대 8MB). 파일을 확인해 주세요.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const before = learningStateSnapshot();
      const beforePracticalStats = cloneJson(practicalStats, {});
      const oldTheme = localStorage.getItem("coreloop-theme");
      const oldGradingOverrides = loadGradingOverrides();
      const oldExamProgress = loadPracticalExamProgress();
      let snapshotSaved = false;

      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (!isPlainRecord(data)) throw new Error("백업 최상위 형식이 올바르지 않습니다.");
        if (data.app && data.app !== "CurriLoop") throw new Error("CurriLoop 백업 파일이 아닙니다.");

        const schemaVersion = Number(data.schemaVersion || 1);
        if (!StorageEngine.schemaSupported(schemaVersion)) {
          throw new Error("지원하지 않는 백업 버전입니다.");
        }
        if (!Array.isArray(data.history) || !isPlainRecord(data.mastery)) {
          throw new Error("오답 또는 복습 기록 형식이 올바르지 않습니다.");
        }
        if (data.history.length > 20000 || Object.keys(data.mastery).length > 30000) {
          throw new Error("기록 개수가 비정상적으로 많습니다.");
        }
        if (!data.history.every(validateBackupHistoryRecord)) {
          throw new Error("손상되었거나 형식이 다른 오답 기록이 포함되어 있습니다.");
        }
        if (!Object.entries(data.mastery).every(([key,value]) =>
          typeof key === "string" && key.length <= 2000 && validateBackupMasteryRecord(value)
        )) {
          throw new Error("손상되었거나 형식이 다른 복습 기록이 포함되어 있습니다.");
        }
        if (!validateBackupPracticalStats(data.practicalStats)) {
          throw new Error("손상되었거나 형식이 다른 실전 학습 기록이 포함되어 있습니다.");
        }
        if (data.gradingOverrides !== undefined) {
          if (!isPlainRecord(data.gradingOverrides) || Object.keys(data.gradingOverrides).length > 5000 ||
              !Object.entries(data.gradingOverrides).every(([key,value]) => typeof key === "string" && key.length <= 1000 && isPlainRecord(value) && value.mode === "wrong")) {
            throw new Error("손상되었거나 형식이 다른 채점 보정 기록이 포함되어 있습니다.");
          }
        }
        if (data.practicalExamProgress !== undefined && (!isPlainRecord(data.practicalExamProgress) || Number(data.practicalExamProgress.completedSinceChallenge || 0) < 0)) {
          throw new Error("손상되었거나 형식이 다른 기출 미니 체크 기록이 포함되어 있습니다.");
        }

        if (data.counts !== undefined) {
          if (!isPlainRecord(data.counts) ||
              Number(data.counts.history) !== data.history.length ||
              Number(data.counts.mastery) !== Object.keys(data.mastery).length) {
            throw new Error("백업의 기록 개수 검증에 실패했습니다.");
          }
        }

        if (!confirm(`백업의 오답 항목 ${data.history.length}개와 복습 기록 ${Object.keys(data.mastery).length}개를 현재 기록 대신 불러올까요? 현재 기록은 브라우저 내부의 임시 복구본으로 보존됩니다.`)) return;

        await savePreimportSnapshot({
          learning: before,
          practicalStats: beforePracticalStats,
          gradingOverrides: oldGradingOverrides,
          practicalExamProgress: oldExamProgress,
          theme: oldTheme,
          savedAt: new Date().toISOString()
        });
        snapshotSaved = true;

        learningStateMemory = {
          history: cloneJson(data.history, []),
          mastery: cloneJson(data.mastery, {}),
          coreSplitMigrationVersion: Number(data.coreSplitMigrationVersion || 0),
          updatedAt: null
        };

        // 구형 answer 기반 concept, hard/옛 난이도, legacy line ID를 현행 stable gap ID 체계로 마이그레이션한다.
        learningStateMemory.history = loadHistory();
        learningStateMemory.mastery = loadMastery();
        replacePracticalStats(data.practicalStats || {});
        if (data.gradingOverrides !== undefined) safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(data.gradingOverrides || {}));
        if (data.practicalExamProgress !== undefined) safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(data.practicalExamProgress || {}));

        if (data.theme === "light" || data.theme === "dark") {
          if (!safeSetLocalStorage("coreloop-theme", data.theme)) throw new Error("테마 설정을 저장하지 못했습니다.");
          applyTheme(data.theme);
        }

        await persistLearningStateNow();
        ensureDailyReviewPlan(Date.now(), {force:true});

        // 실제 저장소를 다시 읽어 개수와 구조를 검증한다.
        if (learningStorageMode === "indexeddb" && learningDb) {
          const checked = await idbGet(LEARNING_STATE_KEY);
          if (!validLearningStateRecord(checked) ||
              checked.history.length !== learningStateMemory.history.length ||
              Object.keys(checked.mastery).length !== Object.keys(learningStateMemory.mastery).length) {
            throw new Error("IndexedDB 저장 후 검증에 실패했습니다.");
          }
        } else {
          const checked = JSON.parse(localStorage.getItem(FALLBACK_STATE_KEY) || "null");
          if (!validLearningStateRecord(checked) ||
              checked.history.length !== learningStateMemory.history.length ||
              Object.keys(checked.mastery).length !== Object.keys(learningStateMemory.mastery).length) {
            throw new Error("fallback 저장 후 검증에 실패했습니다.");
          }
        }

        renderHistory();
        await refreshUndoImportButton();
        alert("백업을 정상적으로 불러왔습니다. 필요하면 ‘가져오기 되돌리기’로 직전 기록을 복원할 수 있습니다.");
      } catch (error) {
        console.error(error);
        learningStateMemory = {
          history: cloneJson(before.history, []),
          mastery: cloneJson(before.mastery, {}),
          coreSplitMigrationVersion: Number(before.coreSplitMigrationVersion || 0),
          updatedAt: before.updatedAt || null
        };
        await persistLearningStateNow();
        replacePracticalStats(beforePracticalStats);
        safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(oldGradingOverrides));
        safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(oldExamProgress));
        if (oldTheme === "light" || oldTheme === "dark") {
          safeSetLocalStorage("coreloop-theme", oldTheme);
          applyTheme(oldTheme);
        } else {
          localStorage.removeItem("coreloop-theme");
          applyTheme(preferredTheme());
        }
        if (snapshotSaved) await clearPreimportSnapshot();
        await refreshUndoImportButton();
        alert(`백업을 적용하지 않았습니다. 기존 기록은 유지됩니다.\n\n이유: ${error?.message || "파일을 확인해 주세요."}`);
      } finally {
        if (input) input.value = "";
      }
    };
    reader.onerror = () => {
      alert("백업 파일을 읽지 못했습니다. 파일 상태를 확인해 주세요.");
      if (input) input.value = "";
    };
    reader.readAsText(file, "utf-8");
  }

  function clearWrongHistoryOnly() {
    if (!confirm("오답 기록만 삭제할까요? 숙련도·복습 일정·실전 학습 통계는 유지됩니다.")) return;
    learningStateMemory.history = [];
    saveHistory([]);
    renderHistory();
  }

  async function clearAllLearningData() {
    if (!confirm("학습 기록 전체를 초기화할까요? 오답 기록, 숙련도, 복습 일정, 실전 통계가 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.")) return;
    reviewActive = false;
    reviewQueue = [];
    reviewPosition = -1;
    activeReviewConceptKey = null;
    reviewGraded = false;
    learningStateMemory.history = [];
    learningStateMemory.mastery = {};
    practicalRetryQueue = [];
    activePracticalRetry = null;
    practicalGradeSerial = 0;
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    Object.keys(practicalStats).forEach(key => delete practicalStats[key]);
    localStorage.removeItem(PRACTICAL_STATS_KEY);
    sessionStorage.removeItem(PRACTICAL_RETRY_KEY);
    localStorage.removeItem(DAILY_REVIEW_PLAN_KEY);
    localStorage.removeItem(GRADING_OVERRIDE_KEY);
    localStorage.removeItem(PRACTICAL_EXAM_PROGRESS_KEY);
    practicalCountedCompletedSets.clear();
    practicalSetRecoveryCount = 0;
    hidePracticalRetryPanel();
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(MASTERY_KEY);
    localStorage.removeItem(FALLBACK_STATE_KEY);
    await persistLearningStateNow();
    renderHistory();
  }

  function formatHistoryTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function historyWrongCount(item) { return HistoryEngine.wrongCount(item); }
  function historyWrongDayCount(item) { return HistoryEngine.wrongDayCount(item); }
  function sortHistoryRecords(list, filter) { return HistoryEngine.sortRecords(list, filter); }

  function renderHistory(options = {}) {
    // 기록 필터/검색 변경은 사용자가 보고 있는 기록 영역에서만 갱신한다.
    // 복습 세션이 활성화된 채 renderReviewSession()을 다시 호출하면
    // 답안 입력칸의 scrollIntoView() 때문에 화면이 위쪽 복습 패널로 튄다.
    const passive = Boolean(options?.passive);
    const preservedScrollY = passive ? window.scrollY : null;
    const restorePassiveScroll = () => {
      if (!passive || preservedScrollY == null) return;
      requestAnimationFrame(() => window.scrollTo({top:preservedScrollY, left:window.scrollX, behavior:"auto"}));
    };

    const container = document.getElementById("historyList");
    const count = document.getElementById("historyCount");
    const filter = document.getElementById("historyFilter")?.value || "weak";
    const search = normalize(document.getElementById("historySearch")?.value || "");

    if (!container || !count) { restorePassiveScroll(); return; }

    const mastery = loadMastery();
    const now = Date.now();
    const completedLinesToday = successfulLineKeysToday(mastery, now);
    const dueCount = remainingDailyReviewItems(now).length;
    const weakList = loadHistory().filter(item => isWeakHistoryItem(item, mastery) && isReviewWorthyHistoryItem(item));
    const weakCount = LearningEngine.dedupeReviewByLine(
      weakList.filter(item => !LearningEngine.wasExactSuccessToday(mastery[item.conceptKey], now))
        .filter(item => !completedLinesToday.has(LearningEngine.reviewLineKey(item)))
        .map(item => ({item, state:mastery[item.conceptKey] || {}})),
      record => Number(record.state?.wrongCount || record.item?.attempts || 1)
    ).length;

    const dueEl = document.getElementById("reviewDueCount");
    const weakEl = document.getElementById("reviewWeakCount");
    if (dueEl) dueEl.textContent = String(dueCount);
    if (weakEl) weakEl.textContent = String(weakCount);
    const todayButton = document.getElementById("todayReviewButton");
    const weakButton = document.getElementById("weakReviewButton");
    if (todayButton) {
      todayButton.textContent = dueCount ? `오늘 복습 시작 · ${dueCount}` : "오늘 복습 완료";
      todayButton.disabled = dueCount === 0;
    }
    if (weakButton) {
      weakButton.textContent = weakCount ? `추가 보강 · ${weakCount}` : "추가 보강 없음";
      weakButton.disabled = weakCount === 0;
    }
    const nextReviewInfo = document.getElementById("nextReviewInfo");
    if (nextReviewInfo) {
      if (dueCount > 0) {
        nextReviewInfo.textContent = "오늘 복습을 완료하면 다음 예정 일정을 표시합니다.";
      } else {
        const futureEntries = Object.entries(mastery).map(([conceptKey, state]) => {
          const item = reviewItemFromConceptKey(conceptKey);
          return item ? {conceptKey, nextReviewAt:Number(state?.nextReviewAt || 0), lineKey:LearningEngine.reviewLineKey(item)} : null;
        }).filter(Boolean);
        const bucket = ReviewEngine.nextDueBucket(futureEntries, now);
        nextReviewInfo.textContent = bucket
          ? `다음 복습: ${ReviewEngine.relativeDayLabel(bucket.dayKey, now)} · ${bucket.count}개`
          : "다음 복습 일정 없음";
      }
    }

    if (reviewActive && currentTab === "history" && !passive) renderReviewSession();

    let list = loadHistory();
    if (filter === "weak") list = list.filter(item => isWeakHistoryItem(item, mastery));
    else if (filter === "resolved") list = list.filter(item => item.resolved);
    else if (filter === "general" || filter === "subject") list = list.filter(item => item.type === filter);
    if (search) {
      list = list.filter(item => normalize([item.context, item.question, item.correctAnswer, item.userAnswer, item.area, item.subjectLabel].filter(Boolean).join(" ")).includes(search));
    }
    list = sortHistoryRecords(list, filter);

    count.textContent = `${list.length}개`;
    container.innerHTML = "";

    if (!list.length) {
      const emptyCopy = filter === "weak"
        ? "반복해서 틀린 취약 항목이 없습니다.<br>한 번의 오타나 자잘한 실수는 취약 항목으로 쌓지 않습니다."
        : "조건에 맞는 복습 기록이 없습니다.";
      container.innerHTML = `<div class="history-empty">${emptyCopy}</div>`;
      restorePassiveScroll();
      return;
    }

    list.forEach(item => {
      const card = document.createElement("article");
      const weak = isWeakHistoryItem(item, mastery);
      card.className = "history-item" + (item.resolved ? " history-resolved" : "");

      const badge = item.type === "general" ? "총론" : "각론";
      const meta = item.type === "general"
        ? (item.categoryLabel || "총론")
        : [item.subjectLabel, item.area, item.groupLabel, item.difficultyLabel]
            .filter(Boolean).join(" · ");

      card.innerHTML = `
        <div class="history-item-top">
          <span class="history-badge">${escapeHtml(badge)}</span>
          ${meta ? `<span class="history-badge">${escapeHtml(meta)}</span>` : ""}
          ${weak && !item.resolved ? `<span class="history-badge">취약</span>` : ""}
          ${item.attempts > 1 ? `<span class="history-badge">${item.attempts}회 오답</span>` : ""}
          ${item.resolved ? `<span class="history-badge resolved-badge">해결됨</span>` : ""}
          <span class="history-time">${item.firstWrongAt && item.firstWrongAt !== item.lastWrongAt ? `최초 ${escapeHtml(formatHistoryTime(item.firstWrongAt))} · ` : ""}최근 ${escapeHtml(formatHistoryTime(item.lastWrongAt))}</span>
        </div>

        <div class="history-context">${escapeHtml(item.context || item.question || "")}</div>

        <div class="history-answer-row">
          <div class="history-answer-label">내 답</div>
          <div class="history-wrong-answer">${escapeHtml(item.userAnswer || "(미입력)")}</div>
        </div>

        <div class="history-answer-row">
          <div class="history-answer-label">정답</div>
          <div class="history-correct-answer">${escapeHtml(item.correctAnswer || "")}</div>
        </div>

        <div class="history-actions">
          <button class="btn" type="button" data-history-review="${escapeHtml(item.key)}">이 페이지에서 복습</button>
          <button class="btn soft" type="button" data-history-source="${escapeHtml(item.key)}">원문에서 보기</button>
          <button class="btn soft" type="button" data-history-key="${escapeHtml(item.key)}">삭제</button>
        </div>
      `;

      card.querySelector("button[data-history-review]")?.addEventListener("click", () => startHistoryItemReview(item.key));
      card.querySelector("button[data-history-source]")?.addEventListener("click", () => openHistorySource(item));
      card.querySelector("button[data-history-key]")?.addEventListener("click", () => removeHistoryItem(item.key));
      container.appendChild(card);
    });
    restorePassiveScroll();
  }


  // -------------------------
  // 8) 채점
  // -------------------------
  function loadGradingOverrides() {
    try {
      const parsed = JSON.parse(localStorage.getItem(GRADING_OVERRIDE_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  }

  function gradingOverrideKey(rawUser, expected) {
    return `${normalize(rawUser)}=>${normalize(expected)}`;
  }

  function rememberStrictGradingPair(rawUser, expected) {
    if (!normalize(rawUser) || !normalize(expected)) return false;
    const overrides = loadGradingOverrides();
    overrides[gradingOverrideKey(rawUser, expected)] = {mode:"wrong", savedAt:new Date().toISOString()};
    return safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(overrides));
  }

  function classifyRawAnswerDetailed(rawUser, expected, aliases = []) {
    const detail = GradingEngine.classifyDetailed(rawUser, expected, aliases);
    if (detail.status === "near") {
      const overrides = loadGradingOverrides();
      if (overrides[gradingOverrideKey(rawUser, expected)]?.mode === "wrong") {
        return {status:"wrong", reason:"user-strict", confidence:1, matched:String(expected || "")};
      }
    }
    return detail;
  }

  function classifyRawAnswer(rawUser, expected, aliases = []) {
    return classifyRawAnswerDetailed(rawUser, expected, aliases).status;
  }

  function classifyInputDetailed(input) {
    const expected = input.dataset.answer;
    const aliases = JSON.parse(input.dataset.aliases || "[]");
    return classifyRawAnswerDetailed(input.value, expected, aliases);
  }

  function classifyInput(input) {
    return classifyInputDetailed(input).status;
  }

  function nearReasonText(detail) {
    return GradingEngine.reasonLabel(detail?.reason || "");
  }

  function isCorrect(input) {
    return ["correct","near"].includes(classifyInput(input));
  }

  function appendResult(wrap, status, answer, detail = null) {
    const old = wrap.querySelector(".gap-result");
    if (old) old.remove();
    const input = wrap.querySelector(".gap-input");
    const span = document.createElement("span");
    const good = status === "correct" || status === "near";
    span.className = "gap-result " + (good ? "good" : status === "unknown" ? "unknown" : "bad") + (status === "near" ? " near" : "");
    span.id = `gap-result-${stableHash(input?.dataset.stateKey || `${answer}|${status}`)}`;
    const text = document.createElement("span");
    text.textContent = status === "correct" ? "✓"
      : status === "near" ? `≈ 유예 · ${nearReasonText(detail)} · 공식 표기: ${answer}`
      : status === "unknown" ? `? 모름 · 정답: ${answer}`
      : `✕ 정답: ${answer}`;
    span.appendChild(text);
    if (status === "near" && input) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "grading-override-button";
      button.textContent = "오답으로 처리";
      button.addEventListener("click", () => forceNearAsWrong(input));
      span.appendChild(button);
    }
    wrap.appendChild(span);
    if (input) {
      input.setAttribute("aria-describedby", span.id);
      input.setAttribute("aria-invalid", good ? "false" : "true");
    }
  }

  function learningContextForInput(input) {
    const unit = getCurrentUnit();
    const sections = getUnitData(unit.subject, unit.area, getCurrentGroup());
    const sectionIndex = Number(input.dataset.sectionIndex);
    const lineIndex = Number(input.dataset.lineIndex);
    const line = sections?.[sectionIndex]?.lines?.[lineIndex];
    const context = line?.text || "";
    const lineId = input.dataset.lineId || makeLineStableId(sections?.[sectionIndex]?.title || "", context, line?.id || "");
    const answerOccurrence = Number(input.dataset.answerOccurrence || 0);
    const sourceGroup = input.dataset.sourceGroup || sections?.[sectionIndex]?._sourceGroup || getCurrentGroup();
    const gapId = input.dataset.gapId || resolveGapIdForLine(line, getCurrentDifficulty(), input.dataset.answer, Number(input.dataset.gapIndex || -1));
    const conceptKey = conceptKeyForSubject(unit, sourceGroup, lineId, gapId, answerOccurrence);
    return {unit, sections, sectionIndex, lineIndex, line, context, lineId, answerOccurrence, sourceGroup, gapId, conceptKey};
  }

  function gradeOne(input) {
    const normalizedValue = normalize(input.value);
    const grading = classifyInputDetailed(input);
    const answerStatus = grading.status;
    const correct = answerStatus === "correct" || answerStatus === "near";
    const practical = getCurrentDifficulty() === "practical";
    input.classList.remove("correct","wrong","unknown");
    input.classList.add(correct ? "correct" : answerStatus === "unknown" ? "unknown" : "wrong");

    const state = fieldState[input.dataset.stateKey] || {};
    state.value = input.value;
    state.status = answerStatus;
    state.nearReason = answerStatus === "near" ? grading.reason : "";

    const gradingSignature = `${normalizedValue || "__blank__"}|${answerStatus}`;
    const outcomeAlreadyCounted = answerStatus === "correct"
      ? Boolean(state.correctOutcomeCounted)
      : answerStatus === "near"
        ? Boolean(state.nearOutcomeCounted)
        : answerStatus === "unknown"
          ? Boolean(state.unknownOutcomeCounted)
          : Boolean(state.wrongOutcomeCounted);
    const practicalAlreadyCounted = practical && Boolean(state.practicalOutcomeCounted);
    const isNewGradingEvent = !practicalAlreadyCounted && !outcomeAlreadyCounted && state.lastCountedSignature !== gradingSignature;
    if (isNewGradingEvent) {
      state.lastCountedSignature = gradingSignature;
      if (answerStatus === "correct") state.correctOutcomeCounted = true;
      else if (answerStatus === "near") state.nearOutcomeCounted = true;
      else if (answerStatus === "unknown") state.unknownOutcomeCounted = true;
      else state.wrongOutcomeCounted = true;
      if (practical) {
        state.practicalOutcomeCounted = true;
        state.practicalInitialStatus = answerStatus;
      }
    }
    fieldState[input.dataset.stateKey] = state;
    scheduleStateSave();

    appendResult(input.parentElement, state.status, input.dataset.answer, grading);

    const meta = learningContextForInput(input);
    const eventToken = isNewGradingEvent ? makeGradingEventToken("subject", meta.conceptKey, gradingSignature) : "";

    let masteryItem = null;
    if (isNewGradingEvent) {
      masteryItem = updateMastery(meta.conceptKey, answerStatus, eventToken);
      if (practical) recordPracticalTargetResult(meta.line, meta.gapId, answerStatus);
    }

    const historyPayload = {
      type: "subject", key: meta.conceptKey, conceptKey: meta.conceptKey, subjectKey: meta.unit.subject,
      groupKey: meta.sourceGroup, sourceGroup: meta.sourceGroup, difficultyKey: getCurrentDifficulty(),
      sectionIndex: meta.sectionIndex, lineIndex: meta.lineIndex, gapIndex: Number(input.dataset.gapIndex || 0), lineId: meta.lineId, gapId: meta.gapId, answerOccurrence: meta.answerOccurrence,
      answerText: input.dataset.answer, subjectLabel: subjectLabels[meta.unit.subject] || meta.unit.subject, area: meta.unit.area,
      groupLabel: groupLabels[meta.sourceGroup] || meta.sourceGroup, difficultyLabel: difficultyLabel(getCurrentDifficulty()),
      context: meta.context, userAnswer: input.value, correctAnswer: input.dataset.answer
    };

    if (answerStatus === "wrong" && isNewGradingEvent) {
      if (Number(masteryItem?.wrongCount || 0) >= 2) addWrongHistory({...historyPayload, attempts:Number(masteryItem.wrongCount || 2)}, eventToken);
      if (practical) schedulePracticalRetry({...historyPayload, aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"wrong"});
    } else if (answerStatus === "unknown" && isNewGradingEvent) {
      // '모름'은 기억 실패이므로 복습 시점은 당기되, 사용자가 입력한 오답 표현으로는 기록하지 않는다.
      if (practical) schedulePracticalRetry({...historyPayload, aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"unknown"});
    } else if (answerStatus === "near" && isNewGradingEvent && practical) {
      schedulePracticalRetry({...historyPayload, aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"near", nearReason:grading.reason});
    }

    updateScore();
    return correct;
  }

  function forceNearAsWrong(input) {
    if (!input) return;
    const state = fieldState[input.dataset.stateKey];
    if (!state || state.status !== "near") return;
    const expected = input.dataset.answer || "";
    if (!rememberStrictGradingPair(input.value, expected)) return;

    const meta = learningContextForInput(input);
    const all = loadMastery();
    let masteryItem = LearningEngine.normalizeMasteryItem(all[meta.conceptKey] || {});
    const nearWasCounted = Boolean(state.nearOutcomeCounted);
    const wrongWasCounted = Boolean(state.wrongOutcomeCounted);
    if (nearWasCounted && masteryItem.nearCount > 0) masteryItem.nearCount -= 1;

    let eventToken = "";
    if (!wrongWasCounted) {
      eventToken = makeGradingEventToken("subject-override", meta.conceptKey, `${normalize(input.value)}|wrong`);
      masteryItem = LearningEngine.applyMasteryEvent(masteryItem, "wrong", Date.now(), eventToken).item;
    } else {
      // 같은 제시에서 이미 오답으로 한 번 기록된 뒤 유사답안으로 고친 경우에는 오답 횟수를 중복 가산하지 않는다.
      masteryItem.correctStreak = 0;
      masteryItem.mastered = false;
      masteryItem.nextReviewAt = Date.now();
      masteryItem.lastResult = "wrong";
      masteryItem.lastSeenAt = Date.now();
    }
    all[meta.conceptKey] = masteryItem;
    saveMastery(all);

    const convertPracticalStat = getCurrentDifficulty() === "practical" && state.practicalInitialStatus === "near" && meta.line && meta.gapId;
    if (convertPracticalStat) {
      const key = practicalTargetKey(meta.line, meta.gapId);
      const stat = practicalStats.targets?.[key];
      if (stat) {
        stat.near = Math.max(0, Number(stat.near || 0) - 1);
        stat.shown = Math.max(0, Number(stat.shown || 0) - 1);
        practicalStats.targets[key] = PracticalEngine.noteResult(stat, "wrong", LearningEngine.localDayKey(Date.now()), Date.now(), true);
        practicalStats._version = 3;
        savePracticalStats();
      }
    }

    state.status = "wrong";
    state.nearReason = "";
    state.nearOutcomeCounted = false;
    state.wrongOutcomeCounted = true;
    if (state.practicalInitialStatus === "near") state.practicalInitialStatus = "wrong";
    state.lastCountedSignature = `${normalize(input.value) || "__blank__"}|wrong`;
    fieldState[input.dataset.stateKey] = state;
    scheduleStateSave();
    input.classList.remove("correct","unknown");
    input.classList.add("wrong");
    appendResult(input.parentElement, "wrong", expected, {reason:"user-strict"});

    const payload = {
      type:"subject", key:meta.conceptKey, conceptKey:meta.conceptKey, subjectKey:meta.unit.subject,
      groupKey:meta.sourceGroup, sourceGroup:meta.sourceGroup, difficultyKey:getCurrentDifficulty(),
      sectionIndex:meta.sectionIndex, lineIndex:meta.lineIndex, gapIndex:Number(input.dataset.gapIndex || 0), lineId:meta.lineId, gapId:meta.gapId, answerOccurrence:meta.answerOccurrence,
      answerText:expected, subjectLabel:subjectLabels[meta.unit.subject] || meta.unit.subject, area:meta.unit.area,
      groupLabel:groupLabels[meta.sourceGroup] || meta.sourceGroup, difficultyLabel:difficultyLabel(getCurrentDifficulty()),
      context:meta.context, userAnswer:input.value, correctAnswer:expected
    };
    if (!wrongWasCounted && Number(masteryItem.wrongCount || 0) >= 2) addWrongHistory({...payload, attempts:Number(masteryItem.wrongCount || 2)}, eventToken);
    if (getCurrentDifficulty() === "practical") schedulePracticalRetry({...payload, aliases:JSON.parse(input.dataset.aliases || "[]"), retryReason:"wrong"});
    updateScore();
    renderHistory({passive:true});
  }


  function notePracticalProblemCompletion(input) {
    if (getCurrentDifficulty() !== "practical" || studyMode !== "fill" || !input) return;
    const lineId = input.dataset.lineId || input.dataset.lineKey || "";
    if (!lineId) return;
    const sameLine = [...document.querySelectorAll("#studyArea .gap-input")].filter(candidate => (candidate.dataset.lineId || candidate.dataset.lineKey || "") === lineId);
    if (!sameLine.length) return;
    const complete = sameLine.every(candidate => {
      const status = fieldState[candidate.dataset.stateKey]?.status;
      return status === "correct" || status === "near";
    });
    if (!complete) return;
    const unit = getCurrentUnit();
    const sections = getUnitData(unit.subject, unit.area, getCurrentGroup());
    const si = Number(input.dataset.sectionIndex), li = Number(input.dataset.lineIndex);
    const line = sections?.[si]?.lines?.[li];
    const token = line ? practicalPresentationToken(line) : "";
    const completionKey = `${unit.subject}|${unit.area}|${lineId}|${token}`;
    if (practicalCompletedLineTokens.has(completionKey)) return;
    practicalCompletedLineTokens.add(completionKey);
    practicalGradeSerial += 1;
    persistPracticalRetryState();
    maybeShowPracticalRetry();
  }

  function gradeAllVisible() {
    if (studyMode !== "fill") return;
    const allInputs = [...document.querySelectorAll("#studyArea .gap-input")];
    // 빈칸을 비워 둔 채 '전체 채점'했다고 해서 지식 오답으로 누적하지 않는다.
    const inputs = allInputs.filter(input => normalize(input.value));
    if (!inputs.length) {
      const announcer = document.getElementById("gradingAnnouncer");
      if (announcer) announcer.textContent = "입력한 빈칸이 없습니다. 전체 채점은 입력한 답만 평가합니다.";
      focusFirstEmpty();
      return;
    }
    inputs.forEach(input => {
      const ok = gradeOne(input);
      if (ok) notePracticalProblemCompletion(input);
    });
    const wrongCount = inputs.filter(input => fieldState[input.dataset.stateKey]?.status === "wrong").length;
    const correctCount = inputs.length - wrongCount;
    const skippedCount = allInputs.length - inputs.length;
    const announcer = document.getElementById("gradingAnnouncer");
    if (announcer) announcer.textContent = `전체 채점 완료. 정답/표기확인 ${correctCount}개, 오답 ${wrongCount}개${skippedCount ? `, 미입력 ${skippedCount}개 제외` : ""}.`;
    const firstWrong = inputs.find(input => fieldState[input.dataset.stateKey]?.status === "wrong");
    if (firstWrong) {
      firstWrong.focus();
      firstWrong.scrollIntoView({block:"center", behavior:"smooth"});
    }
  }

  function resetVisible() {
    if (!isInputStudyMode()) return;
    clearCurrentUnitState(studyMode);
    if (getCurrentDifficulty() === "practical") {
      practicalComboCache.clear();
      practicalPresentationTokens.clear();
      practicalCompletedLineTokens.clear();
      hidePracticalExamChallenge();
      practicalSetRecoveryCount = 0;
      practicalExamOfferedSetKey = "";
      document.getElementById("practicalSetSummary")?.classList.add("hidden");
    }
    renderStudy();
    focusFirstEmpty();
  }

  function nextPracticalSet() {
    if (studyMode !== "fill" || getCurrentDifficulty() !== "practical") return;
    clearCurrentUnitState("fill");
    practicalComboCache.clear();
    practicalPresentationTokens.clear();
    practicalCompletedLineTokens.clear();
    hidePracticalRetryPanel();
    hidePracticalExamChallenge();
    practicalSetRecoveryCount = 0;
    practicalExamOfferedSetKey = "";
    document.getElementById("practicalSetSummary")?.classList.add("hidden");
    renderStudy();
    const announcer = document.getElementById("gradingAnnouncer");
    if (announcer) announcer.textContent = "새 실전 세트를 만들었습니다. 같은 원문에서 다른 핵심 빈칸을 다시 인출합니다.";
    requestAnimationFrame(() => focusFirstEmpty());
  }

  function focusMatchingLine(snapshot) {
    if (activePracticalRetry) {
      focusPracticalRetryInput();
      return;
    }
    if (!snapshot) return;

    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const target =
      inputs.find(input =>
        Number(input.dataset.sectionIndex) === Number(snapshot.sectionIndex) &&
        Number(input.dataset.lineIndex) === Number(snapshot.lineIndex) &&
        !input.value
      ) ||
      inputs.find(input =>
        Number(input.dataset.sectionIndex) === Number(snapshot.sectionIndex) &&
        Number(input.dataset.lineIndex) === Number(snapshot.lineIndex)
      );

    if (target) {
      target.focus();
      target.scrollIntoView({block:"center", behavior:"smooth"});
    }
  }


  function advanceAfterGrade(current) {
    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const i = inputs.indexOf(current);

    if (i >= 0) {
      // 이미 맞힌 칸을 건너뛰고 다음 미완료 입력칸으로 이동한다.
      // 사용자가 앞 칸을 다시 수정해도 Enter가 '다음 빈칸'이라는 기대대로 동작한다.
      const target = inputs.slice(i + 1).find(input => {
        const status = fieldState[input.dataset.stateKey]?.status;
        return status !== "correct" && status !== "near" && status !== "trace-correct";
      });
      if (target) {
        target.focus();
        requestAnimationFrame(() => target.scrollIntoView({block:"center", behavior:"smooth"}));
        return;
      }
    }

    // 단원의 마지막 답을 맞혀도 다음 단원/랜덤 단원으로 자동 이동하지 않는다.
    // 정답 표시를 확인한 뒤 사용자가 '다음 단원' 또는 '다음 실전 세트'를 직접 선택한다.
    if (current) {
      current.focus({preventScroll:true});
      requestAnimationFrame(() => current.scrollIntoView({block:"center", behavior:"smooth"}));
    }
  }

  function focusFirstEmpty() {
    if (activePracticalRetry) {
      focusPracticalRetryInput();
      return;
    }
    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const target = inputs.find(i => !i.value) || inputs[0];
    if (target) target.focus();
  }

  function currentPracticalSetKey() {
    const unit = getCurrentUnit();
    const prefix = `${unit.subject}|${unit.area}|`;
    const tokens = [...practicalPresentationTokens.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, token]) => `${key}:${token}`)
      .sort();
    return `${unit.subject}|${unit.area}|${tokens.join(";")}`;
  }

  function hidePracticalExamChallenge() {
    const panel = document.getElementById("practicalExamChallenge");
    if (panel) panel.classList.add("hidden");
    activePracticalExamChallenge = null;
  }

  function loadPracticalExamProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PRACTICAL_EXAM_PROGRESS_KEY) || "{}");
      return {
        completedSinceChallenge:Math.max(0, Number(parsed?.completedSinceChallenge || 0)),
        lastType:String(parsed?.lastType || "")
      };
    } catch { return {completedSinceChallenge:0, lastType:""}; }
  }

  function savePracticalExamProgress(progress) {
    safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify({
      completedSinceChallenge:Math.max(0, Number(progress?.completedSinceChallenge || 0)),
      lastType:String(progress?.lastType || "")
    }));
  }

  function recordPracticalSetCompletion(setKey) {
    if (!setKey || practicalCountedCompletedSets.has(setKey)) return loadPracticalExamProgress();
    practicalCountedCompletedSets.add(setKey);
    const progress = loadPracticalExamProgress();
    progress.completedSinceChallenge += 1;
    savePracticalExamProgress(progress);
    return progress;
  }

  function studiedLineKeysForSubject(subjectKey) {
    const set = new Set();
    Object.entries(practicalStats.targets || {}).forEach(([key, stat]) => {
      if (!stat || Number(stat.shown || 0) <= 0) return;
      const parts = String(key).split("|");
      if (parts[0] === subjectKey && parts.length >= 4) set.add(`${parts[1]}|${parts[2]}`);
    });
    Object.keys(loadMastery()).forEach(conceptKey => {
      const parts = String(conceptKey).split("|");
      if (parts[0] === "subject" && parts[1] === subjectKey && parts.length >= 5) set.add(`${parts[2]}|${parts[4]}`);
    });
    return set;
  }

  function challengeCandidatesForCurrentSubject() {
    const unit = getCurrentUnit();
    const subject = curriculumData[unit.subject] || {};
    const studied = studiedLineKeysForSubject(unit.subject);
    const category = [];
    const area = [];
    Object.entries(subject).forEach(([areaName, groups]) => {
      if (areaName === COMMON_AREA) return;
      (groups["content-system"] || []).forEach(section => {
        if (["핵심 아이디어","지식·이해","과정·기능","가치·태도"].includes(section.title)) {
          (section.lines || []).forEach(line => {
            const lineId = line.id || makeLineStableId(section.title, line.text, "");
            if (studied.has(`${areaName}|${lineId}`)) category.push({type:"category", text:line.text, answer:section.title, area:areaName});
          });
        }
      });
      ["content-system","achievement"].forEach(group => (groups[group] || []).forEach(section => (section.lines || []).forEach(line => {
        const lineId = line.id || makeLineStableId(section.title, line.text, "");
        if (studied.has(`${areaName}|${lineId}`)) area.push({type:"area", text:line.text, answer:areaName, section:section.title});
      })));
    });
    return {category, area};
  }

  function nextChallengeType(available, lastType) {
    const order = ["category","area","correction"];
    if (!available.length) return "";
    const start = Math.max(-1, order.indexOf(lastType));
    for (let step = 1; step <= order.length; step++) {
      const candidate = order[(start + step + order.length) % order.length];
      if (available.includes(candidate)) return candidate;
    }
    return available[0];
  }

  function buildPracticalExamChallenge() {
    const unit = getCurrentUnit();
    const history = loadHistory().filter(item => item.type === "subject" && item.subjectKey === unit.subject && item.userAnswer && item.correctAnswer && normalize(item.userAnswer) !== normalize(item.correctAnswer));
    const correctionPool = history.filter(item => String(item.context || "").includes(item.correctAnswer || ""));
    const {category, area} = challengeCandidatesForCurrentSubject();
    const types = [];
    if (category.length) types.push("category");
    if (area.length) types.push("area");
    if (correctionPool.length) types.push("correction");
    if (!types.length) return null;
    const progress = loadPracticalExamProgress();
    const type = nextChallengeType(types, progress.lastType);

    if (type === "correction") {
      const item = correctionPool.slice().sort((a,b) => historyWrongCount(b) - historyWrongCount(a))[0];
      const altered = blankNth(item.context, item.correctAnswer, Number(item.answerOccurrence || 0)).replace("〔　　　　〕", item.userAnswer);
      return {
        type, meta:`${item.subjectLabel || subjectLabels[unit.subject]} · ${item.area || ""} · 오답 교정`,
        prompt:`다음 문장에서 잘못 바뀐 표현을 원래 교육과정 표현으로 고치시오.\n${altered}`,
        answer:item.correctAnswer,
        aliases:item.aliases || []
      };
    }
    const pool = type === "category" ? category : area;
    const item = pool[Math.floor(Math.random() * pool.length)];
    return type === "category"
      ? {type, meta:`${subjectLabels[unit.subject]} · 범주 판별`, prompt:`다음 내용은 어느 범주에 해당하는가?\n${item.text}`, answer:item.answer, aliases:[]}
      : {type, meta:`${subjectLabels[unit.subject]} · 영역 판별`, prompt:`다음 교육과정 문장은 어느 영역에 해당하는가?\n${item.text}`, answer:item.answer, aliases:[]};
  }

  function maybeOfferPracticalExamChallenge() {
    const panel = document.getElementById("practicalExamChallenge");
    if (!panel || currentTab !== "subject" || getCurrentDifficulty() !== "practical" || studyMode !== "fill") return;
    const setKey = currentPracticalSetKey();
    if (!setKey || practicalExamOfferedSetKey === setKey || activePracticalExamChallenge) return;
    const progress = loadPracticalExamProgress();
    if (progress.completedSinceChallenge < 3) { hidePracticalExamChallenge(); return; }
    if (activePracticalRetry) return; // 재인출을 먼저 끝낸 뒤 같은 완료 세트에서 제시한다.
    const challenge = buildPracticalExamChallenge();
    if (!challenge) return;
    practicalExamOfferedSetKey = setKey;
    activePracticalExamChallenge = challenge;
    progress.completedSinceChallenge = 0;
    progress.lastType = challenge.type;
    savePracticalExamProgress(progress);
    const meta = document.getElementById("practicalExamMeta");
    const prompt = document.getElementById("practicalExamPrompt");
    const input = document.getElementById("practicalExamInput");
    const feedback = document.getElementById("practicalExamFeedback");
    if (meta) meta.textContent = `${challenge.meta} · 실전 3세트 누적 체크`;
    if (prompt) prompt.textContent = challenge.prompt;
    if (input) { input.value = ""; input.classList.remove("correct","wrong","unknown"); }
    if (feedback) feedback.textContent = "이미 학습한 공식 원문과 실제 오답만 사용합니다.";
    panel.classList.remove("hidden");
  }

  function gradePracticalExamChallenge() {
    const challenge = activePracticalExamChallenge;
    const input = document.getElementById("practicalExamInput");
    const feedback = document.getElementById("practicalExamFeedback");
    if (!challenge || !input) return;
    const grading = classifyRawAnswerDetailed(input.value, challenge.answer, challenge.aliases || []);
    const status = grading.status;
    const ok = status === "correct" || status === "near";
    input.classList.remove("correct","wrong","unknown");
    input.classList.add(ok ? "correct" : status === "unknown" ? "unknown" : "wrong");
    if (feedback) feedback.textContent = ok
      ? (status === "near" ? `유사 답안 유예 · ${nearReasonText(grading)} · 공식 표기: ${challenge.answer}` : `✓ 정답 · ${challenge.answer}`)
      : status === "unknown" ? `? 모름 · 정답: ${challenge.answer}` : `✕ 정답: ${challenge.answer}`;
  }

  function skipPracticalExamChallenge() {
    hidePracticalExamChallenge();
  }

  function updateScore() {
    const unit = getCurrentUnit();
    const selectedGroup = getCurrentGroup();
    const scoreGroups = selectedGroup === "all"
      ? (unit.area === COMMON_AREA ? ["character-goal", "teaching-evaluation"] : ["content-system", "achievement"])
      : [selectedGroup];
    const currentPrefixes = unit.subject && unit.area
      ? scoreGroups.map(group => [unit.subject, unit.area, group, getCurrentDifficulty()].join("|") + "|")
      : [];

    const summaryUnitKey = `${unit.subject}|${unit.area}|${selectedGroup}`;
    if (summaryUnitKey !== practicalSummaryUnitKey) {
      practicalSummaryUnitKey = summaryUnitKey;
      practicalSetRecoveryCount = 0;
    }

    let currentCorrect = 0;
    let currentNear = 0;
    let currentWrong = 0;
    let currentUnknown = 0;

    const visibleInputs = [...document.querySelectorAll("#studyArea .gap-input")];
    if (getCurrentDifficulty() === "practical") {
      visibleInputs.forEach(input => {
        const state = fieldState[input.dataset.stateKey];
        if (state?.status === "correct") currentCorrect++;
        else if (state?.status === "near") currentNear++;
        else if (state?.status === "wrong") currentWrong++;
        else if (state?.status === "unknown") currentUnknown++;
      });
    } else {
      Object.entries(fieldState).forEach(([key, state]) => {
        if (currentPrefixes.some(prefix => key.startsWith(prefix))) {
          if (state.status === "correct") currentCorrect++;
          else if (state.status === "near") currentNear++;
          else if (state.status === "wrong") currentWrong++;
          else if (state.status === "unknown") currentUnknown++;
        }
      });
    }
    const lineGroups = new Map();
    visibleInputs.forEach(input => {
      const key = input.dataset.lineKey || "line";
      if (!lineGroups.has(key)) lineGroups.set(key, []);
      lineGroups.get(key).push(input);
    });

    let completedLines = 0;
    lineGroups.forEach(inputs => {
      if (inputs.length && inputs.every(input => ["correct","near"].includes(fieldState[input.dataset.stateKey]?.status))) completedLines++;
    });

    const lineText = lineGroups.size ? ` · 문장 ${completedLines}/${lineGroups.size}` : "";
    const nearText = currentNear ? ` ${currentNear}≈` : "";
    const unknownText = currentUnknown ? ` ${currentUnknown}?` : "";
    document.getElementById("scoreText").textContent = `현재 ${currentCorrect}✓${nearText} ${currentWrong}✕${unknownText}${lineText}`;

    const nextPracticalButton = document.getElementById("nextPracticalSetButton");
    const summaryPanel = document.getElementById("practicalSetSummary");
    if (nextPracticalButton) {
      const complete = studyMode === "fill" && getCurrentDifficulty() === "practical" && lineGroups.size > 0 && completedLines === lineGroups.size;
      nextPracticalButton.classList.toggle("hidden", !complete);
      if (complete) {
        const setKey = currentPracticalSetKey();
        recordPracticalSetCompletion(setKey);
        if (summaryPanel) {
          const summary = ReviewEngine.summarizePracticalStates(visibleInputs.map(input => fieldState[input.dataset.stateKey] || {}));
          summaryPanel.textContent = `실전 완료 · 정확 ${summary.correct} · 유예 ${summary.near} · 오답 ${summary.wrong} · 모름 ${summary.unknown} · 재인출 회복 ${practicalSetRecoveryCount}`;
          summaryPanel.classList.remove("hidden");
        }
        maybeOfferPracticalExamChallenge();
      } else {
        if (!activePracticalExamChallenge) hidePracticalExamChallenge();
        if (summaryPanel) summaryPanel.classList.add("hidden");
      }
    }
  }

  // -------------------------
  // 9) 총론
  // -------------------------
  const generalCategoryLabels = {
    all: "전체",
    competency: "추구하는 인간상 · 핵심역량",
    history: "개정 교육과정 변천",
    hours: "시수 · 편제",
    subjects: "과목 신설 · 통합 · 선택 유형"
  };

  function filteredGeneral() {
    const category = document.getElementById("generalCategory").value;
    let list = category === "all" ? [...generalBank] : generalBank.filter(q => q.category === category);
    if (generalShuffleState?.category === category) {
      const order = new Map(generalShuffleState.ids.map((id, i) => [id, i]));
      list.sort((a,b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
    }
    return list;
  }

  function updateGeneralProgress() {
    const list = filteredGeneral();
    const el = document.getElementById("generalProgress");
    if (el) el.textContent = `${Math.min(generalIndex + 1, list.length)} / ${list.length}`;
  }

  function resetGeneral() {
    generalIndex = 0;
    generalGraded = false;
    generalShuffleState = null;
    renderGeneral();
  }

  function shuffleGeneralQuestions() {
    const category = document.getElementById("generalCategory").value;
    const base = category === "all" ? [...generalBank] : generalBank.filter(q => q.category === category);
    generalShuffleState = {category, ids: shuffleArray(base.map(q => q.id))};
    generalIndex = 0;
    renderGeneral();
  }

  function renderGeneral() {
    const list = filteredGeneral();
    if (!list.length) return;

    generalIndex = Math.min(generalIndex, list.length - 1);
    generalGraded = false;
    generalLastGradedValue = "";
    generalCorrectCounted = false;
    generalWrongCounted = false;
    generalUnknownCounted = false;

    document.getElementById("generalQuestion").textContent = list[generalIndex].q;
    updateGeneralProgress();

    const prevButton = document.getElementById("prevGeneralButton");
    const nextButton = document.getElementById("nextGeneralButton");
    if (prevButton) prevButton.disabled = generalIndex === 0;
    if (nextButton) nextButton.disabled = generalIndex === list.length - 1;

    const answer = document.getElementById("generalAnswer");
    answer.value = "";

    const result = document.getElementById("generalResult");
    result.className = "general-result hidden";
    result.innerHTML = "";

    // 모바일에서는 문제 이동만으로 키보드가 강제로 열리지 않게 한다.
    if (window.matchMedia("(min-width: 721px) and (pointer:fine)").matches) {
      setTimeout(() => answer.focus(), 0);
    }
    scheduleStateSave();
  }


  function canCoverAnswerExactly(q, rawUser) {
    const target = normalize(rawUser);
    if (!target) return false;
    const groups = q.answers.map(group => [...new Set(group.map(normalize).filter(Boolean))]);
    const memo = new Map();

    function visit(remaining, usedMask) {
      const key = `${usedMask}|${remaining}`;
      if (memo.has(key)) return memo.get(key);
      if (usedMask === (1 << groups.length) - 1) return remaining === "";

      for (let gi = 0; gi < groups.length; gi++) {
        if (usedMask & (1 << gi)) continue;
        for (const alias of groups[gi]) {
          let from = 0;
          while (from <= remaining.length - alias.length) {
            const idx = remaining.indexOf(alias, from);
            if (idx < 0) break;
            const next = remaining.slice(0, idx) + remaining.slice(idx + alias.length);
            if (visit(next, usedMask | (1 << gi))) { memo.set(key, true); return true; }
            from = idx + 1;
          }
        }
      }
      memo.set(key, false);
      return false;
    }
    return visit(target, 0);
  }

  function isGeneralAnswerCorrect(q, rawUser) {
    const normalizedWhole = normalize(rawUser);
    if (!normalizedWhole) return false;

    if (q.answers.length === 1) {
      const accepted = [...q.answers[0], q.display];
      return accepted.some(alias => normalize(alias) === normalizedWhole);
    }

    // 여러 항목은 필요한 답을 전부 포함하면서 불필요한 추가 내용이 없어야 한다.
    return canCoverAnswerExactly(q, rawUser);
  }

  function gradeGeneral(forceUnknown = false) {
    const list = filteredGeneral();
    const q = list[generalIndex];
    const answerEl = document.getElementById("generalAnswer");
    const rawUser = forceUnknown ? "" : answerEl.value;
    const status = forceUnknown || !normalize(rawUser) ? "unknown" : (isGeneralAnswerCorrect(q, rawUser) ? "correct" : "wrong");
    const ok = status === "correct";
    const box = document.getElementById("generalResult");
    box.className = "general-result " + (ok ? "good" : status === "unknown" ? "" : "bad");
    box.innerHTML = ok
      ? `<strong>✓ 정답</strong><br><span style="color:var(--muted)">공식 정답</span><br><strong>${q.display}</strong>`
      : status === "unknown"
        ? `<strong>? 모름</strong><br><span style="color:var(--muted)">공식 정답</span><br><strong>${q.display}</strong><br><span style="color:var(--muted)">오답 표현으로 기록하지 않고 복습 일정만 당깁니다.</span>`
        : `<strong style="color:var(--bad)">✕ 오답</strong><br><span style="color:var(--muted)">공식 정답</span><br><strong style="color:var(--bad)">${q.display}</strong>`;
    box.classList.remove("hidden");

    const signature = `${normalize(rawUser) || "__blank__"}|${status}`;
    const duplicate = status === "correct" ? generalCorrectCounted : status === "unknown" ? generalUnknownCounted : generalWrongCounted;

    generalGraded = true;
    generalLastGradedValue = signature;
    if (!duplicate) {
      if (status === "correct") generalCorrectCounted = true;
      else if (status === "unknown") generalUnknownCounted = true;
      else generalWrongCounted = true;
    }

    const conceptKey = conceptKeyForGeneral(q.id);
    const eventToken = duplicate ? "" : makeGradingEventToken("general", conceptKey, signature);
    const masteryItem = !duplicate ? updateMastery(conceptKey, status, eventToken) : null;

    if (status === "wrong" && !duplicate && Number(masteryItem?.wrongCount || 0) >= 2) {
      addWrongHistory({
        type: "general",
        key: conceptKey,
        conceptKey,
        generalId: q.id,
        categoryLabel: generalCategoryLabels[q.category] || q.category,
        question: q.q,
        context: q.q,
        userAnswer: rawUser,
        correctAnswer: q.display,
        attempts: Number(masteryItem.wrongCount || 2)
      }, eventToken);
    }

    updateGeneralProgress();
    return ok;
  }

  function markGeneralUnknown() {
    gradeGeneral(true);
  }

  function nextGeneral() {
    const list = filteredGeneral();
    if (generalIndex >= list.length - 1) return;
    generalIndex++;
    renderGeneral();
  }

  function previousGeneral() {
    generalIndex = Math.max(0, generalIndex - 1);
    renderGeneral();
  }

  function restartGeneral() {
    generalIndex = 0;
    generalGraded = false;
    renderGeneral();
  }

  const generalAnswerEl = document.getElementById("generalAnswer");

  generalAnswerEl.addEventListener("input", () => {
    if (generalGraded && !generalLastGradedValue.startsWith(normalize(generalAnswerEl.value) + "|")) {
      generalGraded = false;
      document.getElementById("generalResult").classList.add("hidden");
    }
    scheduleStateSave();
  });

  generalAnswerEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // 총론은 정답을 맞혀도 곧바로 넘기지 않는다.
      // 첫 Enter는 채점 결과를 보여주고, 같은 정답을 유지한 상태의 두 번째 Enter에서만 다음으로 이동한다.
      const currentValue = normalize(generalAnswerEl.value) || "__blank__";
      if (generalGraded && generalLastGradedValue === `${currentValue}|correct`) {
        nextGeneral();
        return;
      }

      const correct = gradeGeneral();
      if (correct) {
        generalAnswerEl.focus();
        return;
      }

      // 오답이면 현재 문제에 머물고 즉시 다시 입력할 수 있게 전체 선택한다.
      generalAnswerEl.focus();
      requestAnimationFrame(() => generalAnswerEl.select());
    }
  });

  function toggleMobileSettings(forceCollapsed = null) {
    const panel = document.getElementById("subjectControlPanel");
    const button = document.getElementById("mobileSettingsToggle");
    if (!panel || !button) return;
    const collapsed = forceCollapsed === null ? !panel.classList.contains("settings-collapsed") : Boolean(forceCollapsed);
    panel.classList.toggle("settings-collapsed", collapsed);
    button.textContent = collapsed ? "학습 설정 펼치" : "학습 설정 접기";
    button.setAttribute("aria-expanded", collapsed ? "false" : "true");
    updateStickyMetrics();
  }

  function updateStickyMetrics() {
    const header = document.querySelector("header");
    const height = header ? Math.ceil(header.getBoundingClientRect().height) : 88;
    document.documentElement.style.setProperty("--header-h", `${height}px`);

    const subjectPanel = document.getElementById("subjectControlPanel");
    if (subjectPanel) {
      const panelHeight = Math.ceil(subjectPanel.getBoundingClientRect().height || 0);
      if (panelHeight > 0) {
        document.documentElement.style.setProperty("--subject-control-h", `${panelHeight}px`);
      }
    }
  }

  // -------------------------
  // 10) 화면 테마
  // -------------------------
  function preferredTheme() {
    const saved = localStorage.getItem("coreloop-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const button = document.getElementById("themeToggle");
    if (button) button.textContent = theme === "dark" ? "밝은 화면" : "어두운 화면";
    const meta = document.getElementById("themeColorMeta");
    if (meta) meta.setAttribute("content", theme === "dark" ? "#171b19" : "#f2f3ee");
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || preferredTheme();
    const next = current === "dark" ? "light" : "dark";
    safeSetLocalStorage("coreloop-theme", next);
    applyTheme(next);
  }

  applyTheme(preferredTheme());
  const versionLabel = document.getElementById("appVersionLabel");
  if (versionLabel) versionLabel.textContent = `v${APP_VERSION}`;
  updateStickyMetrics();
  window.addEventListener("resize", updateStickyMetrics);

  const subjectControlPanelForResize = document.getElementById("subjectControlPanel");
  if (subjectControlPanelForResize && "ResizeObserver" in window) {
    const subjectControlResizeObserver = new ResizeObserver(() => updateStickyMetrics());
    subjectControlResizeObserver.observe(subjectControlPanelForResize);
  }

  function runDataAudit() {
    const result = {
      subjects: 0, areas: 0, lines: 0,
      supplementalAreas: 0, supplementalLines: 0,
      expectedSubjects: 6, expectedAreas: 27, expectedLines: 550, expectedSupplementalAreas: 6,
      duplicateLineIds: [], missingExplicitIds: [], configuredTermsMissing: [],
      emptyCore: [], emptyPrecise: [], duplicateConfiguredTerms: [],
      gapIdLengthMismatch: [], duplicateGapIds: [], gapMeaningConflicts: [],
      coreNotHiddenInPrecise: [], functionWordGaps: [], overlongGaps: [], sourcePageFields: [],
      supplementalConfiguredTermsMissing: [], supplementalGapIdLengthMismatch: [], supplementalEmpty: [], supplementalDuplicateGapIds: []
    };
    const seenLineIds = new Set();
    const functionWords = new Set(["및","과","와","의","를","을","에","로","으로","또는","그리고"]);

    const registerLineId = (where, line) => {
      const id = String(line.id || "");
      if (!id) result.missingExplicitIds.push(where);
      else if (seenLineIds.has(id)) result.duplicateLineIds.push({...where, id});
      else seenLineIds.add(id);
      return id;
    };

    const validateSupplementalLine = (where, line) => {
      registerLineId(where, line);
      ["easy", "normal"].forEach(level => {
        const terms = Array.isArray(line[level]) ? line[level] : [];
        const ids = Array.isArray(line.gapIds?.[level]) ? line.gapIds[level] : [];
        if (!terms.length) result.supplementalEmpty.push({...where, level});
        if (terms.length !== ids.length) result.supplementalGapIdLengthMismatch.push({...where, level, termCount:terms.length, gapIdCount:ids.length});
        const seenIds = new Set();
        terms.forEach((term, index) => {
          if (!term || !line.text.includes(term)) result.supplementalConfiguredTermsMissing.push({...where, level, term});
          const gapId = ids[index] || "";
          if (gapId && seenIds.has(gapId)) result.supplementalDuplicateGapIds.push({...where, level, gapId});
          if (gapId) seenIds.add(gapId);
        });
      });
    };

    result.subjects = Object.keys(curriculumData).length;
    Object.entries(curriculumData).forEach(([subjectKey, subject]) => {
      Object.entries(subject).forEach(([areaName, area]) => {
        if (areaName === COMMON_AREA) {
          result.supplementalAreas++;
          ["character-goal", "teaching-evaluation"].forEach(group => {
            (area[group] || []).forEach(section => (section.lines || []).forEach(line => {
              result.supplementalLines++;
              validateSupplementalLine({subjectKey, areaName, group, lineId:String(line.id || ""), text:line.text}, line);
            }));
          });
          return;
        }

        result.areas++;
        ["content-system", "achievement"].forEach(group => {
          (area[group] || []).forEach(section => (section.lines || []).forEach(line => {
            result.lines++;
            const where = {subjectKey, areaName, group, lineId:String(line.id || ""), text:line.text};
            registerLineId(where, line);
            if (Object.prototype.hasOwnProperty.call(line, "sourcePage")) result.sourcePageFields.push(where);

            const meaningByGapId = new Map();
            ["easy", "normal"].forEach(level => {
              const terms = Array.isArray(line[level]) ? line[level] : [];
              const ids = Array.isArray(line.gapIds?.[level]) ? line.gapIds[level] : [];
              if (!terms.length) (level === "easy" ? result.emptyCore : result.emptyPrecise).push(where);
              if (ids.length !== terms.length) result.gapIdLengthMismatch.push({...where, level, termCount:terms.length, gapIdCount:ids.length});

              const seenTerms = new Set();
              const seenIds = new Set();
              terms.forEach((term, index) => {
                const normalizedTerm = normalize(term);
                if (!term || !line.text.includes(term)) result.configuredTermsMissing.push({...where, level, term});
                if (seenTerms.has(normalizedTerm)) result.duplicateConfiguredTerms.push({...where, level, term});
                else seenTerms.add(normalizedTerm);
                const gapId = ids[index] || "";
                if (gapId && seenIds.has(gapId)) result.duplicateGapIds.push({...where, level, gapId});
                if (gapId) seenIds.add(gapId);
                if (gapId && meaningByGapId.has(gapId) && meaningByGapId.get(gapId) !== normalizedTerm) {
                  result.gapMeaningConflicts.push({...where, gapId, first:meaningByGapId.get(gapId), second:normalizedTerm});
                } else if (gapId) meaningByGapId.set(gapId, normalizedTerm);
                if (functionWords.has(String(term).trim())) result.functionWordGaps.push({...where, level, term});
                if ([...String(term)].length > 12) result.overlongGaps.push({...where, level, term});
              });
            });

            const coreSpans = findOccurrences(line.text, buildGapSpecs(line, "easy"));
            const preciseSpans = findOccurrences(line.text, buildGapSpecs(line, "normal"));
            coreSpans.forEach(core => {
              const covered = preciseSpans.some(precise => precise.start <= core.start && precise.end >= core.end);
              if (!covered) result.coreNotHiddenInPrecise.push({...where, term:core.spec.answer, start:core.start, end:core.end});
            });
          }));
        });
      });
    });

    const originalChecks = ["duplicateLineIds","missingExplicitIds","configuredTermsMissing","emptyCore","emptyPrecise","duplicateConfiguredTerms","gapIdLengthMismatch","duplicateGapIds","gapMeaningConflicts","coreNotHiddenInPrecise","functionWordGaps","overlongGaps","sourcePageFields"];
    const supplementChecks = ["supplementalConfiguredTermsMissing","supplementalGapIdLengthMismatch","supplementalEmpty","supplementalDuplicateGapIds"];
    result.ok = result.subjects === result.expectedSubjects && result.areas === result.expectedAreas && result.lines === result.expectedLines &&
      result.supplementalAreas === result.expectedSupplementalAreas && result.supplementalLines > 0 &&
      [...originalChecks, ...supplementChecks].every(key => result[key].length === 0);
    if (!result.ok) console.error("CurriLoop 데이터 감사 실패", result);
    else console.info("CurriLoop 데이터 감사 통과", {subjects:result.subjects, areas:result.areas, lines:result.lines, supplementalLines:result.supplementalLines});
    return result;
  }



  let helpModalReturnFocus = null;

  function setModalBackgroundInert(enabled) {
    const backdrop = document.getElementById("helpModalBackdrop");
    [...document.body.children].forEach(element => {
      if (element === backdrop || element.tagName === "SCRIPT") return;
      if (enabled) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
  }

  function openHelpModal() {
    const backdrop = document.getElementById("helpModalBackdrop");
    if (!backdrop) return;
    helpModalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    backdrop.classList.remove("hidden");
    document.body.dataset.modalOpen = "true";
    setModalBackgroundInert(true);
    requestAnimationFrame(() => backdrop.querySelector("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus());
  }

  function closeHelpModal(event = null) {
    if (event && event.target !== document.getElementById("helpModalBackdrop")) return;
    document.getElementById("helpModalBackdrop")?.classList.add("hidden");
    delete document.body.dataset.modalOpen;
    setModalBackgroundInert(false);
    const target = helpModalReturnFocus && document.contains(helpModalReturnFocus) ? helpModalReturnFocus : document.querySelector(".help-button");
    helpModalReturnFocus = null;
    target?.focus();
  }

  function trapHelpModalFocus(event) {
    const backdrop = document.getElementById("helpModalBackdrop");
    if (!backdrop || backdrop.classList.contains("hidden") || event.key !== "Tab") return;
    const focusable = [...backdrop.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
      .filter(element => !element.disabled && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }


  function setupAccessibleTabs() {
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;
    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    const sync = () => tabs.forEach(tab => tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1);
    sync();
    tabList.addEventListener("keydown", event => {
      const current = document.activeElement;
      const index = tabs.indexOf(current);
      if (index < 0) return;
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus(); tabs[next].click(); sync();
    });
    const observer = new MutationObserver(sync);
    tabs.forEach(tab => observer.observe(tab, {attributes:true, attributeFilter:["aria-selected"]}));
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !document.getElementById("helpModalBackdrop")?.classList.contains("hidden")) {
      event.preventDefault();
      closeHelpModal();
      return;
    }
    trapHelpModalFocus(event);
  });

  // -------------------------
  // 11) 초기화
  // -------------------------
  async function bootstrapCurriLoop() {
    await initializeLearningStorage();
    ensureDailyReviewPlan(Date.now());
    restorePracticalRetryState();
    restoreUiState();
    const restoredGeneralAnswer = restoreDraftState();
    setupAccessibleTabs();
    const retryInput = document.getElementById("practicalRetryInput");
    if (retryInput) retryInput.addEventListener("keydown", event => {
      if (event.key === "Enter") { event.preventDefault(); gradePracticalRetry(); }
    });
    const reviewAnswer = document.getElementById("reviewAnswer");
    if (reviewAnswer) reviewAnswer.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); reviewPrimaryAction(); }
    });
    window.CurriLoopAudit = runDataAudit();
    renderStudy();
    renderGeneral();
    if (restoredGeneralAnswer) document.getElementById("generalAnswer").value = restoredGeneralAnswer;
    renderHistory();
    await refreshUndoImportButton();
    const requestedTab = new URLSearchParams(location.search).get("tab");
    const initialTab = ["general","subject","history"].includes(requestedTab) ? requestedTab : currentTab;
    showTab(initialTab);
    statePersistenceReady = true;
    saveCurrentState();

    if (migrationQuarantineCount > 0) {
      console.warn(`CurriLoop: ${migrationQuarantineCount}개의 구형/손상 기록을 격리 보존했습니다.`);
    }
  }

  bootstrapCurriLoop().catch(error => {
    console.error("CurriLoop 초기화 실패", error);
    alert("CurriLoop 초기화 중 오류가 발생했습니다. 페이지를 새로고침하거나 백업 파일을 확인해 주세요.");
  });

// PWA registration
function showUpdateToast(worker) {
    pendingServiceWorker = worker || null;
    const toast = document.getElementById("updateToast");
    if (toast) toast.classList.remove("hidden");
  }

  function applyAppUpdate() {
    if (pendingServiceWorker) pendingServiceWorker.postMessage({type:"SKIP_WAITING"});
    else location.reload();
  }

  if ("serviceWorker" in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`/service-worker.js?v=${encodeURIComponent(APP_VERSION)}`).then(registration => {
        if (registration.waiting) showUpdateToast(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdateToast(worker);
          });
        });
        registration.update().catch(() => {});
      }).catch(() => {});
    });
  }

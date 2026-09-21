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
    "middle-info":"중학교 정보", "high-info":"고등학교 정보", "2015-middle-info":"2015 중학교 정보", "2015-high-info":"2015 고등학교 정보", "ai-basic":"인공지능 기초",
    "data-science":"데이터 과학", "software-life":"소프트웨어와 생활", "info-science":"정보과학"
  };

  // -------------------------
  // 2) 교육과정 데이터
  // line(text, 핵심 키워드, 정밀 키워드)
  // v7.5: 중등 정보는 핵심 빈칸 + 실전 통회상 + 구조 연습 파일럿. 다른 과목은 기존 체계를 유지한다.
  // -------------------------

  const subjectSourceMeta = {
    "middle-info": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 공통 교육과정 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "high-info": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 일반 선택 과목 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "ai-basic": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 진로 선택 과목 인공지능 기초", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "data-science": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 진로 선택 과목 데이터 과학", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "software-life": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 융합 선택 과목 소프트웨어와 생활", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "info-science": {book:"별책20", label:"2022 개정 [별책20] 과학 계열 선택 과목 교육과정 · 정보과학", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "2015-middle-info": {book:"별책10", label:"교육부 고시 제2020-236호 [별책10] 2015 개정 중학교 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=81884&lev=0&m=0404&opType=N&s=moe&statusYN=W"},
    "2015-high-info": {book:"별책10", label:"교육부 고시 제2020-236호 [별책10] 2015 개정 고등학교 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=81884&lev=0&m=0404&opType=N&s=moe&statusYN=W"}
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
  const curriculum2015 = window.CURRILOOP_CURRICULUM_2015?.subjects || {};
  const curriculumTransition = window.CURRILOOP_CURRICULUM_TRANSITION || {mappings:[]};
  const generalBank = window.CURRILOOP_GENERAL_BANK;
  const COMMON_AREA = window.CURRILOOP_COMMON_AREA || "과목 공통";
  const SUBJECT_GROUPS = ["character-goal", "content-system", "achievement", "core-achievement", "achievement-guidance", "teaching-evaluation"];
  const SOURCE_GROUPS = ["character-goal", "content-system", "achievement", "teaching-evaluation"];
  const groupLabels = {
    "character-goal":"성격·목표",
    "content-system":"내용체계",
    "achievement":"성취기준",
    "core-achievement":"내용체계 + 성취기준",
    "achievement-guidance":"해설 + 적용 시 고려사항",
    "teaching-evaluation":"교수학습·평가"
  };

  // 각 과목의 공식 내용체계·성취기준을 암기용 구조로 재구성한 보조 지도.
  // 원문 보기에서만 표시하며, 공식 교수·학습 순서를 의미하지 않는다.
  const CORE_FLOW_MAP = window.CURRILOOP_CORE_FLOW_MAP || Object.freeze({});

  // -------------------------
  // 4) 상태
  // -------------------------
  let currentTab = "home";
  let currentAreaIndex = 0;
  let currentRandomUnit = null;
  let studyMode = "original"; // original | mask | trace | fill | structure
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
  const APP_VERSION = "7.7.1";
  const MANUAL_GAP_REVIEW = "2026-09-21 / v7.7.1 최종 Red Team 수정 · 하루 새 세션 1개 + 건너뛰기 이월";
  let gradingEventSerial = 0;
  let statePersistenceReady = false;

  const LearningEngine = window.CurriLoopLearningEngine;
  const PracticalEngine = window.CurriLoopPracticalEngine;
  const GradingEngine = window.CurriLoopGradingEngine;
  const RecallEngine = window.CurriLoopRecallEngine;
  const StructureEngine = window.StructureEngine;
  const ReviewEngine = window.CurriLoopReviewEngine;
  const HistoryEngine = window.CurriLoopHistoryEngine;
  const StorageEngine = window.CurriLoopStorageEngine;
  const PlannerEngine = window.CurriLoopPlannerEngine;
  const PracticeEngine = window.CurriLoopPracticeEngine;
  if (!LearningEngine || !PracticalEngine || !GradingEngine || !RecallEngine || !StructureEngine || !ReviewEngine || !HistoryEngine || !StorageEngine || !PlannerEngine || !PracticeEngine) throw new Error("CurriLoop 학습 엔진 모듈을 불러오지 못했습니다.");

  const PRACTICAL_STATS_KEY = "curriloop-practical-stats-v1";
  const PRACTICAL_RETRY_KEY = "curriloop-practical-retry-v2";
  const DAILY_REVIEW_PLAN_KEY = "curriloop-daily-review-plan-v2";
  const DAILY_STUDY_PLANNER_KEY = "curriloop-daily-study-planner-v1";
  const GRADING_OVERRIDE_KEY = "curriloop-grading-overrides-v1";
  const PRACTICAL_EXAM_PROGRESS_KEY = "curriloop-practical-exam-progress-v1";
  const practicalComboCache = new Map();
  const practicalPresentationTokens = new Map();
  let practicalPresentationSerial = 0;
  let practicalGradeSerial = 0; // 실전 지연 재인출용 완료 문장 serial
  let coreGradeSerial = 0; // 중등 정보 핵심 빈칸 당일 지연 재인출용 채점 serial
  let practicalRetryQueue = [];
  let activePracticalRetry = null;
  const practicalCompletedLineTokens = new Set();
  let activePracticalExamChallenge = null;
  let practicalExamOfferedSetKey = "";
  const practicalCountedCompletedSets = new Set();
  let practicalSetRecoveryCount = 0;
  let practicalSummaryUnitKey = "";
  let activeStructureQuestion = null;
  let structureSession = null;
  let structureSessionNonce = 0;
  // v7.6.6: 오늘 플래너의 자동 진도는 새 암기 체계가 검증된 중등 정보만 연다.
  // 다른 5과목은 각론에서 수동 학습할 수 있지만, 기존 핵심+정확화 빈칸 체계를 자동으로 밀어붙이지 않는다.
  const AUTO_PLANNER_SUBJECT_ORDER = ["middle-info"];
  const AUTO_PLANNER_SUBJECT_SET = new Set(AUTO_PLANNER_SUBJECT_ORDER);
  const PAUSED_LEGACY_AUTO_SESSION_KEY = "curriloop-paused-legacy-auto-session-v1";
  const plannerStudySections = PlannerEngine.buildStudySections(curriculumData, AUTO_PLANNER_SUBJECT_ORDER, COMMON_AREA);
  let plannerFocusActive = false;
  let plannerStep = 0; // 0 원문, 1 핵심, 2 실전/정확화, 3 완료

  function loadPlannerState() {
    let normalized;
    try { normalized = PlannerEngine.normalizeState(JSON.parse(localStorage.getItem(DAILY_STUDY_PLANNER_KEY) || "{}")); }
    catch { normalized = PlannerEngine.normalizeState({}); }
    // 이전 버전에서 중등 정보 밖의 자동 세션이 이미 열려 있었다면 그대로 이어가지 않는다.
    // 작성 중 진행 상태는 별도 로컬 백업으로 보존하고, 오늘 플래너에서는 안전하게 중단한다.
    if (normalized.activeSession?.subjectKey && !AUTO_PLANNER_SUBJECT_SET.has(normalized.activeSession.subjectKey)) {
      safeSetLocalStorage(PAUSED_LEGACY_AUTO_SESSION_KEY, JSON.stringify({pausedAt:Date.now(), session:normalized.activeSession}));
      normalized.activeSession = null;
      safeSetLocalStorage(DAILY_STUDY_PLANNER_KEY, JSON.stringify(normalized));
    }
    return normalized;
  }

  function savePlannerState(state) {
    const normalized = PlannerEngine.normalizeState(state);
    normalized.updatedAt = Date.now();
    safeSetLocalStorage(DAILY_STUDY_PLANNER_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function plannerSessionSections(state = loadPlannerState()) {
    const ids = new Set(state?.activeSession?.sectionIds || []);
    return plannerStudySections.filter(section => ids.has(section.id));
  }

  function plannerSessionLabel(session) {
    if (!session) return "새 범위 없음";
    const subjectLabel = subjectLabels[session.subjectKey] || session.subjectKey;
    return `${subjectLabel} · ${session.area}`;
  }

  function plannerStepKey(step) {
    if (!step) return "";
    return `${step.mode || ""}|${step.difficulty || ""}|${step.label || ""}`;
  }

  function collectPlannerDraftFields() {
    const draftFields = {};
    document.querySelectorAll('#studyArea [data-state-key]').forEach(node => {
      const key = node.dataset.stateKey;
      if (!key || !fieldState[key] || typeof fieldState[key] !== "object") return;
      draftFields[key] = {...fieldState[key]};
    });
    return draftFields;
  }

  function collectPlannerGradedRecall() {
    const gradedRecall = {};
    document.querySelectorAll('#studyArea .holistic-recall[data-concept-key]').forEach(block => {
      const key = block.dataset.conceptKey;
      const status = block.dataset.gradedStatus;
      if (key && ["correct","near","wrong","unknown"].includes(status)) gradedRecall[key] = status;
    });
    return gradedRecall;
  }

  function plannerStudyProgressSnapshot() {
    const steps = plannerStepsForCurrentSession();
    const step = steps[Math.max(0, Math.min(plannerStep, steps.length - 1))] || null;
    return {
      stepIndex:Math.max(0, plannerStep),
      stepKey:plannerStepKey(step),
      stepLabel:step?.label || "",
      draftFields:collectPlannerDraftFields(),
      gradedRecall:collectPlannerGradedRecall(),
      structureSession:step?.mode === "structure" && structureSession ? structureSession : null,
      lastFocus:lastStudyFocus && typeof lastStudyFocus === "object" ? {...lastStudyFocus} : null
    };
  }

  function persistPlannerStudyProgress() {
    if (!plannerFocusActive) return;
    const state = loadPlannerState();
    if (!state.activeSession?.sectionIds?.length) return;
    const next = PlannerEngine.noteSessionStudyProgress(state, plannerStudyProgressSnapshot(), Date.now());
    savePlannerState(next);
  }

  function restorePlannerDraftFields(state) {
    const progress = state?.activeSession?.studyProgress;
    if (!progress?.draftFields || typeof progress.draftFields !== "object") return;
    Object.entries(progress.draftFields).forEach(([key, value]) => {
      if (key && value && typeof value === "object") fieldState[key] = {...value};
    });
  }

  function plannerResumeStepIndex(state, steps) {
    const progress = state?.activeSession?.studyProgress;
    if (!progress || !steps.length) return 0;
    if (progress.stepKey) {
      const byKey = steps.findIndex(step => plannerStepKey(step) === progress.stepKey);
      if (byKey >= 0) return byKey;
    }
    return Math.max(0, Math.min(Number(progress.stepIndex || 0), steps.length - 1));
  }

  function restorePlannerRenderedProgress() {
    if (!plannerFocusActive) return;
    const state = loadPlannerState();
    const progress = state.activeSession?.studyProgress;
    if (!progress) return;
    const gradedRecall = progress.gradedRecall || {};
    document.querySelectorAll('#studyArea .holistic-recall[data-concept-key]').forEach(block => {
      const status = gradedRecall[block.dataset.conceptKey];
      if (!["correct","near","wrong","unknown"].includes(status)) return;
      block.dataset.gradedStatus = status;
      const feedback = block.querySelector('.holistic-recall-feedback');
      if (feedback && !feedback.textContent.includes('이전 학습')) {
        feedback.className = `holistic-recall-feedback ${status}`;
        feedback.textContent = `이전 학습에서 이미 채점한 묶음입니다 (${status === "correct" ? "정확" : status === "near" ? "표기 확인" : status === "unknown" ? "모름" : "오답"}). 답을 수정하면 다시 채점하세요.`;
      }
    });
  }

  function plannerResumeNote(session, steps = plannerStepsForCurrentSession()) {
    const progress = session?.studyProgress;
    if (!progress || !steps.length) return "";
    const idx = plannerResumeStepIndex({activeSession:session}, steps);
    const current = steps[idx];
    if (!current) return "";
    if (idx === 0) return `${current.label}부터 이어서 학습합니다.`;
    return `${steps[idx - 1]?.label || "이전 단계"}까지 완료 · ${current.label}부터 이어서 학습합니다.`;
  }

  function recordPlannerStudyActivity(now = Date.now()) {
    const state = loadPlannerState();
    const next = PlannerEngine.recordStudyActivity(state, now);
    savePlannerState(next);
    return next;
  }

  function recordPlannerAssessmentOutcome(key, status, kind = "core", accuracy = null) {
    const now = Date.now();
    // 오늘 플래너 세션이 아니더라도 실제 인출/채점을 했다면 '실제 학습일'로 기록한다.
    let state = recordPlannerStudyActivity(now);
    if (!plannerFocusActive) return;
    const session = state.activeSession;
    if (!session?.sectionIds?.length) return;
    const unit = getCurrentUnit();
    if (!unit || unit.subject !== session.subjectKey || unit.area !== session.area) return;
    const next = PlannerEngine.noteSessionAssessment(state, {key, status, kind, accuracy}, now);
    savePlannerState(next);
  }

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
      home: document.getElementById("homePage"),
      general: document.getElementById("generalPage"),
      subject: document.getElementById("subjectPage"),
      practice: document.getElementById("practicePage"),
      history: document.getElementById("historyPage")
    };

    const tabs = {
      home: document.getElementById("homeTab"),
      general: document.getElementById("generalTab"),
      subject: document.getElementById("subjectTab"),
      practice: document.getElementById("practiceTab"),
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

    if (tab === "home") {
      renderTodayHome();
      hidePracticalRetryPanel();
    } else if (tab === "subject") {
      renderStudy();
      requestAnimationFrame(updateStickyMetrics);
      requestAnimationFrame(maybeShowPracticalRetry);
    } else {
      hidePracticalRetryPanel();
    }

    if (tab === "practice") {
      window.CurriLoopPracticeUI?.onShow?.();
    }

    if (tab === "history") {
      renderHistory();
    }
    scheduleStateSave();
  }

  function goHome() {
    showTab("home");
    requestAnimationFrame(() => window.scrollTo({top:0, left:0, behavior:"auto"}));
  }

  function getCurrentSubject() { return document.getElementById("subjectSelect").value; }
  function normalizeSelectedGroup(group) {
    return group || "all";
  }
  function getCurrentGroup() { return normalizeSelectedGroup(document.getElementById("groupSelect").value); }
  function isAchievementStandardSection(section) {
    return String(section?.title || "").trim() === "성취기준";
  }
  function isAchievementGuidanceSection(section) {
    const title = String(section?.title || "");
    return title.includes("성취기준 해설") || title.includes("성취기준 적용 시 고려");
  }
  function selectionGroupForHistoryItem(item) {
    const sourceGroup = item?.sourceGroup || item?.groupKey || "";
    if (sourceGroup === "content-system") return "content-system";
    if (sourceGroup === "achievement") {
      const meta = findLineIdentity(item?.subjectKey, item?.area, item?.lineId, item?.context || "");
      return isAchievementGuidanceSection({title:meta?.sectionTitle}) ? "achievement-guidance" : "achievement";
    }
    return SUBJECT_GROUPS.includes(sourceGroup) ? sourceGroup : "all";
  }
  function getCurrentDifficulty() { return document.getElementById("difficultySelect").value; }
  function getStudyMode() { return studyMode; }
  function isInputStudyMode(mode = studyMode) { return mode === "fill" || mode === "trace"; }
  function isScoredStudyMode(mode = studyMode) { return mode === "fill"; }
  function isMiddleInfoPilot(unit = null) {
    const target = unit || getCurrentUnit();
    return target?.subject === "middle-info";
  }
  function setDifficultyOptions(options, preferred = "") {
    const select = document.getElementById("difficultySelect");
    if (!select) return;
    const current = select.value;
    const signature = options.map(([value,label]) => `${value}:${label}`).join("|");
    if (select.dataset.optionSignature !== signature) {
      select.innerHTML = "";
      options.forEach(([value,label]) => {
        const option = document.createElement("option"); option.value = value; option.textContent = label; select.appendChild(option);
      });
      select.dataset.optionSignature = signature;
    }
    const values = options.map(([value]) => value);
    select.value = values.includes(current) ? current : (values.includes(preferred) ? preferred : values[0]);
  }
  function syncMiddleInfoPilotControls(unit = null) {
    const target = unit || getCurrentUnit();
    const pilot = isMiddleInfoPilot(target);
    const panel = document.getElementById("subjectControlPanel");
    const field = document.getElementById("difficultyField");
    const label = document.getElementById("difficultyLabel");
    const help = document.getElementById("difficultyHelp");
    const structure = document.getElementById("structureButton");
    const variant = document.getElementById("middleInfoFillVariant");
    const coreVariant = document.getElementById("coreFillVariantButton");
    const practicalVariant = document.getElementById("practicalFillVariantButton");
    if (panel) panel.classList.toggle("middle-info-pilot", pilot);
    if (structure) structure.classList.toggle("hidden", !pilot);
    if (pilot) {
      setDifficultyOptions([["easy","핵심"],["practical","실전"]], "easy");
      if (label) label.textContent = "빈칸 방식";
      if (field) field.classList.add("hidden");
      if (help) help.classList.add("hidden");
      if (variant) variant.classList.toggle("hidden", studyMode !== "fill");
      const activeDifficulty = getCurrentDifficulty();
      if (coreVariant) {
        const active = activeDifficulty === "easy";
        coreVariant.classList.toggle("active", active);
        coreVariant.setAttribute("aria-pressed", active ? "true" : "false");
      }
      if (practicalVariant) {
        const active = activeDifficulty === "practical";
        practicalVariant.classList.toggle("active", active);
        practicalVariant.setAttribute("aria-pressed", active ? "true" : "false");
      }
    } else {
      setDifficultyOptions([["easy","핵심"],["normal","정밀"],["yaho","야~호!"],["practical","실전"]], "normal");
      if (label) label.textContent = "난이도";
      if (field) field.classList.remove("hidden");
      if (help) help.classList.add("hidden");
      if (variant) variant.classList.add("hidden");
      if (studyMode === "structure") studyMode = "original";
    }
  }

  function setMiddleInfoFillVariant(value) {
    if (!isMiddleInfoPilot() || !["easy", "practical"].includes(value)) return;
    const select = document.getElementById("difficultySelect");
    if (!select || select.value === value) {
      syncMiddleInfoPilotControls();
      return;
    }
    select.value = value;
    syncMiddleInfoPilotControls();
    onDifficultyChange();
  }

  function areasForSubject(subject, group = getCurrentGroup()) {
    const regular = subjectAreas[subject] || [];
    group = normalizeSelectedGroup(group);
    if (group === "character-goal" || group === "teaching-evaluation") return curriculumData[subject]?.[COMMON_AREA] ? [COMMON_AREA] : [];
    if (["content-system", "achievement", "core-achievement", "achievement-guidance"].includes(group)) return [...regular];
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
    plannerFocusActive = false;
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    resetStructureSession();
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
    plannerFocusActive = false;
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    resetStructureSession();
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
    plannerFocusActive = false;
    practicalComboCache.clear(); practicalPresentationTokens.clear();
    resetStructureSession();
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
    if (!["original", "mask", "trace", "fill", "structure"].includes(mode)) return;
    if (mode === "structure" && !isMiddleInfoPilot()) return;

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
    // 현재 화면에 실제로 표시된 입력만 초기화한다.
    // 가상 출제 묶음(내용체계+성취기준 / 해설+고려사항) 사이의 기록을 잘못 지우지 않는다.
    const selector = mode === "trace" ? "#studyArea .gap-input[data-learning-mode=\"trace\"]" : "#studyArea .gap-input[data-learning-mode=\"fill\"]";
    document.querySelectorAll(selector).forEach(input => {
      if (input.dataset.stateKey) delete fieldState[input.dataset.stateKey];
    });
  }

  function updateStudyControls() {
    const modeButtons = {
      original: document.getElementById("originalButton"),
      mask: document.getElementById("maskButton"),
      trace: document.getElementById("traceButton"),
      fill: document.getElementById("fillButton"),
      structure: document.getElementById("structureButton")
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
    const progressBox = document.getElementById("studyProgressBox");
    syncMiddleInfoPilotControls();
    const pilot = isMiddleInfoPilot();
    if (gradeButton) gradeButton.classList.toggle("hidden", studyMode !== "fill");
    if (resetButton) resetButton.classList.toggle("hidden", !isInputStudyMode());
    if (progressBox) progressBox.classList.toggle("hidden", studyMode !== "fill");
    if (nextPracticalButton) {
      const legacyPractical = !pilot && studyMode === "fill" && getCurrentDifficulty() === "practical";
      nextPracticalButton.classList.toggle("hidden", !legacyPractical);
    }
    if (score) score.classList.toggle("hidden-mode-score", studyMode !== "fill");
  }

  function getUnitData(subject, area, group) {
    const unit = curriculumData[subject]?.[area];
    if (!unit) return [];
    group = normalizeSelectedGroup(group);
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
    if (group === "content-system") {
      return tagged(unit["content-system"], "content-system");
    }
    if (group === "achievement") {
      return tagged((unit.achievement || []).filter(isAchievementStandardSection), "achievement");
    }
    if (group === "core-achievement") {
      return [
        ...tagged(unit["content-system"], "content-system"),
        ...tagged((unit.achievement || []).filter(isAchievementStandardSection), "achievement")
      ];
    }
    if (group === "achievement-guidance") {
      return tagged((unit.achievement || []).filter(isAchievementGuidanceSection), "achievement");
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
      sessionStorage.setItem(PRACTICAL_RETRY_KEY, JSON.stringify({serial:practicalGradeSerial, coreSerial:coreGradeSerial, queue:practicalRetryQueue}));
    } catch {}
  }

  function restorePracticalRetryState() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(PRACTICAL_RETRY_KEY) || "null");
      if (parsed && typeof parsed === "object") {
        practicalGradeSerial = Number(parsed.serial || 0);
        coreGradeSerial = Number(parsed.coreSerial || 0);
        practicalRetryQueue = Array.isArray(parsed.queue) ? parsed.queue.filter(item => item && item.conceptKey && item.correctAnswer) : [];
      }
    } catch {
      practicalGradeSerial = 0; coreGradeSerial = 0; practicalRetryQueue = [];
    }
  }

  function schedulePracticalRetry(record) {
    if (!record?.conceptKey || !record?.correctAnswer) return;
    const retryMode = record.retryMode || "practical";
    const existing = practicalRetryQueue.find(item => item.conceptKey === record.conceptKey && (item.retryMode || "practical") === retryMode);
    // 통회상 보수는 2~3개 뒤, 핵심 빈칸은 2~4개 뒤, 일반 실전 빈칸은 4~6개 뒤 다시 만난다.
    const retryDistance = record.recallSectionTitle
      ? 2 + Math.floor(Math.random() * 2)
      : retryMode === "core"
        ? 2 + Math.floor(Math.random() * 3)
        : 4 + Math.floor(Math.random() * 3);
    const baseSerial = retryMode === "core" ? coreGradeSerial : practicalGradeSerial;
    const dueAt = baseSerial + retryDistance;
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

  function currentDelayedRetryMode() {
    if (currentTab !== "subject" || studyMode !== "fill") return "";
    if (getCurrentDifficulty() === "practical") return "practical";
    if (getCurrentDifficulty() === "easy" && isMiddleInfoPilot()) return "core";
    return "";
  }

  function maybeShowPracticalRetry() {
    const panel = document.getElementById("practicalRetryPanel");
    if (!panel) return;
    const activeMode = currentDelayedRetryMode();
    if (!activeMode) {
      panel.classList.add("hidden");
      return;
    }
    if (activePracticalRetry && practicalRetryQueue.includes(activePracticalRetry) && (activePracticalRetry.retryMode || "practical") === activeMode) {
      panel.classList.remove("hidden");
      return;
    }
    if (activePracticalRetry && (activePracticalRetry.retryMode || "practical") !== activeMode) activePracticalRetry = null;
    const due = practicalRetryQueue
      .filter(item => (item.retryMode || "practical") === activeMode && Number(item.dueAt || 0) <= (activeMode === "core" ? coreGradeSerial : practicalGradeSerial))
      .sort((a,b) => Number(a.dueAt || 0) - Number(b.dueAt || 0))[0];
    if (!due) { panel.classList.add("hidden"); return; }
    activePracticalRetry = due;
    const kicker = panel.querySelector(".practical-retry-kicker");
    const meta = document.getElementById("practicalRetryMeta");
    const prompt = document.getElementById("practicalRetryPrompt");
    const input = document.getElementById("practicalRetryInput");
    const feedback = document.getElementById("practicalRetryFeedback");
    if (kicker) kicker.textContent = due.retryMode === "core" ? "핵심 빈칸 · 다시 꺼내기" : due.recallSectionTitle ? "실전 통회상 · 틀린 항목 보수" : "실전 · 다시 꺼내기";
    if (meta) {
      const subject = due.subjectLabel || subjectLabels[due.subjectKey] || due.subjectKey || "각론";
      const area = due.area || "영역 미상";
      const group = due.groupLabel || groupLabels[due.sourceGroup || due.groupKey] || due.sourceGroup || due.groupKey || "";
      meta.textContent = [`과목: ${subject}`, `영역: ${area}`, group ? `출제 항목: ${group}` : ""].filter(Boolean).join("  ·  ");
    }
    if (prompt) prompt.textContent = blankNth(due.context || "", due.correctAnswer, Number(due.answerOccurrence || 0));
    if (input) { input.value = ""; input.classList.remove("correct","wrong","unknown"); }
    if (feedback) feedback.textContent = due.retryMode === "core" ? "아까 틀린 핵심어를 단서 없이 다시 꺼내 보세요." : "아까 헷갈린 부분을 한 번만 다시 꺼내 보세요.";
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

  function deferRetryMasteryToNextDay(conceptKey) {
    if (!conceptKey) return;
    const all = loadMastery();
    const current = LearningEngine.normalizeMasteryItem(all[conceptKey] || {});
    current.mastered = false;
    current.nextReviewAt = Math.max(Number(current.nextReviewAt || 0), Date.now() + LearningEngine.DAY_MS);
    all[conceptKey] = current;
    saveMastery(all);
  }

  function gradePracticalRetry() {
    const item = activePracticalRetry;
    const input = document.getElementById("practicalRetryInput");
    const feedback = document.getElementById("practicalRetryFeedback");
    if (!item || !input) return;
    const grading = classifyRawAnswerDetailed(input.value, item.correctAnswer, item.aliases || []);
    const status = grading.status;
    const coreRetry = item.retryMode === "core";
    const signature = `${normalize(input.value) || "__blank__"}|retry|${status}`;
    const eventToken = makeGradingEventToken(coreRetry ? "core-retry" : "practical-retry", item.conceptKey, signature);
    let masteryItem = updateMastery(item.conceptKey, status, eventToken);
    // 핵심 빈칸에서 실패 후 같은 날 지연 재인출에 정확히 성공하면 '최초 학습 성공'으로만 인정한다.
    // 날짜를 건넌 숙달 streak는 이후 장기 복습에서만 쌓이도록 다음 복습을 1일 뒤로 예약한다.
    if (coreRetry && status === "correct" && Number(masteryItem?.correctStreak || 0) === 0) {
      const all = loadMastery();
      const recovered = LearningEngine.normalizeMasteryItem(all[item.conceptKey] || masteryItem || {});
      recovered.correctStreak = 1;
      recovered.mastered = false;
      recovered.lastResult = "correct";
      recovered.lastSuccessAt = Date.now();
      recovered.nextReviewAt = Date.now() + LearningEngine.DAY_MS;
      all[item.conceptKey] = recovered;
      saveMastery(all);
      masteryItem = recovered;
    }
    if (!coreRetry) recordPracticalRetryStat(item, status);

    if (status === "correct") {
      input.classList.add("correct");
      if (feedback) feedback.textContent = "회복 완료 ✓";
      const unit = getCurrentUnit();
      if (!coreRetry && unit.subject === item.subjectKey && unit.area === item.area) practicalSetRecoveryCount += 1;
      practicalRetryQueue = practicalRetryQueue.filter(candidate => candidate !== item);
      activePracticalRetry = null;
      persistPracticalRetryState();
      setTimeout(() => {
        hidePracticalRetryPanel();
        maybeShowPracticalRetry();
        updateScore();
        if (!coreRetry) maybeOfferPracticalExamChallenge();
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
      else item.dueAt = (coreRetry ? coreGradeSerial : practicalGradeSerial) + 3;
      if (feedback) feedback.textContent = capReached
        ? `유사 답안 유예 · ${nearReasonText(grading)} · 공식 표기: ${item.correctAnswer} · 이번 세션에서는 여기까지, 다음 복습에서 정확히 확인합니다.`
        : `유사 답안 유예 · ${nearReasonText(grading)} · 공식 표기: ${item.correctAnswer} · 몇 문장 뒤 한 번 더 확인합니다.`;
      activePracticalRetry = null;
      persistPracticalRetryState();
      setTimeout(() => { hidePracticalRetryPanel(); updateScore(); if (!coreRetry) maybeOfferPracticalExamChallenge(); focusFirstEmpty(); }, capReached ? 1500 : 1250);
      return;
    }

    if (status === "unknown") {
      input.classList.add("unknown");
      item.retryReason = "unknown";
      item.retryFailures = Number(item.retryFailures || 0) + 1;
      const capReached = item.retryFailures >= 2;
      if (capReached) {
        practicalRetryQueue = practicalRetryQueue.filter(candidate => candidate !== item);
        deferRetryMasteryToNextDay(item.conceptKey);
      } else item.dueAt = (coreRetry ? coreGradeSerial : practicalGradeSerial) + 3;
      if (feedback) feedback.textContent = capReached
        ? `모름 · 정답: ${item.correctAnswer} · 오늘은 여기까지 하고 다음 날 다시 꺼냅니다.`
        : `모름 · 정답: ${item.correctAnswer} · 오답 표현으로 기록하지 않고 ${coreRetry ? "몇 항목" : "몇 문장"} 뒤 다시 확인합니다.`;
      activePracticalRetry = null;
      persistPracticalRetryState();
      setTimeout(() => { hidePracticalRetryPanel(); updateScore(); if (!coreRetry) maybeOfferPracticalExamChallenge(); focusFirstEmpty(); }, capReached ? 1500 : 1250);
      return;
    }

    input.classList.add("wrong");
    item.retryFailures = Number(item.retryFailures || 0) + 1;
    item.userAnswer = input.value;
    const capReached = item.retryFailures >= 2;
    if (capReached) {
      practicalRetryQueue = practicalRetryQueue.filter(candidate => candidate !== item);
      deferRetryMasteryToNextDay(item.conceptKey);
    } else item.dueAt = (coreRetry ? coreGradeSerial : practicalGradeSerial) + 3;
    if (Number(masteryItem?.wrongCount || 0) >= 2) {
      addWrongHistory({...item, difficultyKey:coreRetry ? "easy" : "practical", difficultyLabel:coreRetry ? "핵심" : "실전", attempts:Number(masteryItem.wrongCount || 2)}, eventToken);
    }
    if (feedback) feedback.textContent = capReached
      ? `정답: ${item.correctAnswer} · 오늘은 여기까지 하고 다음 날 장기 복습에서 다시 꺼냅니다.`
      : `정답: ${item.correctAnswer} · ${coreRetry ? "몇 항목" : "몇 문장"} 뒤 다시 확인합니다.`;
    activePracticalRetry = null;
    persistPracticalRetryState();
    setTimeout(() => {
      hidePracticalRetryPanel();
      updateScore();
      if (!coreRetry) maybeOfferPracticalExamChallenge();
      focusFirstEmpty();
    }, capReached ? 1500 : 1250);
  }

  function deferPracticalRetry() {
    if (!activePracticalRetry) return;
    activePracticalRetry.dueAt = (activePracticalRetry.retryMode === "core" ? coreGradeSerial : practicalGradeSerial) + 2;
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
    if (difficulty === "practical" && isMiddleInfoPilot()) {
      const tier = RecallEngine.memoryTier(line?._sectionTitle || "", line?._sourceGroup || getCurrentGroup()).key;
      if (tier === "exact") return []; // 정확 암기 구간은 별도의 통회상 UI에서 처리한다.
      return rawConfiguredEntries(line, tier === "keyword" ? "easy" : "normal");
    }
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
        if (isMiddleInfoPilot() && getCurrentDifficulty() === "easy" && studyMode === "fill") {
          if (activePracticalRetry) { focusPracticalRetryInput(); return; }
          requestAnimationFrame(() => advanceAfterGrade(input));
          return;
        }
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


  function middleInfoMemoryTier(section) {
    return RecallEngine.memoryTier(section?.title || "", section?._sourceGroup || getCurrentGroup());
  }

  function recallSectionConceptKey(unit, section) {
    return ["recall-section", unit.subject, unit.area, section?._sourceGroup || getCurrentGroup(), section?.title || ""].join("|");
  }

  function recallItemConceptKey(unit, section, line) {
    return ["recall-item", unit.subject, unit.area, section?._sourceGroup || getCurrentGroup(), section?.title || "", line?.id || stableHash(line?.text || "")].join("|");
  }

  function holisticStateKey(unit, section, line, index, scope = "study") {
    return ["holistic", scope, unit.subject, unit.area, section?._sourceGroup || getCurrentGroup(), section?.title || "", line?.id || index, index].join("|");
  }

  function recallExpectedForLine(line, kind) {
    if (kind === "achievement") return RecallEngine.splitAchievement(line?.text || "").body;
    return String(line?.text || "").trim();
  }

  function recallCueForLine(line, kind, index) {
    if (kind === "achievement") return RecallEngine.splitAchievement(line?.text || "").code || `${index + 1}`;
    return `${index + 1}`;
  }

  function addMemoryTierBadge(th, section) {
    if (!th || !isMiddleInfoPilot()) return;
    const tier = middleInfoMemoryTier(section);
    const badge = document.createElement("span");
    badge.className = `memory-tier-badge ${tier.key}`;
    badge.textContent = tier.label;
    badge.title = tier.description;
    th.appendChild(document.createElement("br"));
    th.appendChild(badge);
  }

  function renderMiddleInfoMaskLine(line, sectionIndex, lineIndex, sectionTitle = "", sourceGroup = "") {
    const tier = RecallEngine.memoryTier(sectionTitle, sourceGroup);
    const p = document.createElement("div");
    p.className = "line-item mask-line" + (tier.key === "exact" ? " whole-mask-line" : "");
    if (tier.key === "exact") {
      if (sectionTitle === "성취기준") {
        const split = RecallEngine.splitAchievement(line.text);
        if (split.code) p.appendChild(document.createTextNode(`${split.code} `));
        p.appendChild(createMaskToken({answer:split.body || line.text}, true));
      } else p.appendChild(createMaskToken({answer:line.text}, true));
      return p;
    }
    const entries = rawConfiguredEntries(line, tier.key === "keyword" ? "easy" : "normal");
    const specs = entries.map(entry => ({...entry, aliases:getSafeAliases(entry.answer, line.aliases), sentence:false, compound:entry.answer.includes(" ")}));
    const occurrences = findOccurrences(line.text, specs);
    if (!occurrences.length) { p.textContent = line.text; return p; }
    let cursor = 0;
    occurrences.forEach(o => {
      if (o.start > cursor) p.appendChild(document.createTextNode(line.text.slice(cursor, o.start)));
      p.appendChild(createMaskToken(o.spec, false)); cursor = o.end;
    });
    if (cursor < line.text.length) p.appendChild(document.createTextNode(line.text.slice(cursor)));
    return p;
  }

  function renderMiddleInfoTraceLine(line, sectionIndex, lineIndex, sectionTitle = "", sourceGroup = "") {
    const wrap = document.createElement("div");
    wrap.className = "line-item trace-full-line";
    const guide = document.createElement("div");
    guide.className = "trace-full-guide";
    guide.textContent = line.text;
    const textarea = document.createElement("textarea");
    textarea.className = "gap-input trace-full-input";
    textarea.rows = String(line.text.length > 70 ? 3 : line.text.length > 35 ? 2 : 1);
    textarea.dataset.learningMode = "trace";
    const lineId = makeLineStableId(sectionTitle, line.text, line.id || "");
    const key = makeStateKey(sectionIndex, lineIndex, 0, lineId, "trace-full", 0, sourceGroup, "trace");
    textarea.dataset.stateKey = key;
    textarea.placeholder = "위 원문을 보며 그대로 입력";
    textarea.value = fieldState[key]?.value || "";
    textarea.addEventListener("input", () => {
      fieldState[key] = {...(fieldState[key] || {}), value:textarea.value, status:""};
      scheduleStateSave();
    });
    wrap.appendChild(guide);
    wrap.appendChild(textarea);
    return wrap;
  }

  function recallMasteryBadgeText(state) {
    const stage = RecallEngine.recallMasteryStage(state || {});
    return {stage, text:stage.label};
  }

  function refreshRecallMasteryBadge(block, state = null) {
    if (!block) return;
    const badge = block.querySelector('.recall-mastery-badge');
    if (!badge) return;
    const conceptKey = block.dataset.conceptKey || '';
    const source = state || loadMastery()[conceptKey] || {};
    const {stage, text} = recallMasteryBadgeText(source);
    badge.className = `recall-mastery-badge ${stage.key}`;
    badge.textContent = text;
    badge.title = stage.description;
  }

  function createHolisticRecallBlock(unit, section, {scope = "study", persistDraft = true, showGradeButton = true} = {}) {
    const kind = RecallEngine.holisticKind(section?.title || "");
    if (!kind) return null;
    const block = document.createElement("section");
    block.className = "holistic-recall";
    block.dataset.recallKind = kind;
    block.dataset.subject = unit.subject;
    block.dataset.area = unit.area;
    block.dataset.sourceGroup = section._sourceGroup || getCurrentGroup();
    block.dataset.sectionTitle = section.title;
    block.dataset.scope = scope;
    block.dataset.conceptKey = recallSectionConceptKey(unit, section);

    const head = document.createElement("div");
    head.className = "holistic-recall-head";
    const instruction = document.createElement("div");
    instruction.className = "holistic-recall-instruction";
    instruction.innerHTML = kind === "list"
      ? `<strong>${section.title}</strong>의 공식 항목을 기억나는 대로 모두 적으세요. 항목 수는 보여주지 않으며, 한 항목당 한 줄로 입력합니다. 채점 후 내용과 공식 순서를 따로 진단합니다.`
      : `<strong>성취기준</strong>은 코드만 보고 문장 전체로 적으세요. 핵심 행동동사를 엄격하게 봅니다.`;
    head.appendChild(instruction);
    const stageRow = document.createElement("div");
    stageRow.className = "recall-mastery-row";
    const stageLabel = document.createElement("span");
    stageLabel.className = "recall-mastery-label";
    stageLabel.textContent = "통회상 상태";
    const stageBadge = document.createElement("span");
    stageBadge.className = "recall-mastery-badge";
    stageRow.appendChild(stageLabel);
    stageRow.appendChild(stageBadge);
    head.appendChild(stageRow);
    block.appendChild(head);
    refreshRecallMasteryBadge(block);

    const list = document.createElement("div");
    list.className = "holistic-recall-list";

    if (kind === "list") {
      const row = document.createElement("div");
      row.className = "holistic-recall-free-row";
      const input = document.createElement("textarea");
      input.className = "recall-input recall-free-input";
      input.rows = "8";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.dataset.freeRecall = "true";
      input.placeholder = "한 항목당 한 줄로 입력하세요. 항목 수는 공개하지 않습니다.";
      if (persistDraft) {
        const synthetic = {id:"__free_recall__"};
        const stateKey = holisticStateKey(unit, section, synthetic, 0, scope);
        input.dataset.stateKey = stateKey;
        input.value = fieldState[stateKey]?.value || "";
        input.addEventListener("input", () => {
          fieldState[stateKey] = {...(fieldState[stateKey] || {}), value:input.value, status:""};
          block.removeAttribute("data-graded-status");
          scheduleStateSave();
        });
      }
      row.appendChild(input);
      list.appendChild(row);
    } else {
      section.lines.forEach((line, index) => {
        const row = document.createElement("div");
        row.className = "holistic-recall-row";
        row.dataset.expectedIndex = String(index);
        row.dataset.lineId = line.id || makeLineStableId(section.title, line.text, "");
        const cue = document.createElement("span");
        cue.className = "holistic-recall-cue";
        cue.textContent = recallCueForLine(line, kind, index);
        const input = document.createElement("textarea");
        input.className = "recall-input";
        input.rows = String(line.text.length > 85 ? 3 : 2);
        input.autocomplete = "off";
        input.spellcheck = false;
        input.dataset.expected = recallExpectedForLine(line, kind);
        input.dataset.lineId = row.dataset.lineId;
        input.dataset.expectedIndex = String(index);
        input.placeholder = "성취기준 문장 전체";
        if (persistDraft) {
          const stateKey = holisticStateKey(unit, section, line, index, scope);
          input.dataset.stateKey = stateKey;
          input.value = fieldState[stateKey]?.value || "";
          input.addEventListener("input", () => {
            fieldState[stateKey] = {...(fieldState[stateKey] || {}), value:input.value, status:""};
            block.removeAttribute("data-graded-status");
            scheduleStateSave();
          });
        }
        const result = document.createElement("div");
        result.className = "recall-item-result";
        row.appendChild(cue); row.appendChild(input); row.appendChild(result);
        list.appendChild(row);
      });
    }
    block.appendChild(list);

    const feedback = document.createElement("div");
    feedback.className = "holistic-recall-feedback";
    feedback.textContent = "채점 전에는 정답과 항목 수가 노출되지 않습니다.";
    block.appendChild(feedback);
    if (showGradeButton) {
      const actions = document.createElement("div");
      actions.className = "holistic-recall-actions";
      const grade = document.createElement("button");
      grade.type = "button"; grade.className = "btn primary"; grade.textContent = "이 묶음 채점";
      grade.addEventListener("click", () => gradeHolisticRecallBlock(block));
      actions.appendChild(grade); block.appendChild(actions);
    }
    return block;
  }

  function setRecallInputResult(input, status, note = "") {
    input.classList.remove("correct","near","wrong","unknown","order-moved");
    if (status) input.classList.add(status);
    const row = input.closest(".holistic-recall-row");
    const result = row?.querySelector(".recall-item-result");
    if (result) {
      result.className = `recall-item-result ${status || ""}`.trim();
      result.textContent = note;
    }
  }

  function scheduleHolisticRetryTarget(unit, section, line, index, reason = "wrong") {
    if (!line) return;
    const kind = RecallEngine.holisticKind(section.title);
    const correctAnswer = recallExpectedForLine(line, kind);
    const cue = recallCueForLine(line, kind, index);
    const context = kind === "achievement"
      ? `${cue} ${correctAnswer}`
      : `${section.title} ${index + 1}번 · ${correctAnswer}`;
    schedulePracticalRetry({
      type:"subject",
      key:recallItemConceptKey(unit, section, line),
      conceptKey:recallItemConceptKey(unit, section, line),
      subjectKey:unit.subject,
      subjectLabel:subjectLabels[unit.subject] || unit.subject,
      area:unit.area,
      sourceGroup:section._sourceGroup || getCurrentGroup(),
      groupKey:section._sourceGroup || getCurrentGroup(),
      groupLabel:groupLabels[section._sourceGroup || getCurrentGroup()] || section._sourceGroup || getCurrentGroup(),
      difficultyKey:"practical",
      difficultyLabel:"실전 통회상",
      lineId:line.id || makeLineStableId(section.title, line.text, ""),
      gapId:"recall-full",
      answerOccurrence:0,
      answerText:correctAnswer,
      correctAnswer,
      aliases:[],
      context,
      userAnswer:"",
      retryReason:reason,
      recallCue:cue,
      recallSectionTitle:section.title
    });
  }

  function appendFreeRecallDiagnostics(feedback, result, expected) {
    if (!feedback || !result) return;
    const box = document.createElement("div");
    box.className = "recall-diagnostic-list";
    const title = document.createElement("strong");
    title.textContent = "항목별 진단";
    box.appendChild(title);
    expected.forEach((text, expectedIndex) => {
      const row = document.createElement("div");
      const match = result.byExpected.get(expectedIndex);
      if (!match) {
        row.className = "recall-diagnostic-item wrong";
        row.textContent = `✗ 공식 ${expectedIndex + 1}번 · 누락 · ${text}`;
      } else {
        const moved = match.userIndex !== expectedIndex;
        const near = match.status === "near";
        row.className = `recall-diagnostic-item ${near ? "near" : moved ? "order-moved" : "correct"}`;
        const notes = [];
        notes.push(near ? "표기 확인" : "내용 정확");
        if (moved) notes.push(`입력 ${match.userIndex + 1}번째 · 순서 이동`);
        row.textContent = `${near ? "△" : moved ? "↔" : "✓"} 공식 ${expectedIndex + 1}번 · ${notes.join(" · ")} · ${text}`;
      }
      box.appendChild(row);
    });
    result.unmatchedUsers.forEach(user => {
      const row = document.createElement("div");
      row.className = "recall-diagnostic-item wrong";
      const diagnostic = result.diagnosticAssignments.find(item => item.userIndex === user.index);
      row.textContent = diagnostic
        ? `✗ 입력 ${user.index + 1}번째 · 공식 ${diagnostic.expectedIndex + 1}번과 불일치 · ${user.value}`
        : `✗ 입력 ${user.index + 1}번째 · 공식 목록에 없는 답 · ${user.value}`;
      box.appendChild(row);
    });
    feedback.appendChild(box);
  }

  function gradeHolisticRecallBlock(block, {review = false, structureOnly = false} = {}) {
    if (!block) return {status:"unknown"};
    const unit = {subject:block.dataset.subject, area:block.dataset.area};
    const sourceGroup = block.dataset.sourceGroup;
    const sectionTitle = block.dataset.sectionTitle;
    const sections = getUnitData(unit.subject, unit.area, sourceGroup);
    const section = sections.find(candidate => candidate.title === sectionTitle);
    if (!section) return {status:"unknown"};
    const kind = block.dataset.recallKind;
    const inputs = [...block.querySelectorAll(".recall-input")];
    const feedback = block.querySelector(".holistic-recall-feedback");
    let status = "unknown";
    let repairIndices = new Set();
    let summary = "";
    let values = [];
    let listResult = null;
    let plannerAccuracy = null;

    if (kind === "list") {
      const freeInput = block.querySelector(".recall-free-input");
      values = RecallEngine.parseFreeRecallText(freeInput?.value || "");
      const expected = section.lines.map(line => line.text);
      const result = RecallEngine.matchRecallList(values, expected, classifyRawAnswerDetailed);
      listResult = result;
      result.matches.forEach(match => { if (match.status === "near") repairIndices.add(match.expectedIndex); });
      result.diagnosticAssignments.forEach(item => repairIndices.add(item.expectedIndex));
      result.missing.forEach(item => repairIndices.add(item.index));
      status = RecallEngine.sectionStatus(result);
      const exactCount = result.matches.filter(item => item.status === "correct").length;
      const nearCount = result.matches.filter(item => item.status === "near").length;
      const baseAccuracy = expected.length ? (exactCount + nearCount * 0.65) / expected.length : 0;
      const extraPenalty = Math.max(0.7, 1 - result.unmatchedUsers.length * 0.08);
      plannerAccuracy = Math.max(0, Math.min(1, baseAccuracy * extraPenalty));
      const missingText = result.missing.length ? ` · 누락 ${result.missing.length}` : "";
      const extraText = result.unmatchedUsers.length ? ` · 불일치 ${result.unmatchedUsers.length}` : "";
      const orderText = result.contentComplete ? (result.orderCorrect ? " · 순서 정확" : " · 내용은 갖췄으나 순서 확인") : "";
      summary = `내용 ${exactCount}/${expected.length}${nearCount ? ` · 표기 확인 ${nearCount}` : ""}${missingText}${extraText}${orderText}`;
      setRecallInputResult(freeInput, status === "correct" ? "correct" : status === "near" ? "near" : status === "unknown" ? "unknown" : "wrong");
    } else {
      values = inputs.map(input => input.value);
      const details = inputs.map((input, index) => {
        const expected = recallExpectedForLine(section.lines[index], kind);
        const grading = RecallEngine.positionGrade(input.value, expected, classifyRawAnswerDetailed);
        const note = grading.status === "correct" ? "정확" : grading.status === "near" ? `표기 확인 · 공식 문장 재확인` : grading.status === "unknown" ? "미입력" : "공식 문장과 불일치";
        setRecallInputResult(input, grading.status, note);
        if (grading.status !== "correct") repairIndices.add(index);
        return grading;
      });
      const wrong = details.filter(item => item.status === "wrong").length;
      const unknown = details.filter(item => item.status === "unknown").length;
      const near = details.filter(item => item.status === "near").length;
      const correct = details.filter(item => item.status === "correct").length;
      plannerAccuracy = details.length ? (correct + near * 0.65) / details.length : 0;
      status = wrong ? "wrong" : unknown ? "unknown" : near ? "near" : "correct";
      summary = `성취기준 ${correct}/${details.length} 정확${near ? ` · 표기 확인 ${near}` : ""}${wrong ? ` · 오답 ${wrong}` : ""}${unknown ? ` · 미입력 ${unknown}` : ""}`;
    }

    block.dataset.gradedStatus = status;
    if (feedback) {
      feedback.innerHTML = "";
      feedback.className = `holistic-recall-feedback ${status}`;
      const summaryLine = document.createElement("div");
      summaryLine.textContent = summary + (status === "correct" ? " · 정확 통회상 성공" : " · 아래에서 항목별로 확인하세요.");
      feedback.appendChild(summaryLine);
      if (kind === "list" && listResult) appendFreeRecallDiagnostics(feedback, listResult, section.lines.map(line => line.text));
      if (status !== "correct") {
        const answerBox = document.createElement("div");
        answerBox.className = "holistic-answer-key";
        section.lines.forEach((line,index) => {
          const item = document.createElement("div");
          item.textContent = `${recallCueForLine(line, kind, index)}. ${recallExpectedForLine(line, kind)}`;
          answerBox.appendChild(item);
        });
        feedback.appendChild(answerBox);
      }
    }

    let masteryItem = null;
    if (!structureOnly) {
      const signature = `${values.map(normalize).join("||")}|${status}`;
      if (block.dataset.lastCountedSignature !== signature) {
        block.dataset.lastCountedSignature = signature;
        const sectionKey = recallSectionConceptKey(unit, section);
        const token = makeGradingEventToken(review ? "review-recall" : "subject-recall", sectionKey, signature);
        if (!review) recordPlannerAssessmentOutcome(`recall|${sectionKey}`, status, "recall", plannerAccuracy);
        masteryItem = updateRecallSectionMastery(sectionKey, status, token);
        if (!review && getCurrentDifficulty() === "practical") {
          practicalGradeSerial += 1;
          repairIndices.forEach(index => scheduleHolisticRetryTarget(unit, section, section.lines[index], index, status === "near" ? "near" : status));
          persistPracticalRetryState();
          maybeShowPracticalRetry();
        }
      } else {
        masteryItem = loadMastery()[block.dataset.conceptKey] || null;
      }
      refreshRecallMasteryBadge(block, masteryItem);
      if (feedback && status === "correct" && masteryItem) {
        const stage = RecallEngine.recallMasteryStage(masteryItem);
        const stageLine = document.createElement("div");
        stageLine.className = `recall-stage-feedback ${stage.key}`;
        stageLine.textContent = `현재 상태: ${stage.label} · ${stage.description}`;
        feedback.appendChild(stageLine);
      }
    }
    updateScore();
    scheduleStateSave();
    return {status, section, repairIndices:[...repairIndices], masteryItem};
  }

  function resetStructureSession() {
    activeStructureQuestion = null;
    structureSession = null;
  }

  function ensureStructureSession(area) {
    if (!window.StructureEngine) return null;
    if (!structureSession || structureSession.area !== area || !Array.isArray(structureSession.questions) || !structureSession.questions.length) {
      const nonce = ++structureSessionNonce;
      const questions = StructureEngine.buildSession(curriculumData, area, {limit:6, nonce});
      structureSession = { area, nonce, questions, index:0, answered:0, correct:0, complete:false };
    }
    activeStructureQuestion = structureSession.questions[structureSession.index] || null;
    return structureSession;
  }

  function renderStructureSessionComplete(studyArea, session) {
    const card = document.createElement("section");
    card.className = "structure-practice-card structure-session-complete";
    const kicker = document.createElement("div");
    kicker.className = "structure-kicker";
    kicker.textContent = "구조 연습 · 세트 완료";
    const title = document.createElement("div");
    title.className = "structure-complete-title";
    title.textContent = `${session.correct} / ${session.questions.length} 정답`;
    const note = document.createElement("p");
    note.className = "structure-complete-note";
    note.textContent = "구조 연습은 많이 푸는 것보다 내용 요소–성취기준–해설의 직접 연결을 정확히 회상하는 데 목적이 있습니다.";
    const actions = document.createElement("div");
    actions.className = "structure-actions";
    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "btn primary";
    restart.textContent = "새 연결 세트";
    restart.addEventListener("click", () => {
      resetStructureSession();
      renderStudy();
    });
    actions.appendChild(restart);
    card.appendChild(kicker);
    card.appendChild(title);
    card.appendChild(note);
    card.appendChild(actions);
    studyArea.appendChild(card);
  }

  function selectedStructureValues(q) {
    return q?.multiSelect ? (Array.isArray(q.selected) ? q.selected : []) : (q?.selected ? [q.selected] : []);
  }

  function sameValueSet(a, b) {
    const aa = [...new Set(a || [])].sort();
    const bb = [...new Set(b || [])].sort();
    return aa.length === bb.length && aa.every((value,index) => value === bb[index]);
  }

  function makeStructureChoice(choice, q) {
    const value = typeof choice === "string" ? choice : choice.value;
    const text = typeof choice === "string" ? choice : choice.text;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "structure-choice structure-choice-card";
    button.dataset.value = value;
    button.setAttribute("role", q.multiSelect ? "checkbox" : "radio");
    const selected = selectedStructureValues(q).includes(value);
    button.setAttribute("aria-checked", selected ? "true" : "false");
    if (selected) button.classList.add("selected");
    button.textContent = text;
    button.addEventListener("click", () => {
      if (q.graded) return;
      if (q.multiSelect) {
        const values = new Set(selectedStructureValues(q));
        if (values.has(value)) values.delete(value); else values.add(value);
        q.selected = [...values];
        document.querySelectorAll(".structure-choice").forEach(item => {
          const isSelected = q.selected.includes(item.dataset.value);
          item.classList.toggle("selected", isSelected);
          item.setAttribute("aria-checked", isSelected ? "true" : "false");
        });
      } else {
        q.selected = value;
        document.querySelectorAll(".structure-choice").forEach(item => {
          const isSelected = item.dataset.value === value;
          item.classList.toggle("selected", isSelected);
          item.setAttribute("aria-checked", isSelected ? "true" : "false");
        });
      }
      scheduleStateSave();
    });
    return button;
  }

  function renderStructurePractice(unit, studyArea) {
    studyArea.innerHTML = "";
    const session = ensureStructureSession(unit.area);
    if (!session || !session.questions.length) {
      studyArea.innerHTML = '<div class="empty">이 영역에는 직접 연결을 검증할 구조 연습 항목이 없습니다.</div>';
      return;
    }
    if (session.complete || session.index >= session.questions.length) {
      renderStructureSessionComplete(studyArea, session);
      return;
    }

    const q = activeStructureQuestion;
    const card = document.createElement("section");
    card.className = "structure-practice-card";

    const top = document.createElement("div");
    top.className = "structure-card-top";
    const kicker = document.createElement("div");
    kicker.className = "structure-kicker";
    kicker.textContent = q.kind === "standard-elements" ? "구조 연습 · 성취기준 ↔ 내용 요소" : "구조 연습 · 성취기준 ↔ 해설";
    const progress = document.createElement("div");
    progress.className = "structure-progress";
    progress.textContent = `${session.index + 1} / ${session.questions.length}`;
    top.appendChild(kicker);
    top.appendChild(progress);

    const instruction = document.createElement("div");
    instruction.className = "structure-instruction";
    instruction.textContent = q.kind === "standard-elements"
      ? "다음 성취기준과 직접 연결되는 내용체계 요소를 모두 고르세요. 지식·이해, 과정·기능, 가치·태도가 함께 포함될 수 있습니다."
      : "다음 성취기준 해설과 직접 연결되는 성취기준을 고르세요.";

    const prompt = document.createElement("div");
    prompt.className = "structure-prompt";
    prompt.textContent = q.prompt;

    const choices = document.createElement("div");
    choices.className = "structure-choice-list connection";
    choices.setAttribute("role", q.multiSelect ? "group" : "radiogroup");
    q.choices.forEach(choice => choices.appendChild(makeStructureChoice(choice, q)));

    const feedback = document.createElement("div");
    feedback.className = "structure-feedback";
    feedback.id = "structureFeedback";

    const actions = document.createElement("div");
    actions.className = "structure-actions";
    const grade = document.createElement("button");
    grade.type = "button";
    grade.className = "btn primary";
    grade.textContent = "채점";
    grade.disabled = Boolean(q.graded);
    grade.addEventListener("click", gradeStructureQuestion);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "btn soft";
    next.textContent = session.index === session.questions.length - 1 ? "결과 보기" : "다음 문제";
    next.disabled = !q.graded;
    next.id = "nextStructureQuestionButton";
    next.addEventListener("click", nextStructureQuestion);
    actions.appendChild(grade);
    actions.appendChild(next);

    card.appendChild(top);
    card.appendChild(instruction);
    card.appendChild(prompt);
    card.appendChild(choices);
    card.appendChild(feedback);
    card.appendChild(actions);
    studyArea.appendChild(card);

    if (q.graded) paintStructureGrade(card, q);
  }

  function paintStructureGrade(card, q) {
    const feedback = card.querySelector("#structureFeedback");
    const grade = card.querySelector(".structure-actions .primary");
    const next = card.querySelector("#nextStructureQuestionButton");
    const answers = q.multiSelect ? q.answers : [q.answer];
    const selected = selectedStructureValues(q);
    card.querySelectorAll(".structure-choice").forEach(button => {
      const isAnswer = answers.includes(button.dataset.value);
      const isSelected = selected.includes(button.dataset.value);
      button.disabled = true;
      button.classList.toggle("answer", isAnswer);
      button.classList.toggle("wrong-selected", isSelected && !isAnswer);
    });
    if (grade) grade.disabled = true;
    if (next) next.disabled = false;
    if (!feedback) return;
    feedback.className = `structure-feedback ${q.correct ? "correct" : "wrong"}`;
    if (q.kind === "standard-elements") {
      const answerText = `[${q.answerCode}] → ${q.answerElements.join(" / ")}`;
      feedback.textContent = q.correct ? `✓ 연결 정확 · ${answerText}` : `정답: ${answerText}`;
    } else {
      feedback.textContent = q.correct
        ? `✓ 연결 정확 · [${q.answerCode}] ${q.answerText}`
        : `정답: [${q.answerCode}] ${q.answerText}`;
    }
  }

  function gradeStructureQuestion() {
    const q = activeStructureQuestion;
    const card = document.querySelector(".structure-practice-card");
    const feedback = document.getElementById("structureFeedback");
    if (!q || !card || !feedback || !structureSession) return;
    const selected = selectedStructureValues(q);
    if (!selected.length) {
      feedback.className = "structure-feedback warning";
      feedback.textContent = "답을 먼저 선택하세요.";
      return;
    }
    if (q.graded) return;
    q.correct = q.multiSelect ? sameValueSet(selected, q.answers) : q.selected === q.answer;
    q.graded = true;
    recordPlannerAssessmentOutcome(`structure|${q.id || `${q.kind}|${q.area}|${structureSession.index}`}`, q.correct ? "correct" : "wrong", "structure");
    structureSession.answered += 1;
    if (q.correct) structureSession.correct += 1;
    paintStructureGrade(card, q);
    scheduleStateSave();
  }

  function nextStructureQuestion() {
    const q = activeStructureQuestion;
    if (!structureSession || !q || !q.graded) return;
    if (structureSession.index >= structureSession.questions.length - 1) {
      structureSession.complete = true;
      activeStructureQuestion = null;
    } else {
      structureSession.index += 1;
      activeStructureQuestion = structureSession.questions[structureSession.index];
    }
    scheduleStateSave();
    renderStudy();
  }

  function renderCoreFlowCard(subject, area) {
    if (studyMode !== "original" || area === COMMON_AREA) return null;
    const flow = CORE_FLOW_MAP[subject]?.[area];
    if (!flow) return null;

    const card = document.createElement("section");
    card.className = "core-flow-card";
    card.setAttribute("aria-label", `${area} 핵심 흐름`);

    const top = document.createElement("div");
    top.className = "core-flow-top";
    const titleWrap = document.createElement("div");
    titleWrap.className = "core-flow-heading";
    const title = document.createElement("strong");
    title.className = "core-flow-title";
    title.textContent = "핵심 흐름";
    const kind = document.createElement("span");
    kind.className = "core-flow-kind";
    kind.textContent = flow.kind || "구조형";
    titleWrap.appendChild(title);
    titleWrap.appendChild(kind);
    const summary = document.createElement("div");
    summary.className = "core-flow-summary";
    summary.textContent = flow.summary;
    top.appendChild(titleWrap);
    top.appendChild(summary);
    card.appendChild(top);

    const details = document.createElement("details");
    details.className = "core-flow-details";
    const detailSummary = document.createElement("summary");
    detailSummary.textContent = "구조 펼쳐 보기";
    const detail = document.createElement("div");
    detail.className = "core-flow-detail";
    (flow.sections || []).forEach(section => {
      const row = document.createElement("div");
      row.className = "core-flow-section";
      const label = document.createElement("strong");
      label.className = "core-flow-section-label";
      label.textContent = section.label;
      const text = document.createElement("div");
      text.className = "core-flow-section-text";
      text.textContent = section.text;
      row.appendChild(label);
      row.appendChild(text);
      detail.appendChild(row);
    });
    const note = document.createElement("div");
    note.className = "core-flow-note";
    note.textContent = "※ 암기와 회상을 위한 요약 구조이며 공식 교수·학습 순서나 교육과정 원문 자체를 의미하지 않습니다.";
    details.appendChild(detailSummary);
    details.appendChild(detail);
    details.appendChild(note);
    card.appendChild(details);
    return card;
  }

  function renderStudy() {
    const unit = getCurrentUnit();
    const subject = unit.subject;
    const area = unit.area;
    const group = getCurrentGroup();
    let sections = getUnitData(subject, area, group);
    if (plannerFocusActive) {
      const activeSections = plannerSessionSections();
      const activeState = loadPlannerState();
      if (activeState.activeSession?.subjectKey === subject && activeState.activeSession?.area === area && activeSections.length) {
        const allowed = new Set(activeSections.map(item => `${item.sourceGroup}|${item.sectionTitle}`));
        sections = sections.filter(section => allowed.has(`${section._sourceGroup || ""}|${section.title || ""}`));
      }
    }
    const studyArea = document.getElementById("studyArea");
    const sequence = getUnitSequence();
    syncMiddleInfoPilotControls(unit);
    renderPlannerStudyBanner(unit);

    const subjectLabel = subjectLabels[subject] || "과목";
    document.getElementById("studyTitle").textContent =
      subject && area ? `${subjectLabel} · ${area}` : "학습 내용";

    const statusByMode = {
      original: "공식 원문과 암기 강도를 함께 확인",
      mask: window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "마우스를 올려 확인" : "눌러 확인",
      trace: "원문을 보며 문장 흐름 익히기 · 숙달 판정에는 직접 반영하지 않음",
      fill: window.matchMedia("(max-width: 720px)").matches ? "다음: 채점" : "Enter: 채점",
      structure: "헷갈리는 내용체계 범주를 구별하고 성취기준과 해설을 연결"
    };
    const baseStatus = statusByMode[studyMode] || "";
    const pilotPractical = isMiddleInfoPilot(unit) && studyMode === "fill" && getCurrentDifficulty() === "practical";
    document.getElementById("studyStatus").textContent = pilotPractical
      ? "실전 통회상 · 지식·이해/과정·기능은 목록 전체, 성취기준은 문장 전체"
      : (isMiddleInfoPilot(unit) && studyMode === "fill" ? `핵심 빈칸 · ${baseStatus}` : baseStatus);

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

    if (studyMode === "structure" && isMiddleInfoPilot(unit)) {
      renderStructurePractice(unit, studyArea);
      updateStudyControls();
      scheduleStateSave();
      return;
    }

    const coreFlowCard = renderCoreFlowCard(subject, area);
    if (coreFlowCard) studyArea.appendChild(coreFlowCard);

    const table = document.createElement("table");
    table.className = "section-table";
    const tbody = document.createElement("tbody");

    sections.forEach((section, sectionIndex) => {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      th.textContent = section.title;
      th.scope = "row";
      if (isMiddleInfoPilot(unit)) addMemoryTierBadge(th, section);

      const td = document.createElement("td");
      const holistic = isMiddleInfoPilot(unit) && studyMode === "fill" && getCurrentDifficulty() === "practical" && RecallEngine.holisticKind(section.title);
      if (holistic) {
        const block = createHolisticRecallBlock(unit, section, {scope:"study", persistDraft:true, showGradeButton:true});
        if (block) td.appendChild(block);
      } else {
        section.lines.forEach((line, lineIndex) => {
          if (studyMode === "mask") {
            td.appendChild(isMiddleInfoPilot(unit)
              ? renderMiddleInfoMaskLine(line, sectionIndex, lineIndex, section.title, section._sourceGroup || group)
              : renderMaskLine(line, sectionIndex, lineIndex, section.title, section._sourceGroup || group));
          } else if (studyMode === "trace" && isMiddleInfoPilot(unit)) {
            td.appendChild(renderMiddleInfoTraceLine(line, sectionIndex, lineIndex, section.title, section._sourceGroup || group));
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
      }

      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    studyArea.appendChild(table);
    restorePlannerRenderedProgress();

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
    try { persistPlannerStudyProgress(); } catch {}
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
    const restoredGroup = normalizeSelectedGroup(saved.group || "all");
    if (["all", ...SUBJECT_GROUPS].includes(restoredGroup)) document.getElementById("groupSelect").value = restoredGroup;
    if (["easy","normal","yaho","practical"].includes(saved.difficulty)) document.getElementById("difficultySelect").value = saved.difficulty;
    if (["all","competency","history","hours","subjects"].includes(saved.generalCategory)) document.getElementById("generalCategory").value = saved.generalCategory;

    fillAreaSelect();
    const areaSelect = document.getElementById("areaSelect");
    if ([...areaSelect.options].some(option => option.value === saved.area)) areaSelect.value = saved.area;

    currentAreaIndex = Number.isFinite(Number(saved.currentAreaIndex)) ? Math.max(0, Number(saved.currentAreaIndex)) : 0;
    currentRandomUnit = saved.currentRandomUnit && typeof saved.currentRandomUnit === "object" ? saved.currentRandomUnit : null;
    studyMode = ["original","mask","trace","fill","structure"].includes(saved.studyMode)
      ? saved.studyMode
      : (saved.quizMode ? "fill" : "original");
    lastStudyFocus = saved.lastStudyFocus && typeof saved.lastStudyFocus === "object" ? saved.lastStudyFocus : null;
    generalIndex = Number.isFinite(Number(saved.generalIndex)) ? Math.max(0, Number(saved.generalIndex)) : 0;
    generalShuffleState = saved.generalShuffleState && typeof saved.generalShuffleState === "object" ? saved.generalShuffleState : null;
    currentTab = ["home","general","subject","practice","history"].includes(saved.currentTab) ? saved.currentTab : "home";
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

      // v7.5.1: 과거 v7.5.0에서 2회 성공만으로 mastered=true가 된 통회상 기록을
      // 새 기준(7일 간격 재인출까지 성공, correctStreak>=4)에 맞춰 재해석한다.
      Object.entries(migrated).forEach(([conceptKey, item]) => {
        if (!conceptKey.startsWith("recall-section|")) return;
        const strictMastered = RecallEngine.isRecallMastered(item || {});
        if (Boolean(item?.mastered) !== strictMastered) {
          item.mastered = strictMastered;
          changed = true;
        }
      });

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
        SOURCE_GROUPS.forEach(sourceGroup => {
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
    // 중등 정보 통회상은 1일·3일·7일 간격을 통과한 네 번째 정확 인출부터 숙달로 본다.
    // 다른 기존 학습 항목의 mastery 규칙은 건드리지 않는다.
    if (String(conceptKey || "").startsWith("recall-section|")) item.mastered = RecallEngine.isRecallMastered(item);
    all[conceptKey] = item;
    saveMastery(all);
    if (status === "correct" && item.mastered) markHistoryResolved(conceptKey);
    return item;
  }

  function updateRecallSectionMastery(conceptKey, result, eventToken) {
    const item = updateMastery(conceptKey, result, eventToken);
    if (result === "correct") return item;
    // 통회상 실패의 같은 날 보수는 개별 항목 재인출 큐가 담당한다.
    // 전체 묶음은 날짜를 건너 다시 꺼내도록 최소 다음 날로 예약한다.
    const all = loadMastery();
    const current = all[conceptKey];
    if (current) {
      current.nextReviewAt = Date.now() + LearningEngine.DAY_MS;
      current.mastered = false;
      all[conceptKey] = current;
      saveMastery(all);
    }
    return current || item;
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
    if (parts[0] === "recall-section" && parts.length >= 5) {
      const [, subjectKey, area, sourceGroup, ...titleParts] = parts;
      const sectionTitle = titleParts.join("|");
      const sections = getUnitData(subjectKey, area, sourceGroup);
      const section = sections.find(candidate => candidate.title === sectionTitle);
      if (!section) return null;
      return {
        type:"recall-section", key:conceptKey, conceptKey, subjectKey, area, sourceGroup,
        groupKey:sourceGroup, groupLabel:groupLabels[sourceGroup] || sourceGroup,
        subjectLabel:subjectLabels[subjectKey] || subjectKey, sectionTitle, section,
        lineIds:section.lines.map(line => line.id).filter(Boolean), attempts:0, resolved:false
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
    if (item.type === "recall-section") return [item.subjectLabel, item.area, item.sectionTitle, "통회상 복습"].filter(Boolean).join(" · ");
    return [item.subjectLabel, item.area, item.groupLabel, item._practiceLinked ? "연습문제 연동" : ""].filter(Boolean).join(" · ");
  }

  function renderReviewSession(completed = false) {
    const panel = document.getElementById("reviewSession");
    const prompt = document.getElementById("reviewPrompt");
    const meta = document.getElementById("reviewMeta");
    const progress = document.getElementById("reviewProgress");
    const input = document.getElementById("reviewAnswer");
    const recallArea = document.getElementById("reviewRecallArea");
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
      if (recallArea) { recallArea.classList.add("hidden"); recallArea.innerHTML = ""; }
      primary.textContent = "다음: 오늘 학습";
      primary.onclick = () => { stopReviewSession(); showTab("home"); };
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
    if (item.type === "recall-section") {
      prompt.textContent = `${item.sectionTitle} 전체를 원문 기준으로 다시 꺼내세요.`;
      input.classList.add("hidden"); input.value = "";
      if (recallArea) {
        recallArea.innerHTML = ""; recallArea.classList.remove("hidden");
        const block = createHolisticRecallBlock({subject:item.subjectKey, area:item.area}, item.section, {scope:"review", persistDraft:false, showGradeButton:false});
        if (block) recallArea.appendChild(block);
      }
    } else {
      if (recallArea) { recallArea.classList.add("hidden"); recallArea.innerHTML = ""; }
      prompt.textContent = item.type === "general"
        ? (item.question || item.context || "")
        : blankNth(item.context || "", item.correctAnswer || item.answerText || "", Number(item.answerOccurrence || 0));
      input.classList.remove("hidden", "correct", "wrong", "unknown");
      input.readOnly = false;
      input.value = "";
      input.placeholder = item.type === "general" ? "필요한 답을 모두 입력" : "정답을 떠올려 입력";
    }
    primary.textContent = "채점";
    primary.onclick = reviewPrimaryAction;
    if (skip) skip.classList.remove("hidden");
    feedback.className = "review-feedback";
    feedback.textContent = "Enter: 채점 · 채점 후 Enter: 다음";
    requestAnimationFrame(() => {
      if (currentTab === "history") {
        if (item.type === "recall-section") recallArea?.querySelector(".recall-input")?.focus({preventScroll:true});
        else { input.focus({preventScroll:true}); input.scrollIntoView({block:"center", behavior:"smooth"}); }
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

  function buildCumulativeReviewCandidates(rawRecords, scheduledRecords, now = Date.now(), limit = 6) {
    const scheduledLines = new Set((scheduledRecords || []).map(record => LearningEngine.reviewLineKey(record.item)));
    const successfulToday = successfulLineKeysToday(Object.fromEntries((rawRecords || []).map(record => [record.conceptKey, record.state])), now);
    return ReviewEngine.selectCumulativeReviewRecords((rawRecords || []).map(record => ({
      ...record,
      lineKey:LearningEngine.reviewLineKey(record.item),
      lastSeenAt:Number(record.state?.lastSeenAt || 0),
      successfulToday:successfulToday.has(LearningEngine.reviewLineKey(record.item))
    })), {now, limit, excludeLineKeys:[...scheduledLines]});
  }

  function buildDailyReviewPlan(now = Date.now()) {
    const mastery = loadMastery();
    const raw = Object.entries(mastery)
      .map(([conceptKey, state]) => ({item:reviewItemFromConceptKey(conceptKey), state:LearningEngine.normalizeMasteryItem(state), conceptKey}))
      .filter(({item}) => Boolean(item))
      .filter(({item}) => isLongTermReviewEligible(item));

    // 장기 복습은 문장(또는 통회상 묶음) 단위로 운영한다. 같은 문장의 여러 빈칸이
    // 하루씩 번갈아 밀려 나오지 않도록, 정확 성공 기록은 문장 단위의 가장 먼 일정으로 합친다.
    const records = ReviewEngine.selectLineReviewRecords(raw.map(record => ({
      ...record,
      lineKey:LearningEngine.reviewLineKey(record.item),
      nextReviewAt:Number(record.state?.nextReviewAt || 0),
      lastResult:record.state?.lastResult || "",
      wrongCount:Number(record.state?.wrongCount || 0)
    })), now);

    const deduped = records.sort((a,b) => {
      const aDue = Number(a.state?.nextReviewAt || 0);
      const bDue = Number(b.state?.nextReviewAt || 0);
      const aOverdue = aDue > 0 && aDue <= now;
      const bOverdue = bDue > 0 && bDue <= now;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return aDue - bDue;
    });

    const plannerState = loadPlannerState();
    const reviewBudget = PlannerEngine.dailyReviewBudget(plannerState.targetLines);
    const scheduled = deduped.slice(0, reviewBudget);
    const cumulative = PlannerEngine.isConsolidationDay(plannerState, now)
      ? buildCumulativeReviewCandidates(raw, scheduled, now, 6)
      : [];
    const plan = {
      version: 3,
      dayKey: LearningEngine.localDayKey(now),
      createdAt: now,
      reviewBudget,
      backlogTotal: deduped.length,
      scheduledCount: scheduled.length,
      cumulativeCount: cumulative.length,
      items: [
        ...scheduled.map(record => ({
          conceptKey: record.item.conceptKey,
          lineKey: LearningEngine.reviewLineKey(record.item),
          cumulative:false
        })),
        ...cumulative.map(record => ({
          conceptKey: record.item.conceptKey,
          lineKey: LearningEngine.reviewLineKey(record.item),
          cumulative:true
        }))
      ],
      completed: []
    };
    saveDailyReviewPlan(plan);
    return plan;
  }

  function ensureDailyReviewPlan(now = Date.now(), {force = false} = {}) {
    const dayKey = LearningEngine.localDayKey(now);
    const existing = loadDailyReviewPlan();
    if (!force && existing?.version === 3 && existing?.dayKey === dayKey) return existing;
    return buildDailyReviewPlan(now);
  }

  function remainingDailyReviewItems(now = Date.now()) {
    const plan = ensureDailyReviewPlan(now);
    const completed = new Set(plan.completed || []);
    const mastery = loadMastery();
    const completedLinesToday = successfulLineKeysToday(mastery, now);
    return (plan.items || [])
      .filter(entry => entry?.conceptKey && !completed.has(entry.conceptKey))
      // 오늘 새 학습/통회상에서 이미 정확히 꺼낸 문장은 아침에 만든 복습 계획에 남아 있어도 다시 제시하지 않는다.
      .filter(entry => !completedLinesToday.has(entry.lineKey || LearningEngine.reviewLineKeyFromConceptKey(entry.conceptKey)))
      .map(entry => {
        const item = reviewItemFromConceptKey(entry.conceptKey);
        return item ? {...item, _practiceLinked:Boolean(entry.practiceLinked), _practiceLinkedAt:Number(entry.linkedAt || 0), _cumulative:Boolean(entry.cumulative)} : null;
      })
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

  // 오늘 복습에서 충분히 시도했지만 아직 회복하지 못한 항목은
  // '오늘 성공'으로 바꾸지 않고, 오늘 할 일만 종료한 뒤 다음 날 다시 꺼낸다.
  function deferDailyReviewUnresolvedToNextDay(conceptKey, now = Date.now()) {
    if (!conceptKey) return null;
    const all = loadMastery();
    const current = LearningEngine.normalizeMasteryItem(all[conceptKey] || {});
    current.mastered = false;
    current.nextReviewAt = now + LearningEngine.DAY_MS;
    all[conceptKey] = current;
    saveMastery(all);
    markDailyReviewCompleted(conceptKey, now);
    return current;
  }

  const PRACTICE_SOURCE_LINK_KEY = "curriloop-practice-source-link-v1";
  let practiceSourceMetaCache = null;

  function loadPracticeSourceLinkState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PRACTICE_SOURCE_LINK_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function savePracticeSourceLinkState(state) {
    try { localStorage.setItem(PRACTICE_SOURCE_LINK_KEY, JSON.stringify(state || {})); } catch {}
  }

  function buildPracticeSourceMetaCache() {
    const cache = new Map();
    Object.entries(curriculumData || {}).forEach(([subjectKey, subject]) => {
      Object.entries(subject || {}).forEach(([areaName, area]) => {
        SOURCE_GROUPS.forEach(sourceGroup => {
          (area?.[sourceGroup] || []).forEach(section => (section.lines || []).forEach(line => {
            if (!line?.id || cache.has(line.id)) return;
            cache.set(line.id, {subjectKey, areaName, sourceGroup, sectionTitle:section.title || "", line});
          }));
        });
      });
    });
    return cache;
  }

  function sourceMetaFromId(sourceId) {
    if (!practiceSourceMetaCache) practiceSourceMetaCache = buildPracticeSourceMetaCache();
    return practiceSourceMetaCache.get(String(sourceId || "")) || null;
  }

  function representativeConceptForSource(sourceId) {
    const meta = sourceMetaFromId(sourceId);
    if (!meta) return null;
    const levels = ["easy", "normal", "yaho"];
    for (const level of levels) {
      const entries = configuredGapEntries(meta.line, level)
        .filter(entry => entry?.gapId && !isPracticalLowValueEntry(entry, meta.line));
      if (!entries.length) continue;
      const entry = entries[0];
      return {
        conceptKey: conceptKeyForSubject(
          {subject:meta.subjectKey, area:meta.areaName},
          meta.sourceGroup,
          meta.line.id,
          entry.gapId,
          0
        ),
        meta,
        gapId:entry.gapId,
        answer:entry.answer,
        difficultyKey:level
      };
    }
    return null;
  }

  function sourceLineMasteryPriority(sourceId, mastery = loadMastery(), now = Date.now()) {
    let best = 0;
    Object.entries(mastery || {}).forEach(([conceptKey, raw]) => {
      const parts = String(conceptKey || "").split("|");
      if (parts[0] !== "subject" || parts[4] !== sourceId) return;
      const state = LearningEngine.normalizeMasteryItem(raw || {});
      let score = 0;
      if (state.nextReviewAt > 0 && state.nextReviewAt <= now) score += 1.5;
      if (state.lastResult === "wrong") score += 2.6;
      else if (state.lastResult === "unknown") score += 2.0;
      else if (state.lastResult === "near") score += 0.9;
      if (state.practiceLinkPending) score += 1.7;
      score += Math.min(2.4, state.wrongCount * 0.8);
      score += Math.min(1.5, state.unknownCount * 0.45);
      score += Math.min(0.8, state.nearCount * 0.2);
      score -= Math.min(1.5, state.correctStreak * 0.45);
      best = Math.max(best, score);
    });
    return Math.max(0, best);
  }

  function sourcePracticeLinkPriority(sourceId, state = loadPracticeSourceLinkState()) {
    return Math.max(0, Number(state?.[sourceId]?.deficit || 0));
  }

  function practiceQuestionPriority(question) {
    const sourceIds = [...new Set((question?.sourceIds || []).filter(Boolean))];
    if (!sourceIds.length) return 0;
    const mastery = loadMastery();
    const linked = loadPracticeSourceLinkState();
    const scores = sourceIds.map(sourceId =>
      sourceLineMasteryPriority(sourceId, mastery) + sourcePracticeLinkPriority(sourceId, linked)
    );
    scores.sort((a,b) => b-a);
    const top = scores.slice(0, Math.min(2, scores.length));
    const sourcePriority = top.reduce((sum, value) => sum + value, 0) / Math.max(1, top.length);
    const adaptivePriority = PracticeEngine.adaptiveDimensionPriority(linked.__adaptive, question);
    return Math.max(0, sourcePriority + adaptivePriority);
  }

  function weightedPracticeQuestionIds(questions, randomFn = Math.random) {
    const rng = typeof randomFn === "function" ? randomFn : Math.random;
    return (questions || []).map(question => {
      const priority = practiceQuestionPriority(question);
      const weight = 1 + Math.min(8, Math.max(0, priority));
      const u = Math.max(Number.EPSILON, Math.min(1 - Number.EPSILON, rng()));
      return {id:question.questionId, key:-Math.log(u) / weight, priority};
    }).sort((a,b) => a.key - b.key).map(entry => entry.id);
  }

  function practiceGradeStatus(grade) {
    if (grade?.perfect) return "correct";
    if (Number(grade?.wrongCount || 0) > 0) return "wrong";
    if (Number(grade?.unknownCount || 0) > 0) return "unknown";
    if (Number(grade?.nearCount || 0) > 0) return "near";
    return "wrong";
  }

  function notePracticeSourceLink(sourceId, status, scale = 1, now = Date.now()) {
    const state = loadPracticeSourceLinkState();
    const current = state[sourceId] && typeof state[sourceId] === "object" ? {...state[sourceId]} : {};
    const deltaMap = {wrong:2.0, unknown:1.5, near:0.75, correct:-0.85};
    current.deficit = Math.max(0, Math.min(8, Number(current.deficit || 0) + Number(deltaMap[status] || 0) * scale));
    current.attempts = Number(current.attempts || 0) + 1;
    current[`${status}Count`] = Number(current[`${status}Count`] || 0) + 1;
    current.lastResult = status;
    current.lastAt = now;
    state[sourceId] = current;
    savePracticeSourceLinkState(state);
    return current;
  }

  function injectPracticeLinkedReview(conceptKey, now = Date.now()) {
    if (!conceptKey) return false;
    const plan = ensureDailyReviewPlan(now);
    const lineKey = LearningEngine.reviewLineKeyFromConceptKey(conceptKey);
    plan.items = Array.isArray(plan.items) ? plan.items : [];
    plan.completed = Array.isArray(plan.completed) ? plan.completed : [];

    const existing = plan.items.find(entry => entry?.lineKey === lineKey);
    if (existing) {
      existing.conceptKey = conceptKey;
      existing.practiceLinked = true;
      existing.linkedAt = now;
    } else {
      plan.items.push({conceptKey, lineKey, practiceLinked:true, linkedAt:now});
    }
    plan.completed = plan.completed.filter(key => LearningEngine.reviewLineKeyFromConceptKey(key) !== lineKey);
    saveDailyReviewPlan(plan);
    return true;
  }

  function scheduleSourceReviewFromPractice(sourceId, status, questionId, now = Date.now()) {
    if (!['wrong','unknown','near'].includes(status)) return null;
    const representative = representativeConceptForSource(sourceId);
    if (!representative) return null;
    const all = loadMastery();
    const item = LearningEngine.normalizeMasteryItem(all[representative.conceptKey] || {});
    const targetAt = status === 'near' ? now + 6 * 60 * 60 * 1000 : now;
    if (!item.nextReviewAt || item.nextReviewAt > targetAt) item.nextReviewAt = targetAt;
    item.practiceLinkCount = Number(item.practiceLinkCount || 0) + 1;
    item.practiceLinkPending = true;
    item.lastPracticeLinkAt = now;
    item.lastPracticeQuestionId = questionId || '';
    // 적용형 문제의 실패를 원문 직접 오답으로 간주하지 않는다.
    // 정확 인출 streak/wrongCount는 건드리지 않고 복습 시점만 앞당긴다.
    all[representative.conceptKey] = item;
    saveMastery(all);
    if (status !== 'near') injectPracticeLinkedReview(representative.conceptKey, now);
    return representative;
  }

  function clearPracticeLinkPending(conceptKey) {
    if (!conceptKey) return;
    const all = loadMastery();
    const item = all[conceptKey];
    if (!item || !item.practiceLinkPending) return;
    item.practiceLinkPending = false;
    item.practiceLinkResolvedAt = Date.now();
    all[conceptKey] = item;
    saveMastery(all);
  }

  function recordPracticeLinkedGrade(question, grade) {
    const sourceIds = [...new Set((question?.sourceIds || []).filter(Boolean))];
    if (!sourceIds.length || !grade) return {status:'none', linked:0};
    const status = practiceGradeStatus(grade);
    const now = Date.now();
    const scale = 1 / Math.max(1, Math.sqrt(sourceIds.length));
    let linked = 0;
    sourceIds.forEach(sourceId => {
      notePracticeSourceLink(sourceId, status, scale, now);
      if (status !== 'correct' && scheduleSourceReviewFromPractice(sourceId, status, question.questionId, now)) linked += 1;
    });
    const state = loadPracticeSourceLinkState();
    state.__adaptive = PracticeEngine.updateAdaptiveState(state.__adaptive, question, status, now);
    savePracticeSourceLinkState(state);
    if (linked && typeof renderHistory === 'function') renderHistory({passive:true});
    return {status, linked, sourceCount:sourceIds.length};
  }

  function practiceSourceLinkSummary() {
    const state = loadPracticeSourceLinkState();
    const entries = Object.entries(state).filter(([key, item]) => key !== '__adaptive' && Number(item?.deficit || 0) > 0);
    const adaptive = PracticeEngine.normalizeAdaptiveState(state.__adaptive);
    const weakScopes = Object.values(adaptive.scopes).filter(item => Number(item?.deficit || 0) > 0).length;
    const weakSourceTypes = Object.values(adaptive.sourceTypes).filter(item => Number(item?.deficit || 0) > 0).length;
    return {
      weakSources:entries.length,
      totalDeficit:entries.reduce((sum, [, item]) => sum + Number(item?.deficit || 0), 0),
      weakScopes, weakSourceTypes
    };
  }

  window.CurriLoopPracticeBridge = {
    recordGrade:recordPracticeLinkedGrade,
    questionPriority:practiceQuestionPriority,
    weightedQuestionIds:weightedPracticeQuestionIds,
    summary:practiceSourceLinkSummary,
    representativeConceptForSource
  };

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
    if (item.type === "recall-section") {
      const block = document.querySelector("#reviewRecallArea .holistic-recall");
      const result = gradeHolisticRecallBlock(block, {review:true});
      recordPlannerStudyActivity(Date.now());
      reviewGraded = true; reviewLastStatus = result.status;
      if (primary) primary.textContent = "다음";
      if (result.status === "correct") {
        markDailyReviewCompleted(item.conceptKey, Date.now());
        if (feedback) { feedback.className="review-feedback good"; feedback.textContent="✓ 통회상 성공 · 다음 간격으로 이동합니다."; }
      } else {
        const failures = Number(item._sessionFailures || 0) + 1;
        item._sessionFailures = failures;
        if (failures < 2) {
          const retry = {...item, _sessionFailures:failures};
          const insertAt = Math.min(reviewPosition + 4, reviewQueue.length);
          reviewQueue.splice(insertAt, 0, retry);
          if (feedback) { feedback.className="review-feedback bad"; feedback.textContent="공식 항목을 확인했습니다. 몇 문제 뒤 전체 묶음을 한 번 더 통회상합니다."; }
        } else {
          deferDailyReviewUnresolvedToNextDay(item.conceptKey, Date.now());
          if (feedback) { feedback.className="review-feedback bad"; feedback.textContent="두 번째 통회상에서도 회복하지 못했습니다. 오늘 시도는 종료하고 전체 묶음은 다음 날 다시 꺼냅니다."; }
        }
      }
      return;
    }

    let grading = {status:"unknown", reason:"empty"};
    if (item.type === "general") {
      const q = generalBank.find(q => q.id === item.generalId);
      if (normalize(input.value)) grading = {status:q && isGeneralAnswerCorrect(q, input.value) ? "correct" : "wrong", reason:"exact"};
    } else {
      grading = classifyRawAnswerDetailed(input.value, item.correctAnswer || item.answerText || "", item.aliases || []);
    }
    const status = grading.status;
    recordPlannerStudyActivity(Date.now());
    const success = status === "correct" || status === "near";
    const signature = `${normalize(input.value) || "__blank__"}|review|${status}`;
    const eventToken = makeGradingEventToken("review", item.conceptKey, signature);
    const masteryItem = updateMastery(item.conceptKey, status, eventToken);
    if (item._practiceLinked) clearPracticeLinkPending(item.conceptKey);

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
      } else if (status === "near" && item._nearRetried) {
        deferDailyReviewUnresolvedToNextDay(item.conceptKey, Date.now());
        if (feedback) feedback.appendChild(document.createTextNode(" 오늘은 여기서 마치고 다음 날 다시 확인합니다."));
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
    } else {
      deferDailyReviewUnresolvedToNextDay(item.conceptKey, Date.now());
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
    const item = currentReviewItem();
    const decision = ReviewEngine.reviewSkipAction(item || {});
    // 첫 건너뛰기는 세션 맨 뒤로 한 번만 보낸다. 두 번째 건너뛰기는
    // '성공'으로 기록하지 않고 오늘 미시도로 종료한 뒤, 일일 복습이면 다음 날 다시 예약한다.
    if (decision.action === "requeue" && decision.nextItem) reviewQueue.push(decision.nextItem);
    else if (decision.action === "defer-next-day" && item?.conceptKey) deferDailyReviewUnresolvedToNextDay(item.conceptKey, Date.now());
    reviewPosition += 1;
    if (reviewPosition >= reviewQueue.length) {
      reviewActive = false;
      activeReviewConceptKey = null;
      renderReviewSession(true);
      renderHistory();
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
      openGeneralSourceModal(item);
      return;
    }
    if (item.type === "recall-section") {
      openSourceModalByIds(item.lineIds || [], {title:"원문 보기", meta:[item.subjectLabel,item.area,item.sectionTitle].filter(Boolean).join(" · "), subject:item.subjectKey || "", note:"통회상 복습 묶음의 공식 원문입니다."});
      return;
    }
    if (item.type !== "subject" || !item.lineId) return;
    openSourceModalByIds([item.lineId], {
      title:"원문 보기",
      meta:[item.subjectLabel, item.area, item.groupLabel].filter(Boolean).join(" · "),
      subject:item.subjectKey || "",
      note:item._practiceLinked
        ? "연습문제에서 취약 신호가 발생해 연결된 원문입니다. 팝업을 닫으면 복습 세션이 그대로 유지됩니다."
        : "현재 복습 항목의 공식 원문입니다. 팝업을 닫으면 복습 세션이 그대로 유지됩니다."
    });
  }

  function openCurrentReviewSource() {
    openHistorySource(currentReviewItem());
  }

  const PREIMPORT_BACKUP_KEY = "curriloop-preimport-backup-v1"; // v6.0 이하 fallback 호환
  const PRACTICE_QUESTION_STATS_KEY = "curriloop-practice-stats-v1";

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
    const beforePlannerState = loadPlannerState();
    const beforePracticeSourceLink = loadPracticeSourceLinkState();
    const beforePracticeQuestionStats = loadLocalRecord(PRACTICE_QUESTION_STATS_KEY);

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
      savePracticeSourceLinkState(snapshot.practiceSourceLink || {});
      if (snapshot.practiceQuestionStats && isPlainRecord(snapshot.practiceQuestionStats)) safeSetLocalStorage(PRACTICE_QUESTION_STATS_KEY, JSON.stringify(snapshot.practiceQuestionStats));
      if (snapshot.gradingOverrides && isPlainRecord(snapshot.gradingOverrides)) safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(snapshot.gradingOverrides));
      if (snapshot.practicalExamProgress && isPlainRecord(snapshot.practicalExamProgress)) safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(snapshot.practicalExamProgress));
      if (snapshot.plannerState && isPlainRecord(snapshot.plannerState)) savePlannerState(snapshot.plannerState);

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
      savePracticeSourceLinkState(beforePracticeSourceLink);
      safeSetLocalStorage(PRACTICE_QUESTION_STATS_KEY, JSON.stringify(beforePracticeQuestionStats));
      safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(beforeGradingOverrides));
      safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(beforeExamProgress));
      savePlannerState(beforePlannerState);
      if (beforeTheme) localStorage.setItem("coreloop-theme", beforeTheme);
      else localStorage.removeItem("coreloop-theme");
      alert("가져오기 이전 기록을 복구하지 못했습니다. 현재 기록은 변경하지 않았습니다.");
    }
  }

  function isPlainRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function loadLocalRecord(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "{}");
      return isPlainRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
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
    for (const field of ["correctCount","nearCount","unknownCount","wrongCount","correctStreak","nextReviewAt","lastSeenAt","lastSuccessAt","practiceLinkCount","lastPracticeLinkAt","practiceLinkResolvedAt"]) {
      if (value[field] !== undefined) {
        const number = Number(value[field]);
        if (!Number.isFinite(number) || number < 0 || number > 1e15) return false;
      }
    }
    if (value.mastered !== undefined && typeof value.mastered !== "boolean") return false;
    if (value.practiceLinkPending !== undefined && typeof value.practiceLinkPending !== "boolean") return false;
    return isSafeBackupString(value.lastResult, 20) && isSafeBackupString(value.lastEventToken, 500) && isSafeBackupString(value.lastPracticeQuestionId, 500);
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

  function validateBackupPracticeAdaptive(value) {
    if (value === undefined || value === null) return true;
    if (!isPlainRecord(value)) return false;
    for (const bucketName of ['scopes','sourceTypes']) {
      const bucket = value[bucketName] === undefined ? {} : value[bucketName];
      if (!isPlainRecord(bucket) || Object.keys(bucket).length > 5000) return false;
      for (const [key, item] of Object.entries(bucket)) {
        if (typeof key !== 'string' || key.length > 500 || !isPlainRecord(item)) return false;
        for (const field of ['deficit','attempts','wrongCount','unknownCount','nearCount','correctCount','lastAt']) {
          if (item[field] !== undefined) {
            const number = Number(item[field]);
            if (!Number.isFinite(number) || number < 0 || number > 1e15) return false;
          }
        }
        if (!isSafeBackupString(item.lastResult, 30)) return false;
      }
    }
    return value.version === undefined || Number(value.version) === 1;
  }

  function validateBackupPracticeSourceLink(value) {
    if (value === undefined || value === null) return true;
    if (!isPlainRecord(value) || Object.keys(value).length > 5000) return false;
    return Object.entries(value).every(([key, item]) => {
      if (key === '__adaptive') return validateBackupPracticeAdaptive(item);
      if (typeof key !== 'string' || key.length > 500 || !isPlainRecord(item)) return false;
      for (const field of ['deficit','attempts','wrongCount','unknownCount','nearCount','correctCount','lastAt']) {
        if (item[field] !== undefined) {
          const number = Number(item[field]);
          if (!Number.isFinite(number) || number < 0 || number > 1e15) return false;
        }
      }
      return isSafeBackupString(item.lastResult, 30);
    });
  }

  function validateBackupPracticeQuestionStats(value) {
    if (value === undefined || value === null) return true;
    if (!isPlainRecord(value)) return false;
    const questions = value.questions === undefined ? {} : value.questions;
    if (!isPlainRecord(questions) || Object.keys(questions).length > 5000) return false;
    for (const field of ['version','totalAttempts','totalPerfect']) {
      if (value[field] !== undefined) {
        const number = Number(value[field]);
        if (!Number.isFinite(number) || number < 0 || number > 1e12) return false;
      }
    }
    return Object.entries(questions).every(([key, item]) => {
      if (typeof key !== 'string' || key.length > 500 || !isPlainRecord(item)) return false;
      for (const field of ['attempts','bestScore','maxScore','lastScore','perfect']) {
        if (item[field] !== undefined) {
          const number = Number(item[field]);
          if (!Number.isFinite(number) || number < 0 || number > 1e9) return false;
        }
      }
      return isSafeBackupString(item.lastAt, 80);
    });
  }

  function exportStudyData() {
    const history = loadHistory();
    const mastery = loadMastery();
    const payload = StorageEngine.buildBackupPayload({
      appVersion:APP_VERSION,
      coreSplitMigrationVersion:Number(learningStateMemory.coreSplitMigrationVersion || CORE_SPLIT_MIGRATION_VERSION),
      history, mastery, practicalStats:cloneJson(practicalStats, {}),
      practiceSourceLink:loadPracticeSourceLinkState(), practiceQuestionStats:loadLocalRecord(PRACTICE_QUESTION_STATS_KEY),
      gradingOverrides:loadGradingOverrides(), practicalExamProgress:loadPracticalExamProgress(),
      plannerState:loadPlannerState(),
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
      const oldPlannerState = loadPlannerState();
      const oldPracticeSourceLink = loadPracticeSourceLinkState();
      const oldPracticeQuestionStats = loadLocalRecord(PRACTICE_QUESTION_STATS_KEY);
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
        if (!validateBackupPracticeSourceLink(data.practiceSourceLink)) {
          throw new Error("손상되었거나 형식이 다른 연습문제-원문 연동 기록이 포함되어 있습니다.");
        }
        if (!validateBackupPracticeQuestionStats(data.practiceQuestionStats)) {
          throw new Error("손상되었거나 형식이 다른 연습문제 풀이 기록이 포함되어 있습니다.");
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

        if (data.plannerState !== undefined) {
          if (!isPlainRecord(data.plannerState) || !Array.isArray(data.plannerState.completedSectionIds) ||
              data.plannerState.completedSectionIds.length > 500 ||
              !data.plannerState.completedSectionIds.every(id => typeof id === "string" && id.length <= 1000)) {
            throw new Error("손상되었거나 형식이 다른 오늘의 학습 계획 기록이 포함되어 있습니다.");
          }
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
          practiceSourceLink: oldPracticeSourceLink,
          practiceQuestionStats: oldPracticeQuestionStats,
          gradingOverrides: oldGradingOverrides,
          practicalExamProgress: oldExamProgress,
          plannerState: oldPlannerState,
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
        savePracticeSourceLinkState(data.practiceSourceLink || {});
        if (data.practiceQuestionStats !== undefined) safeSetLocalStorage(PRACTICE_QUESTION_STATS_KEY, JSON.stringify(data.practiceQuestionStats || {}));
        if (data.gradingOverrides !== undefined) safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(data.gradingOverrides || {}));
        if (data.practicalExamProgress !== undefined) safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(data.practicalExamProgress || {}));
        if (data.plannerState !== undefined) savePlannerState(data.plannerState || {});

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
        savePracticeSourceLinkState(oldPracticeSourceLink);
        safeSetLocalStorage(PRACTICE_QUESTION_STATS_KEY, JSON.stringify(oldPracticeQuestionStats));
        safeSetLocalStorage(GRADING_OVERRIDE_KEY, JSON.stringify(oldGradingOverrides));
        safeSetLocalStorage(PRACTICAL_EXAM_PROGRESS_KEY, JSON.stringify(oldExamProgress));
        savePlannerState(oldPlannerState);
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
    localStorage.removeItem(DAILY_STUDY_PLANNER_KEY);
    localStorage.removeItem(GRADING_OVERRIDE_KEY);
    localStorage.removeItem(PRACTICAL_EXAM_PROGRESS_KEY);
    localStorage.removeItem(PRACTICE_SOURCE_LINK_KEY);
    localStorage.removeItem(PRACTICE_QUESTION_STATS_KEY);
    localStorage.removeItem("curriloop-practice-ui-v1");
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
  function sortHistoryRecords(list, filter, sortMode, mastery) { return HistoryEngine.sortRecords(list, filter, sortMode, mastery); }

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
    const sortMode = document.getElementById("historySort")?.value || "weak";
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
    list = sortHistoryRecords(list, filter, sortMode, mastery);

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
          <button class="btn soft" type="button" data-history-source="${escapeHtml(item.key)}">원문 보기</button>
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
    const coreDelayedRetry = isNewGradingEvent && isMiddleInfoPilot(meta.unit) && getCurrentDifficulty() === "easy" && studyMode === "fill";
    if (isNewGradingEvent) {
      recordPlannerAssessmentOutcome(`blank|${meta.conceptKey}`, answerStatus, "core");
      masteryItem = updateMastery(meta.conceptKey, answerStatus, eventToken);
      if (practical) recordPracticalTargetResult(meta.line, meta.gapId, answerStatus);
      if (coreDelayedRetry) {
        coreGradeSerial += 1;
        persistPracticalRetryState();
      }
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
      if (practical) schedulePracticalRetry({...historyPayload, retryMode:"practical", aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"wrong"});
      else if (coreDelayedRetry) schedulePracticalRetry({...historyPayload, retryMode:"core", difficultyKey:"easy", difficultyLabel:"핵심", aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"wrong"});
    } else if (answerStatus === "unknown" && isNewGradingEvent) {
      // '모름'은 기억 실패이므로 복습 시점은 당기되, 사용자가 입력한 오답 표현으로는 기록하지 않는다.
      if (practical) schedulePracticalRetry({...historyPayload, retryMode:"practical", aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"unknown"});
      else if (coreDelayedRetry) schedulePracticalRetry({...historyPayload, retryMode:"core", difficultyKey:"easy", difficultyLabel:"핵심", aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"unknown"});
    } else if (answerStatus === "near" && isNewGradingEvent) {
      if (practical) schedulePracticalRetry({...historyPayload, retryMode:"practical", aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"near", nearReason:grading.reason});
      else if (coreDelayedRetry) schedulePracticalRetry({...historyPayload, retryMode:"core", difficultyKey:"easy", difficultyLabel:"핵심", aliases: JSON.parse(input.dataset.aliases || "[]"), retryReason:"near", nearReason:grading.reason});
    }

    if (coreDelayedRetry) maybeShowPracticalRetry();
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
    const holisticBlocks = [...document.querySelectorAll("#studyArea .holistic-recall")];
    holisticBlocks.forEach(block => gradeHolisticRecallBlock(block));
    const allInputs = [...document.querySelectorAll("#studyArea .gap-input")].filter(input => input.dataset.learningMode === "fill");
    // 빈칸을 비워 둔 채 '전체 채점'했다고 해서 지식 오답으로 누적하지 않는다.
    const inputs = allInputs.filter(input => normalize(input.value));
    if (!inputs.length && !holisticBlocks.length) {
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
    document.querySelectorAll("#studyArea .recall-input[data-state-key]").forEach(input => { if (input.dataset.stateKey) delete fieldState[input.dataset.stateKey]; });
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
    if (isMiddleInfoPilot()) { if (panel) panel.classList.add("hidden"); return; }
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

    const summaryUnitKey = `${unit.subject}|${unit.area}|${selectedGroup}`;
    if (summaryUnitKey !== practicalSummaryUnitKey) {
      practicalSummaryUnitKey = summaryUnitKey;
      practicalSetRecoveryCount = 0;
    }

    if (isMiddleInfoPilot(unit) && studyMode === "fill" && getCurrentDifficulty() === "practical") {
      const blocks = [...document.querySelectorAll("#studyArea .holistic-recall")];
      if (blocks.length) {
      const statuses = blocks.map(block => block.dataset.gradedStatus || "");
      const exact = statuses.filter(status => status === "correct").length;
      const near = statuses.filter(status => status === "near").length;
      const failed = statuses.filter(status => status === "wrong" || status === "unknown").length;
      const graded = statuses.filter(Boolean).length;
      const score = document.getElementById("scoreText");
      if (score) score.textContent = `통회상 ${graded}/${blocks.length} · 정확 ${exact}${near ? ` · 확인 ${near}` : ""}${failed ? ` · 보완 ${failed}` : ""}`;
      document.getElementById("nextPracticalSetButton")?.classList.add("hidden");
      document.getElementById("practicalSetSummary")?.classList.add("hidden");
      hidePracticalExamChallenge();
      return;
      }
    }

    let currentCorrect = 0;
    let currentNear = 0;
    let currentWrong = 0;
    let currentUnknown = 0;

    const visibleInputs = [...document.querySelectorAll("#studyArea .gap-input")];
    visibleInputs.forEach(input => {
      const state = fieldState[input.dataset.stateKey];
      if (state?.status === "correct") currentCorrect++;
      else if (state?.status === "near") currentNear++;
      else if (state?.status === "wrong") currentWrong++;
      else if (state?.status === "unknown") currentUnknown++;
    });
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
      const complete = !isMiddleInfoPilot(unit) && studyMode === "fill" && getCurrentDifficulty() === "practical" && lineGroups.size > 0 && completedLines === lineGroups.size;
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



  let sourceModalReturnFocus = null;

  function sourceModalGroupLabel(sourceGroup) {
    return groupLabels[sourceGroup] || sourceGroup || "원문";
  }

  function sourceSectionHtml({subjectKey, areaName, sourceGroup, sectionTitle, lines}, highlightedIds = new Set()) {
    const label = subjectKey ? (subjectLabels[subjectKey] || subjectKey) : "";
    const heading = [label, areaName].filter(Boolean).join(" · ") || "원문";
    const lineHtml = (lines || []).map(line => {
      const highlighted = highlightedIds.has(line.id);
      return `<div class="source-modal-line${highlighted ? ' highlighted' : ''}" data-source-id="${escapeHtml(line.id || '')}">
        <div class="source-modal-line-text">${escapeHtml(line.text || '')}</div>
        ${line.id ? `<code class="source-modal-id">${escapeHtml(line.id)}</code>` : ''}
      </div>`;
    }).join("");
    return `<section class="source-modal-section">
      <div class="source-modal-section-head">
        <strong>${escapeHtml(heading)}</strong>
        <span>${escapeHtml(sourceModalGroupLabel(sourceGroup))}${sectionTitle ? ` · ${escapeHtml(sectionTitle)}` : ''}</span>
      </div>
      <div class="source-modal-lines">${lineHtml}</div>
    </section>`;
  }

  function sourceContextsForIds(sourceIds = []) {
    const wanted = new Set((sourceIds || []).filter(Boolean));
    const contexts = [];
    const scanCorpus = corpus => {
      Object.entries(corpus || {}).forEach(([subjectKey, subject]) => {
        Object.entries(subject || {}).forEach(([areaName, area]) => {
          SOURCE_GROUPS.forEach(sourceGroup => {
            (area?.[sourceGroup] || []).forEach(section => {
              const lines = section.lines || [];
              if (!lines.some(line => wanted.has(line.id))) return;
              contexts.push({subjectKey, areaName, sourceGroup, sectionTitle:section.title || "", lines});
            });
          });
        });
      });
    };
    scanCorpus(curriculumData);
    scanCorpus(curriculum2015);
    return contexts;
  }

  function openSourceModalPayload({title="원문 보기", meta="", contexts=[], highlightedIds=[], officialSubject="", note=""} = {}) {
    const backdrop = document.getElementById("sourceModalBackdrop");
    const body = document.getElementById("sourceModalBody");
    if (!backdrop || !body) return;
    if (!document.getElementById("helpModalBackdrop")?.classList.contains("hidden")) closeHelpModal();
    sourceModalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const titleEl = document.getElementById("sourceModalTitle");
    const metaEl = document.getElementById("sourceModalMeta");
    if (titleEl) titleEl.textContent = title;
    if (metaEl) metaEl.textContent = meta;
    const ids = new Set((highlightedIds || []).filter(Boolean));
    const content = contexts.length
      ? contexts.map(context => sourceSectionHtml(context, ids)).join("")
      : `<div class="source-modal-empty">표시할 원문을 찾지 못했습니다.</div>`;
    body.innerHTML = `${note ? `<div class="source-modal-note">${escapeHtml(note)}</div>` : ''}${content}`;
    const link = document.getElementById("sourceModalOfficialLink");
    const sourceMeta = subjectSourceMeta[officialSubject] || null;
    if (link) {
      link.classList.toggle("hidden", !sourceMeta?.url);
      if (sourceMeta?.url) {
        link.href = sourceMeta.url;
        link.title = sourceMeta.label || "공식 교육과정 출처";
      }
    }
    backdrop.classList.remove("hidden");
    document.body.dataset.modalOpen = "true";
    setModalBackgroundInert(true, "sourceModalBackdrop");
    requestAnimationFrame(() => {
      const highlighted = backdrop.querySelector(".source-modal-line.highlighted");
      highlighted?.scrollIntoView({block:"center", behavior:"auto"});
      backdrop.querySelector("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus({preventScroll:true});
    });
  }

  function openSourceModalByIds(sourceIds, options = {}) {
    const ids = [...new Set((sourceIds || []).filter(Boolean))];
    const contexts = sourceContextsForIds(ids);
    const first = contexts[0] || null;
    const subjects = [...new Set(contexts.map(context => context.subjectKey))];
    const areas = [...new Set(contexts.map(context => context.areaName))];
    openSourceModalPayload({
      title:options.title || "근거 원문 보기",
      meta:options.meta || [subjects.map(key => subjectLabels[key] || key).join(" · "), areas.join(" · ")].filter(Boolean).join(" · "),
      contexts,
      highlightedIds:ids,
      officialSubject:subjects.length === 1 ? subjects[0] : (options.subject || first?.subjectKey || ""),
      note:options.note || "강조된 문장이 현재 항목의 직접 근거입니다. 팝업을 닫으면 학습 위치와 답안이 그대로 유지됩니다."
    });
  }

  function openCurrentUnitSourceModal() {
    const unit = getCurrentUnit();
    if (!unit?.subject || !unit?.area) return;
    const group = getCurrentGroup();
    const sections = getUnitData(unit.subject, unit.area, group);
    const contexts = sections.map(section => ({
      subjectKey:unit.subject,
      areaName:unit.area,
      sourceGroup:section._sourceGroup || normalizeSelectedGroup(group),
      sectionTitle:section.title || "",
      lines:section.lines || []
    }));
    openSourceModalPayload({
      title:"원문 보기",
      meta:[subjectLabels[unit.subject] || unit.subject, unit.area, groupLabels[group] || (group === 'all' ? '전체' : group)].filter(Boolean).join(" · "),
      contexts,
      highlightedIds:[],
      officialSubject:unit.subject,
      note:"공식 교육과정 원문만 표시합니다. CurriLoop의 핵심 흐름은 학습용 보조자료이므로 이 팝업에는 포함하지 않습니다."
    });
  }

  function openGeneralSourceModal(item) {
    const q = generalBank.find(entry => entry.id === item?.generalId);
    if (!q) return;
    openSourceModalPayload({
      title:"총론 학습 원문 보기",
      meta:generalCategoryLabels[q.category] || q.category || "총론",
      contexts:[{
        subjectKey:"",
        areaName:"총론",
        sourceGroup:"",
        sectionTitle:"CurriLoop 총론 학습 항목",
        lines:[{id:q.id, text:q.q}, {id:"", text:`정답: ${q.display}`}]
      }],
      highlightedIds:[q.id],
      note:"총론 학습은행 항목을 현재 위치를 유지한 채 표시합니다. 각론 원문 팝업과 달리 이 화면은 총론 문제은행의 학습 항목입니다."
    });
  }

  function closeSourceModal(event = null) {
    const backdrop = document.getElementById("sourceModalBackdrop");
    if (!backdrop) return;
    if (event && event.target !== backdrop) return;
    backdrop.classList.add("hidden");
    delete document.body.dataset.modalOpen;
    setModalBackgroundInert(false);
    const target = sourceModalReturnFocus && document.contains(sourceModalReturnFocus) ? sourceModalReturnFocus : document.getElementById("sourceModalButton");
    sourceModalReturnFocus = null;
    target?.focus?.({preventScroll:true});
  }

  function trapSourceModalFocus(event) {
    const backdrop = document.getElementById("sourceModalBackdrop");
    if (!backdrop || backdrop.classList.contains("hidden") || event.key !== "Tab") return false;
    const focusable = [...backdrop.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
      .filter(element => !element.disabled && element.getClientRects().length);
    if (!focusable.length) return false;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus(); return true;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus(); return true;
    }
    return false;
  }

  window.CurriLoopSourceModal = {openIds:openSourceModalByIds, openCurrent:openCurrentUnitSourceModal, close:closeSourceModal};

  let helpModalReturnFocus = null;

  function setModalBackgroundInert(enabled, activeBackdropId = "") {
    const activeBackdrop = activeBackdropId ? document.getElementById(activeBackdropId) : null;
    [...document.body.children].forEach(element => {
      if (element === activeBackdrop || element.tagName === "SCRIPT") return;
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
    setModalBackgroundInert(true, "helpModalBackdrop");
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


  function isLongTermReviewEligible(item) {
    if (!item) return false;
    if (item.type !== "subject" || item.subjectKey !== "middle-info") return true;
    const meta = findLineIdentity(item.subjectKey, item.area, item.lineId, item.context || "");
    if (!meta) return true;
    const tier = RecallEngine.memoryTier(meta.sectionTitle || "", item.sourceGroup || item.groupKey || "");
    // 정확 암기 영역은 장기적으로 개별 핵심 빈칸을 반복하지 않고 통회상 묶음으로 유지한다.
    return tier.key !== "exact";
  }

  function getTodayPlannerSnapshot(now = Date.now()) {
    let state = loadPlannerState();
    const dailyPlan = ensureDailyReviewPlan(now);
    const remainingReviews = remainingDailyReviewItems(now);
    const cumulativeCount = remainingReviews.filter(item => item._cumulative).length;
    const scheduledDueCount = remainingReviews.length - cumulativeCount;
    const dueCount = remainingReviews.length;
    const backlogCount = Math.max(scheduledDueCount, Number(dailyPlan?.backlogTotal || scheduledDueCount));
    const deadline = PlannerEngine.deadlineGuidance(plannerStudySections, state, {now});
    let decision = PlannerEngine.paceDecision({state, dueCount:backlogCount, now, targetFloor:deadline.targetFloor});
    if (!state.activeSession && decision.mode === "review-recovery" && state.recoveryDayKey !== PlannerEngine.localDayKey(now)) {
      state.recoveryDayKey = PlannerEngine.localDayKey(now);
      state = savePlannerState(state);
      decision = PlannerEngine.paceDecision({state, dueCount:backlogCount, now, targetFloor:deadline.targetFloor});
    }
    const reviewBudget = Number(dailyPlan?.reviewBudget || PlannerEngine.dailyReviewBudget(state.targetLines));
    const reviewUnlockAllowance = PlannerEngine.reviewUnlockAllowance(state.targetLines);
    const consolidationToday = PlannerEngine.isConsolidationDay(state, now);
    // 평상시에는 오늘 복습 예산의 75% 이상 처리하면 소량 잔여 복습과 새 진도를 병행할 수 있다.
    // 누적 정리일에는 새 진도를 열지 않는다.
    const blockingReviewCount = consolidationToday ? dueCount : Math.max(0, scheduledDueCount - reviewUnlockAllowance);
    const canOpenNewAfterReview = !consolidationToday && blockingReviewCount === 0;
    const session = decision.allowNew && canOpenNewAfterReview
      ? (state.activeSession || PlannerEngine.createNextSession(plannerStudySections, state, backlogCount, now, {targetFloor:deadline.targetFloor}))
      : null;
    const progress = PlannerEngine.progressSummary(plannerStudySections, state);
    return {state, dueCount, scheduledDueCount, cumulativeCount, backlogCount, decision, session, progress, reviewBudget, reviewUnlockAllowance, blockingReviewCount, canOpenNewAfterReview, deadline};
  }

  function plannerDayKeyLabel(dayKey) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dayKey || ""));
    if (!match) return String(dayKey || "-");
    return `${Number(match[2])}/${Number(match[3])}`;
  }

  function renderTodayHome() {
    const title = document.getElementById("todayTitle");
    if (!title) return;
    const snapshot = getTodayPlannerSnapshot();
    const {state, dueCount, scheduledDueCount, cumulativeCount, backlogCount, decision, session, progress, reviewBudget, reviewUnlockAllowance, blockingReviewCount, deadline} = snapshot;
    const reviewCount = document.getElementById("todayReviewCount");
    const reviewNote = document.getElementById("todayReviewNote");
    const reviewButton = document.getElementById("todayHomeReviewButton");
    const newRange = document.getElementById("todayNewRange");
    const newNote = document.getElementById("todayNewRangeNote");
    const newButton = document.getElementById("todayNewRangeButton");
    const cumulative = document.getElementById("todayCumulativeCount");
    const cumulativeNote = document.getElementById("todayCumulativeNote");
    const cumulativeButton = document.getElementById("todayCumulativeButton");
    const pace = document.getElementById("todayPace");
    const paceNote = document.getElementById("todayPaceNote");
    const target = document.getElementById("todayTargetLines");
    const recentAccuracy = document.getElementById("todayRecentAccuracy");
    const examDday = document.getElementById("todayExamDday");
    const firstPassForecast = document.getElementById("todayFirstPassForecast");
    const coverage = document.getElementById("todayCoverage");
    const reason = document.getElementById("todayReason");
    const start = document.getElementById("todayStartButton");
    if (start) start.disabled = false;

    if (reviewCount) reviewCount.textContent = `${scheduledDueCount}개`;
    if (reviewNote) reviewNote.textContent = scheduledDueCount
      ? (blockingReviewCount > 0
          ? `오늘 ${scheduledDueCount}개 남음 · ${Math.max(0, scheduledDueCount - blockingReviewCount)}개를 더 처리하면 새 진도가 열립니다.`
          : `잔여 ${scheduledDueCount}개는 허용 범위(${reviewUnlockAllowance}개 이하)입니다. 새 학습 뒤 오늘 안에 마무리합니다.`)
      : (backlogCount > 0 ? "오늘 예정 복습 예산은 처리했습니다. 남은 적체는 새 진도 감속으로 흡수합니다." : "오늘 예정된 장기 복습을 모두 처리했습니다.");
    if (reviewButton) { reviewButton.textContent = scheduledDueCount ? "오늘 학습 시작" : "예정 복습 완료"; reviewButton.disabled = scheduledDueCount === 0; }
    if (cumulative) cumulative.textContent = `${cumulativeCount}개`;
    if (cumulativeNote) {
      const consolidationToday = PlannerEngine.isConsolidationDay(state, Date.now());
      const cycleDays = Math.min(6, Number(state.cycleStudyDayKeys?.length || 0));
      cumulativeNote.textContent = consolidationToday
        ? (cumulativeCount ? "이미 학습한 범위에서 오래 안 본 것·취약한 것을 섞어 다시 꺼냅니다." : "오늘 점검할 적격 항목이 없다면 정리일만 완료하고 다음 주기로 넘어갑니다.")
        : (cycleDays >= 6 ? "일반 학습일 6일을 채웠습니다. 다음 실제 학습일이 누적 정리일입니다." : `현재 주기 ${cycleDays}/6 학습일 · ${6 - cycleDays}일을 더 실제로 공부하면 다음 학습일이 누적 정리일입니다.`);
    }
    if (cumulativeButton) {
      const consolidationToday = PlannerEngine.isConsolidationDay(state, Date.now());
      cumulativeButton.textContent = cumulativeCount ? "누적 점검 시작" : (consolidationToday ? "정리일 완료" : "누적 점검 없음");
      cumulativeButton.disabled = cumulativeCount === 0 && !consolidationToday;
    }
    if (coverage) coverage.textContent = `${progress.percent}%`;
    if (target) target.textContent = decision.effectiveTargetLines && decision.effectiveTargetLines !== state.targetLines ? `${decision.effectiveTargetLines}점 (기본 ${state.targetLines})` : `${state.targetLines}점`;
    if (recentAccuracy) {
      const last = [...(state.completedSessions || [])].reverse().find(item => Number.isFinite(Number(item.firstRecallAccuracy)));
      recentAccuracy.textContent = last ? `${Math.round(Number(last.firstRecallAccuracy))}%` : "아직 없음";
    }

    const active = Boolean(session?.sectionIds?.length);
    const hasActiveSession = Boolean(state.activeSession?.sectionIds?.length);
    const guidedComplete = progress.percent >= 100 && !active;
    if (newRange) newRange.textContent = active ? plannerSessionLabel(session) : (guidedComplete ? "중등 정보 자동 진도 완료" : (decision.allowNew ? "다음 범위 준비" : "오늘 새 진도 없음"));
    if (newNote) {
      if (active) {
        const continued = session.startedDayKey && session.startedDayKey !== PlannerEngine.localDayKey(Date.now());
        const resume = hasActiveSession ? plannerResumeNote(session) : "";
        newNote.textContent = `${Number(session.workloadScore || session.lineCount || 0).toFixed(1).replace(/\.0$/, "")}점 · ${session.lineCount || 0}문장 · ${hasActiveSession ? (resume || (continued ? "어제 범위를 이어서 학습합니다." : "진행 중인 범위를 이어서 학습합니다.")) : "오늘 처음 보는 범위입니다."}`;
      } else if (guidedComplete) {
        newNote.textContent = "오늘 플래너의 자동 진도는 중등 정보까지만 적용합니다. 다른 과목은 개편 전까지 각론에서 수동으로 학습하세요.";
      } else newNote.textContent = decision.reason;
    }
    if (newButton) {
      newButton.disabled = guidedComplete || !active || blockingReviewCount > 0;
      newButton.textContent = guidedComplete ? "자동 진도 종료" : (blockingReviewCount > 0 ? "복습 후 시작" : (hasActiveSession ? "이어 공부하기" : "새 범위 시작"));
    }

    let paceLabel = "표준";
    if (decision.mode === "review-recovery") paceLabel = "복습 회복";
    else if (decision.mode === "consolidation") paceLabel = "누적 정리";
    else if (decision.mode === "new-reduced") paceLabel = "새 진도 감속";
    else if (decision.mode === "deadline-boost") paceLabel = "시험 역산 보정";
    else if (decision.mode === "daily-new-complete") paceLabel = "오늘 새 진도 완료";
    else if (state.targetLines <= 12) paceLabel = "천천히";
    else if (state.targetLines >= 21) paceLabel = "빠르게";
    if (pace) pace.textContent = paceLabel;
    if (examDday) examDday.textContent = deadline.daysToExam >= 0 ? `D-${deadline.daysToExam}` : `D+${Math.abs(deadline.daysToExam)}`;
    if (firstPassForecast) firstPassForecast.textContent = progress.percent >= 100 ? "완료" : plannerDayKeyLabel(deadline.estimatedCompletionDayKey);
    if (paceNote) {
      const deadlineText = progress.percent >= 100
        ? `중등 정보 첫 회독 완료 · 1차 시험 ${plannerDayKeyLabel(deadline.examDayKey)}`
        : `권장 첫 회독 마감 ${plannerDayKeyLabel(deadline.deadlineDayKey)}(D-35) · 예상 ${plannerDayKeyLabel(deadline.estimatedCompletionDayKey)}`;
      paceNote.textContent = state.activeSession
        ? `끝내지 못하면 다음 날 같은 범위를 그대로 이어갑니다. · ${deadlineText}`
        : `${decision.reason} · ${deadlineText}`;
    }

    if (blockingReviewCount > 0 || (decision.mode === "consolidation" && dueCount > 0)) {
      title.textContent = cumulativeCount ? `오늘은 예정 복습과 누적 점검 ${dueCount}개를 먼저 처리하세요.` : `먼저 복습을 ${blockingReviewCount || dueCount}개 더 처리하세요.`;
      reason.textContent = decision.mode === "review-recovery" ? `${decision.reason} 오늘은 새 범위를 열지 않습니다.` : (decision.mode === "consolidation" ? "예정 복습 뒤 누적 혼합 점검까지 마치면 오늘 학습이 끝납니다." : `복습 예산의 75%를 처리하면 새 범위를 열고 잔여 ${reviewUnlockAllowance}개 이하는 오늘 뒤에 마무리할 수 있습니다.`);
      if (start) start.textContent = "오늘 학습 시작";
    } else if (active) {
      title.textContent = hasActiveSession
        ? (session.startedDayKey !== PlannerEngine.localDayKey(Date.now()) ? "어제 범위를 이어서 마칩니다." : "진행 중인 범위를 이어서 마칩니다.")
        : "오늘의 새 범위를 시작하세요.";
      reason.textContent = `${plannerSessionLabel(session)} · 학습량 ${Number(session.workloadScore || session.lineCount || 0).toFixed(1).replace(/\.0$/, "")}점 · ${session.lineCount || 0}문장${hasActiveSession ? ` · ${plannerResumeNote(session)}` : ""}${dueCount > 0 ? ` · 잔여 복습 ${dueCount}개는 학습 뒤 마무리` : ""}`;
      if (start) start.textContent = hasActiveSession ? "이어 공부하기" : "새 범위 시작";
    } else {
      const dailyNewDone = decision.mode === "daily-new-complete";
      title.textContent = progress.percent >= 100
        ? "중등 정보 자동 첫 회독을 완료했습니다."
        : (dailyNewDone ? "오늘의 새 학습량을 완료했습니다." : "오늘은 새 진도보다 누적 정리에 집중합니다.");
      reason.textContent = progress.percent >= 100
        ? "중등 정보의 자동 범위 확장은 여기서 멈춥니다. 완료된 내용은 장기 복습에서 계속 다시 꺼내며, 다른 과목은 각론에서 수동 학습할 수 있습니다."
        : decision.reason;
      if (start) start.textContent = dueCount > 0 ? "남은 복습 마무리" : "오늘 학습 완료";
      if (start && dailyNewDone && dueCount === 0) start.disabled = true;
      else if (start) start.disabled = false;
    }
  }

  function startTodayFromHome() {
    const now = Date.now();
    const snapshot = getTodayPlannerSnapshot(now);
    // 누적 정리일 또는 아직 75% 게이트를 넘지 못한 날은 복습이 항상 먼저다.
    if ((snapshot.decision.mode === "consolidation" && snapshot.dueCount > 0) || snapshot.blockingReviewCount > 0) {
      showTab("history"); startWrongReview(true); return;
    }
    // 복습을 충분히 처리했다면 소량의 잔여 복습이 있어도 진행 중/새 범위를 먼저 수행한다.
    if (snapshot.session) { startPlannedNewStudy(); return; }
    // 새 범위가 끝났거나 열 수 없는 상태에서 잔여 복습이 있으면 오늘 안에 마무리한다.
    if (snapshot.dueCount > 0) { showTab("history"); startWrongReview(true); return; }
    if (snapshot.decision.mode === "consolidation") {
      const next = PlannerEngine.recordStudyActivity(snapshot.state, now);
      savePlannerState(next);
      ensureDailyReviewPlan(now, {force:true});
      renderTodayHome();
      return;
    }
    showTab("history");
  }

  function groupForPlannerSession(session) {
    const groups = new Set(session?.sourceGroups || []);
    if (groups.has("character-goal") || groups.has("teaching-evaluation")) return "all";
    if (groups.has("content-system") && groups.has("achievement")) return "all";
    if (groups.has("content-system")) return "content-system";
    if (groups.has("achievement")) {
      const sections = plannerSessionSections();
      const hasStandard = sections.some(item => item.sectionTitle === "성취기준");
      const hasGuidance = sections.some(item => /성취기준 해설|성취기준 적용 시 고려/.test(item.sectionTitle));
      if (hasStandard && hasGuidance) return "all";
      return hasStandard ? "achievement" : "achievement-guidance";
    }
    return "all";
  }

  function startPlannedNewStudy() {
    const snapshot = getTodayPlannerSnapshot();
    if (snapshot.blockingReviewCount > 0 || snapshot.decision.mode === "consolidation") {
      alert(`복습을 ${snapshot.blockingReviewCount || snapshot.dueCount}개 더 처리한 뒤 새 범위를 시작하세요. 오늘 복습 예산의 75%를 처리하면 소량 잔여 복습은 학습 뒤 마무리할 수 있습니다.`);
      showTab("history");
      return;
    }
    let session = snapshot.session;
    if (!session) { renderTodayHome(); return; }
    let plannerState = snapshot.state;
    if (!snapshot.state.activeSession) {
      plannerState = PlannerEngine.startSession(snapshot.state, session, Date.now());
      savePlannerState(plannerState);
      session = plannerState.activeSession;
    } else {
      plannerState = loadPlannerState();
      session = plannerState.activeSession;
    }
    plannerFocusActive = true;
    restorePlannerDraftFields(plannerState);
    document.getElementById("subjectSelect").value = session.subjectKey;
    document.getElementById("groupSelect").value = groupForPlannerSession(session);
    fillAreaSelect();
    const areaSelect = document.getElementById("areaSelect");
    if ([...areaSelect.options].some(option => option.value === session.area)) areaSelect.value = session.area;
    currentAreaIndex = 0;
    const steps = plannerStepsForCurrentSession();
    plannerStep = plannerResumeStepIndex(plannerState, steps);
    const resumedStep = steps[plannerStep] || steps[0];
    const difficulty = document.getElementById("difficultySelect");
    if (difficulty && resumedStep && [...difficulty.options].some(option => option.value === resumedStep.difficulty)) difficulty.value = resumedStep.difficulty;
    studyMode = resumedStep?.mode || "original";
    if (studyMode === "structure" && plannerState.activeSession?.studyProgress?.structureSession) {
      structureSession = plannerState.activeSession.studyProgress.structureSession;
      structureSessionNonce = Math.max(structureSessionNonce, Number(structureSession?.nonce || 0));
      activeStructureQuestion = structureSession?.questions?.[structureSession.index] || null;
    } else if (studyMode !== "structure") {
      resetStructureSession();
    }
    showTab("subject");
    renderStudy();
    requestAnimationFrame(() => {
      if (isInputStudyMode()) focusFirstEmpty();
      else window.scrollTo({top:0, behavior:"auto"});
    });
  }

  function plannerStepsForCurrentSession() {
    const state = loadPlannerState();
    const middle = state.activeSession?.subjectKey === "middle-info";
    if (middle) {
      const base = [
        {mode:"original", difficulty:"easy", label:"원문 읽기", guide:"전체 흐름을 한 번 읽습니다. 외우려고 오래 붙잡지 마세요."},
        {mode:"fill", difficulty:"easy", label:"핵심 빈칸", guide:"핵심 명사·행동동사를 정확히 꺼냅니다. 틀린 것은 몇 문항 뒤 다시 나옵니다."},
        {mode:"fill", difficulty:"practical", label:"실전 통회상", guide:"가능한 항목은 최소 단서로 통째로 꺼냅니다. 해설·고려사항은 핵심 빈칸으로 정확화합니다."}
      ];
      if (PlannerEngine.completesArea(plannerStudySections, state, state.activeSession)) {
        base.push({mode:"structure", difficulty:"easy", label:"연결 확인", guide:"이 영역의 마지막 세션입니다. 성취기준↔내용 요소·해설 연결을 짧게 확인한 뒤 범위를 완료합니다."});
      }
      return base;
    }
    return [
          {mode:"original", difficulty:"easy", label:"원문 읽기", guide:"전체 흐름을 한 번 읽습니다."},
          {mode:"fill", difficulty:"easy", label:"핵심 빈칸", guide:"핵심어를 직접 꺼냅니다."},
          {mode:"fill", difficulty:"normal", label:"정확화", guide:"조금 더 넓은 단서로 원문 표현을 정확하게 확인합니다."}
        ];
  }

  function applyPlannerStep() {
    const steps = plannerStepsForCurrentSession();
    plannerStep = Math.max(0, Math.min(plannerStep, steps.length - 1));
    const step = steps[plannerStep];
    if (!step) return;
    const difficulty = document.getElementById("difficultySelect");
    if (difficulty && [...difficulty.options].some(option => option.value === step.difficulty)) difficulty.value = step.difficulty;
    const enteringStructure = step.mode === "structure" && studyMode !== "structure";
    if (enteringStructure) resetStructureSession();
    studyMode = step.mode;
    renderStudy();
    persistPlannerStudyProgress();
    if (isInputStudyMode()) requestAnimationFrame(() => focusFirstEmpty());
  }

  function renderPlannerStudyBanner(unit) {
    const banner = document.getElementById("plannerStudyBanner");
    if (!banner) return;
    const state = loadPlannerState();
    const session = state.activeSession;
    const active = plannerFocusActive && session && session.subjectKey === unit.subject && session.area === unit.area;
    banner.classList.toggle("hidden", !active);
    if (!active) return;
    const steps = plannerStepsForCurrentSession();
    plannerStep = Math.max(0, Math.min(plannerStep, steps.length - 1));
    const step = steps[plannerStep];
    document.getElementById("plannerStudyTitle").textContent = `${plannerSessionLabel(session)} · ${step.label} (${plannerStep + 1}/${steps.length})`;
    document.getElementById("plannerStudyGuide").textContent = step.guide;
    const prev = document.getElementById("plannerPrevStepButton");
    const next = document.getElementById("plannerNextStepButton");
    const complete = document.getElementById("plannerCompleteButton");
    if (prev) prev.disabled = plannerStep === 0;
    if (next) { next.classList.toggle("hidden", plannerStep >= steps.length - 1); next.textContent = `다음: ${steps[Math.min(plannerStep + 1, steps.length - 1)]?.label || "완료"}`; }
    if (complete) complete.classList.toggle("hidden", plannerStep < steps.length - 1);
  }

  function plannerActiveLineIdSet(state = loadPlannerState()) {
    const ids = new Set();
    plannerSessionSections(state).forEach(section => (section.lineIds || []).forEach(id => ids.add(id)));
    return ids;
  }

  function pendingPlannerRetries(mode, state = loadPlannerState()) {
    const session = state.activeSession;
    if (!session) return [];
    const lineIds = plannerActiveLineIdSet(state);
    return practicalRetryQueue.filter(item =>
      item && item.subjectKey === session.subjectKey && item.area === session.area &&
      (item.retryMode || "practical") === mode && (!item.lineId || lineIds.has(item.lineId))
    );
  }

  function flushPlannerRetryIfNeeded(mode) {
    const pending = pendingPlannerRetries(mode);
    if (!pending.length) return false;
    const serial = mode === "core" ? coreGradeSerial : practicalGradeSerial;
    pending.forEach(item => { item.dueAt = Math.min(Number(item.dueAt || serial), serial); });
    persistPracticalRetryState();
    maybeShowPracticalRetry();
    return true;
  }

  function plannerStepAttemptGate() {
    const steps = plannerStepsForCurrentSession();
    const step = steps[plannerStep];
    if (!step || step.mode === "original") return {ok:true};
    if (step.mode === "structure") {
      if (structureSession?.complete) return {ok:true};
      return {ok:false, message:"연결 확인 문제를 끝까지 풀고 결과까지 확인한 뒤 완료하세요."};
    }
    if (step.mode === "fill") {
      const gapInputs = [...document.querySelectorAll('#studyArea .gap-input[data-learning-mode="fill"]')];
      const attemptedGaps = gapInputs.filter(input => ["correct","near","wrong","unknown"].includes(fieldState[input.dataset.stateKey]?.status)).length;
      const recallBlocks = [...document.querySelectorAll('#studyArea .holistic-recall')];
      const attemptedRecall = recallBlocks.filter(block => Boolean(block.dataset.gradedStatus)).length;
      const totalTargets = gapInputs.length + recallBlocks.length;
      const attemptedTargets = attemptedGaps + attemptedRecall;
      if (totalTargets > 0 && attemptedTargets < totalTargets) {
        return {ok:false, message:`이 단계의 인출을 먼저 끝내세요. 아직 ${totalTargets - attemptedTargets}개가 시도되지 않았습니다. 모르면 빈칸 상태에서 채점해 ‘모름’으로 기록해도 됩니다.`};
      }
      const retryMode = step.difficulty === "easy" ? "core" : "practical";
      if (flushPlannerRetryIfNeeded(retryMode)) {
        return {ok:false, message:"틀린 항목의 당일 다시 꺼내기가 남아 있습니다. 표시된 재인출을 먼저 끝내세요."};
      }
      return {ok:true};
    }
    return {ok:true};
  }

  function plannerNextStep() {
    const gate = plannerStepAttemptGate();
    if (!gate.ok) { alert(gate.message); return; }
    plannerStep += 1;
    applyPlannerStep();
  }
  function plannerPreviousStep() { plannerStep -= 1; applyPlannerStep(); }

  function completePlannedStudy() {
    const state = loadPlannerState();
    if (!state.activeSession) return;
    const gate = plannerStepAttemptGate();
    if (!gate.ok) { alert(gate.message); return; }
    const performanceBefore = PlannerEngine.sessionPerformanceSummary(state.activeSession);
    if (performanceBefore.evidenceCount < 1) {
      alert("이 범위를 완료하려면 최소 한 번 이상의 실제 인출·채점 기록이 필요합니다. 원문만 읽고 완료할 수는 없습니다.");
      return;
    }
    const result = PlannerEngine.completeActiveSession(state, Date.now());
    savePlannerState(result.state);
    plannerFocusActive = false;
    plannerStep = 0;
    ensureDailyReviewPlan(Date.now(), {force:true});
    showTab("home");
    const accuracyText = result.performance?.percent == null ? "" : ` · 첫 인출 정확도 ${result.performance.percent}%`;
    const paceMessage = `${result.pace?.reason || "범위를 완료했습니다."}${accuracyText} · 완료된 내용은 복습 큐에서 1→3→7→14일… 간격으로 다시 꺼냅니다.`;
    setTimeout(() => { renderTodayHome(); const reason = document.getElementById("todayReason"); if (reason) reason.textContent = paceMessage; }, 0);
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
    if (event.key === "Escape" && !document.getElementById("sourceModalBackdrop")?.classList.contains("hidden")) {
      event.preventDefault(); closeSourceModal(); return;
    }
    if (event.key === "Escape" && !document.getElementById("helpModalBackdrop")?.classList.contains("hidden")) {
      event.preventDefault(); closeHelpModal(); return;
    }
    if (trapSourceModalFocus(event)) return;
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
    renderTodayHome();
    await refreshUndoImportButton();
    const requestedTab = new URLSearchParams(location.search).get("tab");
    const initialTab = ["home","general","subject","practice","history"].includes(requestedTab) ? requestedTab : "home";
    showTab(initialTab);
    statePersistenceReady = true;
    saveCurrentState();

    if (migrationQuarantineCount > 0) {
      console.warn(`CurriLoop: ${migrationQuarantineCount}개의 구형/손상 기록을 격리 보존했습니다.`);
    }
  }

  window.addEventListener("pagehide", () => {
    try { saveCurrentState(); } catch {}
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") { try { saveCurrentState(); } catch {} }
  });

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

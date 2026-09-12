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
  // 공개판은 핵심·정밀 수동 큐레이션과 야~호! 문장 완전 회상의 3단계다.
  // -------------------------

  const subjectSourceMeta = {
    "middle-info": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 공통 교육과정 정보 · 인쇄 p.14–21", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "high-info": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 일반 선택 과목 정보", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "ai-basic": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 진로 선택 과목 인공지능 기초", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "data-science": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 진로 선택 과목 데이터 과학", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "software-life": {book:"별책10", label:"교육부 고시 제2022-33호 [별책10] 융합 선택 과목 소프트웨어와 생활", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="},
    "info-science": {book:"별책20", label:"2022 개정 [별책20] 과학 계열 선택 과목 교육과정 · 정보과학", url:"https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&searchTyp="}
  };

  const middleInfoSourceRanges = {
    "컴퓨팅 시스템": "인쇄 p.14, 16–17",
    "데이터": "인쇄 p.14, 17–18",
    "알고리즘과 프로그래밍": "인쇄 p.15, 18–19",
    "인공지능": "인쇄 p.15, 19–20",
    "디지털 문화": "인쇄 p.16, 20–21"
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

  // -------------------------
  // 4) 상태
  // -------------------------
  let currentTab = "general";
  let currentAreaIndex = 0;
  let currentRandomUnit = null;
  let quizMode = false;
  let lastStudyFocus = null; // {sectionIndex, lineIndex}
  const fieldState = {}; // key -> {value,status}
  const shuffleBags = loadShuffleBags();
  let currentAttemptId = 1;
  let generalAttemptId = 1;
  let generalIndex = 0;
  let generalGraded = false;
  let generalLastGradedValue = "";
  let generalShuffleState = null;
  const sessionStats = { subject: {correct:0, wrong:0}, general: {correct:0, wrong:0} };
  let reviewQueue = [];
  let reviewPosition = -1;
  let reviewActive = false;
  let activeReviewConceptKey = null;
  let pendingServiceWorker = null;
  let storageWarningShown = false;
  const APP_VERSION = "6.1.0";
  const MANUAL_GAP_REVIEW = "2026-09-12 / 6과목 27영역 550문장 핵심·정밀 개별 검수; 반복 핵심어 전수 가림·stable gap ID 도입; 중학교 정보 111문장 공식 별책10 재대조; 컴퓨팅 시스템·데이터 내용 체계 핵심을 소단위 회상형으로 재조정";

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
    }

    if (tab === "history") {
      renderHistory();
    }
  }

  function getCurrentSubject() { return document.getElementById("subjectSelect").value; }
  function getCurrentGroup() { return document.getElementById("groupSelect").value; }
  function getCurrentDifficulty() { return document.getElementById("difficultySelect").value; }

  function getAllUnits() {
    return Object.entries(subjectAreas).flatMap(([subject, areas]) =>
      areas.map(area => ({ subject, area }))
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

  function pickRandom(array) {
    if (!array.length) return null;
    return array[Math.floor(Math.random() * array.length)];
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
    let pool = subject === "all"
      ? getAllUnits()
      : (subjectAreas[subject] || []).map(area => ({ subject, area }));

    const bagKey = `${subject}|${getCurrentGroup()}`;
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
    const selectedArea = document.getElementById("areaSelect").value;

    if (selectedArea === "random") {
      if (!currentRandomUnit) chooseRandomUnit();
      return currentRandomUnit ? [currentRandomUnit] : [];
    }

    const decoded = decodeUnit(selectedArea);
    if (decoded) return [decoded];

    if (subject === "all") {
      return getAllUnits();
    }

    const areas = subjectAreas[subject] || [];

    if (selectedArea === "all") {
      return areas.map(area => ({ subject, area }));
    }

    return selectedArea ? [{ subject, area: selectedArea }] : [];
  }

  function getCurrentUnit() {
    const sequence = getUnitSequence();
    if (!sequence.length) return { subject: "", area: "" };
    currentAreaIndex = Math.max(0, Math.min(currentAreaIndex, sequence.length - 1));
    return sequence[currentAreaIndex];
  }

  function getSelectedAreaName() {
    return getCurrentUnit().area;
  }

  function onSubjectChange() {
    currentAreaIndex = 0;
    currentRandomUnit = null;
    quizMode = false;
    fillAreaSelect();
    renderStudy();
  }


  function fillAreaSelect() {
    const select = document.getElementById("areaSelect");
    const subject = getCurrentSubject();
    const previous = select.value;

    select.innerHTML = "";

    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "전체 단원";
    select.appendChild(all);

    const random = document.createElement("option");
    random.value = "random";
    random.textContent = "랜덤 단원";
    select.appendChild(random);

    if (subject === "all") {
      Object.entries(subjectAreas).forEach(([subjectKey, areas]) => {
        const group = document.createElement("optgroup");
        group.label = subjectLabels[subjectKey];

        areas.forEach(area => {
          const op = document.createElement("option");
          op.value = encodeUnit(subjectKey, area);
          op.textContent = `${subjectLabels[subjectKey]} · ${area}`;
          group.appendChild(op);
        });

        select.appendChild(group);
      });
    } else {
      (subjectAreas[subject] || [])
        .forEach(area => {
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
    currentAreaIndex = 0;
    quizMode = false;

    if (document.getElementById("areaSelect").value === "random") {
      chooseRandomUnit();
    } else {
      currentRandomUnit = null;
    }

    renderStudy();
  }

  function onGroupChange() {
    currentAreaIndex = 0;
    currentRandomUnit = null;
    quizMode = false;
    fillAreaSelect();
    renderStudy();
  }

  function onDifficultyChange() {
    const wasQuizMode = quizMode;
    const focusSnapshot = lastStudyFocus ? {...lastStudyFocus} : null;

    renderStudy();

    if (wasQuizMode && focusSnapshot) {
      requestAnimationFrame(() => focusMatchingLine(focusSnapshot));
    }
  }

  function moveUnit(delta) {
    if (document.getElementById("areaSelect").value === "random") {
      if (delta > 0) {
        chooseRandomUnit();
        currentAttemptId++;
        renderStudy();
        if (quizMode) requestAnimationFrame(() => focusFirstEmpty());
      }
      return;
    }
    const sequence = getUnitSequence();
    currentAreaIndex = Math.max(0, Math.min(sequence.length - 1, currentAreaIndex + delta));
    renderStudy();
    if (quizMode) requestAnimationFrame(() => focusFirstEmpty());
  }

  function startQuiz() {
    // 랜덤 모드에서는 미리보기에서 이미 뽑힌 단원을 그대로 시작한다.
    // 새 추첨은 최초 진입 또는 단원 완료/다음 랜덤 이동 시점에만 수행한다.
    if (document.getElementById("areaSelect").value === "random" && !currentRandomUnit) {
      chooseRandomUnit();
    }

    currentAttemptId++;
    quizMode = true;
    renderStudy();
    if (window.matchMedia("(max-width: 720px)").matches) toggleMobileSettings(true);
    requestAnimationFrame(() => focusFirstEmpty());
  }

  function clearCurrentUnitState() {
    const unit = getCurrentUnit();
    if (!unit.subject || !unit.area) return;
    const difficulty = getCurrentDifficulty();
    const selectedGroup = getCurrentGroup();
    const groups = selectedGroup === "all" ? ["content-system", "achievement"] : [selectedGroup];
    Object.keys(fieldState).forEach(key => {
      if (groups.some(group => key.startsWith([unit.subject, unit.area, group, difficulty].join("|") + "|"))) delete fieldState[key];
    });
  }

  // 원문 보기는 풀이 기록을 보존하고
  // 원문 학습 화면으로 돌아간다.
  function showOriginalAndReset() {
    // 원문 보기는 현재 입력/채점 상태를 보존한다. 삭제는 '현재 단원 초기화'에서만 수행한다.
    quizMode = false;
    renderStudy();
  }

  function updateStudyControls() {
    const startButton = document.getElementById("startQuizButton");
    const gradeButton = document.getElementById("gradeAllButton");
    const resetButton = document.getElementById("resetUnitButton");
    const originalButton = document.getElementById("originalButton");

    if (startButton) startButton.classList.toggle("hidden", quizMode);
    if (gradeButton) gradeButton.classList.toggle("hidden", !quizMode);
    if (resetButton) resetButton.classList.toggle("hidden", !quizMode);
    if (originalButton) originalButton.classList.toggle("hidden", !quizMode);
  }

  function getUnitData(subject, area, group) {
    const unit = curriculumData[subject]?.[area];
    if (!unit) return [];
    const tagged = (sections, sourceGroup) => (sections || []).map(section => ({...section, _sourceGroup: sourceGroup}));
    if (group === "all") return [
      ...tagged(unit["content-system"], "content-system"),
      ...tagged(unit.achievement, "achievement")
    ];
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

  function makeStateKey(sectionIndex, lineIndex, gapIndex, lineId = "", gapId = "", answerOccurrence = 0, sourceGroup = "") {
    const unit = getCurrentUnit();
    const intrinsicGroup = sourceGroup || getCurrentGroup();

    if (lineId && gapId) {
      return [unit.subject, unit.area, intrinsicGroup, getCurrentDifficulty(), lineId, gapId, answerOccurrence].join("|");
    }

    return [unit.subject, unit.area, intrinsicGroup, getCurrentDifficulty(), sectionIndex, lineIndex, gapIndex].join("|");
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

  function configuredGapEntries(line, difficulty) {
    if (difficulty === "yaho") {
      const sentences = splitSentenceUnits(line.text).sentences;
      const ids = line.gapIds?.yaho || [];
      return sentences.map((answer, index) => ({
        answer,
        gapId: ids[index] || `y${String(index + 1).padStart(2, "0")}`
      }));
    }

    const configured = difficulty === "easy" ? (line.easy || []) : (line.normal || []);
    const ids = line.gapIds?.[difficulty] || [];
    const seen = new Set();
    const entries = [];

    configured.forEach((answer, index) => {
      if (!answer || !line.text.includes(answer)) return;
      const key = normalize(answer);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({
        answer,
        gapId: ids[index] || `legacy-${stableHash(`${difficulty}|${index}`)}`
      });
    });

    return entries;
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

  function createGapInput(spec, sectionIndex, lineIndex, gapIndex, lineId = "", answerOccurrence = 0, sourceGroup = "", sectionTitle = "") {
    const wrap = document.createElement("span");
    wrap.className = "gap-wrap" + (spec.sentence ? " sentence-gap-wrap" : "");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "gap-input" + (spec.sentence ? " sentence-gap" : "");
    input.dataset.answer = spec.answer;
    input.dataset.gapId = spec.gapId || `legacy-${gapIndex}`;
    input.dataset.aliases = JSON.stringify(spec.aliases || []);
    input.dataset.stateKey = makeStateKey(sectionIndex, lineIndex, gapIndex, lineId, input.dataset.gapId, answerOccurrence, sourceGroup);
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
    input.setAttribute("aria-label", `${sectionTitle || "학습"} · ${lineIndex + 1}번째 문장 · ${gapIndex + 1}번째 빈칸`);
    if (!spec.sentence) {
      input.style.width = Math.max(82, Math.min(260, spec.answer.length * 17 + 28)) + "px";
    }

    const saved = fieldState[input.dataset.stateKey];
    if (saved) {
      input.value = saved.value || "";
      if (saved.status === "correct") input.classList.add("correct");
      if (saved.status === "wrong") input.classList.add("wrong");
    }

    const selectFilledGapText = () => {
      if (!input.value) return;
      requestAnimationFrame(() => {
        if (document.activeElement !== input || !input.value) return;
        try {
          input.setSelectionRange(0, input.value.length);
        } catch {
          input.select?.();
        }
      });
    };

    input.addEventListener("focus", () => {
      lastStudyFocus = { sectionIndex, lineIndex };
      // Tab, 오답 재진입, 프로그램 이동 모두 기존 답안을 즉시 덮어쓸 수 있게 전체 선택한다.
      selectFilledGapText();
    });

    input.addEventListener("click", () => {
      // 이미 포커스된 입력칸을 다시 클릭한 경우에도 커서 한 점이 아니라 기존 답 전체를 선택한다.
      selectFilledGapText();
    });

    input.addEventListener("input", () => {
      const state = fieldState[input.dataset.stateKey] || {};
      state.value = input.value;
      if (state.status) delete state.status;
      fieldState[input.dataset.stateKey] = state;
      input.classList.remove("correct","wrong");
      const result = wrap.querySelector(".gap-result");
      if (result) result.remove();
      input.removeAttribute("aria-describedby");
      input.removeAttribute("aria-invalid");
      updateScore();
    });

    const gradeAndAdvance = () => {
      gradeOne(input); // 빈 입력도 오답으로 처리한다.
      if (reviewActive) return;
      requestAnimationFrame(() => advanceAfterGrade(input));
    };

    input.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.keyCode === 13) {
        event.preventDefault();
        gradeAndAdvance();
      }
    });

    wrap.appendChild(input);
    if (saved?.status) appendResult(wrap, saved.status, spec.answer);
    return wrap;
  }

  function renderLine(line, sectionIndex, lineIndex, sectionTitle = "", sourceGroup = "") {
    const p = document.createElement("div");
    p.className = "line-item";
    const difficulty = getCurrentDifficulty();
    const specs = buildGapSpecs(line, difficulty);
    const lineId = makeLineStableId(sectionTitle, line.text, line.id || "");

    if (difficulty === "yaho") {
      p.innerHTML = "";
      const sentenceUnits = splitSentenceUnits(line.text);
      if (sentenceUnits.prefix) p.appendChild(document.createTextNode(sentenceUnits.prefix));
      specs.forEach((spec, index) => {
        if (index > 0) p.appendChild(document.createTextNode(" "));
        p.appendChild(createGapInput(spec, sectionIndex, lineIndex, index, lineId, index, sourceGroup, sectionTitle));
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
        sectionTitle
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

    document.getElementById("studyStatus").textContent = quizMode
      ? (window.matchMedia("(max-width: 720px)").matches
          ? "다음: 채점 후 이동(빈칸도 오답)"
          : "Enter: 채점 후 이동(빈칸도 오답)")
      : "";

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
        const range = subject === "middle-info" ? middleInfoSourceRanges[area] : "";
        const meta = subjectSourceMeta[subject];
        const sourceParts = ["공식 출처", meta?.book, range].filter(Boolean);
        sourceButton.textContent = sourceParts.join(" · ");
        sourceButton.href = meta?.url || "#";
        sourceButton.title = meta?.label || "공식 교육과정 출처";
        sourceButton.setAttribute("aria-label", `${subjectLabel}${area ? " · " + area : ""} 공식 교육과정 출처 새 탭에서 열기. ${meta?.label || ""}`.trim());
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
        if (quizMode) {
          td.appendChild(renderLine(line, sectionIndex, lineIndex, section.title, section._sourceGroup || group));
        } else {
          const p = document.createElement("div");
          p.className = "line-item";
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
  }

  function difficultyLabel(value) {
    return ({ easy: "핵심", normal: "정밀", yaho: "야~호!" })[value] || (value === "hard" ? "정밀" : value);
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

  let learningDb = null;
  let learningStorageMode = "memory";
  let learningStateMemory = {history: [], mastery: {}, updatedAt: null};
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

      const merge = (key, item) => {
        const prev = migrated[key];
        if (!prev) { migrated[key] = {...item}; return; }
        const prevSeen = Number(prev.lastSeenAt || 0), nextSeen = Number(item.lastSeenAt || 0);
        migrated[key] = {
          ...prev,
          ...(nextSeen >= prevSeen ? item : {}),
          correctCount: Math.max(Number(prev.correctCount || 0), Number(item.correctCount || 0)),
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
        merge(nextKey, item || {});
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
        ["content-system", "achievement"].forEach(sourceGroup => {
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

  function conceptKeyForGeneral(questionOrId) {
    return `general|${String(questionOrId || "")}`;
  }

  function updateMastery(conceptKey, correct, eventToken) {
    const all = loadMastery();
    const now = Date.now();
    const item = all[conceptKey] || {
      correctCount: 0,
      wrongCount: 0,
      correctStreak: 0,
      mastered: false,
      nextReviewAt: 0
    };

    // 같은 답으로 채점 버튼을 반복해서 눌러도 누적하지 않는다. 답이 바뀌면 새 시도로 인정한다.
    if (eventToken && item.lastEventToken === eventToken) return item;
    item.lastEventToken = eventToken || `${now}`;
    item.lastSeenAt = now;

    if (correct) {
      item.correctCount += 1;
      const due = !item.nextReviewAt || now >= item.nextReviewAt;
      if (due) item.correctStreak += 1;
      item.mastered = item.correctStreak >= 2;
      if (due) {
        const days = item.correctStreak >= 3 ? 7 : item.correctStreak >= 2 ? 3 : 1;
        item.nextReviewAt = now + days * 24 * 60 * 60 * 1000;
      }
      item.lastResult = "correct";
    } else {
      item.wrongCount += 1;
      item.correctStreak = 0;
      item.mastered = false;
      item.nextReviewAt = now;
      item.lastResult = "wrong";
    }

    all[conceptKey] = item;
    saveMastery(all);
    if (item.mastered) markHistoryResolved(conceptKey);
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
    const legacyLabelMap = {"쉬움":"easy", "보통":"normal", "어려움":"normal", "핵심":"easy", "정밀":"normal", "야~호!":"yaho"};
    let key = copy.difficultyKey || legacyLabelMap[copy.difficultyLabel] || "";
    if (key === "hard") key = "normal";
    if (key && ["easy","normal","yaho"].includes(key)) {
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
        difficultyKey: ["easy","normal","yaho"].includes(event.difficultyKey) ? event.difficultyKey : ""
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

      const migrated = data
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
              copy.groupLabel = meta.sourceGroup === "content-system" ? "내용 체계" : "성취기준";
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
          updatedAt: fallbackState.updatedAt || null
        };
      } else if (validLearningStateRecord(stored)) {
        learningStateMemory = {
          history: cloneJson(stored.history, []),
          mastery: cloneJson(stored.mastery, {}),
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
        learningStateMemory = {history: legacyHistory, mastery: legacyMastery, updatedAt:null};
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
      difficultyKey: ["easy","normal","yaho"].includes(entry.difficultyKey) ? entry.difficultyKey : ""
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
        attempts: 1,
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


  function retryHistoryItem(item, preserveReview = false) {
    if (!preserveReview) { reviewActive = false; activeReviewConceptKey = null; }

    if (item.type === "general") {
      const index = generalBank.findIndex(q => q.id === item.generalId || q.q === item.question || q.q === item.context);
      if (index < 0) return;

      generalShuffleState = null;
      document.getElementById("generalCategory").value = "all";
      generalIndex = index;
      showTab("general");
      renderGeneral();
      activeReviewConceptKey = item.conceptKey || (generalBank[index] ? conceptKeyForGeneral(generalBank[index].id) : null);
      requestAnimationFrame(() => document.getElementById("generalAnswer").focus());
      return;
    }

    if (item.type === "subject" && item.subjectKey && item.area) {
      showTab("subject");

      document.getElementById("subjectSelect").value = item.subjectKey;
      fillAreaSelect();
      document.getElementById("areaSelect").value = item.area;

      if (item.groupKey === "content-system" || item.groupKey === "achievement") document.getElementById("groupSelect").value = item.groupKey;
      const retryDifficulty = item.difficultyKey === "hard" ? "normal" : item.difficultyKey;
      if (["easy","normal","yaho"].includes(retryDifficulty)) document.getElementById("difficultySelect").value = retryDifficulty;

      currentAreaIndex = 0;
      currentRandomUnit = null;
      quizMode = true;

      currentAttemptId++;
      activeReviewConceptKey = item.conceptKey || null;

      renderStudy();

      requestAnimationFrame(() => {
        const inputs = [...document.querySelectorAll("#studyArea .gap-input")];

        let target = null;

        if (item.lineId && item.gapId) {
          target = inputs.find(input =>
            input.dataset.lineId === item.lineId &&
            input.dataset.gapId === item.gapId &&
            Number(input.dataset.answerOccurrence || 0) === Number(item.answerOccurrence || 0)
          );
        }

        // v6.0 이하 answer-text 기반 기록 호환
        if (!target && item.lineId && item.answerText) {
          target = inputs.find(input =>
            input.dataset.lineId === item.lineId &&
            normalize(input.dataset.answer) === normalize(item.answerText) &&
            Number(input.dataset.answerOccurrence || 0) === Number(item.answerOccurrence || 0)
          );
        }

        // 원문/수동 빈칸 문구가 크게 바뀐 경우에도 stable line ID가 같으면 같은 문장 안의 첫 빈칸으로 연결한다.
        if (!target && item.lineId) {
          target = inputs.find(input => input.dataset.lineId === item.lineId);
        }

        // v4 이전 위치 기반 오답 기록 호환
        if (!target) {
          target = inputs.find(input =>
            Number(input.dataset.sectionIndex) === Number(item.sectionIndex || 0) &&
            Number(input.dataset.lineIndex) === Number(item.lineIndex || 0)
          );
        }

        if (target) {
          delete fieldState[target.dataset.stateKey];
          target.value = "";
          target.classList.remove("correct", "wrong");
          target.focus();
        } else {
          alert("교육과정 데이터가 변경되어 기존 오답 위치를 정확히 찾지 못했습니다. 현재 단원의 첫 빈칸으로 이동합니다.");
          focusFirstEmpty();
        }
      });
    }
  }

  function startWrongReview(dueOnly = true) {
    const list = loadHistory().filter(item => !item.resolved);
    if (!list.length) { alert("복습할 미해결 오답이 없습니다."); return; }

    const mastery = loadMastery();
    const now = Date.now();
    reviewQueue = list
      .map(item => ({item, mastery: mastery[item.conceptKey] || null}))
      .filter(({mastery}) => !mastery?.mastered)
      .filter(({mastery}) => !dueOnly || !mastery?.nextReviewAt || mastery.nextReviewAt <= now)
      .sort((a,b) => {
        const aDue = !a.mastery?.nextReviewAt || a.mastery.nextReviewAt <= now ? 1 : 0;
        const bDue = !b.mastery?.nextReviewAt || b.mastery.nextReviewAt <= now ? 1 : 0;
        if (aDue !== bDue) return bDue - aDue;
        const aWrong = a.mastery?.wrongCount || a.item.attempts || 1;
        const bWrong = b.mastery?.wrongCount || b.item.attempts || 1;
        return bWrong - aWrong;
      })
      .map(x => x.item);

    if (!reviewQueue.length) { alert(dueOnly ? "오늘 복습할 오답이 없습니다." : "복습할 미해결 오답이 없습니다."); return; }
    reviewPosition = 0;
    reviewActive = true;
    openCurrentReviewItem();
  }

  function openCurrentReviewItem() {
    const item = reviewQueue[reviewPosition];
    if (!item) {
      reviewActive = false;
      activeReviewConceptKey = null;
      alert("오답 복습을 완료했습니다.");
      showTab("history");
      return;
    }
    activeReviewConceptKey = item.conceptKey || null;
    retryHistoryItem(item, true);
  }

  function advanceWrongReview() {
    if (!reviewActive) return;
    reviewPosition += 1;
    setTimeout(openCurrentReviewItem, 250);
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
    const beforeTheme = localStorage.getItem("coreloop-theme");

    try {
      if (!validLearningStateRecord(snapshot.learning)) throw new Error("복구본 학습 기록 형식이 올바르지 않습니다.");
      learningStateMemory = {
        history:cloneJson(snapshot.learning.history, []),
        mastery:cloneJson(snapshot.learning.mastery, {}),
        updatedAt:snapshot.learning.updatedAt || null
      };
      learningStateMemory.history = loadHistory();
      learningStateMemory.mastery = loadMastery();
      await persistLearningStateNow();

      if (snapshot.theme === "light" || snapshot.theme === "dark") {
        safeSetLocalStorage("coreloop-theme", snapshot.theme);
        applyTheme(snapshot.theme);
      } else {
        localStorage.removeItem("coreloop-theme");
        applyTheme(preferredTheme());
      }

      await clearPreimportSnapshot();
      renderHistory();
      await refreshUndoImportButton();
      alert("백업 가져오기 직전의 기록으로 되돌렸습니다.");
    } catch (error) {
      console.error(error);
      learningStateMemory = {
        history:cloneJson(before.history, []),
        mastery:cloneJson(before.mastery, {}),
        updatedAt:before.updatedAt || null
      };
      await persistLearningStateNow();
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
    for (const field of ["correctCount","wrongCount","correctStreak","nextReviewAt","lastSeenAt"]) {
      if (value[field] !== undefined) {
        const number = Number(value[field]);
        if (!Number.isFinite(number) || number < 0 || number > 1e15) return false;
      }
    }
    if (value.mastered !== undefined && typeof value.mastered !== "boolean") return false;
    return isSafeBackupString(value.lastResult, 20) && isSafeBackupString(value.lastEventToken, 500);
  }

  function exportStudyData() {
    const history = loadHistory();
    const mastery = loadMastery();
    const payload = {
      schemaVersion: 5,
      app: "CurriLoop",
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      counts: {history: history.length, mastery: Object.keys(mastery).length},
      history,
      mastery,
      theme: localStorage.getItem("coreloop-theme") || null
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0,10);
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
      const oldTheme = localStorage.getItem("coreloop-theme");
      let snapshotSaved = false;

      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (!isPlainRecord(data)) throw new Error("백업 최상위 형식이 올바르지 않습니다.");
        if (data.app && data.app !== "CurriLoop") throw new Error("CurriLoop 백업 파일이 아닙니다.");

        const schemaVersion = Number(data.schemaVersion || 1);
        if (!Number.isInteger(schemaVersion) || schemaVersion < 1 || schemaVersion > 5) {
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
          theme: oldTheme,
          savedAt: new Date().toISOString()
        });
        snapshotSaved = true;

        learningStateMemory = {
          history: cloneJson(data.history, []),
          mastery: cloneJson(data.mastery, {}),
          updatedAt: null
        };

        // 구형 answer 기반 concept, hard/옛 난이도, legacy line ID를 현행 stable gap ID 체계로 마이그레이션한다.
        learningStateMemory.history = loadHistory();
        learningStateMemory.mastery = loadMastery();

        if (data.theme === "light" || data.theme === "dark") {
          if (!safeSetLocalStorage("coreloop-theme", data.theme)) throw new Error("테마 설정을 저장하지 못했습니다.");
          applyTheme(data.theme);
        }

        await persistLearningStateNow();

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
          updatedAt: before.updatedAt || null
        };
        await persistLearningStateNow();
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

  async function clearHistory() {
    if (!confirm("오답과 복습 기록을 모두 지울까요?")) return;
    reviewActive = false;
    reviewQueue = [];
    reviewPosition = -1;
    activeReviewConceptKey = null;
    learningStateMemory.history = [];
    learningStateMemory.mastery = {};
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

  function renderHistory() {
    const container = document.getElementById("historyList");
    const count = document.getElementById("historyCount");
    const filter = document.getElementById("historyFilter")?.value || "active";
    const search = normalize(document.getElementById("historySearch")?.value || "");

    if (!container || !count) return;

    let list = loadHistory();
    if (filter === "active") list = list.filter(item => !item.resolved);
    else if (filter === "resolved") list = list.filter(item => item.resolved);
    else if (filter === "general" || filter === "subject") list = list.filter(item => item.type === filter);
    if (search) {
      list = list.filter(item => normalize([item.context, item.question, item.correctAnswer, item.userAnswer, item.area, item.subjectLabel].filter(Boolean).join(" ")).includes(search));
    }

    count.textContent = `${list.length}개`;
    container.innerHTML = "";

    if (!list.length) {
      container.innerHTML = `
        <div class="history-empty">
          아직 저장된 오답이 없습니다.<br>
          총론이나 각론에서 틀린 문항이 생기면 자동으로 이곳에 쌓입니다.
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const card = document.createElement("article");
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
          <button class="btn" type="button" data-history-retry="${escapeHtml(item.key)}">다시 풀기</button>
          <button class="btn" type="button" data-history-key="${escapeHtml(item.key)}">삭제</button>
        </div>
      `;

      const retryButton = card.querySelector("button[data-history-retry]");
      if (retryButton) {
        retryButton.addEventListener("click", () => retryHistoryItem(item));
      }

      card.querySelector("button[data-history-key]").addEventListener("click", () => {
        removeHistoryItem(item.key);
      });

      container.appendChild(card);
    });
  }


  // -------------------------
  // 8) 채점
  // -------------------------
  function isCorrect(input) {
    const expected = input.dataset.answer;
    const aliases = JSON.parse(input.dataset.aliases || "[]");
    const user = normalize(input.value);
    if (!user) return false;
    return [expected, ...aliases].some(a => normalize(a) === user);
  }

  function appendResult(wrap, status, answer) {
    const old = wrap.querySelector(".gap-result");
    if (old) old.remove();
    const input = wrap.querySelector(".gap-input");
    const span = document.createElement("span");
    span.className = "gap-result " + (status === "correct" ? "good" : "bad");
    span.id = `gap-result-${stableHash(input?.dataset.stateKey || `${answer}|${status}`)}`;
    span.textContent = status === "correct" ? "✓" : `✕ 정답: ${answer}`;
    wrap.appendChild(span);
    if (input) {
      input.setAttribute("aria-describedby", span.id);
      input.setAttribute("aria-invalid", status === "correct" ? "false" : "true");
    }
  }

  function gradeOne(input) {
    const normalizedValue = normalize(input.value);
    const correct = normalizedValue ? isCorrect(input) : false;
    input.classList.remove("correct","wrong");
    input.classList.add(correct ? "correct" : "wrong");

    const state = fieldState[input.dataset.stateKey] || {};
    state.value = input.value;
    state.status = correct ? "correct" : "wrong";

    const gradingSignature = `${normalizedValue || "__blank__"}|${correct ? "correct" : "wrong"}`;
    const isNewGradingEvent = state.lastCountedSignature !== gradingSignature;
    if (isNewGradingEvent) {
      state.lastCountedSignature = gradingSignature;
      sessionStats.subject[correct ? "correct" : "wrong"] += 1;
    }
    fieldState[input.dataset.stateKey] = state;

    appendResult(input.parentElement, state.status, input.dataset.answer);

    const unit = getCurrentUnit();
    const sections = getUnitData(unit.subject, unit.area, getCurrentGroup());
    const sectionIndex = Number(input.dataset.sectionIndex);
    const lineIndex = Number(input.dataset.lineIndex);
    const context = sections?.[sectionIndex]?.lines?.[lineIndex]?.text || "";
    const lineId = input.dataset.lineId || makeLineStableId(sections?.[sectionIndex]?.title || "", context, sections?.[sectionIndex]?.lines?.[lineIndex]?.id || "");
    const answerOccurrence = Number(input.dataset.answerOccurrence || 0);
    const sourceGroup = input.dataset.sourceGroup || sections?.[sectionIndex]?._sourceGroup || getCurrentGroup();
    const gapId = input.dataset.gapId || resolveGapIdForLine(sections?.[sectionIndex]?.lines?.[lineIndex], getCurrentDifficulty(), input.dataset.answer, Number(input.dataset.gapIndex || -1));
    const conceptKey = conceptKeyForSubject(unit, sourceGroup, lineId, gapId, answerOccurrence);
    const eventToken = `subject|${currentAttemptId}|${input.dataset.stateKey}|${gradingSignature}`;

    if (isNewGradingEvent) updateMastery(conceptKey, correct, eventToken);

    if (!correct) {
      addWrongHistory({
        type: "subject",
        key: conceptKey,
        conceptKey,
        subjectKey: unit.subject,
        groupKey: sourceGroup,
        sourceGroup,
        difficultyKey: getCurrentDifficulty(),
        sectionIndex,
        lineIndex,
        gapIndex: Number(input.dataset.gapIndex || 0),
        lineId,
        gapId,
        answerOccurrence,
        answerText: input.dataset.answer,
        subjectLabel: subjectLabels[unit.subject] || unit.subject,
        area: unit.area,
        groupLabel: sourceGroup === "content-system" ? "내용 체계" : "성취기준",
        difficultyLabel: difficultyLabel(getCurrentDifficulty()),
        context,
        userAnswer: input.value,
        correctAnswer: input.dataset.answer
      }, eventToken);
    }

    updateScore();

    if (correct && reviewActive && activeReviewConceptKey === conceptKey) {
      advanceWrongReview();
    }
    return correct;
  }

  function gradeAllVisible() {
    if (!quizMode) return;
    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    inputs.forEach(gradeOne); // 미입력도 오답으로 채점한다.
    const wrongCount = inputs.filter(input => fieldState[input.dataset.stateKey]?.status === "wrong").length;
    const correctCount = inputs.length - wrongCount;
    const announcer = document.getElementById("gradingAnnouncer");
    if (announcer) announcer.textContent = `전체 채점 완료. 정답 ${correctCount}개, 오답 ${wrongCount}개.`;
    const firstWrong = inputs.find(input => fieldState[input.dataset.stateKey]?.status === "wrong");
    if (firstWrong) {
      firstWrong.focus();
      firstWrong.scrollIntoView({block:"center", behavior:"smooth"});
    }
  }

  function resetVisible() {
    if (!quizMode) return;
    currentAttemptId++;
    clearCurrentUnitState();
    renderStudy();
    focusFirstEmpty();
  }

  function focusMatchingLine(snapshot) {
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

  function focusRelative(current, delta) {
    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const i = inputs.indexOf(current);
    if (i < 0) return;
    const target = inputs[i + delta];
    if (target) target.focus();
  }

  function advanceAfterGrade(current) {
    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const i = inputs.indexOf(current);

    if (i >= 0 && inputs[i + 1]) {
      const target = inputs[i + 1];
      target.focus();
      requestAnimationFrame(() => target.scrollIntoView({block:"center", behavior:"smooth"}));
      return;
    }

    if (document.getElementById("areaSelect").value === "random") {
      chooseRandomUnit();
      currentAttemptId++;
      renderStudy();
      requestAnimationFrame(() => focusFirstEmpty());
      return;
    }

    const sequence = getUnitSequence();
    if (currentAreaIndex < sequence.length - 1) {
      currentAreaIndex++;
      renderStudy();
      requestAnimationFrame(() => focusFirstEmpty());
    }
  }

  function focusFirstEmpty() {
    const inputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const target = inputs.find(i => !i.value) || inputs[0];
    if (target) target.focus();
  }

  function updateScore() {
    const unit = getCurrentUnit();
    const selectedGroup = getCurrentGroup();
    const scoreGroups = selectedGroup === "all" ? ["content-system", "achievement"] : [selectedGroup];
    const currentPrefixes = unit.subject && unit.area
      ? scoreGroups.map(group => [unit.subject, unit.area, group, getCurrentDifficulty()].join("|") + "|")
      : [];

    let currentCorrect = 0;
    let currentWrong = 0;

    Object.entries(fieldState).forEach(([key, state]) => {
      if (currentPrefixes.some(prefix => key.startsWith(prefix))) {
        if (state.status === "correct") currentCorrect++;
        if (state.status === "wrong") currentWrong++;
      }
    });

    const visibleInputs = [...document.querySelectorAll("#studyArea .gap-input")];
    const lineGroups = new Map();

    visibleInputs.forEach(input => {
      const key = input.dataset.lineKey || "line";
      if (!lineGroups.has(key)) lineGroups.set(key, []);
      lineGroups.get(key).push(input);
    });

    let completedLines = 0;
    lineGroups.forEach(inputs => {
      if (inputs.length && inputs.every(input => fieldState[input.dataset.stateKey]?.status === "correct")) {
        completedLines++;
      }
    });

    const lineText = lineGroups.size ? ` · 문장 ${completedLines}/${lineGroups.size}` : "";
    document.getElementById("scoreText").textContent =
      `현재 ${currentCorrect}✓ ${currentWrong}✕${lineText} · 세션 시도 ${sessionStats.subject.correct}✓ ${sessionStats.subject.wrong}✕`;
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
    if (el) el.textContent = `${Math.min(generalIndex + 1, list.length)} / ${list.length} · 세션 시도 ${sessionStats.general.correct}✓ ${sessionStats.general.wrong}✕`;
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
    generalAttemptId++;
    const list = filteredGeneral();
    if (!list.length) return;

    generalIndex = Math.min(generalIndex, list.length - 1);
    generalGraded = false;
    generalLastGradedValue = "";

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
  }

  function splitGeneralAnswers(raw) {
    return String(raw || "").split(/[\n,;|/]+/).map(v => v.trim()).filter(Boolean);
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
    const rawUser = forceUnknown ? "(모름)" : answerEl.value;
    const ok = forceUnknown ? false : (normalize(rawUser) ? isGeneralAnswerCorrect(q, rawUser) : false);
    const box = document.getElementById("generalResult");
    box.className = "general-result " + (ok ? "good" : "bad");
    box.innerHTML = ok
      ? `<strong>✓ 정답</strong><br><span style="color:var(--muted)">공식 정답</span><br><strong>${q.display}</strong>`
      : `<strong style="color:var(--bad)">✕ 오답</strong><br><span style="color:var(--muted)">공식 정답</span><br><strong style="color:var(--bad)">${q.display}</strong>`;
    box.classList.remove("hidden");

    const signature = `${normalize(rawUser) || "__blank__"}|${ok ? "correct" : "wrong"}`;
    const eventToken = `general|${generalAttemptId}|${q.id}|${signature}`;
    const duplicate = generalGraded && generalLastGradedValue === signature;

    generalGraded = true;
    generalLastGradedValue = signature;

    const conceptKey = conceptKeyForGeneral(q.id);
    if (!duplicate) {
      sessionStats.general[ok ? "correct" : "wrong"] += 1;
      updateMastery(conceptKey, ok, eventToken);
    }

    if (!ok) {
      addWrongHistory({
        type: "general",
        key: conceptKey,
        conceptKey,
        generalId: q.id,
        categoryLabel: generalCategoryLabels[q.category] || q.category,
        question: q.q,
        context: q.q,
        userAnswer: rawUser,
        correctAnswer: q.display
      }, eventToken);
    }

    updateGeneralProgress();
    if (ok && reviewActive && activeReviewConceptKey === conceptKey) advanceWrongReview();
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
  });

  generalAnswerEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const currentNormalized = normalize(generalAnswerEl.value) || "__blank__";
      const unchangedAfterGrade = generalGraded && generalLastGradedValue.startsWith(currentNormalized + "|");

      if (reviewActive) {
        gradeGeneral();
      } else if (unchangedAfterGrade) {
        nextGeneral();
      } else {
        gradeGeneral();
      }
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
    const result = {subjects:0, areas:0, lines:0, duplicateLineIds:[], configuredTermsMissing:[], missingExplicitIds:[]};
    const seen = new Set();
    result.subjects = Object.keys(curriculumData).length;
    Object.entries(curriculumData).forEach(([subjectKey, subject]) => {
      Object.entries(subject).forEach(([areaName, area]) => {
        result.areas++;
        ["content-system", "achievement"].forEach(group => {
          (area[group] || []).forEach(section => (section.lines || []).forEach(line => {
            result.lines++;
            const id = line.id || "";
            if (!id) result.missingExplicitIds.push({subjectKey,areaName,group,text:line.text});
            const fullId = `${subjectKey}|${areaName}|${group}|${id}`;
            if (seen.has(fullId)) result.duplicateLineIds.push(fullId); else seen.add(fullId);
            ["easy", "normal"].forEach(level => (line[level] || []).forEach(term => {
              if (term && !line.text.includes(term)) result.configuredTermsMissing.push({subjectKey,areaName,group,level,term,text:line.text});
            }));
          }));
        });
      });
    });
    if (result.duplicateLineIds.length || result.configuredTermsMissing.length || result.missingExplicitIds.length) console.warn("CurriLoop 데이터 감사", result);
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
    fillAreaSelect();
    setupAccessibleTabs();
    window.CurriLoopAudit = runDataAudit();
    quizMode = false;
    renderStudy();
    renderGeneral();
    renderHistory();
    await refreshUndoImportButton();
    const requestedTab = new URLSearchParams(location.search).get("tab");
    if (["general","subject","history"].includes(requestedTab)) showTab(requestedTab);

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

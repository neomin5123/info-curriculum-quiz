(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CURRILOOP_EXAM_RECALL_PROFILES = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  // CurriLoop 실전 프로필의 목적은 "많이 가리기"가 아니다.
  // 실제 임용에서 수험생이 생산해야 했던 답안 단위(production)를 최우선으로 삼고,
  // 제시문으로 보인 표현(cue)이나 분류·판별만 요구한 표현(recognition)은 중요도만 올린다.
  // 직접 생산 근거가 없는 문장은 1개 → 2개 조합을 기본 안전마진으로 사용한다.
  const pilotSubjects = Object.freeze(['middle-info', 'high-info']);

  const familyProfiles = Object.freeze({
    'core-idea': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 핵심 아이디어: 1개 회상 후 2개 조합까지만'}),
    'value-attitude': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 가치·태도: 핵심 방향 1개 후 2개 조합까지만'}),
    'content-element': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 내용 요소: 단일 원자부터 시작해 2개 조합까지만'}),
    'achievement-standard': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 성취기준: 단일 원자 후 2개 조합까지만'}),
    'achievement-commentary': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 해설: 답안 가치가 큰 원자 1개 후 2개 조합까지만'}),
    'achievement-consideration': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 고려사항: 조건/주의점 1개 후 2개 조합까지만'}),
    'teaching-evaluation': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 교수·학습/평가: 핵심 원칙 1개 후 2개 조합까지만'}),
    'character-goal': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'기출 직접 근거가 없는 성격·목표: 핵심 방향 1개 후 2개 조합까지만'}),
    'general': Object.freeze({observedMaxUnits:1, trainingMaxUnits:2, demandKind:'pattern', evidence:'교육과정 원문 일반 fallback: 1개 → 2개'})
  });

  // demandKind
  // - production : 실제 시험에서 해당 교육과정 용어/내용을 답으로 생산해야 했음. pinnedAnswers가 실제 인출 핵심.
  // - constructed: 교육과정 근거로 이유/설명을 구성해야 했음. 정확 빈칸 수를 부풀리지 않고 priorityAnswers만 우선.
  // - recognition : 학교급/범주/영역 등 분류·판별에 사용된 원문. 중요도는 올리되 동시 빈칸 수 근거로 사용하지 않음.
  // - cue         : 시험지에 원문이 제시된 단서. 중요하지만 "시험에서 외워 썼다"고 간주하지 않음.
  // observedMaxUnits는 production에서 실제로 동시에 생산한 atomic unit 수를 뜻한다.
  const lineProfiles = Object.freeze({
    // 2024 A Q1: 교과 역량 2개 생산. 동일 문구가 중·고 평가 공통부에 존재하므로 두 과목 모두 훈련 근거로 사용.
    'MI-TE-EVD-01': Object.freeze({demandKind:'production', observedMaxUnits:2, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['디지털 문화 소양','인공지능 소양']), evidence:'2024 A Q1 · 교과 역량 디지털 문화 소양/인공지능 소양 생산'}),
    'HI-TE-EVD-01': Object.freeze({demandKind:'production', observedMaxUnits:2, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['디지털 문화 소양','인공지능 소양']), evidence:'2024 A Q1 · 교과 역량 디지털 문화 소양/인공지능 소양 생산'}),

    // 2024 A Q5: 실제 빈칸 2개는 서로 다른 line에서 각각 1개씩.
    'MI-03-CS-KI-02': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['자동화']), evidence:'2024 A Q5 · 핵심 아이디어 자동화 생산'}),
    'MI-03-CS-VA-01': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['추상화']), evidence:'2024 A Q5 · 가치·태도 추상화 생산'}),

    // 2024 A Q7: 원문을 보고 중학교 지식·이해/과정·기능을 분류. 원문 자체를 빈칸으로 생산한 문제는 아님.
    'MI-02-CS-KN-01': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['디지털 데이터','표현 방법']), evidence:'2024 A Q7 · 중학교 데이터 지식·이해 내용 요소 분류'}),
    'MI-02-CS-PF-01': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['디지털 데이터','표현하기']), evidence:'2024 A Q7 · 중학교 데이터 과정·기능 내용 요소 분류'}),
    'HI-02-CS-PF-01': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['압축','효율성','평가']), evidence:'2024 A Q7 · 고등 데이터 과정·기능이 비교 제시됨'}),
    'HI-02-CS-VA-01': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['긍정적 측면']), evidence:'2024 A Q7 · 고등 데이터 가치·태도가 비교 제시됨'}),

    // 2024 B Q3: 아래 표현들은 시험지에 그대로 제시된 ASSURE 분석 단서였다. 답으로 3개/2개를 외워 쓴 것이 아님.
    'MI-03-AC-CO-01': Object.freeze({demandKind:'cue', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['문제 발견','상태 정의','핵심요소 추출']), evidence:'2024 B Q3/2026 A Q9 · 추상화 단계가 제시문 단서로 사용됨'}),
    'MI-03-AC-CO-02': Object.freeze({demandKind:'cue', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['학생의 수준','적합한 프로그래밍 언어']), evidence:'2024 B Q3 · 학생 수준→언어 선정 문구가 ASSURE 단서로 제시됨'}),
    'MI-TE-DIR-05': Object.freeze({demandKind:'cue', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['학생의 디지털 역량 수준','추가적인 교육 기회']), evidence:'2024 B Q3/2026 A Q9 · 학습자 디지털 역량 분석 문구가 제시됨'}),

    // 2024 B Q4: [12정03-06]에서 실제 빈칸은 "구조" 1개.
    'HI-03-AC-ST-06': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['구조']), evidence:'2024 B Q4 · [12정03-06] 다차원 데이터 구조의 구조 생산'}),

    // 2025 A Q6: 2022 중학교 알고리즘·프로그래밍 내용 요소는 학교급 식별용으로 제시됨.
    'MI-03-CS-KN-01': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, evidence:'2025 A Q6 · 2022 중학교 알고리즘·프로그래밍 내용 요소 학교급 식별'}),
    'MI-03-CS-KN-02': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, evidence:'2025 A Q6 · 2022 중학교 알고리즘·프로그래밍 내용 요소 학교급 식별'}),
    'MI-03-CS-KN-03': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['순차적인 데이터 저장']), evidence:'2025 A Q6 · 2022 중학교 순차적 데이터 저장 내용 요소 식별'}),
    'MI-03-CS-KN-04': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, evidence:'2025 A Q6 · 2022 중학교 논리 연산 내용 요소 식별'}),
    'MI-03-CS-KN-05': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, evidence:'2025 A Q6 · 2022 중학교 중첩 제어 구조 내용 요소 식별'}),
    'MI-03-CS-KN-06': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, evidence:'2025 A Q6 · 2022 중학교 함수와 디버깅 내용 요소 식별'}),
    'MI-03-AC-EX-03': Object.freeze({demandKind:'constructed', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['배열','리스트','순차적으로','저장할 수 있는 구조']), evidence:'2025 A Q6 · 2022 성취기준 해설을 근거로 학교급 변화 이유 서술'}),

    // 2025 A Q7: 중학교 데이터 과정·기능을 과목명 식별에 사용.
    'MI-02-CS-PF-02': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['수집','분류','저장']), evidence:'2025 A Q7 · 중학교 정보 데이터 과정·기능 과목 식별'}),
    'MI-02-CS-PF-03': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['구조화','의미 해석']), evidence:'2025 A Q7 · 중학교 정보 데이터 과정·기능 과목 식별'}),

    // 2025 B Q5: 실제 정답은 중학교 공통 평가의 방향 "평가 루브릭".
    'MI-TE-EVD-03': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['평가 루브릭']), evidence:'2025 B Q5 · 중학교 평가의 방향 평가 루브릭 생산'}),

    // 2026 A Q1: 서로 다른 지식·이해 line에서 각각 1개 생산.
    'MI-05-CS-KN-02': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['디지털 윤리']), evidence:'2026 A Q1 · 중학교 디지털 문화 디지털 윤리 생산'}),
    'MI-05-CS-KN-03': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['저작권']), evidence:'2026 A Q1 · 중학교 디지털 문화 저작권 생산'}),

    // 2026 A Q5: 정렬 성취기준은 제시되었고, 평가 방법의 이유를 교육과정에 근거해 구성.
    'HI-03-AC-ST-02': Object.freeze({demandKind:'cue', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['정렬','효율']), evidence:'2026 A Q5 · [12정03-02] 성취기준이 제시문으로 사용됨'}),
    'HI-TE-EVM-05': Object.freeze({demandKind:'constructed', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['학습 부진, 느린 학습자','최소 성취수준','난이도에 따른 평가기준을 세분화']), evidence:'2026 A Q5 · 평가기준 세분화 이유를 평가 방법에 근거해 서술'}),

    // 2026 A Q7: 내용 요소 1개, 성취기준 빈칸 1개, 수행평가 방법 2개 생산.
    // 짧은 지식·이해 내용 요소는 정확 암기 대상이므로 실제 문구를 3개 atomic 단위로 분해해 끝까지 회수한다.
    'HI-01-CS-KN-02': Object.freeze({demandKind:'production', observedMaxUnits:3, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['사물인터넷 시스템','구성','동작 원리']), evidence:'2026 A Q7 · 지식·이해 내용 요소 사물인터넷 시스템의 구성 및 동작 원리 생산'}),
    'HI-01-AC-ST-03': Object.freeze({demandKind:'production', observedMaxUnits:1, trainingMaxUnits:2, pinnedAnswers:Object.freeze(['피지컬 컴퓨팅']), evidence:'2026 A Q7 · [12정01-03] 피지컬 컴퓨팅 생산'}),
    'HI-TE-EVM-03': Object.freeze({demandKind:'production', observedMaxUnits:2, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['보고서','포트폴리오']), evidence:'2026 A Q7 · 수행평가 방법 보고서/포트폴리오 생산'}),

    // 2026 A Q9: 공통 교수·학습/평가 문구의 옳고 그름을 판별. 디지털 문화 소양은 MI-TE-EVD-01 production 근거와 합쳐짐.
    'MI-TE-MET-05': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['개인차를 고려한 소집단']), evidence:'2026 A Q9 · 개인차 고려 소집단 문구 판별'}),
    'MI-TE-EVM-03': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['정량적 평가','정성적 평가']), evidence:'2026 A Q9 · 정량/정성 평가 문구 판별'}),

    // 2026 B Q1: 목표 원문을 학교급에 맞게 판별하고 영역을 쓰는 문제. 원문 자체를 빈칸으로 생산한 것은 아님.
    'HI-CG-GOAL-01': Object.freeze({demandKind:'recognition', observedMaxUnits:1, trainingMaxUnits:2, priorityAnswers:Object.freeze(['연결 원리','시스템 제어']), evidence:'2026 B Q1 · 고등학교 정보 목표를 학교급에 맞게 판별하고 컴퓨팅 시스템 영역 식별'}),

    // 2026 B Q9: 압축·암호화를 핵심 아이디어와 지식·이해에 실제로 생산하고, 고려사항에도 같은 빈칸이 반복됨.
    'HI-02-CS-KI-01': Object.freeze({demandKind:'production', observedMaxUnits:2, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['압축','암호화']), evidence:'2026 B Q9 · 데이터 핵심 아이디어 압축/암호화 생산'}),
    'HI-02-CS-KN-01': Object.freeze({demandKind:'production', observedMaxUnits:2, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['압축','암호화']), evidence:'2026 B Q9 · 지식·이해 디지털 데이터 압축/암호화 생산'}),
    'HI-02-AC-CO-01': Object.freeze({demandKind:'production', observedMaxUnits:2, trainingMaxUnits:3, pinnedAnswers:Object.freeze(['압축','암호화']), priorityAnswers:Object.freeze(['알고리즘과 프로그래밍']), evidence:'2026 B Q9 · 고려사항에서 압축/암호화 동일 빈칸 반복'}),
  });

  function familyKey(sectionTitle = '', sourceGroup = '') {
    const title = String(sectionTitle || '');
    const group = String(sourceGroup || '');
    if (title.includes('핵심 아이디어')) return 'core-idea';
    if (title.includes('가치·태도') || title.includes('가치⋅태도')) return 'value-attitude';
    if (title.includes('지식·이해') || title.includes('지식⋅이해') || title.includes('과정·기능') || title.includes('과정⋅기능')) return 'content-element';
    if (title.includes('성취기준 적용 시 고려')) return 'achievement-consideration';
    if (title.includes('성취기준 해설')) return 'achievement-commentary';
    if (title === '성취기준' || (group === 'achievement' && /성취기준$/.test(title))) return 'achievement-standard';
    if (group === 'teaching-evaluation') return 'teaching-evaluation';
    if (group === 'character-goal') return 'character-goal';
    return 'general';
  }

  function getProfile({subjectKey = '', lineId = '', sectionTitle = '', sourceGroup = ''} = {}) {
    if (!pilotSubjects.includes(String(subjectKey || ''))) return null;
    const family = familyKey(sectionTitle, sourceGroup);
    const base = familyProfiles[family] || familyProfiles.general;
    const direct = lineProfiles[String(lineId || '')];
    const demandKind = direct?.demandKind || base.demandKind || 'pattern';
    const observedMaxUnits = Math.max(1, Number(direct?.observedMaxUnits || base.observedMaxUnits || 1));
    const trainingMaxUnits = Math.max(observedMaxUnits, Number(direct?.trainingMaxUnits || base.trainingMaxUnits || observedMaxUnits));
    return Object.freeze({
      family,
      demandKind,
      observedMaxUnits,
      trainingMaxUnits,
      pinnedAnswers: Object.freeze([...(direct?.pinnedAnswers || [])]),
      priorityAnswers: Object.freeze([...(direct?.priorityAnswers || [])]),
      evidence: direct?.evidence || base.evidence,
      directExam: Boolean(direct),
      productionEvidence: demandKind === 'production'
    });
  }

  return Object.freeze({pilotSubjects, familyProfiles, lineProfiles, familyKey, getProfile});
});

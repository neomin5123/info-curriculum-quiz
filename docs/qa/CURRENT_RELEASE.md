# CurriLoop v7.7.0 — Study Freeze QA

## Release state

- 2022 curriculum memorization corpus: 6 subjects / 33 areas / 662 lines / 6,245 gaps
- production questions: 31
  - 4-point: 24
  - 2-point: 7
- atomic scoring units: 110 × 1 point
- 2015↔2022 transition mappings: 20
- middle-school Informatics pilot areas: 5
- exact-recall sections: 15
  - 지식·이해 5
  - 과정·기능 5
  - 성취기준 5
- exact-recall official lines: 59
- middle-school Informatics achievement standards: 25

## v7.7.0 release boundary

`오늘` 플래너의 **자동 범위 확장은 중학교 정보에만 적용**한다. 고등 정보·선택 과목의 각론 내부 학습 동작은 기존 방식으로 유지하되, 새 암기 체계가 적용되기 전까지 자동 플래너가 해당 과목의 `핵심 → 정확화` 빈칸 루틴을 시작하지 않는다. 중등 정보 완료 후에는 자동 새 진도를 종료하고 장기 복습·누적 혼합만 계속한다.

홈의 진행률은 `중등 정보 자동 첫 회독`으로 표시하여 6과목 전체 첫 회독과 혼동하지 않게 한다. 이전 버전에서 중등 정보 밖의 자동 active session이 이미 열려 있었다면 작성 중 session payload를 별도 로컬 백업 키에 보존한 뒤 자동 플래너에서는 중단한다.

v7.6.5의 실제 학습일 6일 + 다음 학습일 누적 정리, v7.6.4의 학습량 점수, v7.6.3의 미완료 세션 복원, v7.6.2의 복습 이중 실패 다음 날 이월, v7.6.1의 인출 게이트·backlog 감속은 유지한다. 교육과정 원문과 production 문제은행은 수정하지 않는다.

중학교 정보 학습 방식:

1. 원문 보기
2. 마스킹
3. 따라치기
4. 빈칸 채우기
   - 핵심
   - 실전
5. 구조 연습

`실전`은 랜덤 빈칸 증가가 아니라 최소 단서의 통회상이다.

- 지식·이해: 항목 개수와 슬롯을 숨긴 단일 입력창에서 목록 전체 자유회상
- 과정·기능: 항목 개수와 슬롯을 숨긴 단일 입력창에서 목록 전체 자유회상
- 성취기준: 성취기준 코드만 보고 문장 전체 회상



## Daily planner checks

- 앱 기본 진입 탭은 `오늘`이며 URL `?tab=`이 명시된 경우만 다른 탭으로 바로 연다.
- 자동 플래너 section index는 중학교 정보 공식 corpus에서만 파생한다. 나머지 5과목은 각론 수동 학습 대상으로 남기며 공식 텍스트를 변경하지 않는다.
- 기본 새 학습량 목표 18점, 자동 범위 8~22점. 미완료 active session은 다음 날짜에도 유지한다.
- 목표량은 완료까지 걸린 날짜와 첫 인출 정확도를 함께 반영한다. 1일 완료라도 70% 미만이면 감속하고, 85% 이상 정확한 1일 완료가 3회 누적되어야 +1한다. 2~3일 이상 걸리더라도 85% 이상이면 감속 폭을 완화한다.
- 정확도는 첫 시도만 기록한다. 같은 항목의 재시도 성공으로 최초 실패를 덮어쓰지 않는다. 중등 정보 종합 정확도는 통회상 55%, 핵심 빈칸 35%, 구조 연결 10%이며 존재하는 유형끼리 가중치를 재정규화한다.
- 평가 근거가 3개 미만인 세션은 증량 근거로 사용하지 않는다.
- 누적 정리는 달력 7일이 아니라 실제 인출·복습이 기록된 일반 학습일 6일을 누적한 뒤 다음 실제 학습일에 발동한다. 여섯 번째 학습일 당일은 정상 학습일이며, 휴식일은 카운트하지 않는다. 정리일에는 active session도 하루 보류한다.
- 오늘 복습 예산은 느린 학습자도 최소 20개를 유지한다. backlog가 예산을 넘으면 새 원문을 먼저 75%→50%로 줄이고, 2배를 넘으면 회복일로 전환한다.
- 중학교 정보 정확 암기 section은 장기 개별 gap 복습 대신 recall-section을 사용한다.
- 동일 원문의 복수 gap은 장기 일정에서 line 단위로 집계한다. 오늘 정확 인출로 미래 일정까지 전진한 문장은 아침에 생성된 복습 계획에 남아 있더라도 같은 날 장기 복습에서 다시 제시하지 않는다.
- planner state는 backup schema 10에서 export/import/undo 대상이다.

## Completion / long-term retrieval checks

- planner의 핵심/실전 단계는 화면에 제시된 인출 대상을 실제로 채점하기 전에는 다음 단계로 넘어갈 수 없다.
- 틀린 핵심·실전 항목의 당일 지연 재인출이 남아 있으면 이를 먼저 처리해야 한다. 단, 같은 항목을 두 번 다시 실패하면 무한 반복하지 않고 다음 날 장기 복습으로 이월한다.
- planner session에는 최소 1개 이상의 실제 인출 평가 근거가 있어야 완료할 수 있다.
- 중학교 정보 영역의 마지막 분할 session에서는 구조 연결 세트를 끝내야 완료할 수 있다.
- 완료된 항목의 mastery/recall-section 기록은 유지되며 다음 due 날짜에 다시 장기 인출한다.
- 정확 통회상은 최초 성공 후 1일→3일→7일 재성공을 거쳐서만 숙달로 올라간다.

## Cumulative-review checks

- 정리일 누적 혼합은 당일 이미 성공한 항목과 오늘 예정 복습에 포함된 항목을 중복 선택하지 않는다.
- 최소 하루 이상 지난 학습 기록만 후보로 사용한다.
- 오래 안 본 정도와 wrong/unknown/near 이력을 우선하되 동일 영역 독점을 피하도록 다양성 패널티를 적용한다.
- 누적 혼합은 예정 복습과 같은 복습 UI에서 수행하지만 홈에서는 별도 개수로 표시한다.

## Structure-practice checks

- 문장 형태만 보고 맞힐 수 있는 `내용체계 범주 구별` 문제는 사용하지 않는다.
- 구조 연습은 `성취기준 ↔ 내용 요소`와 `성취기준 해설 ↔ 성취기준` 두 연결 유형만 사용한다.
- 성취기준↔내용 요소 연결은 직접 연결이 명확한 경우만 curated metadata로 지정하고, 한 성취기준에 연결되는 지식·이해/과정·기능/가치·태도 요소를 복수 선택으로 채점한다.
- 성취기준 코드는 문제 본문에서 숨기고 채점 후에만 공개한다.
- 영역별 세트는 4~6문항이며 세트 내 문항 ID 중복을 허용하지 않는다.
- 5개 중등 정보 각론 영역의 매 세트에 내용 요소 연결과 해설 연결을 모두 포함한다.
- 구조 연습은 숙달 판정용 통회상과 별도이며 production 기출형 문제은행을 증가시키지 않는다.

## Core-blank delayed retrieval checks

- 중학교 정보 `핵심` 빈칸의 틀림/모름/유사 답안은 같은 날 지연 재인출 큐에 들어간다.
- 재출제는 즉시 반복하지 않고 2~4개 다른 핵심 빈칸 뒤에 이루어진다.
- 최초 오답 뒤에는 정답을 보여준 뒤 다음 항목으로 이동한다.
- 핵심 빈칸 진행 serial은 실전 지연 재인출 serial과 분리한다.
- 당일 보수 성공은 해당 항목을 회복시키되 장기 복습 일정은 계속 유지한다.

## UI hierarchy checks

- 중등 정보에서는 `difficultyField` 드롭다운을 숨기고 `핵심 / 실전` 세그먼트 토글을 사용한다.
- 세그먼트 토글은 `빈칸 채우기` 모드에서만 표시한다.
- 상단 선택 설정, 학습 방식, 진행/채점/도구는 서로 다른 시각 구획으로 분리한다.
- 다른 과목은 기존 난이도 드롭다운을 유지한다.

## Recall grading checks

- 지식·이해/과정·기능은 채점 전 항목 수를 노출하지 않는다.
- 자유회상 답안은 줄바꿈 단위로 파싱한 뒤 공식 항목별로 독립 진단한다.
- 목록 항목의 내용 정확도와 공식 순서를 분리해 판정한다.
- 모든 항목이 맞아도 순서가 이동하면 장기 숙달 성공으로 처리하지 않는다.
- 누락·오답·유사 답안은 공식 항목별로 표시한다.
- 같은 날 보수는 틀린 개별 항목만 몇 문항 뒤 다시 묻는다.
- 장기 복습은 개별 항목이 아니라 전체 `recall-section`을 다시 묻는다.
- 같은 날 반복 성공은 장기 `correctStreak`를 올리지 않는다.
- 통회상 상태는 `학습됨(streak=1) → 안정화 중(streak=2~3) → 숙달(streak>=4)`로 구분한다.
- `숙달`은 1일→3일→7일 간격을 거친 뒤 다시 정확히 인출한 경우에만 인정한다.
- 기본 장기 간격 1→3→7→14→30→60일은 유지한다.
- v7.5.0에서 `streak<4`인데 `mastered=true`였던 통회상 기록은 기존 횟수/일정을 유지한 채 새 기준으로 재해석한다.
- 따라치기는 숙달 판정을 올리는 평가가 아니라 학습/친숙화 도구로 유지한다.

## Memory-tier checks

중학교 정보 파일럿 표시 기준:

- `정확 암기`: 지식·이해 / 과정·기능 / 성취기준
- `키워드 +@`: 목표 / 핵심 아이디어 / 가치·태도 / 성취기준 해설 / 성취기준 적용 시 고려사항
- `키워드`: 성격 / 교수·학습·평가 공통 원칙

이 분류는 CurriLoop의 기출 대비 학습용 메타데이터이며 교육부 공식 분류가 아니다.

## Data boundary checks

v7.4의 다음 데이터는 바이트 단위로 변경하지 않는다.

- `data/curriculum/2022/curriculum.js`
- `data/curriculum/2015/transition-reference.js`
- `data/curriculum/mappings/2015-2022.js`
- `data/questions/production.js`
- `data/learning-aids/core-flow.js`
- `data/learning-aids/general-bank.js`

기존 EX-001~031의 production 내용도 변경하지 않는다.

## Automated QA

Release 전 다음을 모두 실행한다.

```bash
node tests/engines/learning-engine.test.js
node tests/engines/planner-engine.test.js
node tests/engines/grading-engine.test.js
node tests/engines/recall-engine.test.js
node tests/engines/structure-engine.test.js
node tests/engines/support-engines.test.js
node tests/practice/practice-engine.test.js
node tests/data/static-qa.js
node tests/data/middle-info-recall-qa.js
node tests/release/current-release-qa.js
node tests/simulation/planner-pace-simulation.js
```

추가 검증:

- 모든 JS 파일 `node --check`
- HTML의 로컬 script/link 경로 존재 확인
- service worker precache 경로 존재 확인
- v7.4 기준 production/curriculum/transition 데이터 무변경 비교

## Browser smoke note

현재 실행 컨테이너의 Chromium headless가 DBus 초기화 이후 종료되지 않아 실제 브라우저 DOM smoke는 완료하지 못했다. HTTP 정적 제공, JS syntax, 엔진/데이터/release QA, HTML/PWA 자산 경로 검사는 모두 통과했다.


## v7.7.0 final study-freeze checks
- 오늘 복습 예산 75% 처리 후 소량 잔여 복습과 새 학습 병행.
- 기본 시험일 2026-11-28 / 중등 정보 첫 회독 권장 마감 D-35 역산.
- 통회상 장기복습 첫 실패 당일 재인출, 두 번째 실패 다음 날 이월.
- 홈의 카드별 시작 버튼 제거, `오늘 학습 시작` 단일 주 행동.

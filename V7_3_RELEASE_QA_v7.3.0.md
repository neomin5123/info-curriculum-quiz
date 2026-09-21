# CurriLoop v7.3.0 — Cross-course Process/Function Gap QA

## 1. Release scope

v7.2.0 production 29문항을 유지하고 신규 1문항(EX-030)만 추가했다. 이번 추가는 단순 영역 균형이 아니라 `기출에는 있으나 현재 production에 유사 구조가 없는가`를 우선 기준으로 삼았다.

## 2. Historical-gap rationale

2025학년도 전공A 7번은 2022 개정 정보과 교육과정에서 여러 학교급·선택 과목의 **과정·기능 문장을 제시하고, 그 문장이 어느 과목에 속하는지 식별**하게 한다. 기존 v7.2 production에는 특정 과목 안에서 내용 체계·성취기준·수업·평가를 연결하는 문항은 있었으나, 서로 다른 선택 과목의 과정·기능을 나란히 읽고 과목을 판별하는 구조는 없었다.

다만 과거 PB-039처럼 `과목 이름 맞히기`만 하는 문제는 실전성이 낮다고 판단했으므로, EX-030은 동일한 기출 구조를 다음처럼 강화했다.

- 과정·기능으로 `소프트웨어와 생활`과 `데이터 과학` 식별: 2점
- 제시된 실제 데이터 규칙으로 결측치 평균 대체: 1점
- 동일 검증 자료의 RMSE 비교로 모델 선택: 1점

즉 `교육과정 분류 2점 + 실제 데이터 처리 2점` 구조다.

## 3. EX-030 scoring

| Unit | 정답 | 점수 |
|---|---|---:|
| 과목 A | 소프트웨어와 생활 | 1 |
| 과목 B | 데이터 과학 | 1 |
| 화요일 기온 결측치 | 21℃ | 1 |
| 더 작은 RMSE 모델 | N | 1 |

모든 answerUnit은 정확히 1점이며, 한 1점 task가 복수의 독립 답을 요구하지 않는다.

## 4. Official source traceability

EX-030 sourceIds:

- `SL-03-CS-PF-02` — 데이터 처리하고 관리하기
- `SL-03-CS-PF-03` — 데이터를 분석하여 의미 파악하기
- `DS-02-CS-PF-02` — 이상치와 결측치 처리하고 정규화 활용하기
- `DS-02-CS-PF-03` — 데이터 속성 간의 관계를 파악하고 통합하여 탐색하기
- `DS-02-CS-PF-04` — 서로 다른 데이터 분석 방법 비교하기

모든 sourceId는 현재 2022 공식 교육과정 corpus에 존재함을 자동 검사했다.

## 5. Automated QA

통과:

- `node tests/v730-exam-paper-qa.js`
  - 30문항
  - 4점형 23 / 2점형 7
  - 1점 answerUnit 106개
  - sourceId 실재
  - task/unit 배점 일치
  - 공식 정답 만점
  - 다중 unit 부분점수 격리
  - 1점 원자성
  - 20점 실전세트 1,000회 생성
  - EX-030 historicalEvidence 및 canonical answer 검증
- `node tests/static-qa.js`
- `node tests/practice-engine.test.js`
- `node tests/grading-engine.test.js`
- `node tests/learning-engine.test.js`
- `node tests/support-engines.test.js`
- `node tests/v693-feature-qa.js`

기존 공식 교육과정 corpus는 6과목 / 33영역 / 662문장 / 6,245 gaps, invalid 0, duplicate IDs 0을 유지한다.

## 6. Historical near-copy check

EX-030의 stem + 작성 방법을 2014 및 2016~2026 A/B PDF 텍스트와 정규화 후 비교했다.

- 10-token exact contiguous match: 0 files
- 8-token exact contiguous match: 0 files

따라서 2025 A 7번의 **자료 역할과 요구 사고 구조**를 참고했지만, 문장·수치·상황을 직접 복제하지 않았다.

## 7. Release state

- production: **30문항 = 4점형 23 + 2점형 7**
- scoring units: **106 × 1점**
- rules: PRACTICE_RULES v1.6 유지
- app version: **7.3.0**
- next highest-priority uncovered family: `2015↔2022 개정 교육과정 비교` 계열. 다만 2015 공식 원문 source 연결을 먼저 확정한 뒤 production에 넣는 편이 안전하다.

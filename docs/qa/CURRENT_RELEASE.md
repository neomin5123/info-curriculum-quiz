# CurriLoop v7.5.1 — Middle Info Free Recall Pilot QA

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

## v7.5.1 pilot boundary

새 학습 체계는 **중학교 정보 과목에만** 적용한다. 다른 과목은 v7.4의 기존 학습 동작을 유지한다.

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
node tests/engines/grading-engine.test.js
node tests/engines/recall-engine.test.js
node tests/engines/support-engines.test.js
node tests/practice/practice-engine.test.js
node tests/data/static-qa.js
node tests/data/middle-info-recall-qa.js
node tests/release/current-release-qa.js
```

추가 검증:

- 모든 JS 파일 `node --check`
- HTML의 로컬 script/link 경로 존재 확인
- service worker precache 경로 존재 확인
- v7.4 기준 production/curriculum/transition 데이터 무변경 비교

## Browser smoke note

현재 실행 컨테이너의 Chromium headless가 DBus 초기화 이후 종료되지 않아 실제 브라우저 DOM smoke는 완료하지 못했다. HTTP 정적 제공, JS syntax, 엔진/데이터/release QA, HTML/PWA 자산 경로 검사는 모두 통과했다.

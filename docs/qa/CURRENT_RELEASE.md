# CurriLoop v7.8.1 — Six-Course Release QA

## Release state

- 2022 curriculum corpus: **6 subjects / 33 areas / 662 official lines / 6,245 gaps**
- achievement standards: **123**
  - middle-info 25
  - high-info 23
  - ai-basic 19
  - data-science 19
  - info-science 18
  - software-life 19
- planner study sections: **225**
- production questions: **31**
  - 4-point: 24
  - 2-point: 7
  - atomic scoring units: 110 × 1 point
- 2015↔2022 transition mappings: **20**

## Release boundary

`오늘` 플래너의 자동 첫 회독 범위는 2022 개정 정보과 6과목 전체다.

1. 중학교 정보
2. 고등학교 정보
3. 인공지능 기초
4. 데이터 과학
5. 정보과학
6. 소프트웨어와 생활

모든 과목은 `원문 → 핵심 빈칸 → 실전 통회상 → 당일 재인출 → 장기 복습 → 구조 연결` 원칙을 공유한다. 하루에 새로 시작하는 자동 진도 세션은 최대 1개이며, 전날 시작한 미완료 세션의 오늘 완료는 오늘의 새 세션 시작 횟수에 포함하지 않는다.

## Study-day boundary

- 공통 학습일 경계: **04:00 local time**
- 00:00~03:59는 전날 학습일로 처리한다.
- planner / review / cumulative review / daily fresh-session cap은 동일한 day engine을 사용한다.
- 테스트는 실행 환경과 관계없이 `Asia/Seoul`을 고정하여 재현한다.

## Recall architecture

6과목 공통 암기 강도:

- `정확 암기`: 지식·이해 / 과정·기능 / 성취기준
- `키워드 +@`: 목표 / 핵심 아이디어 / 가치·태도 / 성취기준 해설 / 성취기준 적용 시 고려사항
- `키워드`: 성격 / 교수·학습·평가 공통 원칙

정확 암기 section은 장기적으로 개별 gap SRS를 반복하지 않고 recall-section 단위 통회상으로 유지한다. 지식·이해/과정·기능은 항목 수를 선노출하지 않는 자유 목록 회상, 성취기준은 코드 단서의 문장 전체 회상을 사용한다.

`키워드 +@ / 키워드` section의 **핵심**은 기존 easy gap 중 답안 가치가 높은 일부만 `gap-intensity` metadata로 노출한다. 공식 문장과 6,245 gap inventory는 수정하지 않는다. **실전**은 normal gap을 더 많이 가리는 방식이 아니라 section 자유회상으로 동작한다. 성취기준 해설은 성취기준 코드별 핵심 개념·열거·비교를, 고려사항·가치태도 등은 핵심 방향과 조건을 인출한다.

빈칸 강도 QA: 가치·태도 평균 23.9%, 성취기준 해설 10.7%, 적용 시 고려 사항 12.3% 가림. 정확 암기 289문장은 기존 핵심 gap을 그대로 유지한다.

통회상 장기 실패는 첫 실패 뒤 같은 학습일에 한 번 더 지연 재인출하고, 두 번째 실패에서 다음 학습일로 이월한다. 같은 날 반복 성공은 장기 spaced streak를 올리지 않는다.

## Structure-practice boundary

- 중학교 정보: 사람이 검토한 `성취기준 ↔ 내용 요소` + 공식 코드 기반 `성취기준 해설 ↔ 성취기준`
- 고등 5과목: 공식 코드 기반 `성취기준 해설 ↔ 성취기준` + `과정·기능 → 과목` 변별
- 고등 5과목의 과정·기능 변별은 현재 화면의 과목 이름이 정답을 노출하지 않도록 5과목 전체 pool에서 섞는다.
- `과목 공통` 영역에는 구조 문제를 강제하지 않는다.
- 일반 27영역은 모두 비어 있지 않은 structure pool을 가져야 한다.

## Daily planner / D-day

- 기본 workload target: 18점
- 평상시 적응 범위: 8~22점
- 기본 시험일: **2026-11-28**
- 권장 6과목 첫 회독 마감: **D-21 = 2026-11-07**
- D-day 역산은 남은 workload뿐 아니라 영역 경계, 남은 실제 session 수, 6학습일 주기의 누적 정리일까지 고려한다.
- 홈의 예상 완료일은 기본 target이 아니라 실제 `targetFloor` 보정을 반영한다.
- 복습 부담이 큰 날에는 deadline boost보다 review recovery를 우선한다.
- 평상시에는 일일 복습 예산의 75% 이상을 처리하면 예산 25% 이하의 잔여 복습과 새 진도를 병행할 수 있다.

시뮬레이션 기준:

- 평균 조건: 2026-11-07 전후 첫 회독 완료
- 중간 복습 부하: 2026-11-08 전후
- 독립적인 하루 결석 2회: 2026-11-08 전후 회복

위 날짜는 학습 보장이 아니라 현재 planner policy의 deterministic simulation 결과다.

## Review / cumulative invariants

- 실제 일반 학습일 6일을 채운 뒤 다음 실제 학습일을 누적 정리일로 사용한다.
- 휴식일과 단순 앱 접속은 주기를 진행시키지 않는다.
- 정리일에는 새 진도보다 예정 복습/누적 혼합을 우선한다.
- 아침에 일일 복습 계획을 만들더라도 현재 학습일 종료 시각(다음 04:00) 전에 due가 되는 항목은 그날 계획에 포함한다.
- 일일 복습 `건너뛰기`: 1회 뒤로 이동, 2회째에는 성공 처리 없이 오늘 계획에서 닫고 다음 학습일로 이월한다.

## UI / reset

- 헤더 화면 배율: **80% / 90% / 100% / 110% / 120% / 130% / 140%**
- 배율은 `curriloop-ui-scale-v1`에 저장하며 학습 기록과 독립적이다.
- `학습 기록 전체 초기화`는 mastery, planner, review, 입력 draft, sessionStorage draft, structure session을 초기화한다.
- 학습 기록 초기화는 화면 배율 설정을 지우지 않는다.

## Official-data audit

원본 HWP 기준으로 6과목 성취기준 코드 수를 재대조한다.

- 9정: 25
- 12정: 23
- 12인기: 19
- 12데과: 19
- 12정과: 18
- 12소생: 19

이번 v7.8.1 안정화에서는 공식 corpus 문구를 수정하지 않았다. 작업 시작 ZIP의 2022 curriculum / production 문제은행 / 2015 transition reference / 2015↔2022 mapping SHA-256을 기준선으로 고정했고 최종 SHA가 동일해야 release가 통과한다. 기존 corpus의 5개 원문 교정 회귀 검사는 유지한다. 현재 실행 환경에서는 HWP 5.0을 독립적으로 재파싱할 수 없어 원 HWP 전체를 이번 세션에서 다시 byte-to-text 대조하지는 못했으며, 이 한계는 known issue로 남긴다.

## Red Team invariants

다음 위반은 release failure다.

- 04:00 이전/이후 study-day 오판정
- 자정 통과로 하루 새 세션 1회 제한 우회
- 한 session이 과목 또는 영역 경계를 넘음
- 일반 영역 마지막 session에 필요한 structure pool이 없음
- 현재 과목 UI가 과정·기능 과목 변별의 답을 항상 노출함
- severe review backlog가 deadline boost에 의해 무시됨
- review skip이 무한 재큐됨
- 완료된 6과목 뒤 새 자동 section이 생성됨
- UI scale이 범위를 벗어나거나 학습 초기화에 의해 소실됨
- 공식 corpus/production 불변식이 변함

## Automated QA

Release 전 모든 `tests/**/*.js`를 실행하고 추가로 다음을 검사한다.

- 모든 JS 파일 `node --check`
- HTML duplicate id
- 로컬 script/link 경로 존재
- service-worker precache 경로 존재
- v7.7.1과 production/2015 transition/mapping SHA-256 비교
- 2022 curriculum diff가 검토된 원문 교정 범위를 벗어나지 않는지 확인
- 최종 ZIP 생성 후 `unzip -t`
- ZIP을 별도 디렉터리에 재해제한 뒤 동일한 전체 테스트와 Red Team을 다시 실행

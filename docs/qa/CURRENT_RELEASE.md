# CurriLoop v7.8.9 — Middle/High Exam-Demand Re-audit (WORKING)

## 범위
- 이번 변경 범위: **중학교 정보 + 고등학교 정보의 기출 profile / 실전 조합 엔진 재감사**
- 다른 4과목 실전은 아직 migration 전
- 공식 corpus는 변경하지 않음: **674문장 / 6,327 gaps**
- 중학교 정보 **139문장**, 고등학교 정보 **131문장**, 합계 **270문장**

## 이번에 고친 핵심 오류
- 시험지에 원문이 **제시된 cue**를 수험생이 여러 단위 직접 인출한 것으로 잘못 계산하던 profile을 수정했다.
- 기출 증거를 `production / constructed / recognition / cue`로 분리했다.
- 2025 B `평가 루브릭`을 고등학교가 아니라 **중학교 MI-TE-EVD-03**으로 바로잡았다.
- 2026 A 중학교 `디지털 윤리 / 저작권`, 고등학교 `피지컬 컴퓨팅`, `사물인터넷 시스템의 구성 및 동작 원리`, `보고서 / 포트폴리오`를 실제 생산 답안으로 고정했다.
- 2026 A 정렬 성취기준과 2024 B 고려사항처럼 **제시문으로 보인 원문은 동시 빈칸 수 근거로 사용하지 않는다.**
- 2026 B `압축 / 암호화`는 실제 2단위 생산으로 유지한다.

## 실전 조합 고정 규칙
- 직접 생산 근거가 없는 문장: **1개 → 숙련 후 최대 2개**.
- 실제 1단위 생산 기출: **1개 → 최대 2개(+1 안전마진)**.
- 실제 2단위 생산 기출: **1개 → 2개 → 최대 3개(+1 안전마진)**.
- 실제 시험이 짧은 정확 암기 항목 전체를 요구한 경우에는 **관찰된 production pinned 원자까지만** 문맥 보존 상한을 넘을 수 있다. +α 원자는 예외를 받지 않는다.
- `recognition / cue / pattern`은 가능한 경우 최소 **65% 문맥을 보존**한다. `production`도 +α 구간에서는 문맥 보존 상한을 적용한다.
- `실전`과 `통회상`은 계속 별도 모드다.

## Source QA
- 중학교 정보 139문장 source-lock 통과.
- 고등학교 정보 131문장 source-lock 통과.
- 업로드한 공식 [별책10] HWP 기반 고등학교 후반 67문장 source hash lock 유지.
- 공통부 누락 12개(중 5, 고 7) 복구 상태 유지.

## 회귀 QA
- profile direct evidence: **35 line profiles**
  - production 14
  - recognition 15
  - cue 4
  - constructed 2
- profile의 pinned/priority atom은 모두 실제 해당 source line 안에 존재하도록 자동 검사.
- non-production evidence는 `observed=1 / training<=2 / pinned=0`으로 자동 검사.
- 6과목/33영역/674문장/6,327 gaps, planner 225 sections, EX-001~031 / 110 units 유지.
- 전체 engine/data/release/simulation Red Team 통과 필요.

## 상태
- **FINAL 아님.** 중·고 정보는 새 실전 엔진의 기준판으로 재감사한 WORKING checkpoint.
- 나머지 4과목은 이 규칙을 그대로 migration하며 새 철학을 추가하지 않는다.

# CurriLoop v7.8.7 — Official Source Completeness Repair QA (WORKING)

## 범위
- 6과목 / 33영역
- 공식 corpus **674문장 / 6,327 gaps**
- 중학교 정보 **139문장**, 고등학교 정보 **131문장**
- 중·고 정보 공통 교수⋅학습·평가 누락 공식 항목 **12개(중 5, 고 7) 복구**

## 고정 QA
- 기존 source line ID는 변경하지 않고 복구 항목에 신규 ID만 사용
- 12개 복구 문장의 원문 존재·공통부 배치·semantic override 자동 검사
- 최근 2022 개정 직접 기출(2024~2026) 답안 문구에 exam-priority QA 적용
- 6과목 전체 평균 난이도 상한: 가치·태도 26%, 성취기준 해설 13%, 고려사항 14%
- EX-001~031 / 110 answer units / transition mapping 20 유지
- production 문제은행 / 2015 transition / 2015↔2022 mapping byte identity 유지
- first-pass 평균 완료 2026-11-07, moderate backlog/2일 결석 회복 범위 2026-11-09

## 상태
- FINAL 아님. rolling WORKING checkpoint.

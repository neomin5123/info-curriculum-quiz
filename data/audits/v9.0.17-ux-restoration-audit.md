# CurriLoop v9.0.17 — UX Restoration Audit

Status: **PASS — STUDY RC READY / HUMAN UX CONFIRMATION PENDING**

## 복원한 회귀 기능

| 기능 | v9.0.16 | v9.0.17 |
|---|---|---|
| exact 채점 | O | O |
| near 판정 | X | O |
| 미입력 unknown 분리 | 부분 | O |
| Levenshtein 오타 | X | O |
| 한글 자모 오타 | X | O |
| 조사/제한적 유사 표현 near | X | O |
| 오답 즉시 정답 표시 | X | O |
| Enter 개별 채점 | O | O |
| 정확 시 다음 칸 focus | X | O |
| Tab/자동 중앙 scroll | 브라우저 의존 | O |
| 입력값 저장/복원 | X | O |
| 답 수정 시 판정 해제 | 불완전 | O |
| 범위별 round | X | O |
| 범위별 마지막 task | X | O |
| 원문 출처 버튼 상단 | X | O |
| 하단 상시 provenance | X | O |
| 답 길이 기반 빈칸 폭 | X | O |

## 유지한 불변조건
- official curriculum lines: 270
- curriculum data mutation: 0
- policy/presentation data mutation: 0
- 내용체계 전체 표 scaffold 유지
- 지식·이해는 회상 방식과 무관하게 영역 목록 전체 회상
- C/X-only 항목은 문맥에 보이되 강제 production하지 않음

## 자동 QA
`npm test`는 data/package/behavior/UX 검사를 모두 포함한다.

# Build 2026.10.19-16 기출 화면 개편 감사

- 기준선: 2026.10.19-15, 원본 문제 269, 독립 풀이 159, atlas 12종, 영역 337조각.
- 고정된 필터 6종(연도·시험·과목·주제·풀이·검색)의 기존 ID와 필터 로직 보존.
- 문항 탐색은 상단 select로 이동. 옛 `examQuestionList` 참조 노드는 숨겨 기존 DOM 검증과 충돌 방지.
- PDF/답안 병렬: 화면폭 781px 이상 원문 64% 내외/풀이 36% 내외, 그 아래에서는 풀이 박스를 문제 위에 배치.
- 풀이 판별은 기존 q.solutionStatus === solved만 사용. 초기 blurred+inert+aria-hidden, 버튼 공개, 숨기기 지원. 풀이가 없는 경우는 데이터 추정 금지.
- 정답표는 year+part 기준 모든 해당 문항을 나열하며 solved에 한해 q.answer 필드만 사용. 공식 검증 표기 금지.
- 기존 source/answer/explanation/status 필드를 변경하지 않음.

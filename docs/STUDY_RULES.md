# Study rules — current RC

## 지식·이해
- 한 영역의 내용 요소 **전체를 동시에 회상**.
- 공식 항목 수 그대로 사용. 2개짜리 영역에 임의 항목을 추가하지 않는다.
- 입력 순서 무관.

## 기타 family
- `단일 회상`: core set.
- `실전 조합`: evidence-driven practical set.
- 4개 이상 동시 빈칸은 사용하지 않는다.
- v9.0.6에서 너무 긴/짧은 phrase granularity를 추가 정제한다.

## 반복
- `다음 바퀴`에서 set rotation.
- 오답 다시 묻기 ON이면 약 3 task 뒤 재삽입, 한 바퀴 최대 2회.


## v9.0.6 granularity
- 지식·이해는 영역 전체를 한 번에 회상한다.
- 그 외는 너무 긴 문장 전체를 한 칸으로 만들지 않는다.
- comma/list 형태는 하나의 list blank로 묶을 수 있다.
- practical은 대표 pair/triple만 사용하며 exhaustive combination은 생성하지 않는다.
- 기출 exact-term과 공식 원문은 유지한다.


## v9.0.7 범위 규칙
- `전체 영역`은 5개 영역을 모두 세션에 포함한다.
- `내용체계 전체`는 지식·이해, 과정·기능, 가치·태도만 포함한다. 핵심 아이디어/성취기준/해설은 포함하지 않는다.
- 지식·이해의 `영역별 회상`은 영역당 1문제, `전체 영역 통회상`은 학교급당 1문제다.
- 난이도 라벨을 따로 두지 않고 회상 범위를 넓히는 방식으로 부담을 조절한다.


## v9.0.9 내용체계 전체
- 특정 영역 + 내용체계 전체: 해당 영역의 지식·이해/과정·기능/가치·태도를 한 표에서 전부 묻는다.
- 전체 영역 + 내용체계 전체: 영역별 표 5개를 순회한다.
- 표 안에서는 범주별로 답을 채점하며, 같은 범주 안의 입력 순서는 무관하다.
- 원본 line과 item mastery는 그대로 유지한다.


## v9.0.11 내용체계 회상 방식
모든 `내용체계` 회상은 동일한 전체 표 scaffold를 사용한다.

- `단일 회상`: 한 recall unit만 시험한다. 비지식·이해 line은 single presentation set을 사용한다.
- `실전 조합`: 한 recall unit 안에서 representative practical set을 사용한다.
- `지식·이해`: 회상 방식과 무관하게 해당 영역의 지식·이해 목록 전체를 하나의 recall unit으로 취급한다.
- `통짜 회상`: active production 대상 항목을 동시에 묻는다.
- C/X-only line은 표의 맥락으로 제시하되 production 입력을 요구하지 않는다.


## 기본 키보드/포인터 UX
학습 입력은 마우스 없이도 완료할 수 있어야 한다.
- Enter = 채점
- Tab / Shift+Tab = 입력칸 이동
- 첫 클릭 = 전체 선택
- 두 번째 클릭부터 = 커서 위치 선택
- IME composing Enter는 채점 금지
- Shift+Enter = textarea 줄바꿈

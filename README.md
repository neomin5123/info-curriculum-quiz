# CurriLoop v9.0.7 Study RC

중학교 정보 + 고등학교 정보 **270개 공식 교육과정 line**을 즉시 공부할 수 있는 정적 웹앱입니다. GitHub Pages/Vercel에 그대로 올릴 수 있고, 데이터는 코드와 분리되어 있습니다.

## 바로 사용

- 가장 간단함: `index.html`을 브라우저로 열기. 데이터가 JS mirror로 포함되어 있어 `file://`에서도 동작합니다.
- 권장: 이 ZIP의 **내용물 전체**를 Git 저장소 루트에 업로드하고 GitHub Pages 또는 Vercel로 배포합니다.
- 로컬 서버: `python -m http.server 8000` 후 `http://localhost:8000`.

## 현재 학습 규칙

- `지식·이해`: **학교급 × 영역의 공식 내용 요소를 한 번에 전부 회상**합니다. 공식 구성상 실제 그룹 크기는 2~7개입니다.
- 나머지 family: 현재 v9.0.1 refined cloze의 단일/실전 조합을 사용합니다. 이 부분은 v9.0.6에서 granularity를 추가 정제할 예정입니다.
- 학습 모드: `원문 → 따라치기 → 마스킹 → 빈칸 채우기`.
- 오답 다시 묻기: 기본 ON, 약 3문제 뒤 재출제.
- 진행 상태: 브라우저 `localStorage`에 저장.

## 수정할 때

**원본 데이터는 `data/curriculum/middle-high-v9.0.6.json` 하나입니다.**

1. JSON 수정
2. `npm run build:data` — 로컬 실행용 `data/generated/study-data.js` 재생성
3. `npm test` — 데이터/패키지 정적 QA
4. 버전 변경 시 `service-worker.js`의 `CACHE` 이름과 HTML cache-buster를 함께 갱신

생성 파일인 `data/generated/study-data.js`를 직접 수정하지 마세요.

## 상태

이 빌드는 **공부 가능한 Study RC**입니다. `지식·이해` 전체회상 규칙은 반영되었지만, 비-지식·이해 granularity의 최종 동결 전이므로 `FINAL FROZEN`으로 표시하지 않습니다.


## v9.0.6 presentation layer
- `지식·이해`: 학교급×영역 전체 목록 회상
- 그 외 family: `line.presentation.units` + representative pair/triple sets
- 공식 원문, canonical knowledge, S/A/B/C/X, legacy keywords/sets는 보존
- 빈칸 UX는 presentation layer에서만 수정 가능


## v9.0.7 범위/회상 UX
- `영역`: `전체 영역` 지원.
- `출제 항목`: `내용체계 전체` 추가. 이는 `지식·이해 + 과정·기능 + 가치·태도`만 묶는다.
- `지식·이해 + 전체 영역`: `영역별 회상` 또는 `전체 영역 통회상` 선택 가능.
- `중·고 정보 전체 + 전체 영역 통회상`: 32개를 한 번에 묻지 않고 중학교 17개 / 고등학교 15개로 학교급별 1문제씩 분리한다.
- 난이도 숫자는 두지 않고 **회상 범위 자체**로 부담을 조절한다.


## v9.0.8 Freeze Candidate
Automated final QA candidate. Curriculum data is unchanged from v9.0.7; final freeze waits only for real-study UX confirmation.


## v9.0.9 — 내용체계 표 전체 회상
`내용체계 전체`는 더 이상 개별 line task를 이어 붙이지 않는다. `학교급 × 영역`을 하나의 composite task로 만들고, 지식·이해/과정·기능/가치·태도를 한 표에서 전부 회상한다. 그룹은 원본 line에서 런타임에 파생하므로 중복 데이터가 없다.


## v9.0.10 grouped study UI
출제 항목은 교육과정 문서 구조를 기준으로 6개 학습 묶음으로 노출한다. 원본 family는 데이터에 그대로 유지되고 UI/engine에서만 묶는다. 특정 영역에서는 과목 공통 범주(성격·목표, 교수·학습·평가)를 자동으로 숨긴다. 회상 방식은 모든 묶음에서 단일/실전/통짜를 제공하되, 지식·이해는 어떤 회상 방식에서도 영역 전체 목록 recall task를 유지한다.


## v9.0.11 — 표 scaffold 기반 회상
`내용체계`는 회상 방식에 관계없이 항상 동일한 전체 표를 보여준다.

- 단일 회상: 현재 recall unit의 빈칸만 뚫고 나머지 표는 원문으로 유지
- 실전 조합: 현재 recall unit의 practical set만 여러 빈칸으로 출제
- 지식·이해: single/practical에서도 해당 영역 목록 전체를 묶어서 회상
- 통짜 회상: production 대상 항목을 한 화면에서 모두 회상
- C/X-only 항목: 표에는 계속 보이지만 production 빈칸으로 만들지 않음

이 방식은 표 구조 기억과 세부 cloze 연습을 분리하지 않고 같은 화면에서 누적하도록 설계한다.


## v9.0.12 — 기본 입력 상호작용
- Enter: 현재 문제 채점
- Tab / Shift+Tab: 다음 / 이전 입력칸 이동
- 입력칸 첫 클릭: 전체 선택
- 같은 입력칸 두 번째 클릭부터: 클릭 위치에 커서
- 한글 IME 조합 중 Enter는 채점하지 않음
- textarea에서 Shift+Enter는 줄바꿈


## v9.0.13 deployment guard
The Study RC no longer uses a persistent Service Worker cache. `vercel.json` sets `no-store`, and old CurriLoop Service Worker/cache entries are cleared on load. The deployed header must read `v9.0.13 Deploy Safe`.


## v9.0.14 — 표 전체에 난이도 적용
내용체계 학습은 어느 회상 방식에서도 영역당 **표 1개**를 유지한다. 난이도는 표를 쪼개는 것이 아니라 표 안에 뚫리는 빈칸의 밀도로만 바뀐다.

- 단일 회상: 각 production line의 single unit 1개씩
- 실전 조합: 각 production line의 representative multi-blank set
- 전체 회상: 각 production line의 presentation unit 전체
- 지식·이해: 항상 해당 영역 목록 전체 입력
- C/X-only: 문맥으로 보이되 강제 production 없음

상단 버전 표기는 CurriLoop 제목 옆에 인라인으로 배치한다.


## v9.0.15 — 내용체계 + 성취기준 한 화면
특정 영역에서 `내용체계 + 성취기준`을 선택하면 내용체계 전체 표와 그 영역의 성취기준을 한 화면에 함께 표시한다. `성취기준` 단독 출제 항목도 그대로 제공된다.


## v9.0.16 — Enter 개별 채점
Enter는 포커스된 답 입력칸 하나만 채점한다. 전체 문제 채점은 `채점` 버튼으로만 수행한다. 목록형 정답은 순서와 무관하게 판정하며 이미 맞힌 동일 항목의 중복 입력은 정답으로 처리하지 않는다.


## v9.0.17 UX Restoration
이번 버전은 신규 교육과정 기능보다 v8에서 이미 해결했던 학습 편의성을 복원하는 데 초점을 둔다.

- 4상태 채점: 정확 / 표기 확인(near) / 모름 / 오답
- 오타·한글 자모·조사 차이의 보수적 near 판정
- 틀리거나 비워두면 입력칸 바로 아래 공식 정답 표시
- Enter 개별 채점, 정확 시 다음 미완료 칸 자동 이동
- Tab 이동과 자동 중앙 스크롤
- 입력값/판정/범위별 round/마지막 위치 저장
- 상단 `원문 출처` 버튼 + 하단 상시 provenance
- compact table/blank visual redesign


## v9.0.19 — 빈칸 크기와 지연 재인출
오답/모름/표기 확인 상태는 개별 입력칸 기준으로 예약되며, 기본적으로 다른 답을 3개 채점한 뒤 해당 칸이 비워지고 `다시` 상태로 돌아온다. 자동으로 그 칸에 포커스하고 화면 중앙으로 스크롤한다. inline 빈칸도 이전보다 넓고 높게 조정했다.


## v9.0.20 — 복습 탭과 비방해형 지연 재인출 카드
지연 재인출은 현재 문제를 강제로 중단하지 않는다. 기본적으로 다른 답 3개를 채점한 뒤 우측 가장자리에 작은 카드가 나타난다. 카드는 여러 개가 생기면 조금씩 겹치며, 마우스/키보드 포커스를 올리면 해당 카드가 앞으로 나오고 전체가 보인다. 사용자가 카드를 눌렀을 때만 원래 문맥으로 이동해 그 빈칸을 다시 푼다.

`복습` 탭에서는 현재 재인출 예약과 누적 취약 항목을 한 번에 확인할 수 있다.


## v9.0.21 — 카드 안에서 끝나는 지연 재인출
v8의 `다시 꺼내기` 보조 패널을 참고해 지연 재인출 카드를 다시 만들었다. 카드가 due 상태가 되면 우측에 쌓이지만 현재 학습을 중단하지 않는다. 사용자가 카드를 클릭하면 카드 자체가 확장되어 원문 문맥의 빈칸, 답 입력, 확인/나중에, 정답 피드백까지 그 자리에서 처리한다. 정답이면 카드가 사라지고, 실패하면 정답을 확인한 뒤 몇 항목 뒤 다시 예약한다.


## v9.0.22 — 오늘의 복습 / 데이터 관리
장기 복습은 1·3·7·14·21·30일 간격으로 동작한다. 일반 학습에서 처음 답한 항목은 다음날 복습 대상으로 등록된다. `복습` 탭에서 오늘 예정된 항목을 한 번 완료하면 그날의 큐에서 빠지고 다음 간격으로 이동한다.

입력 중인 빈칸(drafts/fieldGrades)은 현지 날짜가 바뀌면 자동으로 비워진다. `빈칸 비우기`를 누르면 즉시 같은 데이터만 초기화한다. `복습 데이터 초기화`는 장기 복습 일정, 취약 기록, 지연 재인출 카드만 초기화하며 빈칸 입력과 학습 범위/바퀴는 건드리지 않는다.

`오답 다시 묻기 (3개 뒤 카드)`는 짧은 지연 재인출 전용 스위치다. 체크하면 Enter 채점과 전체 채점 모두 실패한 빈칸을 우측 카드로 예약하고, 체크 해제하면 새 예약 및 카드 표시를 중지한다. 날짜 기반 `오늘의 복습`은 이 체크박스와 별도다.

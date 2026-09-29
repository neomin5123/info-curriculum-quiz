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

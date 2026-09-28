# CurriLoop v9.0.5 Study RC

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

**원본 데이터는 `data/curriculum/middle-high-v9.0.5.json` 하나입니다.**

1. JSON 수정
2. `npm run build:data` — 로컬 실행용 `data/generated/study-data.js` 재생성
3. `npm test` — 데이터/패키지 정적 QA
4. 버전 변경 시 `service-worker.js`의 `CACHE` 이름과 HTML cache-buster를 함께 갱신

생성 파일인 `data/generated/study-data.js`를 직접 수정하지 마세요.

## 상태

이 빌드는 **공부 가능한 Study RC**입니다. `지식·이해` 전체회상 규칙은 반영되었지만, 비-지식·이해 granularity의 최종 동결 전이므로 `FINAL FROZEN`으로 표시하지 않습니다.

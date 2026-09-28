# Architecture

```text
index.html                 얇은 UI shell
assets/css/app.css         화면 스타일
js/core/config.js          버전/상수
js/core/storage.js         localStorage 전용
js/core/grading.js         정규화/채점
js/core/study-engine.js    task pool, KI grouping, round, retry
js/app.js                  DOM/UI orchestration
data/curriculum/*.json     canonical study data (수정 대상)
data/generated/*.js       JSON의 생성 mirror (직접 수정 금지)
data/audits/               해당 데이터 버전의 QA 기록
tools/                     build/validation
```

## 원칙
1. 공식 원문 데이터와 UI 코드를 섞지 않는다.
2. `지식·이해` presentation override는 데이터에 명시한다.
3. generated 파일은 build 산출물이다.
4. 학습 상태는 line/group ID를 key로 저장하여 UI 재구조화와 분리한다.
5. 새 버전은 service worker cache 이름을 반드시 변경한다.

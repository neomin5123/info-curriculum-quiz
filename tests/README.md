# CurriLoop tests

현재 production 구조에 대한 테스트만 이 디렉터리에 둡니다. 과거 릴리스별 QA는 `archive/tests/release/`에 보존합니다.

## 실행
프로젝트 루트에서:

```bash
node tests/engines/learning-engine.test.js
node tests/engines/grading-engine.test.js
node tests/engines/planner-engine.test.js
node tests/engines/recall-engine.test.js
node tests/engines/structure-engine.test.js
node tests/engines/support-engines.test.js
node tests/practice/practice-engine.test.js
node tests/data/static-qa.js
node tests/data/middle-info-recall-qa.js
node tests/release/current-release-qa.js
node tests/simulation/planner-pace-simulation.js
node tests/simulation/guided-scope-simulation.js
node tests/simulation/final-study-freeze-simulation.js
node tests/simulation/red-team-freeze-simulation.js
```

`current-release-qa.js`는 `data/questions/production.js`를 직접 읽습니다. 별도의 문제은행 복제본을 사용하지 않습니다.

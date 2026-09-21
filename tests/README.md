# QA

Node.js에서 다음을 실행하면 핵심 학습 엔진, 유사 답안 채점, 데이터 정합성을 검사할 수 있습니다.

```bash
node tests/learning-engine.test.js
node tests/grading-engine.test.js
node tests/support-engines.test.js
node tests/static-qa.js
```

v6.11.1 기능 검사는 다음도 포함합니다.

```bash
node tests/v610-feature-qa.js
node tests/v611-feature-qa.js
```


## v7.0.0
`v700-exam-paper-qa.legacy.txt` preserves the v7.0.0 release check as historical reference. It is not executed against later banks.


## v7.1.0
`v710-exam-paper-qa.js` verifies 28 production items, atomic 1-point prompts, explanation metadata, source grounding, and exact 20-point set composition.

## v7.2.0
`v720-exam-paper-qa.js` verifies 29 production items, 102 atomic 1-point units, source grounding, exact 20-point set composition, and the new curriculum-text × ASSURE archetype item.

## v7.3.0
- `node tests/v730-exam-paper-qa.js`: 30문항, 106개 1점 unit, sourceId, 부분점수, 20점 세트, EX-030 포함 회귀 검증.

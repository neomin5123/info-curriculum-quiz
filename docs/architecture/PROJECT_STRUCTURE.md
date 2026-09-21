# Project structure

## 원칙
1. `data/`에는 현재 앱이 실제 사용하는 데이터만 둔다.
2. 공식 교육과정과 CurriLoop 학습 보조 자료를 분리한다.
3. `docs/`에는 현행 문서만, 과거 자료는 `archive/`에 둔다.
4. 최신 release QA는 하나의 진입점으로 유지한다.

## 주요 경로
- `data/curriculum/2022/curriculum.js`: 2022 공식 교육과정 corpus
- `data/questions/production.js`: production 문제은행
- `data/learning-aids/general-bank.js`: 총론·역사 등 일반 암기 문항
- `data/learning-aids/core-flow.js`: 영역별 핵심 흐름 보조 지도
- `js/engines/structure-engine.js`: 중등 정보 구조 연습의 범주 구별·성취기준 해설 연결 문항 생성
- `tests/release/current-release-qa.js`: 현재 release 문제은행 QA

## v7.4 additions

```text
data/curriculum/
├─ 2015/
│  └─ transition-reference.js
├─ 2022/
│  └─ curriculum.js
└─ mappings/
   └─ 2015-2022.js

docs/
├─ curriculum/CURRICULUM_TRANSITION.md
└─ exams/EXAM_COVERAGE.md
```

2015 전환 참조 자료는 비교형 문제의 근거 조회용이며 기존 2022 암기 과목 목록에 추가되지 않는다.

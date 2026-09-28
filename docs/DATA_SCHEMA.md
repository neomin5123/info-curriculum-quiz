# Data schema notes

## `lines[]`
- `lineId`: 영구 식별자
- `subject`, `subjectLabel`, `area`, `family`
- `sourceText`: 공식 원문
- `keywords[]`: 내부 학습 target + Stage3R provenance
- `coreSets[]`, `practicalSets[]`: 비-지식·이해 현재 cloze 세트
- `presentationOverride`: UI presentation 예외. 현재 `지식·이해`에 사용.

## `knowledgeUnderstandingGroups[]`
학교급×영역 단위 전체회상 task.
- `items[]`: 해당 영역의 공식 지식·이해 내용 요소 전체
- `UNORDERED_EXACT_SET`: 순서 무관, 중복 불가
- 그룹 완료와 item mastery를 분리 가능

`지식·이해`의 기존 개별 cloze set은 **추적성 보존용**으로 데이터에 남지만 메인 학습에서는 `presentationOverride.suppressIndividualClozeInMainStudy=true`로 차단합니다.

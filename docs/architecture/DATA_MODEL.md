# Data model boundary

- **Official-source corpus**: 교육부 원문 및 원문을 앱에서 사용하기 위한 구조화 데이터. `data/curriculum/2015/`, `data/curriculum/2022/`에 둔다.
- **Curriculum analysis mapping**: 두 공식 corpus를 source ID로 연결한 CurriLoop 분석 데이터. `data/curriculum/mappings/`에 두며 공식 원문과 구분한다.
- **Learning aids**: 핵심 흐름, 일반 암기 문항 등 CurriLoop가 만든 보조 자료. `data/learning-aids/`에 둔다.
- **Production questions**: 실제 연습 화면에서 사용하는 검증 완료 문항. `data/questions/production.js`를 단일 진실 원천으로 삼는다.
- **Archive**: 현재 런타임에 필요하지 않은 과거 산출물.

## v7.4 transition layer

`CURRILOOP_CURRICULUM_2015`는 2022 학습 corpus와 별개의 전환 참조 데이터다. `CURRILOOP_CURRICULUM_TRANSITION`은 다음 최소 스키마를 사용한다.

```text
mapping = {
  id,
  from: [2015 sourceId...],
  to: [2022 sourceId...],
  relationType: 유지|이동|통합|분화|신설|삭제,
  note
}
```

`relationType`은 분석 값이므로 공식 원문 객체에 역으로 기록하지 않는다.

## v7.5 middle-school Informatics recall state

중학교 정보 파일럿은 공식 curriculum corpus를 수정하지 않고 학습 상태 키를 별도로 사용한다.

- `recall-section|subject|area|sourceGroup|sectionTitle`: 장기 통회상 숙달 및 복습 예약 단위
- `recall-item|...`: 같은 날 오답 보수를 위한 개별 항목 진단 단위. 장기 복습 카드로 승격하지 않는다.

목록 통회상은 전체 묶음으로 제시하지만 채점은 공식 항목별로 진단하며, 장기 스케줄은 묶음 단위로만 유지한다. 이렇게 하여 "무엇을 틀렸는가"와 "전체를 다시 꺼낼 수 있는가"를 동시에 기록한다.

# Curriculum mappings

이 디렉터리는 **교육과정 원문이 아니라 CurriLoop의 비교·전환 분석 데이터**를 저장한다.

현재 파일:

- `2015-2022.js`: 2015 개정 정보과 ↔ 2022 개정 정보과 주요 요소의 전환 관계

관계 유형은 `유지 / 이동 / 통합 / 분화 / 신설 / 삭제` 여섯 가지다. 이 분류는 교육부 공식 용어가 아니라 임용 대비와 Coverage 분석을 위한 CurriLoop 내부 분석 기준이다.

원문 또는 준원문 근거는 각각 `../2015/transition-reference.js`, `../2022/curriculum.js`에서 관리한다. mapping 객체 안에는 원문 문장을 중복 저장하지 않고 source ID만 연결한다.

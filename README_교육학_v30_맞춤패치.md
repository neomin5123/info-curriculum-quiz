# CurriLoop — 업로드하신 ZIP 전용 교육학 v30 맞춤 패치

대상: `info-curriculum-quiz-main (1).zip` (사용자 제공 원본)

## 적용 방법
1. 원본 ZIP을 백업하고 압축을 해제하세요.
2. 이 패치 ZIP을 **원본 ZIP을 푼 상위 폴더**에 압축 해제하세요.
3. `info-curriculum-quiz-main/education/` 아래 같은 이름 파일 5개를 덮어쓰면 됩니다.
4. `info-curriculum-quiz-main/index.html`을 열어 기존 앱을 이용하세요.

## 패치 범위
- 덮어쓰기: `education/index.html`, `education/app.js`, `education/data.js`, `education/drills.js`, `education/style.css`
- 추가: v26/v27/v28 검수 자료 및 v30 검증 보고서, 이 안내문
- **보존:** 최상위 `index.html`, `js/app.js`, `js/core/storage.js`, `assets/css/app.css` 등 교육학 외의 업로드 파일은 전부 수정하지 않습니다.
- **보존:** `education/exams.js`는 업로드 파일과 v30 파일이 완전히 동일하여 덮어쓰지 않습니다.

## 데이터 호환성
- 교육학 개념 83개, 일반 확인문제 128개, 기출 소재 변형 25개 (총 153문항).
- 기존 교육학 저장 키 및 문항 ID를 유지하는 v30 코드를 사용합니다.
- 주의: 학습 기록은 브라우저 저장소에 존재하고 ZIP 안에 들어 있지 않습니다. 배포 주소나 파일 경로 변경에 따른 브라우저 저장 공간 분리는 별도 문제이므로 기존 기록을 먼저 내보내 백업하세요.
- 웹사이트에서 실제 새로고침 이후 영구 저장은 이 패키징 작업에서 재시험하지 않았습니다.

이 패치는 제공된 **해당 ZIP 내용**에 맞춰 생성했습니다. 다른 버전의 ZIP에 적용할 경우 같은 보존을 보장할 수 없습니다.

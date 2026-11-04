# CurriLoop Build Policy

CurriLoop는 사용자에게 SemVer 버전 번호를 표시하지 않는다. 제품명은 항상 **CurriLoop**로 표시한다.

## 내부 식별

- 형식: `YYYY.MM.DD-NN`
- 현재 Build ID: `2026.10.22-02`
- Build ID는 캐시 무효화, 배포 비교, 장애 추적에만 사용한다.
- 화면에는 Build ID를 상시 노출하지 않는다.

## 데이터 스키마

앱 빌드와 데이터 구조는 별도로 관리한다.

- 교육과정 데이터: 기존 canonical data/presentation 정책 유지
- 기출 데이터: `examSchema: 3` (연도별 atlas crop 좌표 지원)
- 학습 상태: 기존 `curriloop:v9:study-state` 키를 유지하여 과거 진행도를 보존
- 기출 탐색 UI 상태: `curriloop-exam-ui-v1`

## 변경 기록

기능 변화는 숫자 버전 대신 `CHANGELOG.md`에 날짜와 Build ID로 기록한다. 과거 v9.x 로그는 개발 역사로 그대로 보존한다.

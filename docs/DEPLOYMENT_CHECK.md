# CurriLoop 배포 점검 (Build 2026.10.19-05)

- 공개 화면은 제품명 **CurriLoop**만 사용하고, 사용자에게 SemVer 버전 번호를 표시하지 않는다.
- 내부 HTML의 `data-build`, `js/core/config.js`의 `appVersion`, `service-worker.js`의 `BUILD`, URL cache-buster가 같은 Build를 가리키는지 확인한다.
- 현재 기준 내부 Build ID는 `2026.10.19-05`이다.
- 기존 Service Worker는 캐시를 삭제한 뒤 스스로 등록을 해제한다. 새 영속 캐시를 만들지 않는다.
- `npm test`는 정적·데이터 회귀 검사다. 실제 Browser E2E를 대체하지 않는다.
- `BUILD_ID.txt`를 배포 환경에서 직접 열어 내부 Build를 확인할 수 있다.
- 기출 정답은 공식 정답지를 확인하지 않은 독립 풀이가 포함되어 있다.

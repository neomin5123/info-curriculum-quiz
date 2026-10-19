# CurriLoop 릴리스 점검

- [ ] 수정 대상의 원본과 generated mirror 구분
- [ ] 기출 변경 시 `npm run build:exams` 실행 (교육과정 수정 없는 경우 `build:data` 불필요)
- [ ] `npm test` 전체 실행
- [ ] `node --check js/app.js` 및 변경된 JS 검사
- [ ] 교육과정 270 lines / 370 presentation units / Stage3R 정책 불변 검증
- [ ] `BUILD.json`, `BUILD_ID.txt`, `config.js`, HTML `data-build`, cache-buster, `service-worker.js` Build 일치
- [ ] localStorage 저장 키 및 기존 상태 마이그레이션 불변 검증
- [ ] `SHA256SUMS.txt` 재생성 및 검증
- [ ] 배포본 및 개발 보관본 ZIP 생성 후 새 디렉터리에 재해제
- [ ] 재해제본에서 체크섬 검사 및 `npm test` 재실행
- [ ] Browser E2E 수행 여부를 실제 사실대로 표시

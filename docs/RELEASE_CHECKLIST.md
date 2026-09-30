# Release checklist

- [ ] `npm run build:data`
- [ ] `npm test`
- [ ] `node --check js/app.js`
- [ ] `node --check js/core/*.js` 각각 PASS
- [ ] `VERSION.json` 갱신
- [ ] service worker CACHE 갱신
- [ ] index cache-buster 갱신
- [ ] ZIP 생성 후 새 디렉터리에 재해제
- [ ] 재해제본에서 `npm test` 재실행
- [ ] SHA-256 기록

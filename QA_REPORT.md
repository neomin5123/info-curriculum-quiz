# CurriLoop v6.0.0 Final QA

검수일: 2026-09-12

## 정적 자동 검사

- JavaScript syntax: **PASS**
- Service Worker syntax: **PASS**
- Curriculum subjects: **6/6**
- Curriculum areas: **27/27**
- Curriculum lines: **550**
- Unique explicit stable IDs: **550/550**, duplicates **0**
- General-bank IDs: **28**, duplicates **0**
- Core gap 0-line: **0**
- Precise gap 0-line: **0**
- Manual gap terms absent from source: **0**
- Precise gap count < core gap count: **0**
- User-visible old difficulty labels (쉬움/보통/어려움): **0**
- Middle-school Information official source-lock: **111/111**
- Middle-school Information areas: **5/5**
- Obsolete automatic gap-generation symbols: **0**
- PWA manifest/cache identity check: **PASS**

## 동적 smoke test

Playwright: **27/27 PASS**

검사 범위: 핵심/정밀/야~호! 표시, 문장부호 허용 정규화, 공식 출처 UI, 중학교 정보 빈칸 생성, 빈 Enter 오답+다음 이동, 오답 저장, 전체 채점 미입력 오답, 원문 보기/초기화 역할 분리, 랜덤 단원 자동 연속 진행, 구형 hard→정밀·legacy stable ID 마이그레이션, 오답노트 정밀 표시, 장기 오답 메타데이터, 백업 record 검증, 모바일 ARIA, 모바일/데스크톱 수평 overflow, 도움말 modal, 런타임 JS 오류.

> 샌드박스의 localhost/file origin 차단 때문에 실제 Service Worker 설치/업데이트 자동화는 수행하지 못했다. SW 문법·캐시 정책은 정적 검증했고, 실제 배포 뒤 실기기 PWA 업데이트/오프라인 1회 확인을 권장한다.

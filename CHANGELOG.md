# Changelog

## 9.0.10-study-rc.1
- 화면 상단 통계/중·고 정보 문구/회상 안내/바퀴 수/debug status 제거
- 우측 상단 화면 배율 추가 및 localStorage 저장
- 원문 출처 버튼을 화면 최하단으로 이동
- 출제 항목을 6개 묶음으로 재구성
- 전체 영역/특정 영역에 따라 존재하지 않는 출제 묶음 자동 숨김
- 회상 방식: 단일 회상 / 실전 조합 / 통짜 회상 공통 제공
- 지식·이해는 단일/실전에서도 영역 전체 목록 회상 유지
- 내용체계에 핵심 아이디어 포함
- 통짜 회상은 논리 단위별 composite task로 생성

## 9.0.9-study-rc.1
- `내용체계 전체`를 line 순회가 아닌 영역별 composite table task로 변경
- 지식·이해 / 과정·기능 / 가치·태도를 공식 내용체계 표처럼 한 화면에 표시
- 빈칸 채우기에서 해당 영역의 모든 내용 요소를 동시에 입력
- 전체 영역 선택 시 영역별 표 5개를 순회
- 항목별 mastery와 오답 재출제 유지
- v9.0.8 freeze candidate는 UX 구조 변경으로 freeze gate 재개방

## 9.0.8-freeze-candidate.1
- 270-line automated final audit
- source/policy/history/presentation/package gates audited
- curriculum data unchanged from v9.0.7
- final freeze pending real-study UX confirmation

## 9.0.7-study-rc.1
- 영역 드롭다운의 `전체 영역`을 실제 세션 범위로 사용
- 출제 항목에 `내용체계 전체` 추가
- `학습 단계`를 `회상 방식`으로 변경
- 지식·이해 전체 영역에서 `영역별 회상` / `전체 영역 통회상` 제공
- 중·고 전체 통회상은 학교급별 2문제로 분리
- 데이터/정책 레이어 변경 없음

# Changelog

## 9.0.6-study-rc.1
- 비지식·이해 family에 source-faithful presentation layer 추가
- 과도한 sentence-sized blank 60여 line을 term/phrase/list 단위로 재분절
- representative practical set 최대 4개, 4+ 동시 빈칸 금지
- 지식·이해 영역 전체회상 유지
- underlying S/A/B/C/X 및 official source mutation 없음

# Changelog

## 9.0.5-study-rc.1
- Git 저장소를 비운 상태에서도 바로 배포 가능한 clean rebase.
- 중·고 정보 270-line v9.0.5 데이터 탑재.
- 지식·이해를 학교급×영역 전체회상으로 전환.
- UI를 데이터/엔진/저장소/CSS로 분리.
- 원문/따라치기/마스킹/빈칸 채우기 구현.
- 오답 지연 재출제 및 localStorage 진행 저장.
- JSON → local-file-compatible JS mirror build script 추가.
- service worker cache version을 새로 시작하여 구버전 혼합 방지.

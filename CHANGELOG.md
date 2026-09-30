# Changelog

## 9.0.28-study-rc.1
- 우측 재인출 카드가 접힌 상태에서도 고정 `retryDock`의 투명한 450px 영역이 메인 학습 화면 클릭을 가로채던 버그 수정
- `retryDock` 및 카드 컨테이너 자체는 `pointer-events:none`
- 실제 보이는 카드 탭(`retry-card-peek`)과 펼친 카드 패널만 `pointer-events:auto`
- 따라서 카드 옆/뒤의 학습 화면 빈칸과 버튼을 정상 클릭할 수 있음
- 카드 바깥 클릭/터치 시 펼친 카드가 접히는 v9.0.27 동작은 그대로 유지
- 카드 자체 hover/click/input/확인/나중에는 그대로 동작
- 교육과정/복습/SRS/채점 데이터 변경 없음

## 9.0.27-study-rc.1
- 우측 `다시 풀기` 카드가 열린 상태에서 **카드 영역 밖을 클릭/터치하면 자동으로 접힘**
- Pointer Events를 사용해 마우스와 터치를 같은 규칙으로 처리
- 내용체계/성취기준 빈칸 문장에서 한글 문맥이 한 글자씩 세로로 깨지는 레이아웃을 방지하도록 전용 `.cs-cloze-content` 컨테이너 추가
- 한국어 문맥은 `word-break: keep-all`, 입력칸은 inline-flex + 최대 폭 제한으로 고정하여 문맥 영역을 침범하지 않게 함
- 기존 v8.0.3 learner-facing 연습문제 31문항 전수 사용가치 검토
  - 높음 16
  - 보통 10
  - 낮음 5
- 연습문제 문제은행/UI는 이번 버전에서 자동 복원하지 않고 검토 보고서만 포함
- 교육과정 원문, Stage3R 정책, SRS 규칙 변경 없음

## 9.0.26-study-rc.1
- 우측 지연 재인출 카드 전면 red-team/audit 수행
- **정답 누출 수정**
  - 정답이 원문 전체인 경우 원문을 그대로 보여주던 오류 수정
  - 동일 정답이 원문에 여러 번 나올 때 첫 번째만 가리고 나머지가 노출되던 오류 수정
  - 영역명/구분명 자체가 정답을 포함하여 카드 메타데이터에서 답이 새던 경우 자동 비식별화
  - 원문에서 정답 위치를 안전하게 찾지 못하면 원문을 노출하지 않고 일반 회상 프롬프트 사용
- `retryEntries`, `retryMeta` 중복 함수 선언 제거
- **지식·이해 따라치기/typing 재인출 수정**
  - 여러 정답을 `A / B / C` 한 줄 답으로 요구하던 오류 제거
  - 지식·이해 typing 실패도 기존 원칙대로 전체 목록 set 카드로 재인출
  - 성공 시 원래 textarea draft도 줄바꿈 목록으로 정상 복원
- **전체 `채점` 버튼 재인출 카운터 수정**
  - Enter만 answerSerial을 증가시키던 문제 수정
  - 전체 채점에서도 실제 채점된 입력칸마다 serial이 진행되어 `3개 답 뒤 카드`가 정상 도착
- 복습 탭에서 7번째 이후 지연 재인출 항목을 직접 열었을 때 우측 dock에 안 보일 수 있던 문제 수정
- 결과 1초 표시 중 중복 클릭으로 retryAttempts가 두 번 증가할 수 있는 경로 차단
- 긴 set 재인출 카드가 화면 밖으로 벗어나지 않도록 카드/입력 목록 내부 스크롤 추가
- 1초 결과 표시를 전체 덮개 대신 작은 상태 토스트로 변경하여 오답 정답 피드백이 가려지지 않게 수정
- 공용 prompt helper를 사용하는 오늘의 복습에서도 동일한 정답 누출 방지 적용
- 교육과정 원문, Stage3R S/A/B/C/X, 가치·태도 정책, 장기복습 간격 변경 없음

## 9.0.25-study-rc.1
- 우측 지연 재인출 결과 표시를 **2초 → 1초**로 단축
- 1초 뒤 현재 카드의 **바로 아래 카드**를 자동으로 열고, 현재 카드가 마지막이면 **첫 카드로 순환**
- 채점 직전 카드 순서를 기준으로 다음 카드를 선택해, 현재 카드가 정답 처리/재예약으로 사라져도 순서가 흔들리지 않음
- due 카드가 하나뿐이면 자기 자신을 자동 재개방하지 않음
- 가치·태도 C-only 문장은 **전체 회상에서만 문장당 C cue 1개**를 빈칸 처리
- C cue는 공식 source span에 있는 기존 C keyword만 사용하고, 바퀴마다 해당 문장 내 cue를 순환
- C cue는 frozen Stage3R C 등급을 바꾸지 않으며 장기 SRS/mastery를 새로 생성하지 않음
- 단일 회상/실전 조합은 기존 S/A/B 정책 유지
- 교육과정 원문 및 frozen S/A/B/C/X 데이터 변경 없음

## 9.0.24-study-rc.1
- 우측 지연 재인출 **사이드 카드에만** 채점 색상 강화
- 개별 입력칸: 정답=녹색, near=노랑, 오답/모름=빨강
- 카드 전체 판정 후 약 2초간 결과 오버레이 표시
  - 전체 정답: `재인출 완료 ✓`
  - near만 존재: `표현 확인 필요`
  - 오답/모름 포함: `재인출 실패`
- 전체 정답이면 2초 후 카드 제거
- 실패/near면 정답을 카드 내부에 표시한 뒤 재예약 또는 취약 기록 처리
- 메인 학습 화면/오늘의 복습 카드의 채점 연출은 변경하지 않음
- 교육과정/복습 간격/정책 데이터 변경 없음

## 9.0.23-study-rc.1
- 우측 재인출 카드 hover 시 내용이 세로 한 글자씩 찌그러지던 레이아웃 버그 수정
- 원인: v9.0.20의 `.retry-card { display:grid; grid-template-columns:8px ... }`가 v9.0.21+ 카드 컨테이너에 남아 새 카드의 첫 자식이 8px 열에 갇힘
- 카드 컨테이너를 `display:block`으로 명시적으로 reset
- hover/focus 시 카드 요약(`다시 풀기`, 영역·구분)이 가로로 온전히 노출
- 클릭 시 기존처럼 카드 내부 재인출 패널 확장
- 교육과정/복습 로직/채점 로직 변경 없음

## 9.0.22-study-rc.1
- 날짜 기반 `오늘의 복습` SRS 추가: **1 → 3 → 7 → 14 → 21 → 30일**
- 처음 학습한 항목은 다음날 첫 장기 복습 예약
- 오늘 예정된 복습은 복습 탭에서 카드 형태로 직접 채점
- 정답은 다음 단계로, near는 한 단계 완화, 오답/모름은 1일 단계로 복귀
- 지식·이해 장기 복습도 기존 원칙대로 **영역 전체 목록 회상**
- `복습 데이터 초기화` 버튼 추가: 장기 복습 일정, 취약 통계, 지연 재인출 카드만 삭제
- 저장된 빈칸 입력/채점 상태는 **현지 날짜가 바뀌면 자동으로 비움**
- 학습 화면에 `빈칸 비우기` 버튼 추가: 즉시 drafts/fieldGrades만 삭제, 복습 데이터는 유지
- `오답 다시 묻기` 체크박스를 실제 field-card 재인출의 단일 스위치로 정리
  - ON: Enter 개별 채점과 전체 `채점` 버튼 모두 오답/모름/near를 3개 답 뒤 우측 카드로 예약
  - OFF: 새 카드 예약 안 함 + 우측 카드 숨김
  - OFF여도 이미 예약된 카드는 보존되어 다시 ON 하면 재등장
- 예전 task 전체 재출제(`engine.scheduleRetry`)는 제거하여 현재 학습 흐름을 방해하지 않음
- 교육과정/정책/presentation 데이터 변경 없음

## 9.0.21-study-rc.1
- 우측 지연 재인출 카드를 **v8의 `다시 꺼내기` 패널 형태**로 재설계
- 카드 클릭 시 더 이상 원래 학습 페이지/문제로 이동하지 않음
- 카드 안에서 `출처 메타 → 원문 문맥 빈칸 → 답 입력 → 확인 / 나중에 → 즉시 피드백`까지 완결
- 정답이면 `회복 완료 ✓` 후 카드 제거
- near/모름/오답이면 카드 안에서 공식 정답을 보여주고 몇 항목 뒤 다시 예약
- 복수 카드는 기존처럼 우측에 살짝 겹쳐 쌓이고 hover/focus 시 해당 카드 전체 노출
- 지식·이해/순서 무관 목록형 재인출은 한 카드에서 **해당 목록 전체**를 다시 입력
- 복습 탭의 지연 재인출 항목을 눌러도 같은 우측 카드가 열리며 본문 문맥을 바꾸지 않음
- 메인 학습 포커스/스크롤/입력 상태를 건드리지 않음
- 교육과정/정책/presentation 데이터 변경 없음

## 9.0.20-study-rc.1
- `복습` 탭 복원
- 복습 탭에 `지연 재인출`과 `취약 항목` 목록 제공
- 오답 지연 재인출이 더 이상 현재 입력을 자동 중단하거나 강제로 포커스를 빼앗지 않음
- 재인출 시점이 되면 화면 우측에 작은 카드로 표시
- 여러 카드는 세로로 살짝 겹쳐 쌓이고, hover/focus 시 해당 카드가 앞으로 나오며 전체가 보임
- 카드 클릭 시 원래 학교급/영역/출제항목/회상방식/문제 문맥으로 돌아가 해당 빈칸만 비우고 다시 풀이
- 카드가 뜬 상태에서도 현재 문제를 계속 풀 수 있음
- 복습 탭의 취약 항목을 누르면 해당 원문 문맥으로 이동
- 기존 3답 지연 기준, 채점 엔진, 입력값 저장, round 독립 저장 유지
- 교육과정/정책/presentation 데이터 변경 없음

## 9.0.19-study-rc.1
- inline 빈칸 최소/최대 폭과 높이를 확대해 답 입력 공간을 넓힘
- 개별 Enter 오답/모름/near에 대해 **field-level delayed retry** 추가
- 기본 3개의 다른 답을 채점한 뒤 해당 오답 칸을 비우고 `다시` 상태로 자동 재제시
- 재제시 시 해당 칸으로 자동 focus + 중앙 smooth scroll
- 정답 처리하면 해당 field retry 예약을 취소
- retry 상태를 localStorage에 저장해 새로고침에도 유지
- 개별 Enter 채점 시 화면 하단 전역 `오답 · 정답 ...` 메시지 제거
- 전체 `채점` 버튼은 기존처럼 전체 결과 요약을 표시
- 기존 task-level retry는 유지하되 field-level 재인출이 먼저 체감되도록 보완
- 교육과정/정책/presentation 데이터 변경 없음

## 9.0.18-study-rc.1
- 정답 처리된 입력칸의 글자색을 진한 녹색으로 변경
- 정답 배경을 더 선명한 연녹색으로 조정
- 정답 테두리/밑줄도 녹색 계열로 통일
- near는 황갈색, wrong은 적갈색 글자색으로 상태 구분 강화
- 채점 로직/교육과정 데이터/정책 변경 없음

## 9.0.17-ux-restoration.1
- v8 채점 엔진의 핵심을 복원: correct / near / unknown / wrong 4상태
- 공백·문장부호 정규화, 조사 차이, 제한적 유사 표현, Levenshtein, 한글 자모 오타 판정 복원
- 짧은 공식 용어는 보수적으로 판정하고 near는 정답으로 승격하지 않음
- 오답/near/미입력 즉시 정답 표시 복원
- Enter는 현재 입력칸만 채점; 정확이면 다음 미완료 칸으로 자동 이동
- Tab / Shift+Tab 이동 시 다음 입력칸을 화면 중앙으로 smooth scroll
- 첫 클릭 전체 선택, 두 번째 클릭부터 커서 위치 선택 유지
- 입력 중 답안과 필드별 판정 localStorage 저장/복원
- 답안을 수정하면 기존 판정 자동 해제
- 학습 범위별 round와 마지막 task를 독립 저장
- `원문 출처` 버튼을 모드 행 우측 끝으로 복원
- 화면 최하단에 현재 문서/과목/영역/출제항목/성취기준 번호 provenance 상시 표시
- 빈칸 폭을 답 길이에 비례시키고 near/unknown/wrong/correct 시각 상태와 간격을 재디자인
- 기존 v9 내용체계 표, 지식·이해 전체회상, 성취기준 composite 구조 유지
- curriculum/policy/presentation 데이터 변경 없음

## 9.0.16-study-rc.1
- Enter 키는 더 이상 화면 전체를 채점하지 않고 **현재 입력칸 하나만 채점**
- `채점` 버튼은 기존처럼 현재 문제 전체 채점
- 지식·이해처럼 순서 무관 목록형 답은 Enter 채점 시 해당 범주의 정답 집합과 대조
- 이미 다른 입력칸에서 정답 처리한 동일 답을 다시 입력하면 `중복` 처리
- inline cloze는 현재 빈칸의 `data-answer`만 검사
- Tab / Shift+Tab 이동, 첫 클릭 전체선택, 두 번째 클릭부터 커서 배치, IME 보호 유지
- 공식 curriculum/policy/presentation 데이터 변경 없음

## 9.0.15-study-rc.1
- `내용체계 + 성취기준`을 영역당 **한 composite 화면**으로 수정
- 내용체계 전체 표 아래에 성취기준을 같은 문제에서 함께 표시
- 단일/실전/전체 회상 모두 같은 composite 화면 유지
- 성취기준도 선택한 회상 방식에 맞춰 빈칸 밀도 적용
- 특정 영역 드롭다운에서 `성취기준` 단독 항목 사용 가능 여부를 behavior QA로 고정
- 공식 curriculum/policy/presentation 데이터 변경 없음

## 9.0.14-study-rc.1
- 버전 표기를 CurriLoop 제목 우측 인라인으로 이동해 상단 높이 축소
- `내용체계`는 단일/실전/전체 회상 모두 영역당 표 1개를 유지
- 단일 회상: production 가능한 각 비지식·이해 line에서 single presentation unit 1개씩 빈칸
- 실전 조합: production 가능한 각 비지식·이해 line에서 representative practical set을 동시에 빈칸
- 전체 회상: production 가능한 각 비지식·이해 line의 presentation unit 전체를 동시에 빈칸
- 지식·이해: 난이도와 무관하게 해당 영역 항목 전체를 통째로 입력
- C/X-only 항목은 표에는 보이되 production 빈칸으로 강제하지 않음
- `통짜 회상` 명칭을 `전체 회상`으로 변경
- v9.0.12 입력 UX(Enter 채점, Tab 이동, 첫 클릭 전체선택) 유지
- v9.0.13 배포 캐시 방지(no-store, 기존 SW/cache 정리) 유지
- 공식 curriculum/policy/presentation 데이터 변경 없음

## 9.0.13-deploy-safe.1
- v9.0.11/v9.0.12 content-system table scaffold behavior preserved
- Service Worker registration disabled during Study RC
- any existing CurriLoop Service Worker registration is unregistered on load
- existing `curriloop-*` Cache Storage entries are deleted on load
- service-worker.js now self-retires and clears old CurriLoop caches
- Vercel `Cache-Control: no-store` added for RC deployment
- `BUILD_ID.txt` added for immediate deployed-build verification
- curriculum/policy/presentation data unchanged

## 9.0.12-study-rc.1
- 답 입력칸에서 Enter 키로 즉시 채점
- 한글 IME 조합 확정 Enter는 채점으로 오인하지 않도록 `isComposing`/229 보호
- Tab / Shift+Tab은 브라우저 기본 입력 순서 이동 유지
- 각 입력칸의 첫 클릭은 입력값 전체 선택
- 같은 입력칸의 두 번째 클릭부터는 클릭한 위치에 커서 배치
- Shift+Enter는 textarea에서 줄바꿈 용도로 보존
- 공식 교육과정/정책/빈칸 데이터 변경 없음

## 9.0.11-study-rc.1
- `내용체계`의 단일/실전/통짜 회상을 모두 동일한 전체 표 scaffold 위에서 실행
- 단일 회상: 표 전체를 보여주고 한 recall unit만 빈칸
- 실전 조합: 표 전체를 보여주고 해당 line의 practical cloze set만 빈칸
- 지식·이해: 어느 회상 방식에서도 해당 영역 목록 전체를 한 번에 회상
- 통짜 회상: production 대상 내용 요소 전체를 한 번에 회상
- C/X-only 항목은 표에 보이되 production 빈칸으로 강제하지 않음
- `내용체계 + 성취기준`의 단일/실전에서도 내용체계 부분은 동일한 표 task를 재사용
- 공식 curriculum/policy 데이터 변경 없음

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

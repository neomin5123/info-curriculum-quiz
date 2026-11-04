# CurriLoop Build 2026.10.19-01 — 교교론 정답 1차 감사

## 기준선
- 입력: `CurriLoop-20261018-build03-full-part1-app-data.zip` (41개 파일), `...part2-tools-audits.zip` (72개 파일)
- 합본 113개 파일, 중복 0개, `npm test` 기준선 PASS
- Build 2026.10.18-03 / 269문항 / 기존 답안 6개 / 교교론 74문항
- 교육과정 공식 270 lines, presentation 370 units

## 정답 변경
- 추가된 답안은 교교론 2014년 6문항, 2016년 5문항 = 11문항
- 2014: A-01, A-02, A-03, A-11, A-12, B-05
- 2016: A-01, A-09, A-10, B-01, B-08
- 전체 풀이 6 → 17 / 미수록 263 → 252 / 교교론 1 → 12 (74개 중 62개 남음)
- 원문 PDF에서 모든 대상 문항을 대조하였고, 그림이 필요한 `2016-B-01`은 17쪽의 전체 순서도/스크래치 블록을 확인
- `2016-A-09`는 문제에 명시된 법률 제12137호의 제5조·제25조·제36조·제37조 등 당시 조문을 기준으로 판단
- `2014-B-05` 및 `2016-B-08`은 복수 답안 가능성이 있는 논술/수업 설계이므로 단정적 공식 답으로 간주하지 않음
- 새 답안은 `verification.status=derived`, `officialAnswerConfirmed=false`, `checkedAgainst=original-question-pdf`
- 기존 풀이 6개는 고정 해시로 보존 검증

## 출처 / 주의
- 사용자 제공 원문 `전공 기출_260921_105741.pdf`
- 당시 저작권법 본문: https://wipolex-resources-eu-central-1-358922420655.s3.amazonaws.com/edocs/lexdocs/laws/ko/kr/kr219ko.pdf
- 기출 공식 정답지는 제공되지 않았으므로 공식 정답 대조/승인이 수행된 것은 아님
- 기존 과목/주제 분류는 자동 분류 단계이며 전수 검수로 보지 않음
- Browser E2E: 미실행

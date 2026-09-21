"use strict";
// CurriLoop production practice bank: single source of truth.
window.CURRILOOP_PRACTICE_BANK = {
  "meta": {
    "version": "exam-paper-structured-2.4-v7",
    "created": "2026-09-21",
    "policy": "Quality-first rebuild. Learner-facing items must imitate teacher-exam document structure, not merely curriculum content.",
    "questionCount": 31,
    "fourPointCount": 24,
    "twoPointCount": 7,
    "scoringRule": "Every grading unit is exactly 1 point. A task may contain multiple 1-point semantic units for partial credit.",
    "rulesVersion": "1.6",
    "learnerFacingTaxonomy": false,
    "difficultyLabels": false,
    "target": "no-fixed-count",
    "qualityGate": "Cross-document linkage + source-layer precision + concrete CS/data processing + atomic 1-point scoring + historical-archetype coverage + curriculum-transition evidence + post-grade explanation + 20-point exact-score set composition.",
    "rebuildFrom": "v6.18.0 ExamLike Core 41",
    "rebuildStatus": "v7.4 Curriculum Transition. Existing 30 items retained; EX-031 added for 2015↔2022 programming transition comparison, backed by a separate 2015 transition reference corpus and explicit mapping metadata.",
    "quarantinePolicy": "All unreworked v6.18 production items remain candidates outside learner-facing production until rewritten and re-audited.",
    "explanationPolicy": "After grading, explanation modal shows per-1-point correctness, canonical answer/rationale, curriculum source layers, exam focus, and confusion notes. Hidden before exam-set submission.",
    "examSetPolicy": "Compose an exact 20-point set. Prefer a mixed 4pt/2pt profile when the filtered pool permits; question count is derived from the point composition, not fixed."
  },
  "questions": [
    {
      "questionId": "EX-001",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-02-AC-ST-01",
        "HI-02-AC-CO-01"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 교육과정에 따라 ‘데이터’ 영역의 수업을 계획하는 교사들의 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 성취기준과 교사 대화\n[12정02-01] 디지털 데이터 ( ㉠ )의 개념과 필요성을 이해하고, ( ㉠ )의 효율성을 분석하여 평가한다.\n\nA교사: 먼저 간단한 문자열로 원리를 확인하고, 서로 다른 문자열에서 결과 길이가 어떻게 달라지는지 비교하게 하겠습니다.\nB교사: 압축 결과를 만드는 것뿐 아니라 효율을 판단하는 활동까지 연결해야겠군요.\n\n(나) 활동지\n문자열 str = \"AAABBBBCC\"\n규칙: 같은 문자가 연속되면 ‘문자+반복 횟수’로 표현한다. 예) DDDDD → D5\n\n(다) 최소 성취수준 지원안\n프로그래밍 수행이 어려운 학생에게는 압축 기능이 미리 작성된 코드를 제공한다. 후속 활동 후보는 다음과 같다.\nㄱ. 서로 다른 문자열 데이터를 코드에 입력해 본다.\nㄴ. 입력에 따른 출력 결과의 차이를 분석한다.\nㄷ. 실행 결과는 확인하지 않고 코드를 그대로 베껴 쓴다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 성취기준에 근거하여 (가)의 ㉠에 들어갈 용어를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 규칙을 적용했을 때 출력되는 압축 문자열을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 후속 활동으로 적절한 것 두 개를 기호로 쓰시오.",
          "points": 2
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-㉠",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "압축",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[12정02-01]은 디지털 데이터 압축의 개념·필요성과 압축 효율 분석을 요구한다.",
          "requiredConcepts": [
            "압축"
          ]
        },
        {
          "unitId": "b-압축 결과",
          "taskId": "b",
          "label": "압축 결과",
          "points": 1,
          "key": "A3B4C2",
          "acceptedVariants": [
            "A3 B4 C2"
          ],
          "forbiddenConfusions": [],
          "rationale": "연속 길이 부호화 규칙을 적용하면 A3B4C2가 된다."
        },
        {
          "unitId": "c-후속 ①",
          "taskId": "c",
          "label": "후속 활동 ①",
          "points": 1,
          "key": "ㄱ",
          "acceptedVariants": [
            "1",
            "①"
          ],
          "forbiddenConfusions": [],
          "rationale": "공식 고려 사항은 미리 작성된 코드에 데이터를 직접 입력하는 활동을 제시할 수 있다고 한다.",
          "requiredConcepts": [
            "ㄱ"
          ]
        },
        {
          "unitId": "c-후속 ②",
          "taskId": "c",
          "label": "후속 활동 ②",
          "points": 1,
          "key": "ㄴ",
          "acceptedVariants": [
            "2",
            "②"
          ],
          "forbiddenConfusions": [],
          "rationale": "입력에 따라 출력되는 결과를 분석하는 활동까지 이어져야 최소 성취수준 지원이 단순 모방에 그치지 않는다.",
          "requiredConcepts": [
            "ㄴ"
          ]
        }
      ],
      "explanation": "㉠은 ‘압축’이다. AAABBBBCC에 연속 길이 부호화 규칙을 적용하면 A3B4C2가 된다. 최소 성취수준 지원에서는 미리 작성된 코드를 주는 것에서 끝내지 않고, 학생이 데이터를 입력하고 출력 결과를 분석하게 해야 하므로 ㄱ과 ㄴ이 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "데이터"
      ],
      "sections": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "데이터"
        }
      ],
      "explanationDetail": {
        "examPoint": "성취기준 빈칸, 실제 알고리즘 적용, 성취기준 적용 시 고려 사항을 세 자료에 분산시켜 연결한다. 2점짜리 마지막 답도 ㄱ·ㄴ을 각각 1점으로 독립 채점한다.",
        "watchOut": "코드 제공 자체는 이미 (다)에 주어진 조건이다. 답은 그 이후 학생이 수행해야 하는 데이터 입력과 출력 결과 분석이다."
      }
    },
    {
      "questionId": "EX-002",
      "curriculumVersion": "2022",
      "sourceIds": [
        "AI-02-AC-ST-03",
        "AI-02-AC-EX-03",
        "AI-02-AC-ST-04",
        "AI-TE-EVD-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설",
        "평가의 방향"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘인공지능 기초’ 과목의 수업을 협의하는 교사들의 대화와 평가 계획이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 교사 대화\nA교사: 과일의 무게, 당도, 색상과 품종 레이블이 있는 데이터를 사용하려고 합니다.\nB교사: 데이터를 ( ㉠ ) 데이터와 ( ㉡ ) 데이터로 나누고, k-NN으로 품종을 예측해 보면 좋겠습니다.\nA교사: 레이블이 있는 사례를 바탕으로 새로운 과일의 품종을 예측하므로 ㉢에 해당하겠군요.\n\n(나) 수업 절차\n① ( ㉠ ) 데이터로 모델을 학습한다.\n② 새로운 과일의 품종을 예측한다.\n③ ( ㉡ ) 데이터로 성능을 확인한다.\n\n(다) 평가 체크리스트\nㄱ. 파이썬 문법을 오류 없이 작성했는가?\nㄴ. 사용한 라이브러리의 내부 알고리즘을 직접 구현했는가?\nㄷ. 데이터가 학습과 평가에 어떻게 사용되는지 설명했는가?\nㄹ. 예측 결과를 해석하고 인공지능의 활용과 연결했는가?\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가), (나)의 ㉠과 ㉡에 들어갈 용어를 순서대로 쓰시오.",
          "points": 2
        },
        {
          "id": "b",
          "prompt": "2022 개정 ‘인공지능 기초’의 ‘인공지능과 학습’ 영역 성취기준 해설에 근거하여 ㉢에 해당하는 기계학습 유형을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 ‘인공지능 기초’의 ‘평가의 방향’에 근거하여 프로그래밍 문법이나 라이브러리 내부 구현보다 평가의 중심에 둘 내용을 한 가지 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-㉠",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "훈련 데이터",
          "acceptedVariants": [
            "학습 데이터"
          ],
          "forbiddenConfusions": [],
          "rationale": "모델을 학습시키는 데 사용하는 데이터이다.",
          "requiredConcepts": [
            "훈련 데이터"
          ]
        },
        {
          "unitId": "a-㉡",
          "taskId": "a",
          "label": "㉡",
          "points": 1,
          "key": "테스트 데이터",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "학습이 끝난 모델의 성능을 확인하는 데 사용하는 데이터이다.",
          "requiredConcepts": [
            "테스트 데이터"
          ]
        },
        {
          "unitId": "b-㉢",
          "taskId": "b",
          "label": "㉢",
          "points": 1,
          "key": "지도학습",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "레이블이 있는 사례로 분류 모델을 학습하므로 지도학습이다.",
          "requiredConcepts": [
            "지도학습"
          ]
        },
        {
          "unitId": "c-평가 초점",
          "taskId": "c",
          "label": "평가 초점",
          "points": 1,
          "key": "인공지능의 구현과 활용",
          "acceptedVariants": [
            "인공지능 활용에 대한 인식"
          ],
          "forbiddenConfusions": [],
          "rationale": "공식 평가 방향은 프로그래밍 내용 자체보다 인공지능의 구현과 활용, 인공지능 활용에 대한 인식에 초점을 맞추도록 한다.",
          "requiredConcepts": [
            "인공지능",
            "활용"
          ]
        }
      ],
      "explanation": "㉠은 훈련 데이터, ㉡은 테스트 데이터이며 레이블이 있는 데이터를 이용한 분류는 지도학습이다. 평가는 파이썬 문법이나 라이브러리 내부 구현 자체보다 인공지능의 구현과 활용 또는 인공지능 활용에 대한 인식을 중심에 둔다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.1-exam-paper-audit-v710",
      "subjects": [
        "ai-basic"
      ],
      "areas": [
        "인공지능과 학습"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설",
        "평가의 방향"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "ai-basic",
          "area": "인공지능과 학습"
        }
      ],
      "explanationDetail": {
        "examPoint": "교사 대화와 수업 절차의 빈칸을 연결한 뒤, 평가 체크리스트에서 교육과정상 중심 항목을 선별한다.",
        "watchOut": "‘학습 데이터’는 훈련 데이터의 허용 표현이지만 테스트 데이터와 혼동하면 안 된다. 마지막 1점은 체크리스트 두 항목을 한꺼번에 쓰는 문제가 아니라 교육과정이 요구하는 평가 초점 하나를 정확히 쓰는 항목이다."
      }
    },
    {
      "questionId": "EX-003",
      "curriculumVersion": "2022",
      "sourceIds": [
        "IS-03-AC-ST-03",
        "IS-03-AC-ST-04",
        "IS-03-AC-ST-05",
        "IS-03-AC-EX-02",
        "IS-03-AC-EX-03"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘정보과학’ 과목의 알고리즘 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 문제 해결 사례\nA: 큰 정렬 문제를 두 부분으로 나누어 각각 해결한 뒤 결과를 합쳐 전체 정렬 결과를 만든다.\nB: 계단 오르기 문제에서 같은 작은 문제가 반복 계산되므로 이미 구한 f(k)의 값을 배열 memo[k]에 저장하고 다시 사용한다.\n\n(나) B의 의사코드 일부\nf(n):\n  if n <= 2 return n\n  if memo[n] != -1 return memo[n]\n  memo[n] = f(n-1) + f(n-2)\n  return memo[n]\n\n(다) 관찰 평가 체크리스트\n1. 전체 문제를 부분 문제로 분해했는가?\n2. 전체 문제와 부분 문제의 관계를 발견했는가?\n3. B에서 ㉠을 통해 중복 계산을 줄였는가?\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "A와 B에 적용된 알고리즘 설계 기법을 순서대로 쓰시오.",
          "points": 2
        },
        {
          "id": "b",
          "prompt": "(나), (다)를 참고하여 ㉠에 들어갈 내용을 서술하시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "두 설계 기법을 적용하기 전에 2022 개정 ‘정보과학’ 성취기준이 공통적으로 요구하는 문제 분석 행동을 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-A 설계 기법",
          "taskId": "a",
          "label": "A 설계 기법",
          "points": 1,
          "key": "분할정복법",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "부분 문제를 해결한 결과를 이용해 전체 문제를 해결하는 대표적 설계 기법이다.",
          "requiredConcepts": [
            "분할정복법"
          ]
        },
        {
          "unitId": "a-B 설계 기법",
          "taskId": "a",
          "label": "B 설계 기법",
          "points": 1,
          "key": "동적계획법",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "중복되는 부분 문제의 답을 저장하여 재사용하는 방식은 동적계획법이다.",
          "requiredConcepts": [
            "동적계획법"
          ]
        },
        {
          "unitId": "b-㉠",
          "taskId": "b",
          "label": "㉠",
          "points": 1,
          "key": "중복되는 부분 문제의 답을 배열에 저장하여 재사용한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "성취기준 해설은 중복 계산되는 부분 문제들의 답을 저장해 효율을 높이는 원리를 제시한다.",
          "requiredConcepts": [
            "부분 문제",
            "답",
            "저장",
            "재사용"
          ]
        },
        {
          "unitId": "c-공통 분석 행동",
          "taskId": "c",
          "label": "공통 분석 행동",
          "points": 1,
          "key": "전체 문제를 부분 문제로 분해하고 전체 문제와 부분 문제의 관계를 발견한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[12정과03-03]은 전체 문제를 부분 문제로 분해하고 그 관계를 발견하도록 한다.",
          "requiredConcepts": [
            "부분 문제",
            "분해",
            "관계",
            "발견"
          ]
        }
      ],
      "explanation": "A는 큰 문제를 부분 문제로 나누어 해결한 뒤 결합하므로 분할정복법, B는 중복되는 부분 문제의 답을 저장해 다시 사용하므로 동적계획법이다. 두 전략 모두 적용 전에 전체 문제를 부분 문제로 분해하고 전체와 부분 문제의 관계를 발견하는 분석이 선행된다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "info-science"
      ],
      "areas": [
        "알고리즘"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "info-science",
          "area": "알고리즘"
        }
      ],
      "explanationDetail": {
        "examPoint": "사례·의사코드·평가 체크리스트를 함께 읽어 설계 기법과 선행 분석 행동을 연결한다.",
        "watchOut": "‘재귀를 사용한다’는 것만으로 동적계획법이 되는 것은 아니다. 중복 부분 문제의 답을 저장하고 재사용하는지가 핵심이다."
      }
    },
    {
      "questionId": "EX-004",
      "curriculumVersion": "2022",
      "sourceIds": [
        "MI-03-AC-ST-06",
        "MI-03-AC-ST-07",
        "MI-TE-EVD-02"
      ],
      "sourceType": [
        "성취기준",
        "평가의 방향"
      ],
      "stem": "다음은 2022 개정 중학교 정보과 교육과정에 따른 프로그래밍 수업 자료와 평가 계획이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 성취기준 일부\n[9정03-06] 논리 연산과 ( ㉠ )를 활용하여 문제를 해결하는 프로그램을 작성한다.\n[9정03-07] 프로그램 작성에서 함수를 활용하고 프로그램 수행 결과를 ( ㉡ )로 분석하여 오류를 수정한다.\n\n(나) 학생 프로그램\nfor dan in range(2, 10):\n    for n in range(1, 9):\n        print(dan, \"x\", n, \"=\", dan*n)\n\n학생은 구구단을 2단부터 9단까지, 각 단의 1~9 곱셈 결과가 모두 출력되도록 하려 한다.\n\n(다) 평가 계획\n평가 항목 ① 최종 출력 결과의 정확성\n평가 항목 ② 오류 원인에 대한 설명\n평가 항목 ③ 수정 전·후 코드와 수정 과정의 기록\n\n{{u:ⓐ A교사: 평가 시간을 줄이기 위해 ①만 남기고 ②, ③은 삭제하는 것이 어떨까요?}}\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 중학교 정보과 교육과정의 성취기준에 근거하여 ㉠, ㉡에 들어갈 용어를 순서대로 쓰시오.",
          "points": 2
        },
        {
          "id": "b",
          "prompt": "(나)의 프로그램이 목표대로 동작하도록 수정해야 할 부분을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 정보과 ‘평가의 방향’에 근거하여 밑줄 친 ⓐ를 수정해야 하는 이유를 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-㉠",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "중첩 제어 구조",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[9정03-06]은 논리 연산과 중첩 제어 구조를 활용하도록 한다.",
          "requiredConcepts": [
            "중첩 제어 구조"
          ]
        },
        {
          "unitId": "a-㉡",
          "taskId": "a",
          "label": "㉡",
          "points": 1,
          "key": "디버거",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[9정03-07]은 프로그램 수행 결과를 디버거로 분석하여 오류를 수정하도록 한다.",
          "requiredConcepts": [
            "디버거"
          ]
        },
        {
          "unitId": "b-코드 수정",
          "taskId": "b",
          "label": "코드 수정",
          "points": 1,
          "key": "안쪽 반복문의 범위를 range(1, 10)으로 수정한다",
          "acceptedVariants": [
            "range(1,10)"
          ],
          "forbiddenConfusions": [],
          "rationale": "현재 range(1,9)는 1~8까지만 반복하므로 9까지 포함하려면 stop 값을 10으로 해야 한다.",
          "requiredConcepts": [
            "range(1, 10)"
          ]
        },
        {
          "unitId": "c-평가 이유",
          "taskId": "c",
          "label": "평가 이유",
          "points": 1,
          "key": "과정·기능을 반영하고 오류를 분석·수정하는 과정을 중시하여 평가해야 한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [
            "최종 결과만"
          ],
          "rationale": "평가 내용은 지식·이해뿐 아니라 과정·기능 등을 다면적으로 반영하고 과정을 중시해야 한다.",
          "requiredConcepts": [
            "과정",
            "오류",
            "수정",
            "평가"
          ]
        }
      ],
      "explanation": "㉠은 중첩 제어 구조, ㉡은 디버거이다. 안쪽 반복문은 range(1, 10)으로 수정해야 1~9가 모두 출력된다. 평가에서는 최종 결과뿐 아니라 오류를 분석하고 수정하는 과정까지 반영해야 하므로 ②, ③과 같은 과정 자료를 제거해서는 안 된다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "middle-info"
      ],
      "areas": [
        "알고리즘과 프로그래밍"
      ],
      "sections": [
        "성취기준",
        "평가의 방향"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "middle-info",
          "area": "알고리즘과 프로그래밍"
        }
      ],
      "explanationDetail": {
        "examPoint": "성취기준 빈칸, 실제 코드 디버깅, 평가 계획의 적절성 판단이 연속된다.",
        "watchOut": "range의 두 번째 인자는 포함되지 않는다. 또한 ⓐ처럼 결과의 정확성만 남기면 [9정03-07]의 오류 분석·수정 과정과 과정·기능을 충분히 평가하지 못한다."
      }
    },
    {
      "questionId": "EX-005",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-01-AC-ST-03",
        "HI-TE-EVM-03"
      ],
      "sourceType": [
        "성취기준",
        "평가 방법"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 교육과정에 따라 스마트 온실의 사물인터넷 시스템을 설계하는 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 성취기준 일부\n[12정01-03] 문제 해결에 적합한 ( ㉠ ) 시스템 장치를 선택하여 사물인터넷 시스템을 설계한다.\n\n(나) 스마트 온실 요구사항과 장치 목록\n요구사항: 토양이 건조해지면 이를 자동으로 감지하여 물을 공급하고, 급수 중에는 경고등을 켠다.\n장치 목록: 토양 수분 센서, 조도 센서, 워터 펌프, LED, 버튼, 마이크로컨트롤러, 무선 통신 모듈\n\n설계표\n- 건조 상태 감지 장치: ( ㉡ )\n- 물 공급 장치: ( ㉢ )\n\n(다) 평가 자료 후보\n① 완성된 시스템의 최종 시연 영상만 제출\n② 설계 변경, 테스트 결과, 오류 수정 과정을 누적한 포트폴리오\n③ 장치 명칭을 외워 고르는 선택형 퀴즈만 실시\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 성취기준에 근거하여 (가)의 ㉠에 들어갈 용어를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 요구사항을 고려하여 ㉡과 ㉢에 들어갈 장치를 순서대로 쓰시오.",
          "points": 2
        },
        {
          "id": "c",
          "prompt": "2022 개정 정보과의 ‘평가 방법’에 근거하여 (다)에서 개발 과정을 평가하기에 가장 적절한 자료의 번호를 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-㉠",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "사물인터넷",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[12정01-03]은 문제 해결에 적합한 사물인터넷 시스템 장치를 선택해 시스템을 설계하도록 한다.",
          "requiredConcepts": [
            "사물인터넷"
          ]
        },
        {
          "unitId": "b-㉡",
          "taskId": "b",
          "label": "㉡",
          "points": 1,
          "key": "토양 수분 센서",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "토양의 건조 상태를 자동으로 감지해야 하므로 토양 수분 센서가 입력 장치로 적합하다.",
          "requiredConcepts": [
            "토양 수분 센서"
          ]
        },
        {
          "unitId": "b-㉢",
          "taskId": "b",
          "label": "㉢",
          "points": 1,
          "key": "워터 펌프",
          "acceptedVariants": [
            "물 펌프",
            "펌프"
          ],
          "forbiddenConfusions": [],
          "rationale": "건조 상태에서 실제로 물을 공급해야 하므로 워터 펌프가 출력 장치로 적합하다.",
          "requiredConcepts": [
            "워터 펌프"
          ]
        },
        {
          "unitId": "c-process-evidence",
          "taskId": "c",
          "label": "과정 평가 자료",
          "points": 1,
          "key": "②",
          "acceptedVariants": [
            "2",
            "②번"
          ],
          "forbiddenConfusions": [],
          "rationale": "설계·테스트·오류 수정의 누적 기록은 최종 산출물만이 아니라 개발 과정을 확인할 수 있는 포트폴리오 자료이다.",
          "requiredConcepts": [
            "②"
          ]
        }
      ],
      "explanation": "㉠은 ‘사물인터넷’이다. 토양의 건조 상태는 토양 수분 센서로 감지하고 실제 물 공급은 워터 펌프가 담당한다. 과정 평가에서는 최종 시연만 보는 것보다 설계 변경, 테스트, 오류 수정의 흔적을 누적한 ② 포트폴리오가 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "컴퓨팅 시스템"
      ],
      "sections": [
        "성취기준",
        "평가 방법"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "컴퓨팅 시스템"
        }
      ],
      "explanationDetail": {
        "examPoint": "성취기준 빈칸 → 요구사항에 따른 센서·액추에이터 선택 → 과정 평가 자료 판별로 이어진다. 평가 자료는 보기 중 하나로 제한해 정답 유일성을 높였다.",
        "watchOut": "LED는 급수 상태를 표시할 수 있지만 물을 공급하는 장치는 아니다. 최종 영상만으로는 설계·테스트·수정 과정을 충분히 확인하기 어렵다."
      }
    },
    {
      "questionId": "EX-006",
      "curriculumVersion": "2022",
      "sourceIds": [
        "DS-02-AC-ST-02",
        "DS-02-AC-CO-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘데이터 과학’ 과목의 데이터 전처리 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 원자료 일부\n학생 | 키(cm) | 하루 걸음 수 | 체온(℃)\nA | 150 | 7,300 | 36.5\nB | 170 | (비어 있음) | 36.7\nC | 190 | 8,100 | 300\n\n(나) 전처리 계획\n키는 min-max 정규화 (x-min)/(max-min)를 사용한다. 키의 최소값은 150, 최대값은 190이다.\n\n(다) 전처리 절차 후보\nA안: 결측·이상 여부를 확인 → 처리 → 시각화·요약 통계로 다시 확인 → 필요하면 처리 방법 수정\nB안: 결측·이상 여부를 확인 → 처리 → 처리 결과는 다시 점검하지 않고 바로 모델링\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)에서 탐색해야 할 결측치와 이상치를 각각 쓰시오.",
          "points": 2
        },
        {
          "id": "b",
          "prompt": "(나)의 식으로 키 170을 정규화한 값을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 ‘데이터 과학’의 ‘성취기준 적용 시 고려 사항’에 비추어 (다)의 A안과 B안 중 더 적절한 것을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-결측",
          "taskId": "a",
          "label": "결측치",
          "points": 1,
          "key": "B의 하루 걸음 수",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "값이 비어 있어 결측치에 해당한다.",
          "requiredConcepts": [
            "B",
            "걸음 수"
          ]
        },
        {
          "unitId": "a-이상",
          "taskId": "a",
          "label": "이상치",
          "points": 1,
          "key": "C의 체온 300℃",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "일반적인 체온 범위에서 크게 벗어난 값이므로 이상치로 점검해야 한다.",
          "requiredConcepts": [
            "C",
            "300"
          ]
        },
        {
          "unitId": "b-정규화",
          "taskId": "b",
          "label": "정규화 값",
          "points": 1,
          "key": "0.5",
          "acceptedVariants": [
            ".5",
            "1/2"
          ],
          "forbiddenConfusions": [],
          "rationale": "(170-150)/(190-150)=20/40=0.5이다."
        },
        {
          "unitId": "c-절차",
          "taskId": "c",
          "label": "적절한 절차",
          "points": 1,
          "key": "A안",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "전처리 후에도 데이터 오류·편향 가능성을 점검하고 필요하면 처리 방법을 조정하는 반복적 검증이 필요하다.",
          "requiredConcepts": [
            "A안"
          ]
        }
      ],
      "explanation": "결측치는 B의 하루 걸음 수이고, 체온 300℃는 이상치로 점검해야 한다. 170의 min-max 정규화 값은 0.5이다. 전처리는 한 번 적용하고 끝나는 작업이 아니라 처리 결과를 다시 확인하고 필요하면 수정하는 A안과 같은 반복적 검증 과정이 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "data-science"
      ],
      "areas": [
        "데이터 준비와 분석"
      ],
      "sections": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "data-science",
          "area": "데이터 준비와 분석"
        }
      ],
      "explanationDetail": {
        "examPoint": "표에서 실제 오류를 찾고 계산을 수행한 뒤, 두 전처리 절차 중 교육과정 취지에 맞는 것을 판별한다.",
        "watchOut": "이상치는 무조건 삭제한다는 뜻이 아니다. 먼저 오류인지 실제 극단값인지 확인하고, 처리 후 결과도 다시 검증해야 한다."
      }
    },
    {
      "questionId": "EX-007",
      "curriculumVersion": "2022",
      "sourceIds": [
        "DS-03-AC-ST-04",
        "DS-03-AC-EX-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘데이터 과학’ 과목에서 장바구니 데이터를 분석한 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 거래 자료\n전체 거래 100건\n기저귀 구매 40건\n물티슈 구매 50건\n기저귀와 물티슈 동시 구매 30건\n\n(나) 연관 규칙\n기저귀 → 물티슈\n지지도 = 동시구매 / 전체거래\n신뢰도 = 동시구매 / 기저귀구매\n향상도 = 신뢰도 / (물티슈구매 / 전체거래)\n\n(다) 학생 결론\n“세 지표를 계산한 숫자만 표에 쓰면 분석이 끝난다.”\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가), (나)를 이용하여 지지도와 신뢰도를 순서대로 계산하시오.",
          "points": 2
        },
        {
          "id": "b",
          "prompt": "향상도를 계산하시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 ‘데이터 과학’ 성취기준에 근거하여 (다)에 추가되어야 할 학습 행동을 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-지지도",
          "taskId": "a",
          "label": "지지도",
          "points": 1,
          "key": "0.30",
          "acceptedVariants": [
            "0.3",
            "30%"
          ],
          "forbiddenConfusions": [],
          "rationale": "30/100=0.30이다.",
          "requiredConcepts": [
            "0.30"
          ]
        },
        {
          "unitId": "a-신뢰도",
          "taskId": "a",
          "label": "신뢰도",
          "points": 1,
          "key": "0.75",
          "acceptedVariants": [
            "75%"
          ],
          "forbiddenConfusions": [],
          "rationale": "30/40=0.75이다.",
          "requiredConcepts": [
            "0.75"
          ]
        },
        {
          "unitId": "b-향상도",
          "taskId": "b",
          "label": "향상도",
          "points": 1,
          "key": "1.5",
          "acceptedVariants": [
            "1.50"
          ],
          "forbiddenConfusions": [],
          "rationale": "0.75/(50/100)=0.75/0.5=1.5이다."
        },
        {
          "unitId": "c-해석 행동",
          "taskId": "c",
          "label": "해석 행동",
          "points": 1,
          "key": "데이터 간 상호 연관성을 파악하고 연관 규칙 결과의 의미를 해석한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "성취기준은 데이터 간 관계와 상호 연관성을 파악한 뒤 결과의 의미를 해석하도록 한다.",
          "requiredConcepts": [
            "연관",
            "의미",
            "해석"
          ]
        }
      ],
      "explanation": "지지도는 30/100=0.30, 신뢰도는 30/40=0.75, 향상도는 0.75/(50/100)=1.5이다. 계산된 지표를 적는 것만으로 분석이 끝나는 것이 아니라, 지표가 나타내는 관계의 의미를 해석하여 의사결정에 활용할 수 있어야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "data-science"
      ],
      "areas": [
        "데이터 모델링과 평가"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "data-science",
          "area": "데이터 모델링과 평가"
        }
      ],
      "explanationDetail": {
        "examPoint": "하나의 거래 표에서 세 지표를 계산하고 마지막 1점에서 수치의 의미 해석이라는 교육과정 행동을 요구한다.",
        "watchOut": "신뢰도의 분모는 전체 거래가 아니라 선행항인 ‘기저귀 구매’ 건수이다. 향상도는 물티슈의 전체 구매 비율과 비교한다."
      }
    },
    {
      "questionId": "EX-008",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-03-CS-PF-02",
        "HI-03-AC-ST-03",
        "HI-03-AC-EX-02",
        "HI-03-AC-CO-02"
      ],
      "sourceType": [
        "내용 체계",
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 교육과정에 따른 탐색 알고리즘 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 내용 체계 일부\n범주: 과정·기능\n내용 요소: 알고리즘의 (            ㉠            )\n\n(나) 활동 자료\n오름차순으로 정렬된 1,023개의 학생 번호에서 특정 번호를 찾는다. 찾는 번호는 목록에 존재한다.\nA: 앞에서부터 하나씩 비교한다.\nB: 중앙값과 비교한 뒤 탐색 범위를 절반으로 줄인다.\n\n(다) 교사 대화\nA교사: A와 B의 효율 차이를 학생들이 직접 체감하게 하고 싶습니다.\nB교사: 그러면 10개 정도의 작은 자료만 사용해도 충분하겠죠?\n\n<조건>\nB는 각 단계에서 중앙값과 한 번 비교하며, 1,023 = 2^10 - 1이다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 ‘내용 체계’에 근거하여 (가)의 ㉠에 들어갈 내용을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)에서 최악의 경우 A의 비교 횟수를 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나)에서 최악의 경우 B의 비교 횟수를 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 B교사 발언을 수정하여 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-㉠",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "수행 과정 및 효율성 비교·분석하기",
          "acceptedVariants": [
            "수행 과정 및 효율성 비교 분석하기"
          ],
          "forbiddenConfusions": [],
          "requiredConcepts": [
            "수행 과정",
            "효율성",
            "비교",
            "분석"
          ],
          "rationale": "내용 체계의 과정·기능에는 ‘알고리즘의 수행 과정 및 효율성 비교·분석하기’가 제시된다."
        },
        {
          "unitId": "b-A 비교 횟수",
          "taskId": "b",
          "label": "A 비교 횟수",
          "points": 1,
          "key": "1023회",
          "acceptedVariants": [
            "1,023회",
            "1023"
          ],
          "forbiddenConfusions": [],
          "rationale": "순차 탐색은 찾는 값이 마지막에 있을 때 1,023번 비교한다."
        },
        {
          "unitId": "c-B 비교 횟수",
          "taskId": "c",
          "label": "B 비교 횟수",
          "points": 1,
          "key": "10회",
          "acceptedVariants": [
            "10"
          ],
          "forbiddenConfusions": [],
          "rationale": "2^10-1개의 원소에서 이진 탐색의 최악 비교 횟수는 10회이다."
        },
        {
          "unitId": "d-교수·학습 수정",
          "taskId": "d",
          "label": "교수·학습 수정",
          "points": 1,
          "key": "실제 대규모 데이터를 탐색하는 과정을 교수·학습에 충분히 포함해야 한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "requiredConcepts": [
            "대규모 데이터",
            "탐색",
            "교수",
            "학습"
          ],
          "rationale": "공식 고려 사항은 정렬·탐색 효율을 효과적으로 이해하도록 실제 대규모 데이터를 사용하는 과정을 충분히 포함하도록 한다."
        }
      ],
      "explanation": "내용 체계의 과정·기능은 알고리즘의 수행 과정 및 효율성을 비교·분석하는 것을 요구한다. 순차 탐색은 최악에 1,023회, 이진 탐색은 2^10-1개의 정렬 자료에서 최악 10회 비교한다. 두 알고리즘의 차이를 체감하려면 지나치게 작은 자료보다 규모가 충분한 자료를 사용하는 것이 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "알고리즘과 프로그래밍"
      ],
      "sections": [
        "내용 체계",
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "알고리즘과 프로그래밍"
        }
      ],
      "explanationDetail": {
        "examPoint": "내용 체계 인출 → 실제 비교 횟수 계산 → 교수·학습 조건 판단으로 이어지는 세 층의 문제다.",
        "watchOut": "이진 탐색은 정렬된 자료라는 전제가 필요하다. 1,023=2^10-1이므로 최악 비교 횟수는 10회이다."
      }
    },
    {
      "questionId": "EX-009",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-04-AC-ST-03",
        "HI-04-AC-EX-02",
        "HI-04-AC-CO-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 교육과정의 ‘인공지능’ 영역 수업을 협의하는 교사들의 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 후보 과제\n① 사진 속 폐기물을 종이·캔·플라스틱으로 구분하기\n② 세율표와 과세표준이 주어졌을 때 정해진 공식대로 세금 계산하기\n\n(나) 교사 대화\nA교사: 두 과제 중 데이터로부터 규칙을 학습하는 방식이 더 필요한 문제를 선택하게 하겠습니다.\nB교사: 선택한 문제는 회귀·분류·군집 중 어떤 유형으로 모델링할지도 판단하게 하지요.\n\n(다) 실습 도구 선택안\nA안: 작은 예제로 알고리즘 원리를 확인한 뒤에도 수업 대부분을 라이브러리 내부 함수와 학습 알고리즘을 직접 구현하는 데 사용한다.\nB안: 교육용 또는 범용 기계학습 도구를 활용해 데이터 준비, 모델 선택, 결과 해석과 문제 해결에 집중한다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)에서 기계학습 적용 대상으로 더 적합한 과제의 번호를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "선택한 과제에 적용할 기계학습 유형을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 A안과 B안 중 더 적절한 것을 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "같은 근거에 따라 실습에서 학생이 집중해야 할 학습 초점을 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-과제",
          "taskId": "a",
          "label": "과제",
          "points": 1,
          "key": "①",
          "acceptedVariants": [
            "1",
            "①번"
          ],
          "forbiddenConfusions": [],
          "rationale": "사진의 특징을 데이터로부터 학습해 범주를 예측하는 문제이므로 기계학습 적용이 적합하다."
        },
        {
          "unitId": "b-유형",
          "taskId": "b",
          "label": "기계학습 유형",
          "points": 1,
          "key": "분류",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "종이·캔·플라스틱처럼 미리 정해진 범주 중 하나를 예측하므로 분류이다.",
          "requiredConcepts": [
            "분류"
          ]
        },
        {
          "unitId": "c-도구",
          "taskId": "c",
          "label": "실습안",
          "points": 1,
          "key": "B안",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "교육과정은 기계학습의 내부 구현 자체보다 적절한 도구를 활용해 문제 해결 과정을 경험하도록 하는 데 초점을 둔다.",
          "requiredConcepts": [
            "B안"
          ]
        },
        {
          "unitId": "d-초점",
          "taskId": "d",
          "label": "학습 초점",
          "points": 1,
          "key": "데이터와 기계학습 모델을 활용하여 문제를 해결하고 결과를 해석하는 과정",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "데이터 준비·모델 선택·결과 해석 등 기계학습을 활용한 문제 해결 과정에 초점을 두어야 한다.",
          "requiredConcepts": [
            "데이터",
            "모델",
            "결과",
            "해석"
          ]
        }
      ],
      "explanation": "①은 사진을 세 범주 중 하나로 예측하는 분류 문제이므로 기계학습 적용이 적합하다. 실습에서는 내부 수식과 알고리즘을 모두 직접 구현하는 것보다 적절한 도구를 사용해 데이터와 모델을 선택하고 결과를 해석하는 문제 해결 과정에 집중하는 B안이 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "인공지능"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "인공지능"
        }
      ],
      "explanationDetail": {
        "examPoint": "기계학습 적용 가능성 → 분류 유형 → 실습 도구 선택 → 교육과정상 학습 초점을 연쇄적으로 판단한다. 두 실습안 모두 일부 장점이 있지만 무엇을 수업의 중심에 둘지 교육과정 근거로 결정해야 한다.",
        "watchOut": "규칙이 완전히 주어진 계산 문제와 데이터로부터 패턴을 학습해야 하는 문제를 구분해야 한다. ‘분류’와 ‘군집’도 레이블 유무를 기준으로 구별한다."
      }
    },
    {
      "questionId": "EX-010",
      "curriculumVersion": "2022",
      "sourceIds": [
        "DS-04-AC-ST-05",
        "DS-04-AC-EX-02",
        "DS-04-AC-CO-04",
        "DS-TE-MET-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항",
        "교수·학습 방법"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘데이터 과학’ 과목의 프로젝트 결과와 수업 협의 내용이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 프로젝트 결과\n학생들은 지역별 대중교통 수요 예측 모델을 만들었다. 전체 정확도는 높았지만, 과거 운행이 적었던 C지역의 수요를 지속적으로 낮게 예측하였다.\n\n(나) 학생 대화\n학생 A: 전체 정확도가 높으니 모델을 그대로 공개하자.\n학생 B: 과거 데이터가 특정 지역에 불리하게 작용했는지 살펴봐야 하지 않을까?\n\n(다) 교사 계획\n결과 공개 여부는 각 모둠이 개별적으로 결정하고, 다른 학생과의 토의·토론은 생략한다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가), (나)에서 프로젝트 종료 전에 성찰해야 할 문제를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "2022 개정 ‘데이터 과학’ 성취기준 해설에 근거하여 성찰 후 수행해야 할 조치를 서술하시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 ‘데이터 과학’의 교수·학습 방법에 근거하여 (다)에 추가해야 할 학습 방법을 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "그 학습 과정에서 판단해야 할 내용을 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-성찰 문제",
          "taskId": "a",
          "label": "성찰 문제",
          "points": 1,
          "key": "데이터와 모델의 편향이 초래하는 사회적·윤리적 영향",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[12데과04-05]는 분석 과정의 사회적 영향과 윤리 문제를 성찰하도록 한다.",
          "requiredConcepts": [
            "편향",
            "사회적",
            "윤리적"
          ]
        },
        {
          "unitId": "b-성찰 후 조치",
          "taskId": "b",
          "label": "성찰 후 조치",
          "points": 1,
          "key": "필요하면 데이터 모델을 수정한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "성취기준 해설은 사회적·윤리적 문제를 성찰한 후 데이터 모델을 수정하도록 한다.",
          "requiredConcepts": [
            "모델",
            "수정"
          ]
        },
        {
          "unitId": "c-학습 방법",
          "taskId": "c",
          "label": "학습 방법",
          "points": 1,
          "key": "토의·토론",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "교수·학습 방법은 데이터 편향성·윤리 문제를 토의·토론을 통해 판단하도록 한다.",
          "requiredConcepts": [
            "토의",
            "토론"
          ]
        },
        {
          "unitId": "d-판단 내용",
          "taskId": "d",
          "label": "판단 내용",
          "points": 1,
          "key": "결과의 사회적 영향과 파급력을 고려하여 활용·공유 방안을 의사 결정한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "프로젝트에서 생산한 정보의 사회적 영향과 파급력을 논의하고 활용 방안을 탐색하도록 한다.",
          "requiredConcepts": [
            "사회적 영향",
            "파급력",
            "활용",
            "의사 결정"
          ]
        }
      ],
      "explanation": "전체 정확도가 높더라도 특정 지역에 지속적으로 불리한 예측이 나타나면 데이터나 모델의 편향 가능성을 성찰해야 한다. 그 결과에 따라 데이터 구성이나 모델을 수정·보완하고, 다른 학생들과 토의·토론하여 결과의 의미와 사회적 활용의 타당성을 판단해야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "data-science"
      ],
      "areas": [
        "데이터 과학 프로젝트"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항",
        "교수·학습 방법"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "data-science",
          "area": "데이터 과학 프로젝트"
        }
      ],
      "explanationDetail": {
        "examPoint": "모델 성능 수치 하나만 보는 것이 아니라 편향 발견 → 수정 → 토론 → 사회적 활용 판단의 프로젝트 흐름을 묻는다.",
        "watchOut": "‘정확도가 높다’는 사실만으로 모든 집단에 공정한 모델이라고 결론 내릴 수 없다."
      }
    },
    {
      "questionId": "EX-011",
      "curriculumVersion": "2022",
      "sourceIds": [
        "AI-01-AC-ST-04",
        "AI-01-AC-EX-02",
        "AI-TE-MET-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설",
        "교수·학습 방법"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘인공지능 기초’ 과목에서 A* 탐색을 적용하는 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 활동지\nA* 탐색의 평가함수는 f(n)=g(n)+h(n)이며 f값이 작은 후보를 다음에 선택한다.\n\n후보 | g(n) | h(n)\nA | 2 | 5\nB | 4 | 1\n\n(나) 교사 대화\nA교사: 학생들은 탐색 원리는 이해하지만 우선순위 큐 구현에서 계속 막힙니다.\nB교사: 탐색의 개념과 문제 해결 과정에 집중하도록 교육과정의 교수·학습 방법을 적용해 봅시다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)에서 A와 B의 f값을 순서대로 쓰시오.",
          "points": 2
        },
        {
          "id": "b",
          "prompt": "다음에 선택되는 후보 노드를 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 ‘인공지능 기초’의 교수·학습 방법에 근거하여 (나)의 문제를 해결할 수 있는 지원 방안을 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-A의 f값",
          "taskId": "a",
          "label": "A의 f값",
          "points": 1,
          "key": "7",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "2+5=7이다.",
          "requiredConcepts": [
            "7"
          ]
        },
        {
          "unitId": "a-B의 f값",
          "taskId": "a",
          "label": "B의 f값",
          "points": 1,
          "key": "5",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "4+1=5이다.",
          "requiredConcepts": [
            "5"
          ]
        },
        {
          "unitId": "b-선택 노드",
          "taskId": "b",
          "label": "선택 노드",
          "points": 1,
          "key": "B",
          "acceptedVariants": [],
          "forbiddenConfusions": [
            "A"
          ],
          "rationale": "f값이 더 작은 B를 다음 후보로 선택한다.",
          "requiredConcepts": [
            "B"
          ]
        },
        {
          "unitId": "c-지원 방안",
          "taskId": "c",
          "label": "지원 방안",
          "points": 1,
          "key": "인공지능 관련 소프트웨어나 라이브러리를 활용하여 구현 부담을 줄이고 탐색 개념과 문제 해결에 집중하게 한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "교수·학습 방법은 관련 소프트웨어·라이브러리를 적극 활용하여 최소 성취수준을 보장하도록 한다.",
          "requiredConcepts": [
            "라이브러리",
            "구현",
            "탐색",
            "문제 해결"
          ]
        }
      ],
      "explanation": "A의 f값은 2+5=7, B는 4+1=5이므로 다음 선택 노드는 B이다. 학생이 우선순위 큐 구현 자체에서 막힌다면 탐색 원리와 문제 해결 과정에 집중할 수 있도록 미리 작성된 코드, 시각화 도구 또는 단계화된 자료를 제공하는 방식이 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "ai-basic"
      ],
      "areas": [
        "인공지능의 이해"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설",
        "교수·학습 방법"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "ai-basic",
          "area": "인공지능의 이해"
        }
      ],
      "explanationDetail": {
        "examPoint": "탐색 평가함수 계산과 교수·학습 지원 판단을 결합한다.",
        "watchOut": "A*는 h(n)만 비교하는 탐욕적 탐색이 아니다. g(n)+h(n)을 사용한다."
      }
    },
    {
      "questionId": "EX-012",
      "curriculumVersion": "2022",
      "sourceIds": [
        "IS-04-AC-ST-04",
        "IS-04-AC-ST-05",
        "IS-TE-EVD-02"
      ],
      "sourceType": [
        "성취기준",
        "평가의 방향"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘정보과학’ 프로젝트의 프로그램 테스트 결과와 평가 계획이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 재난 대피 경로 프로그램 테스트\n입력 1: 예상 12분 / 실제 12분\n입력 2: 예상 ‘경로 없음’ / 실제 프로그램 오류\n입력 3: 예상 8분 / 실제 8분\n\n(나) 교사 평가 계획\nⓐ {{u:최종 발표 화면의 완성도와 시각적 구성만 평가하고, 문제 분석·설계·구현·수정 과정은 평가하지 않는다.}}\n\n(다) 프로젝트 마무리 계획\n완성된 프로그램을 기능적 관점에서만 검토한 뒤 공유한다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)에서 추가 검증이 필요한 입력 번호를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "[12정과04-04]에 근거하여 해당 오류를 해결하기 위해 수행해야 할 활동을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "2022 개정 ‘정보과학’의 ‘평가의 방향’에 근거하여 밑줄 친 ⓐ의 평가 계획을 수정하여 서술하시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "[12정과04-05]에 근거하여 (다)에 추가해야 할 평가 관점을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-오류 입력",
          "taskId": "a",
          "label": "오류 입력",
          "points": 1,
          "key": "입력 2",
          "acceptedVariants": [
            "2"
          ],
          "forbiddenConfusions": [],
          "rationale": "예상 결과와 달리 프로그램 오류가 발생한 입력 2를 추가 검증해야 한다."
        },
        {
          "unitId": "b-검증 활동",
          "taskId": "b",
          "label": "검증 활동",
          "points": 1,
          "key": "테스트와 디버깅을 통해 오류 원인을 찾아 수정하고 검증한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[12정과04-04]는 테스트와 디버깅 과정으로 완성도를 검증하도록 한다.",
          "requiredConcepts": [
            "테스트",
            "디버깅",
            "수정",
            "검증"
          ]
        },
        {
          "unitId": "c-과정 평가",
          "taskId": "c",
          "label": "과정 평가",
          "points": 1,
          "key": "최종 결과만 보지 말고 문제 해결 과정을 통합적으로 관찰하고 평가한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "평가의 방향은 지엽적 결과보다 문제 해결 과정을 통합적으로 관찰·평가하도록 한다.",
          "requiredConcepts": [
            "문제 해결 과정",
            "통합",
            "관찰",
            "평가"
          ]
        },
        {
          "unitId": "d-추가 평가 관점",
          "taskId": "d",
          "label": "추가 평가 관점",
          "points": 1,
          "key": "윤리적 관점",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "[12정과04-05]는 산출물을 기능적·윤리적 관점에서 평가하도록 한다.",
          "requiredConcepts": [
            "윤리적"
          ]
        }
      ],
      "explanation": "입력 2는 예상과 달리 프로그램 오류가 발생하므로 추가 검증이 필요하다. 오류 원인을 분석하고 수정한 뒤 다시 테스트해야 한다. 평가는 최종 화면만이 아니라 문제 분석·설계·구현·수정 과정을 포함해야 하며, 프로젝트 결과의 공유·활용에서는 기능 외에 윤리적·사회적 관점도 고려해야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "info-science"
      ],
      "areas": [
        "정보과학 프로젝트"
      ],
      "sections": [
        "성취기준",
        "평가의 방향"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "info-science",
          "area": "정보과학 프로젝트"
        }
      ],
      "explanationDetail": {
        "examPoint": "테스트 결과 → 디버깅 → 과정 평가 → 프로젝트의 윤리적 평가까지 연결한다.",
        "watchOut": "오류가 난 입력만 찾는 것으로 끝나지 않는다. 수정 후 재검증과 과정 기록이 평가 대상이다."
      }
    },
    {
      "questionId": "EX-013",
      "curriculumVersion": "2022",
      "sourceIds": [
        "IS-01-AC-ST-03",
        "IS-01-AC-CO-01",
        "IS-01-AC-CO-02",
        "IS-TE-EVM-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 적용 시 고려 사항",
        "평가 방법"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘정보과학’ 과목의 재귀구조 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 반복구조 프로그램\ns = 0\nfor i in range(1, n+1):\n    s = s + i\n\n(나) 재귀함수로 변환한 프로그램\nsum(n):\n    if n == 1: return ( ㉠ )\n    return n + sum(n-1)\n\n(다) 교사 협의\nA교사: 일부 학생은 처음부터 재귀관계를 세우지 못합니다.\nB교사: 최소 성취수준을 보장할 수 있는 단계적 활동이 필요하겠네요.\nA교사: 평가는 학생이 처음 접하는 online judge로 바로 실시하겠습니다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가), (나)의 실행 결과가 같도록 ㉠에 들어갈 값을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "2022 개정 ‘정보과학’의 ‘성취기준 적용 시 고려 사항’에 근거하여 재귀구조를 이해할 때 강조할 관계를 서술하시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "같은 근거에 따라 재귀관계를 바로 세우지 못하는 학생에게 제공할 단계적 활동을 서술하시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 ‘정보과학’의 ‘평가 방법’에 근거하여 online judge 평가 전에 해야 할 조치를 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-㉠",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "1",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "1부터 n까지의 합에서 n=1일 때 기저값은 1이다."
        },
        {
          "unitId": "b-학습 관계",
          "taskId": "b",
          "label": "학습 관계",
          "points": 1,
          "key": "귀납 가정과 재귀함수 호출의 관계",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "공식 고려 사항은 수학적 증명 자체보다 귀납 가정 부분과 재귀함수 호출의 관계를 다양한 예로 이해하게 한다.",
          "requiredConcepts": [
            "귀납 가정",
            "재귀함수 호출",
            "관계"
          ]
        },
        {
          "unitId": "c-단계적 지원",
          "taskId": "c",
          "label": "단계적 지원",
          "points": 1,
          "key": "반복구조로 작성된 프로그램을 재귀함수로 변환하는 활동을 제공한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "재귀관계를 파악하지 못해도 반복구조 프로그램을 재귀함수로 변환하는 활동을 제공할 수 있다.",
          "requiredConcepts": [
            "반복구조",
            "재귀함수",
            "변환"
          ]
        },
        {
          "unitId": "d-평가 전 조치",
          "taskId": "d",
          "label": "평가 전 조치",
          "points": 1,
          "key": "평가 전에 online judge 사용법을 교육하여 도구 미숙으로 인한 불이익이 없도록 한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "평가 방법은 디지털 도구 활용 전에 학생이 도구를 다룰 수 있도록 교육하여 불이익이 없도록 하라고 한다.",
          "requiredConcepts": [
            "평가 전에",
            "online judge",
            "교육",
            "불이익"
          ]
        }
      ],
      "explanation": "반복구조와 같은 합을 만들려면 재귀함수의 기저 사례 sum(1)은 1을 반환해야 한다. 재귀 수업에서는 현재 문제와 더 작은 문제 사이의 재귀관계를 이해하게 하고, 어려워하는 학생에게는 작은 입력의 호출 과정을 추적하는 단계적 활동을 제공할 수 있다. 자동평가 도구를 사용할 때도 사전에 사용법과 평가 조건을 익힐 기회를 제공해야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "info-science"
      ],
      "areas": [
        "프로그래밍"
      ],
      "sections": [
        "성취기준",
        "성취기준 적용 시 고려 사항",
        "평가 방법"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "info-science",
          "area": "프로그래밍"
        }
      ],
      "explanationDetail": {
        "examPoint": "코드 완성, 개념 관계, 최소 성취수준 지원, 자동평가 공정성까지 한 문항 안에서 이어진다.",
        "watchOut": "재귀는 단순히 ‘함수가 자기 자신을 호출한다’로만 설명하면 부족하다. 기저 조건과 더 작은 문제와의 관계가 핵심이다."
      }
    },
    {
      "questionId": "EX-014",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-02-AC-ST-01",
        "HI-02-AC-EX-01"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 ‘데이터’ 영역의 수업 활동지 일부이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 압축 규칙\n같은 문자가 연속될 때 ‘문자+반복 횟수’로 나타낸다. 문자와 숫자는 각각 한 글자로 센다.\n예) AAA → A3\n\n(나) 대상 문자열\nKKKKLLMMNNN\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)의 규칙으로 (나)를 압축한 결과를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "원본 길이와 압축 후 길이를 비교하여 압축으로 줄어든 글자 수를 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-압축 결과",
          "taskId": "a",
          "label": "압축 결과",
          "points": 1,
          "key": "K4L2M2N3",
          "acceptedVariants": [
            "K4 L2 M2 N3"
          ],
          "forbiddenConfusions": [],
          "rationale": "연속 문자 수를 세면 K4L2M2N3이 된다."
        },
        {
          "unitId": "b-감소 길이",
          "taskId": "b",
          "label": "감소 길이",
          "points": 1,
          "key": "3글자",
          "acceptedVariants": [
            "3",
            "3자"
          ],
          "forbiddenConfusions": [],
          "rationale": "원본은 11글자, 압축 결과는 8글자이므로 3글자 줄었다."
        }
      ],
      "explanation": "KKKKLLMMNNN을 연속 길이 규칙으로 바꾸면 K4L2M2N3이다. 원본은 11글자, 압축 결과는 8글자이므로 3글자가 줄어든다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "데이터"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "데이터"
        }
      ],
      "explanationDetail": {
        "examPoint": "답은 두 개의 단답이지만 규칙을 실제로 적용하고 길이까지 비교해야 한다.",
        "watchOut": "문자와 숫자를 각각 한 글자로 센다는 조건을 놓치지 않는다."
      }
    },
    {
      "questionId": "EX-015",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-02-AC-ST-02",
        "HI-02-AC-EX-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 ‘데이터’ 영역에서 활용한 간단한 치환형 암호 활동이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 암호 규칙\n영문 대문자를 알파벳 순서에서 3칸 뒤 문자로 바꾼다.\nA→D, B→E, …, X→A, Y→B, Z→C\n\n(나) 평문\nDATA\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)의 규칙으로 (나)를 암호화한 결과를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "복호화할 때 적용할 이동 방향과 칸 수를 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-암호문",
          "taskId": "a",
          "label": "암호문",
          "points": 1,
          "key": "GDWD",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "D→G, A→D, T→W, A→D이므로 GDWD이다."
        },
        {
          "unitId": "b-복호화 역연산",
          "taskId": "b",
          "label": "복호화 역연산",
          "points": 1,
          "key": "알파벳 순서에서 3칸 앞으로 이동한다",
          "acceptedVariants": [
            "3칸 이전 문자로 바꾼다"
          ],
          "forbiddenConfusions": [],
          "rationale": "암호화가 3칸 뒤 이동이므로 복호화는 반대로 3칸 앞(이전)으로 이동한다.",
          "requiredConcepts": [
            "3칸",
            "앞"
          ]
        }
      ],
      "explanation": "각 문자를 알파벳 순서에서 3칸 뒤로 이동하면 DATA는 GDWD가 된다. 복호화는 암호화의 역연산이므로 3칸 앞으로가 아니라 3칸 뒤로 되돌리는 방향, 즉 알파벳 순서에서 3칸 앞쪽으로 이동한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "데이터"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "데이터"
        }
      ],
      "explanationDetail": {
        "examPoint": "암호 규칙을 보기에서 읽고 암호화와 역변환을 각각 적용하는 2점형이다.",
        "watchOut": "X, Y, Z에서는 A, B, C로 순환한다. 복호화는 같은 방향으로 다시 3칸 이동하는 것이 아니다."
      }
    },
    {
      "questionId": "EX-016",
      "curriculumVersion": "2022",
      "sourceIds": [
        "AI-01-AC-ST-05"
      ],
      "sourceType": [
        "성취기준"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘인공지능 기초’ 과목에서 규칙과 사실을 이용해 추론하는 활동이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 규칙\nR1: 열이 높고 기침이 있으면 감염 의심이다.\nR2: 감염 의심이면 검사를 권고한다.\n\n(나) 사실\n민수는 열이 높다.\n민수는 기침이 있다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "R1을 적용하여 새로 생성되는 지식을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "이어 R2를 적용하여 새로 생성되는 지식을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-R1 추론",
          "taskId": "a",
          "label": "R1 추론",
          "points": 1,
          "key": "민수는 감염 의심이다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "두 전제가 모두 사실이므로 R1의 결론이 새 지식으로 생성된다.",
          "requiredConcepts": [
            "민수",
            "감염 의심"
          ]
        },
        {
          "unitId": "b-R2 추론",
          "taskId": "b",
          "label": "R2 추론",
          "points": 1,
          "key": "민수에게 검사를 권고한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "R1에서 생성된 감염 의심 사실에 R2를 적용한다.",
          "requiredConcepts": [
            "민수",
            "검사",
            "권고"
          ]
        }
      ],
      "explanation": "열이 높고 기침이 있으므로 R1에 의해 ‘감염 의심’이 생성되고, 이어 R2에 의해 ‘검사를 권고한다’가 생성된다. 앞 단계에서 새로 얻은 지식이 다음 규칙의 전제가 된다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "ai-basic"
      ],
      "areas": [
        "인공지능의 이해"
      ],
      "sections": [
        "성취기준"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "ai-basic",
          "area": "인공지능의 이해"
        }
      ],
      "explanationDetail": {
        "examPoint": "두 규칙을 순차적으로 적용해야 하므로 단순 용어 회상이 아니다.",
        "watchOut": "R2는 최초 사실만으로 바로 적용되는 것이 아니라 R1에서 생성된 ‘감염 의심’이 먼저 필요하다."
      }
    },
    {
      "questionId": "EX-017",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-04-AC-ST-01",
        "HI-04-AC-EX-01"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 ‘인공지능’ 영역의 수업 자료이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 장치 사례\nA장치: 매일 오후 6시가 되면 정해진 규칙대로 조명을 켠다.\nB로봇: 센서로 사람과 장애물을 인식하고, 이전 이동 결과를 바탕으로 경로를 조정하여 행동한다.\n\n(나) 학생 발언\n“자동으로 작동하는 장치는 모두 지능 에이전트이다.”\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "A와 B 중 지능 에이전트의 특성을 더 잘 나타내는 것을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "성취기준 해설에 근거하여 두 장치를 구분할 때 확인할 수 있는 인공지능 관점의 요소를 한 가지 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-지능 에이전트",
          "taskId": "a",
          "label": "지능 에이전트",
          "points": 1,
          "key": "B",
          "acceptedVariants": [
            "B로봇"
          ],
          "forbiddenConfusions": [
            "A"
          ],
          "rationale": "B는 환경을 인식하고 결과에 따라 행동을 조정하는 특성을 보인다."
        },
        {
          "unitId": "b-구분 요소",
          "taskId": "b",
          "label": "구분 요소",
          "points": 1,
          "key": "인식·학습·추론·행동 중 한 가지",
          "acceptedVariants": [
            "인식",
            "학습",
            "추론",
            "행동"
          ],
          "forbiddenConfusions": [],
          "rationale": "성취기준 해설은 인식, 학습, 추론, 행동 등의 관점에서 에이전트와 지능 에이전트를 구분한다.",
          "anyOf": {
            "pool": [
              "인식",
              "학습",
              "추론",
              "행동"
            ],
            "count": 1
          }
        }
      ],
      "explanation": "B로봇은 환경을 센서로 인식하고 이전 결과를 바탕으로 행동을 조정하므로 지능 에이전트의 특성을 더 잘 나타낸다. 단순히 정해진 시간에 규칙대로 동작하는 자동화와 달리 환경 인식, 상호작용, 자율적 행동 조정 여부를 살펴야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "인공지능"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "인공지능"
        }
      ],
      "explanationDetail": {
        "examPoint": "두 장치의 행동을 비교해 지능 에이전트 여부를 판별한다.",
        "watchOut": "‘자동으로 작동한다’는 사실만으로 지능 에이전트라고 할 수 없다."
      }
    },
    {
      "questionId": "EX-018",
      "curriculumVersion": "2022",
      "sourceIds": [
        "IS-02-AC-ST-01",
        "IS-02-AC-ST-02"
      ],
      "sourceType": [
        "성취기준"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘정보과학’ 과목에서 스택과 큐의 동작을 확인하는 활동지이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 스택 S의 연산\npush(4) → push(7) → pop() → push(9) → pop()\n\n(나) 큐 Q의 연산\nadd(4) → add(7) → delete() → add(9) → delete()\n\n<조건>\n- pop()은 스택의 맨 위 원소를 제거하여 반환한다.\n- add(x)는 큐의 rear에 x를 삽입한다.\n- delete()는 큐의 front 원소를 제거하여 반환한다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)에서 두 번째 pop()이 반환하는 값을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)에서 두 번째 delete()가 반환하는 값을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-stack",
          "taskId": "a",
          "label": "스택 반환값",
          "points": 1,
          "key": "9",
          "acceptedVariants": [
            "9"
          ],
          "forbiddenConfusions": [],
          "rationale": "스택은 후입선출이므로 첫 pop에서 7이 제거되고, 9를 push한 뒤 두 번째 pop은 9를 반환한다."
        },
        {
          "unitId": "b-queue",
          "taskId": "b",
          "label": "큐 반환값",
          "points": 1,
          "key": "7",
          "acceptedVariants": [
            "7"
          ],
          "forbiddenConfusions": [],
          "rationale": "큐는 선입선출이므로 첫 delete에서 4가 제거되고, 두 번째 delete는 7을 반환한다."
        }
      ],
      "explanation": "스택은 후입선출이므로 두 번째 pop()은 9를 반환한다. 큐는 선입선출이므로 두 번째 delete()는 7을 반환한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "info-science"
      ],
      "areas": [
        "데이터 구조"
      ],
      "sections": [
        "성취기준"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "info-science",
          "area": "데이터 구조"
        }
      ],
      "explanationDetail": {
        "examPoint": "자료구조 이름을 직접 묻기보다 연산 순서를 추적해 동작 원리를 확인하는 2점형이다.",
        "watchOut": "스택과 큐에서 같은 삽입 순서를 사용해도 제거 순서는 다르다."
      }
    },
    {
      "questionId": "EX-019",
      "curriculumVersion": "2022",
      "sourceIds": [
        "MI-01-CS-KN-03",
        "MI-01-AC-ST-03",
        "MI-01-AC-CO-02"
      ],
      "sourceType": [
        "내용 체계",
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 중학교 정보과 교육과정에 따라 피지컬 컴퓨팅 수업을 설계하는 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 내용 체계 및 성취기준 일부\n지식·이해: ( ㉠ )\n[9정01-03] 문제 해결 목적에 맞는 피지컬 컴퓨팅 구성요소를 선택하여 시스템을 구상한다.\n\n(나) 스마트 화분 요구사항과 장치 목록\n요구사항: 토양의 수분이 기준값보다 낮아지면 자동으로 물을 공급한다.\n장치 목록: 토양 수분 센서, 조도 센서, 버튼, 워터 펌프, LED, 마이크로컨트롤러\n\n구성안\n- 환경 상태를 입력받는 장치: ( ㉡ )\n- 물을 실제로 공급하는 장치: ( ㉢ )\n\n(다) 교사 협의\nA교사: 프로그래밍 경험이 부족한 학생도 센서 회로와 제어 프로그램을 모두 처음부터 제작하게 하겠습니다.\nB교사: 하드웨어와 소프트웨어가 통합적으로 동작한다는 점에 집중할 수 있도록 학습 부담을 조정할 필요가 있습니다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 중학교 정보과 교육과정의 ‘내용 체계’에 근거하여 ㉠에 들어갈 내용을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 요구사항과 장치 목록을 고려하여 ㉡과 ㉢에 들어갈 장치를 순서대로 쓰시오.",
          "points": 2
        },
        {
          "id": "c",
          "prompt": "2022 개정 중학교 정보과 교육과정의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 A교사 계획을 수정하는 지원 방안을 한 가지 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-content",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "피지컬 컴퓨팅의 개념",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "내용 체계의 지식·이해 요소에 ‘피지컬 컴퓨팅의 개념’이 제시된다.",
          "requiredConcepts": [
            "피지컬 컴퓨팅",
            "개념"
          ]
        },
        {
          "unitId": "b-input",
          "taskId": "b",
          "label": "㉡",
          "points": 1,
          "key": "토양 수분 센서",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "토양의 수분 상태를 측정해야 하므로 입력 장치로 토양 수분 센서가 적합하다.",
          "requiredConcepts": [
            "토양 수분 센서"
          ]
        },
        {
          "unitId": "b-output",
          "taskId": "b",
          "label": "㉢",
          "points": 1,
          "key": "워터 펌프",
          "acceptedVariants": [
            "펌프"
          ],
          "forbiddenConfusions": [],
          "rationale": "물 공급이라는 물리적 동작을 수행해야 하므로 워터 펌프가 적합하다.",
          "requiredConcepts": [
            "워터 펌프"
          ]
        },
        {
          "unitId": "c-support",
          "taskId": "c",
          "label": "지원 방안",
          "points": 1,
          "key": "미리 구성된 피지컬 컴퓨팅 시스템을 활용하거나 간단한 시스템으로 난이도를 낮춘다",
          "acceptedVariants": [
            "미리 구성된 피지컬 컴퓨팅 시스템을 활용한다",
            "간단한 피지컬 컴퓨팅 시스템을 구현한다",
            "구현 난이도를 낮춘다"
          ],
          "forbiddenConfusions": [],
          "rationale": "프로그래밍 경험이 부족한 학생에게는 하드웨어·소프트웨어 통합 동작을 이해하는 데 집중할 수 있도록 구현 난이도를 낮춰야 한다.",
          "anyOf": {
            "pool": [
              "미리 구성",
              "간단한 피지컬 컴퓨팅 시스템",
              "난이도를 낮"
            ],
            "count": 1
          }
        }
      ],
      "explanation": "㉠은 ‘피지컬 컴퓨팅의 개념’이다. 스마트 화분에서는 토양 수분 센서가 환경 상태를 입력받고 워터 펌프가 물을 공급한다. 프로그래밍 경험이 부족한 학생에게는 미리 구성된 장치나 간단한 시스템을 활용하여 하드웨어와 소프트웨어의 통합 동작에 집중하도록 지원할 수 있다.",
      "explanationDetail": {
        "examPoint": "내용 체계 빈칸, 장치 역할 판별, 학습자 수준에 따른 교수·학습 조정을 한 문제에서 연결한다.",
        "watchOut": "센서와 액추에이터의 역할을 뒤바꾸지 않는다. 지원은 학습 목표를 없애는 것이 아니라 구현 부담을 조정하는 것이다."
      },
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "middle-info"
      ],
      "areas": [
        "컴퓨팅 시스템"
      ],
      "sections": [
        "내용 체계",
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "middle-info",
          "area": "컴퓨팅 시스템"
        }
      ]
    },
    {
      "questionId": "EX-020",
      "curriculumVersion": "2022",
      "sourceIds": [
        "HI-05-CS-KN-02",
        "HI-05-AC-ST-02",
        "HI-05-AC-CO-02"
      ],
      "sourceType": [
        "내용 체계",
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 교육과정의 ‘디지털 문화’ 영역에서 정보 보호 수업을 계획한 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 내용 체계 일부\n지식·이해: ( ㉠ )\n\n(나) 클라우드 공유 설정\n자료 A: 모둠 발표용 공개 보고서 — 링크가 있는 사람 모두 ‘읽기’\n자료 B: 학생 이름·전화번호·상담 내용이 포함된 원자료 — 링크가 있는 사람 모두 ‘편집’\n\nA교사: 자료 A와 B를 같은 방식으로 공개해도 될까요?\nB교사: 보호해야 할 정보와 공유해야 할 정보를 구분하고 접근 권한을 다르게 설정해야 합니다.\n\n(다) 평가 계획\n수업이 끝난 뒤 한 번의 선택형 시험만 실시한다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 ‘내용 체계’에 근거하여 (가)의 ㉠에 들어갈 내용을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 A와 B 중 접근 권한을 우선 제한해야 할 자료를 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나)의 자료 B에 적용할 수 있는 정보 보호 방법을 한 가지 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 고등학교 정보과 교육과정의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)에 추가할 평가 방법을 한 가지 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-content",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "정보 보호와 보안",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "내용 체계의 지식·이해 요소이다.",
          "requiredConcepts": [
            "정보 보호",
            "보안"
          ]
        },
        {
          "unitId": "b-data",
          "taskId": "b",
          "label": "보호 대상",
          "points": 1,
          "key": "자료 B",
          "acceptedVariants": [
            "B",
            "B자료",
            "자료B"
          ],
          "forbiddenConfusions": [],
          "rationale": "개인 정보와 상담 내용이 포함된 원자료이므로 접근을 제한해야 한다."
        },
        {
          "unitId": "c-method",
          "taskId": "c",
          "label": "보호 방법",
          "points": 1,
          "key": "접근 권한을 제한한다",
          "acceptedVariants": [
            "접근제어"
          ],
          "forbiddenConfusions": [],
          "rationale": "기기나 클라우드의 접근제어는 학습자가 실천할 수 있는 정보 보호 방법이다.",
          "requiredConcepts": [
            "접근",
            "권한",
            "제한"
          ]
        },
        {
          "unitId": "d-eval",
          "taskId": "d",
          "label": "평가 방법",
          "points": 1,
          "key": "학습 과정을 누적하여 기록하거나 서·논술형으로 평가한다",
          "acceptedVariants": [
            "학습 과정을 누적하여 기록한다",
            "서술형으로 평가한다",
            "논술형으로 평가한다",
            "서·논술형으로 평가한다"
          ],
          "forbiddenConfusions": [],
          "rationale": "공식 고려 사항은 정보 보호·보안 실천 활동의 학습 과정을 누적 기록하거나 서·논술형으로 평가하도록 한다.",
          "anyOf": {
            "pool": [
              "누적하여 기록",
              "누적 기록",
              "서술형",
              "논술형",
              "서·논술형"
            ],
            "count": 1
          }
        }
      ],
      "explanation": "㉠은 ‘정보 보호와 보안’이다. 개인정보와 상담 내용이 포함된 자료 B는 공개 보고서와 달리 접근 권한을 제한해야 한다. 클라우드 접근제어와 같은 실제 보호 방법을 적용하고, 평가는 일회성 선택형 시험만이 아니라 실천 과정을 누적 기록하거나 서·논술형으로 확인할 수 있다.",
      "explanationDetail": {
        "examPoint": "내용 체계, 실제 클라우드 권한 설정, 평가 방법을 한 사례에 묶어 정보 보호를 단순 용어 암기에서 실천 판단으로 확장한다.",
        "watchOut": "‘공유하면 안 된다’가 정답의 전부가 아니다. 보호할 정보와 공유할 정보를 구분하고 적절한 접근 권한을 설정하는 것이 핵심이다."
      },
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "high-info"
      ],
      "areas": [
        "디지털 문화"
      ],
      "sections": [
        "내용 체계",
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "디지털 문화"
        }
      ]
    },
    {
      "questionId": "EX-021",
      "curriculumVersion": "2022",
      "sourceIds": [
        "AI-03-AC-ST-04",
        "AI-03-AC-EX-02",
        "AI-03-AC-CO-03"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘인공지능 기초’ 과목에서 인공지능 윤리를 다루는 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 채용 지원 인공지능의 분석 결과\n- 과거 합격자 데이터를 학습 데이터로 사용하였다.\n- 학습 데이터의 90%가 A집단, 10%가 B집단이었다.\n- 비슷한 경력의 지원자에게도 B집단의 합격 추천 비율이 지속적으로 낮게 나타났다.\n\n(나) 교사 대화\nA교사: 모델의 전체 정확도만 높으면 그대로 사용해도 되지 않을까요?\nB교사: 데이터와 알고리즘의 편향이 특정 집단에 미치는 영향을 살펴보고 인공지능 윤리의 관점에서 판단해야 합니다.\n\n(다) 토론 평가 계획\n학생들은 ‘이 시스템을 사용해도 되는가?’를 주제로 토론한다. 교사는 최종 찬반 선택만 기록하고 주장에 사용한 근거나 다른 학생의 견해를 다루는 태도는 평가하지 않는다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)의 자료에서 우선 의심해야 할 편향의 대상을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(가)의 결과를 인공지능 윤리 관점에서 판단할 때 특히 확인해야 할 가치를 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "편향 문제를 점검하기 위해 개발자 관점에서 우선 수행할 조치를 한 가지 서술하시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 ‘인공지능 기초’의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 토론 평가에 추가할 요소를 한 가지 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-bias",
          "taskId": "a",
          "label": "편향 대상",
          "points": 1,
          "key": "학습 데이터의 편향",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "집단 구성 비율이 크게 불균형하므로 학습 데이터의 편향을 먼저 점검해야 한다.",
          "requiredConcepts": [
            "데이터",
            "편향"
          ]
        },
        {
          "unitId": "b-value",
          "taskId": "b",
          "label": "윤리 가치",
          "points": 1,
          "key": "공정성",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "특정 집단에 지속적으로 불리한 결과가 나타나는지는 공정성 관점의 핵심 쟁점이다.",
          "requiredConcepts": [
            "공정성"
          ]
        },
        {
          "unitId": "c-action",
          "taskId": "c",
          "label": "개발자 조치",
          "points": 1,
          "key": "학습 데이터의 집단별 구성과 대표성을 점검하고 편향을 완화하도록 데이터를 보완한다",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "개발자는 데이터 구성과 편향을 점검하고 필요한 경우 대표성을 높이도록 데이터를 수정·보완해야 한다.",
          "requiredConcepts": [
            "데이터",
            "구성",
            "점검",
            "보완"
          ]
        },
        {
          "unitId": "d-discussion",
          "taskId": "d",
          "label": "토론 평가 요소",
          "points": 1,
          "key": "근거를 바탕으로 주장하는 과정이나 타인의 견해를 존중하는 태도를 평가한다",
          "acceptedVariants": [
            "근거를 바탕으로 주장하는 과정을 평가한다",
            "타인의 견해를 존중하는 태도를 평가한다"
          ],
          "forbiddenConfusions": [],
          "rationale": "공식 고려 사항은 윤리적 쟁점 토론에서 근거 기반 주장과 타인의 견해를 존중하는 토론 문화를 강조한다.",
          "anyOf": {
            "pool": [
              "근거를 바탕으로",
              "근거 기반",
              "타인의 견해를 존중",
              "타인 의견을 존중"
            ],
            "count": 1
          }
        }
      ],
      "explanation": "학습 데이터의 집단 구성 자체가 크게 치우쳐 있으므로 데이터 편향을 우선 점검해야 한다. 특정 집단에 불리한 결과는 공정성의 문제와 연결된다. 개발자는 데이터의 대표성을 확인하고 필요한 경우 보완해야 하며, 토론 평가는 최종 찬반만이 아니라 근거를 바탕으로 주장하고 타인의 견해를 존중하는 과정도 보아야 한다.",
      "explanationDetail": {
        "examPoint": "편향 사례의 사실 판단, 윤리 가치, 개발자 조치, 토론 평가를 서로 다른 1점 요소로 구성했다.",
        "watchOut": "전체 정확도가 높다는 사실은 집단 간 공정성을 보장하지 않는다. 데이터 편향과 알고리즘 편향을 구분하되, 제시 자료에서는 먼저 데이터 구성의 불균형이 직접 근거다."
      },
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "ai-basic"
      ],
      "areas": [
        "인공지능의 사회적 영향"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "ai-basic",
          "area": "인공지능의 사회적 영향"
        }
      ]
    },
    {
      "questionId": "EX-022",
      "curriculumVersion": "2022",
      "sourceIds": [
        "DS-01-AC-ST-02",
        "DS-01-AC-EX-01"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘데이터 과학’ 과목에서 데이터의 형태를 구분하는 활동지이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 데이터 A\nCSV 파일: 학생번호, 날짜, 걸음 수, 수면 시간처럼 각 열의 속성이 정해져 있다.\n\n(나) 데이터 B\n학생이 자유롭게 작성한 상담 후기 문장과 첨부 사진 파일의 모음이다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)의 데이터 A의 형태를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 데이터 B의 형태를 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-structured",
          "taskId": "a",
          "label": "데이터 A",
          "points": 1,
          "key": "정형 데이터",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "고정된 열과 속성 구조를 가지므로 정형 데이터이다.",
          "requiredConcepts": [
            "정형 데이터"
          ]
        },
        {
          "unitId": "b-unstructured",
          "taskId": "b",
          "label": "데이터 B",
          "points": 1,
          "key": "비정형 데이터",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "자유 텍스트와 이미지처럼 고정된 표 구조로 바로 표현되지 않는 데이터이므로 비정형 데이터이다.",
          "requiredConcepts": [
            "비정형 데이터"
          ]
        }
      ],
      "explanation": "고정된 열과 속성 구조를 갖는 CSV의 데이터 A는 정형 데이터이고, 자유 텍스트와 이미지가 섞인 데이터 B는 비정형 데이터이다.",
      "explanationDetail": {
        "examPoint": "답은 두 단어지만 실제 데이터 예시의 구조를 읽고 분류해야 한다.",
        "watchOut": "파일 확장자만으로 판단하지 말고 데이터가 일정한 속성 구조를 가지는지 확인한다."
      },
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "data-science"
      ],
      "areas": [
        "데이터 과학의 이해"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "data-science",
          "area": "데이터 과학의 이해"
        }
      ]
    },
    {
      "questionId": "EX-023",
      "curriculumVersion": "2022",
      "sourceIds": [
        "MI-02-CS-KN-03",
        "MI-02-AC-ST-04",
        "MI-02-AC-CO-03"
      ],
      "sourceType": [
        "내용 체계",
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 중학교 정보과 교육과정의 ‘데이터’ 영역에서 생활 데이터를 분석하는 수업 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 내용 체계 일부\n지식·이해: 데이터 (            ㉠            )\n\n(나) 학생이 수집하여 구조화한 자료\n학생 | 하루 평균 수면 시간 | 한 달 지각 횟수\nA | 5시간 | 4회\nB | 6시간 | 3회\nC | 7시간 | 2회\nD | 8시간 | 1회\n\n(다) 수업 협의\nA교사: 표 계산 기능을 한 번 연습한 뒤 수업을 끝내겠습니다.\nB교사: 학생이 생활 속 문제를 정하고 필요한 데이터를 수집·분석한 뒤, 데이터에 근거해 의미를 설명하는 전 과정을 경험하도록 구성하면 좋겠습니다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 중학교 정보과 교육과정의 ‘내용 체계’에 근거하여 (가)의 ㉠에 들어갈 내용을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)에서 수면 시간이 6시간 이상인 학생의 한 달 지각 횟수 평균을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나)의 자료에 근거하여 수면 시간과 지각 횟수 사이에서 관찰되는 경향을 서술하시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 중학교 정보과 교육과정의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 B교사 계획에 해당하는 수업 맥락을 한 가지 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-content",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "구조화 및 해석",
          "acceptedVariants": [
            "구조화와 해석"
          ],
          "forbiddenConfusions": [],
          "rationale": "내용 체계의 지식·이해 요소는 ‘데이터 구조화 및 해석’이다.",
          "requiredConcepts": [
            "구조화",
            "해석"
          ]
        },
        {
          "unitId": "b-average",
          "taskId": "b",
          "label": "평균 지각 횟수",
          "points": 1,
          "key": "2회",
          "acceptedVariants": [
            "2"
          ],
          "forbiddenConfusions": [],
          "rationale": "6시간 이상인 B, C, D의 지각 횟수는 3, 2, 1회이므로 평균은 2회이다."
        },
        {
          "unitId": "c-relation",
          "taskId": "c",
          "label": "데이터 해석",
          "points": 1,
          "key": "수면 시간이 증가할수록 지각 횟수가 감소하는 경향이 있다",
          "acceptedVariants": [
            "수면 시간이 길수록 지각 횟수가 감소한다"
          ],
          "forbiddenConfusions": [],
          "rationale": "표의 네 관측값은 수면 시간이 5→8시간으로 증가할 때 지각 횟수가 4→1회로 감소하는 경향을 보인다.",
          "requiredConcepts": [
            "수면 시간",
            "증가",
            "지각",
            "감소"
          ]
        },
        {
          "unitId": "d-context",
          "taskId": "d",
          "label": "수업 맥락",
          "points": 1,
          "key": "프로젝트 기반의 문제 해결 활동",
          "acceptedVariants": [
            "프로젝트 기반 문제 해결 활동",
            "문제기반 학습"
          ],
          "forbiddenConfusions": [],
          "rationale": "공식 고려 사항은 데이터 분석의 전 과정을 프로젝트 기반 문제 해결 활동 또는 문제기반 학습의 맥락에서 수행하도록 한다.",
          "anyOf": {
            "pool": [
              "프로젝트",
              "문제기반"
            ],
            "count": 1
          }
        }
      ],
      "explanation": "㉠은 ‘구조화 및 해석’이다. B·C·D의 지각 횟수 평균은 (3+2+1)/3=2회이며, 제시된 표에서는 수면 시간이 늘수록 지각 횟수가 줄어드는 경향이 보인다. 교육과정은 이런 데이터 분석의 전 과정을 프로젝트 기반 문제 해결 활동이나 문제기반 학습의 맥락에서 실제적으로 경험하도록 요구한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "middle-info"
      ],
      "areas": [
        "데이터"
      ],
      "sections": [
        "내용 체계",
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "middle-info",
          "area": "데이터"
        }
      ],
      "explanationDetail": {
        "examPoint": "내용 체계 인출, 간단한 데이터 계산, 표의 의미 해석, 교수·학습 맥락을 네 개의 독립 1점으로 연결한다.",
        "watchOut": "표의 경향을 곧바로 인과관계라고 단정하면 안 된다. 제시 자료로 말할 수 있는 것은 ‘감소하는 경향’까지다."
      }
    },
    {
      "questionId": "EX-024",
      "curriculumVersion": "2022",
      "sourceIds": [
        "MI-04-AC-ST-02",
        "MI-04-AC-ST-05",
        "MI-04-AC-EX-03"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 2022 개정 중학교 정보과 교육과정의 ‘인공지능’ 영역에서 이미지 분류 시스템을 학습시키는 활동 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 학습 데이터와 평가 결과\n학습 데이터: 고양이 80장, 강아지 20장\n평가 데이터: 고양이 20장 중 18장 정답, 강아지 10장 중 4장 정답\n\n(나) 학생의 개선안\n학생 A: 강아지 사진을 더 수집하여 학습 데이터의 구성을 보완하자.\n학생 B: 인터넷에서 사진을 무단으로 대량 수집하면 빠르게 해결할 수 있다.\n\n(다) 교사 대화\n교사: 데이터의 수집과 활용에서 발생할 수 있는 문제를 단순히 정확도만으로 판단해서는 안 됩니다. 해결 방안 자체도 여러 측면에서 타당해야 합니다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)에서 강아지에 대한 정답률을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(가)의 학습 데이터에서 우선 점검해야 할 데이터 구성의 문제를 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나)의 A학생 개선안에 따라 우선 추가 수집해야 할 데이터의 종류를 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "[9정04-05] 성취기준 해설에 근거하여 (나)의 B학생처럼 인터넷의 사진을 무단으로 수집하는 방안에서 가장 직접적으로 점검해야 할 타당성 측면을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-rate",
          "taskId": "a",
          "label": "강아지 정답률",
          "points": 1,
          "key": "40%",
          "acceptedVariants": [
            "40",
            "0.4"
          ],
          "forbiddenConfusions": [],
          "rationale": "강아지 10장 중 4장을 맞혔으므로 정답률은 4/10=40%이다."
        },
        {
          "unitId": "b-imbalance",
          "taskId": "b",
          "label": "데이터 구성 문제",
          "points": 1,
          "key": "고양이와 강아지 학습 데이터의 불균형",
          "acceptedVariants": [
            "학습 데이터의 불균형",
            "클래스 불균형"
          ],
          "forbiddenConfusions": [],
          "rationale": "고양이 80장, 강아지 20장으로 클래스별 학습 데이터 양이 크게 다르다.",
          "requiredConcepts": [
            "불균형"
          ]
        },
        {
          "unitId": "c-add",
          "taskId": "c",
          "label": "추가 수집 데이터",
          "points": 1,
          "key": "강아지 사진 데이터",
          "acceptedVariants": [
            "강아지 데이터",
            "강아지 사진"
          ],
          "forbiddenConfusions": [],
          "rationale": "상대적으로 부족하고 정답률도 낮은 강아지 데이터를 우선 보완하는 것이 제시 자료에 부합한다.",
          "requiredConcepts": [
            "강아지"
          ]
        },
        {
          "unitId": "d-validity",
          "taskId": "d",
          "label": "타당성 측면",
          "points": 1,
          "key": "법적 타당성",
          "acceptedVariants": [
            "법적 측면",
            "법적"
          ],
          "forbiddenConfusions": [],
          "rationale": "인터넷 사진의 무단 수집은 권리 침해 가능성과 직접 연결되므로 제시 상황에서 우선 점검할 측면은 법적 타당성이다.",
          "requiredConcepts": [
            "법적"
          ]
        }
      ],
      "explanation": "강아지 정답률은 4/10=40%이다. 학습 데이터가 고양이 80장 대 강아지 20장으로 불균형하므로 강아지 데이터를 보완하는 것이 우선이다. 다만 인터넷 사진을 무단으로 수집하는 방식은 권리 침해 가능성이 있으므로 제시 상황에서는 먼저 법적 타당성을 점검해야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.1-exam-paper-audit-v710",
      "subjects": [
        "middle-info"
      ],
      "areas": [
        "인공지능"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "middle-info",
          "area": "인공지능"
        }
      ],
      "explanationDetail": {
        "examPoint": "평가 결과 계산 → 데이터 구성 문제 발견 → 개선 데이터 선택 → 윤리적 해결 기준으로 확장한다. 정확도와 데이터 윤리를 한 문항에서 분리해 판단하게 한다.",
        "watchOut": "강아지 정답률이 낮다는 사실만으로 원인을 데이터 불균형 하나로 확정할 수는 없다. 또한 성취기준 해설은 법적·사회적·윤리적 타당성을 폭넓게 요구하지만, 이 1점 항목은 ‘무단 수집’이라는 구체 상황에서 가장 직접적인 법적 측면 하나만 묻는다."
      }
    },
    {
      "questionId": "EX-025",
      "curriculumVersion": "2022",
      "sourceIds": [
        "AI-04-CS-KN-02",
        "AI-04-AC-ST-02",
        "AI-04-AC-EX-02",
        "AI-04-AC-CO-02"
      ],
      "sourceType": [
        "내용 체계",
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘인공지능 기초’ 과목에서 수행하는 인공지능 프로젝트의 계획과 평가 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 프로젝트 수행 계획\n문제 정의 → 데이터 수집 및 전처리 → (            ㉠            ) → 기계학습을 통한 모델 생성 → 성능 평가 및 수정\n\n(나) 모델 평가 결과\n평가 데이터 50건 중 올바르게 예측한 데이터는 42건이다.\n\n(다) 프로젝트 평가 루브릭 일부\n- 주제가 인공지능 프로젝트에 적절한가?\n- 문제 해결 방식이 창의적인가?\n- 인공지능 소프트웨어가 의도한 기능을 수행하는가?\n- 다른 사람과의 (            ㉡            )을/를 바탕으로 프로젝트를 수행했는가?\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 ‘인공지능 기초’의 ‘인공지능 프로젝트’ 영역 성취기준 해설에 근거하여 (가)의 ㉠에 들어갈 단계를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 모델 정확도를 백분율로 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(가)에서 성능 평가 결과가 목표에 미달했을 때 이어서 수행해야 할 활동을 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 ‘인공지능 기초’의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)의 ㉡에 들어갈 내용을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-stage",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "기계학습 유형과 알고리즘 선정",
          "acceptedVariants": [
            "기계학습 유형 및 알고리즘 선정"
          ],
          "forbiddenConfusions": [],
          "rationale": "공식 해설의 인공지능 문제 해결 과정은 데이터 수집·전처리 뒤에 기계학습 유형과 알고리즘을 선정하도록 한다.",
          "requiredConcepts": [
            "기계학습",
            "유형",
            "알고리즘",
            "선정"
          ]
        },
        {
          "unitId": "b-accuracy",
          "taskId": "b",
          "label": "정확도",
          "points": 1,
          "key": "84%",
          "acceptedVariants": [
            "84",
            "0.84"
          ],
          "forbiddenConfusions": [],
          "rationale": "42/50=0.84이므로 정확도는 84%이다."
        },
        {
          "unitId": "c-revise",
          "taskId": "c",
          "label": "평가 후 활동",
          "points": 1,
          "key": "모델을 수정하여 성능을 개선한다",
          "acceptedVariants": [
            "모델을 수정한다",
            "성능을 개선한다"
          ],
          "forbiddenConfusions": [],
          "rationale": "문제 해결 과정에는 성능 평가 후 수정이 포함되며 성취기준은 평가 결과를 반영하여 성능을 개선하도록 한다.",
          "requiredConcepts": [
            "수정"
          ]
        },
        {
          "unitId": "d-collab",
          "taskId": "d",
          "label": "㉡",
          "points": 1,
          "key": "협업 능력",
          "acceptedVariants": [
            "협업",
            "협력"
          ],
          "forbiddenConfusions": [],
          "rationale": "프로젝트 평가는 완성도뿐 아니라 주제 적절성, 창의성, 다른 사람과의 협업 능력 등을 다각적으로 반영해야 한다.",
          "requiredConcepts": [
            "협업"
          ]
        }
      ],
      "explanation": "인공지능 문제 해결 과정에서는 데이터 수집·전처리 뒤에 기계학습 유형과 알고리즘을 선정하고 모델을 생성한다. 42/50의 정확도는 84%이며, 평가 결과가 부족하면 모델을 수정해 성능을 개선해야 한다. 프로젝트 루브릭은 결과물 완성도뿐 아니라 협업 능력도 평가해야 한다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "ai-basic"
      ],
      "areas": [
        "인공지능 프로젝트"
      ],
      "sections": [
        "내용 체계",
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "ai-basic",
          "area": "인공지능 프로젝트"
        }
      ],
      "explanationDetail": {
        "examPoint": "교육과정의 문제 해결 절차 빈칸, 실제 성능 계산, 평가 후 개선, 프로젝트 루브릭을 한 흐름으로 묶었다. 각 요소는 1점씩 독립 채점된다.",
        "watchOut": "모델 생성 뒤 ‘성능 평가’로 끝나는 것이 아니라 평가 결과를 반영한 수정·개선이 문제 해결 과정에 포함된다."
      }
    },
    {
      "questionId": "EX-026",
      "curriculumVersion": "2022",
      "sourceIds": [
        "SL-03-AC-ST-02",
        "SL-03-AC-EX-02",
        "SL-03-AC-CO-01",
        "SL-03-AC-CO-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘소프트웨어와 생활’ 과목의 ‘현상을 분석하는 소프트웨어’ 영역에서 공공 자전거 이용 데이터를 분석하는 활동 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 수집 데이터 일부\n기록 | 대여소 | 이용 시간(분) | 이용자 휴대전화번호\n1 | A | 12 | 010-1234-0001\n2 | A | -3 | 010-1234-0002\n3 | B | 20 | 010-1234-0003\n\n(나) 학생의 전처리 메모\n- 고정된 열 구조를 가진 표 형태의 데이터이다.\n- 분석 목적과 무관한 개인 식별 정보는 분석 전에 처리할 필요가 있다.\n- 이용 시간이 -3분인 값은 실제 가능한 값인지 확인한 뒤 정제 여부를 결정한다.\n\n(다) 평가 계획\n최종 그래프 한 장만 제출받고 문제 상황, 데이터 수집·관리, 전처리, 분석 과정, 결과 해석의 기록은 받지 않는다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가), (나)의 데이터 형태를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "2022 개정 ‘소프트웨어와 생활’의 ‘성취기준 적용 시 고려 사항’에 근거하여 (가)에서 식별되지 않도록 우선 처리할 속성을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(가)에서 오류 가능성을 우선 확인해야 할 기록 번호를 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 ‘소프트웨어와 생활’의 ‘성취기준 적용 시 고려 사항’에 근거하여 (다)에 추가할 누적 평가 자료를 한 가지 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-type",
          "taskId": "a",
          "label": "데이터 형태",
          "points": 1,
          "key": "정형 데이터",
          "acceptedVariants": [],
          "forbiddenConfusions": [],
          "rationale": "고정된 열과 속성 구조를 가진 표이므로 정형 데이터이다.",
          "requiredConcepts": [
            "정형 데이터"
          ]
        },
        {
          "unitId": "b-private",
          "taskId": "b",
          "label": "비식별 처리 속성",
          "points": 1,
          "key": "이용자 휴대전화번호",
          "acceptedVariants": [
            "휴대전화번호",
            "전화번호"
          ],
          "forbiddenConfusions": [],
          "rationale": "개인 정보가 포함된 데이터는 개인을 식별할 수 없도록 처리해야 한다.",
          "requiredConcepts": [
            "휴대전화"
          ]
        },
        {
          "unitId": "c-invalid",
          "taskId": "c",
          "label": "오류 확인 기록",
          "points": 1,
          "key": "2번",
          "acceptedVariants": [
            "2",
            "기록 2"
          ],
          "forbiddenConfusions": [],
          "rationale": "이용 시간 -3분은 해당 맥락에서 오류 가능성이 높아 실제 값인지 확인하고 정제 여부를 결정해야 한다."
        },
        {
          "unitId": "d-record",
          "taskId": "d",
          "label": "누적 평가 자료",
          "points": 1,
          "key": "보고서 또는 포트폴리오",
          "acceptedVariants": [
            "보고서",
            "포트폴리오"
          ],
          "forbiddenConfusions": [],
          "rationale": "문제 상황부터 결과 해석까지의 수행 과정을 보고서, 포트폴리오 등으로 누적하고 종합적으로 평가하도록 한다.",
          "anyOf": {
            "pool": [
              "보고서",
              "포트폴리오"
            ],
            "count": 1
          }
        }
      ],
      "explanation": "고정된 열을 가진 표는 정형 데이터이다. 이용자 휴대전화번호는 개인 식별 가능성이 있으므로 비식별 처리가 필요하고, -3분인 2번 기록은 오류 가능성을 우선 검증해야 한다. 평가는 최종 그래프만 보지 않고 데이터 수집·관리·전처리·분석·해석의 전 과정을 보고서나 포트폴리오로 누적해 확인하는 것이 적절하다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "software-life"
      ],
      "areas": [
        "현상을 분석하는 소프트웨어"
      ],
      "sections": [
        "성취기준",
        "성취기준 해설",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "software-life",
          "area": "현상을 분석하는 소프트웨어"
        }
      ],
      "explanationDetail": {
        "examPoint": "실제 데이터 표를 읽어 데이터 형태, 개인정보, 오류 가능성을 판별하고 마지막에 평가 자료까지 교육과정 근거로 연결한다.",
        "watchOut": "이상해 보이는 값을 즉시 삭제하는 것이 아니라 먼저 실제 값인지 오류인지 확인해야 한다. 개인 정보도 분석에 불필요하다면 식별되지 않도록 처리해야 한다."
      }
    },
    {
      "questionId": "EX-027",
      "curriculumVersion": "2022",
      "sourceIds": [
        "SL-04-AC-ST-01",
        "SL-04-AC-CO-01"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘소프트웨어와 생활’ 과목의 ‘모의 실험하는 소프트웨어’ 영역에서 활용한 제동 시뮬레이션 자료이다. <작성 방법>에 따라 쓰시오. [2점]\n\n(가) 단순화한 시뮬레이션 모델\n제동 거리 d = v² / (2a)\nv: 제동 시작 속력(m/s), a: 일정한 감속도의 크기(m/s²)\n\n(나) 모의 실험 조건\nv = 20, a = 5\n실제 도로에서 같은 조건의 급제동을 반복하면 안전 위험과 자원 소모가 크다고 가정한다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가), (나)의 조건으로 계산한 제동 거리 d를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "2022 개정 ‘소프트웨어와 생활’의 ‘성취기준 적용 시 고려 사항’에 근거하여 이 상황에서 시뮬레이션을 활용하는 가치를 한 가지 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-distance",
          "taskId": "a",
          "label": "제동 거리",
          "points": 1,
          "key": "40m",
          "acceptedVariants": [
            "40 m",
            "40미터",
            "40"
          ],
          "forbiddenConfusions": [],
          "rationale": "20²/(2×5)=400/10=40이므로 제동 거리는 40m이다."
        },
        {
          "unitId": "b-value",
          "taskId": "b",
          "label": "시뮬레이션의 가치",
          "points": 1,
          "key": "실세계에서 수행하기 어렵거나 위험한 실험을 모의적으로 실행하여 자원 사용을 줄일 수 있다",
          "acceptedVariants": [
            "위험한 실험을 모의적으로 수행할 수 있다",
            "현실의 자원 사용을 절약할 수 있다"
          ],
          "forbiddenConfusions": [],
          "rationale": "교육과정은 실세계에서 실행하기 어렵거나 불가능한 대상을 모의 실행하고 현실의 자원 사용을 절약하는 시뮬레이션의 가치를 다룬다.",
          "anyOf": {
            "pool": [
              "위험",
              "어렵",
              "모의",
              "자원",
              "절약"
            ],
            "count": 2
          }
        }
      ],
      "explanation": "모델에 값을 대입하면 d=20²/(2×5)=40m이다. 실제 급제동을 반복하기 위험하고 자원 소모가 큰 상황에서는 시뮬레이션으로 조건을 바꾸어 모의 실험함으로써 현실의 위험과 자원 사용을 줄이면서 원리를 탐구할 수 있다.",
      "comparison2015": false,
      "legacyEvidence": null,
      "validationStatus": "v2.0-exam-paper-audit-v700",
      "subjects": [
        "software-life"
      ],
      "areas": [
        "모의 실험하는 소프트웨어"
      ],
      "sections": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 2,
      "curriculumScopes": [
        {
          "subject": "software-life",
          "area": "모의 실험하는 소프트웨어"
        }
      ],
      "explanationDetail": {
        "examPoint": "2점형이지만 제시된 수식으로 실제 값을 계산한 뒤, 같은 상황에서 시뮬레이션이 필요한 이유를 교육과정 근거와 연결한다.",
        "watchOut": "시뮬레이션은 현실을 완벽히 복제하는 것이 아니라 목적에 맞는 모델을 이용해 현상이나 원리를 모의적으로 탐구하는 도구다."
      }
    },
    {
      "questionId": "EX-028",
      "curriculumVersion": "2022",
      "sourceIds": [
        "MI-03-AC-ST-07",
        "MI-TE-EVD-03"
      ],
      "sourceType": [
        "성취기준",
        "평가의 방향"
      ],
      "stem": "다음은 2022 개정 중학교 정보과 교육과정에 따라 ‘함수와 디버깅’ 수업의 평가를 계획하는 교사들의 대화와 학생 답안이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 교사 대화\nA교사: 프로그램 수행 결과를 분석하여 오류를 수정하는 과정을 평가하고 싶습니다.\nB교사: 학생이 자신의 학습 수준을 파악하고 성찰할 수 있도록 구체적인 (            ㉠            )을/를 학생과 함께 구성해 보는 것도 좋겠습니다.\n\n(나) 평가 과제\n다음 함수는 리스트에서 0보다 큰 값의 개수를 반환해야 한다. 프로그램을 실행하여 결과를 확인하고, 오류가 있으면 원인을 찾아 수정하시오.\n\ndef count_pos(data):\n    count = 0\n    for x in data:\n        if x >= 0:\n            count += 1\n    return count\n\nprint(count_pos([-3, 0, 2, 5]))\n\n(다) 평가 기준\n2점: 잘못된 결과의 원인을 조건식에서 정확히 찾고 올바르게 수정한 경우\n1점: 오류가 조건식에 있음을 찾았으나 올바른 수정식을 제시하지 못한 경우\n0점: 오류 원인과 관계없는 부분을 수정한 경우\n\n(라) 학생 답안\n학생 A: “0도 개수에 포함되는 것이 원인이다. `x >= 0`을 `x > 0`으로 수정한다.”\n학생 B: “출력값이 잘못되었으므로 `print` 문을 삭제한다.”\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 중학교 정보과 교육과정의 ‘평가의 방향’에 근거하여 (가)의 ㉠에 들어갈 용어를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(나)의 프로그램을 수정하지 않고 실행했을 때 출력되는 값을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(다)의 평가 기준에 따라 (라)의 학생 A에게 부여할 점수를 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "[9정03-07]에 근거하여 학생 B에게 제공할 피드백으로, 수정해야 할 조건식을 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-rubric",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "평가 루브릭",
          "acceptedVariants": [
            "루브릭"
          ],
          "forbiddenConfusions": [],
          "rationale": "평가의 방향은 구체적인 평가 루브릭을 학생과 함께 구성하여 자신의 학습 수준을 파악하고 성찰할 기회를 제공하도록 한다.",
          "requiredConcepts": [
            "루브릭"
          ]
        },
        {
          "unitId": "b-output",
          "taskId": "b",
          "label": "실행 결과",
          "points": 1,
          "key": "3",
          "acceptedVariants": [
            "3개"
          ],
          "forbiddenConfusions": [],
          "rationale": "조건이 x >= 0이므로 0, 2, 5의 세 값이 count에 포함되어 3이 출력된다."
        },
        {
          "unitId": "c-score",
          "taskId": "c",
          "label": "학생 A 점수",
          "points": 1,
          "key": "2점",
          "acceptedVariants": [
            "2"
          ],
          "forbiddenConfusions": [],
          "rationale": "학생 A는 오류 원인을 조건식에서 정확히 찾았고 x > 0으로 올바르게 수정했으므로 2점 기준에 해당한다."
        },
        {
          "unitId": "d-feedback",
          "taskId": "d",
          "label": "수정 조건식",
          "points": 1,
          "key": "x > 0",
          "acceptedVariants": [
            "if x > 0",
            "x>0"
          ],
          "forbiddenConfusions": [
            "x >= 0"
          ],
          "rationale": "0보다 큰 값만 세어야 하므로 조건은 x > 0이어야 한다. 이는 실행 결과를 분석하여 오류를 수정하는 [9정03-07]의 수행과 직접 연결된다."
        }
      ],
      "explanation": "㉠은 평가 루브릭이다. 원래 코드는 0까지 포함하므로 3을 출력한다. 학생 A는 오류 원인을 조건식에서 정확히 찾아 x > 0으로 수정했으므로 (다)의 2점 기준에 해당한다. 학생 B에게는 출력문을 지우는 것이 아니라 조건식을 x > 0으로 수정하도록 피드백해야 한다.",
      "comparison2015": false,
      "legacyEvidence": {
        "examYear": 2025,
        "paper": "B",
        "question": 5,
        "construct": "평가 루브릭 + 학생 답안 판정 + 피드백의 결합 구조를 참고하되 소재·코드·정답은 새로 설계"
      },
      "validationStatus": "v2.1-exam-paper-audit-v710",
      "subjects": [
        "middle-info"
      ],
      "areas": [
        "알고리즘과 프로그래밍"
      ],
      "sections": [
        "성취기준",
        "평가의 방향"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "middle-info",
          "area": "알고리즘과 프로그래밍"
        }
      ],
      "explanationDetail": {
        "examPoint": "교육과정 평가 방향의 빈칸, 실제 코드 실행, 평가 기준에 따른 학생 답안 판정, 성취기준에 근거한 피드백을 하나의 문항에 연결한다. 현재 production에 없던 ‘루브릭→학생 답안→피드백’ 기출 구조를 보강한다.",
        "watchOut": "실행 결과가 틀렸다는 사실만 보고 출력문을 고치는 것이 아니라, 요구사항과 실행 결과를 비교해 조건식의 논리 오류를 찾아야 한다. 평가 기준을 읽지 않고 학생 A의 점수를 추측해서도 안 된다."
      }
    },
    {
      "questionId": "EX-029",
      "curriculumVersion": "2022",
      "sourceIds": [
        "DS-03-AC-ST-01",
        "DS-03-AC-CO-02"
      ],
      "sourceType": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "stem": "다음은 2022 개정 고등학교 ‘데이터 과학’ 과목의 ‘데이터 모델링과 평가’ 영역 수업을 설계하는 교사들의 자료이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 교육과정과 교사 대화\n[12데과03-01] 데이터 모델 개념을 이해하고 데이터 분석에 활용할 수 있는 도구를 탐색한다.\n\nA교사: 분석 도구를 정하기 전에 학생들의 (            ㉠            )을/를 사전에 파악하려고 합니다.\nB교사: 하인리히(R. Heinich) 등이 제시한 ASSURE 모형을 적용한다면, 이러한 사전 파악은 (            ㉡            ) 단계에 해당하겠네요.\n\n(나) 사전 조사 결과\n항목 | 1반(24명)\n브라우저 기반 스프레드시트 사용 경험 | 18명\n명령 프롬프트에서 패키지를 설치해 본 경험 | 3명\n수업에 사용하는 기기 | Windows 노트북 10명 / ChromeOS 노트북 8명 / 태블릿 6명\n\n(다) 데이터 분석 도구 후보\nP | Windows 전용 / 별도 설치 필요 / 명령어로 패키지 설치 / 고급 분석 기능 제공\nQ | 웹 브라우저에서 실행 / 별도 설치 불필요 / 여러 기기에서 동일한 화면 / 기초 회귀·군집 분석 지원\n\nA교사: 첫 활동에서는 기능의 수보다 학생의 학습 부담과 다양한 환경에서의 접근성을 우선하여 도구를 선택하겠습니다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "2022 개정 ‘데이터 과학’의 ‘성취기준 적용 시 고려 사항’에 근거하여 (가)의 ㉠에 들어갈 용어를 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "ASSURE 모형에서 (가)의 ㉡에 들어갈 단계의 명칭을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나), (다)를 고려하여 A교사가 우선 선택할 도구를 P와 Q 중에서 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "2022 개정 ‘데이터 과학’의 ‘성취기준 적용 시 고려 사항’에 근거하여, 기기와 운영 체제의 관점에서 (다)의 Q를 선택하는 이유를 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-digital",
          "taskId": "a",
          "label": "㉠",
          "points": 1,
          "key": "디지털 역량",
          "acceptedVariants": [
            "학습자의 디지털 역량"
          ],
          "forbiddenConfusions": [],
          "rationale": "교육과정은 데이터 분석 도구를 선정하기 전에 학습자의 디지털 역량을 사전에 파악하도록 한다.",
          "requiredConcepts": [
            "디지털",
            "역량"
          ]
        },
        {
          "unitId": "b-assure",
          "taskId": "b",
          "label": "㉡",
          "points": 1,
          "key": "학습자 분석",
          "acceptedVariants": [
            "학습자 분석 단계",
            "Analyze Learners",
            "Analyze Learner"
          ],
          "forbiddenConfusions": [
            "목표 진술",
            "방법 매체 자료 선정"
          ],
          "rationale": "ASSURE 모형에서 학습자의 특성과 출발점 능력 등을 사전에 파악하는 단계는 학습자 분석이다.",
          "requiredConcepts": [
            "학습자",
            "분석"
          ]
        },
        {
          "unitId": "c-tool",
          "taskId": "c",
          "label": "선택 도구",
          "points": 1,
          "key": "Q",
          "acceptedVariants": [
            "도구 Q",
            "Q 도구"
          ],
          "forbiddenConfusions": [
            "P"
          ],
          "rationale": "학생 다수에게 명령어 기반 설치 경험이 부족하고 기기 환경도 다양하므로 설치 부담이 적고 여러 기기에서 동일하게 사용할 수 있는 Q가 제시 조건에 더 부합한다."
        },
        {
          "unitId": "d-access",
          "taskId": "d",
          "label": "Q 선택 이유",
          "points": 1,
          "key": "기기나 운영 체제에 비교적 독립적이어서 다양한 학습 환경에서 접근성을 보장할 수 있다",
          "acceptedVariants": [
            "운영 체제에 비교적 독립적이어서 접근성을 보장할 수 있다",
            "여러 기기에서 사용할 수 있어 접근성을 보장한다",
            "기기와 운영 체제에 독립적이어서 접근성이 높다"
          ],
          "forbiddenConfusions": [],
          "rationale": "교육과정은 기기나 운영 체제에 비교적 독립적인 소프트웨어나 프로그래밍 언어를 활용하여 다양한 학습 환경에서 접근성을 보장하도록 한다.",
          "requiredConcepts": [
            "독립",
            "접근성"
          ]
        }
      ],
      "explanation": "㉠은 디지털 역량이고, 이를 도구 선정 전에 파악하는 것은 ASSURE의 학습자 분석 단계와 연결된다. 1반은 명령어 기반 설치 경험이 적고 사용하는 기기도 서로 다르므로 첫 활동에서는 Q가 더 적절하다. 특히 Q는 웹 브라우저에서 실행되어 기기와 운영 체제에 비교적 독립적이므로 다양한 학습 환경에서 접근성을 확보하기 쉽다.",
      "comparison2015": false,
      "legacyEvidence": {
        "examYear": 2024,
        "paper": "B",
        "question": 3,
        "construct": "교육과정의 학습자 수준·역량 관련 문장을 교수설계 모형의 단계와 연결하는 기출 구조를 참고하되, 데이터 과학의 분석 도구 선정 상황으로 새로 설계"
      },
      "validationStatus": "v2.2-historical-gap-v720",
      "subjects": [
        "data-science"
      ],
      "areas": [
        "데이터 모델링과 평가"
      ],
      "sections": [
        "성취기준",
        "성취기준 적용 시 고려 사항"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "data-science",
          "area": "데이터 모델링과 평가"
        }
      ],
      "explanationDetail": {
        "examPoint": "교육과정 원문의 ‘학습자 디지털 역량 사전 파악’을 ASSURE의 학습자 분석 단계와 연결하고, 실제 학습자 자료와 도구 특성을 이용해 도구 선택까지 이어 간다. 기존 production에 없던 ‘교육과정 원문×교수설계 모형’ 기출 구조를 보강한다.",
        "watchOut": "Q를 단지 ‘웹 도구라 편하다’고 고르는 것으로 끝내면 교육과정 근거가 부족하다. 기기·운영 체제에 비교적 독립적이라는 특성이 다양한 학습 환경의 접근성 보장과 연결된다는 점을 구분해야 한다."
      }
    },
    {
      "questionId": "EX-030",
      "curriculumVersion": "2022",
      "sourceIds": [
        "SL-03-CS-PF-02",
        "SL-03-CS-PF-03",
        "DS-02-CS-PF-02",
        "DS-02-CS-PF-03",
        "DS-02-CS-PF-04"
      ],
      "sourceType": [
        "과정·기능"
      ],
      "stem": "다음은 2022 개정 고등학교 정보과 선택 과목을 연계하여 운영하기 위해 교사들이 작성한 자료이다. (가)는 두 과목의 ‘과정·기능’ 일부이고, (나)는 동일한 지역 공공 자전거 데이터를 활용한 연계 수업 계획이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 과정·기능 일부\n\n과목 A\n∙데이터 처리하고 관리하기\n∙데이터를 분석하여 의미 파악하기\n\n과목 B\n∙이상치와 결측치 처리하고 정규화 활용하기\n∙데이터 속성 간의 관계를 파악하고 통합하여 탐색하기\n∙서로 다른 데이터 분석 방법 비교하기\n\n(나) 연계 수업 계획\n\n1학기 활동\n∙공공 자전거 이용 기록을 불러와 필요한 속성만 정리한다.\n∙요일별 이용량을 시각화하고 이용 현상의 의미를 해석한다.\n\n2학기 활동\n∙1학기 자료에 기온과 강수량 데이터를 결합한다.\n∙다음과 같은 기온 자료의 결측치를 ‘결측치를 제외한 값의 평균’으로 대체한다.\n\n날짜 | 기온(℃) | 이용 건수\n월 | 18 | 120\n화 | (결측) | 150\n수 | 24 | 180\n\n∙같은 검증 자료에서 두 예측 모델의 RMSE를 비교한다.\n모델 M: 16.0\n모델 N: 11.5\n※ RMSE는 값이 작을수록 예측 오차가 작다고 본다.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)의 과정·기능에 해당하는 과목 A의 명칭을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(가)의 과정·기능에 해당하는 과목 B의 명칭을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나)의 규칙에 따라 화요일 기온의 결측치를 대체할 값을 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "(나)의 같은 검증 자료에서 예측 오차가 더 작은 모델을 M과 N 중에서 쓰시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-course",
          "taskId": "a",
          "label": "과목 A",
          "points": 1,
          "key": "소프트웨어와 생활",
          "acceptedVariants": [
            "소프트웨어와생활",
            "소프트웨어와 생활 과목"
          ],
          "forbiddenConfusions": [
            "데이터 과학"
          ],
          "rationale": "‘데이터 처리하고 관리하기’, ‘데이터를 분석하여 의미 파악하기’는 ‘소프트웨어와 생활’의 ‘현상을 분석하는 소프트웨어’ 영역에 제시된 과정·기능이다.",
          "requiredConcepts": [
            "소프트웨어",
            "생활"
          ]
        },
        {
          "unitId": "b-course",
          "taskId": "b",
          "label": "과목 B",
          "points": 1,
          "key": "데이터 과학",
          "acceptedVariants": [
            "데이터과학",
            "데이터 과학 과목"
          ],
          "forbiddenConfusions": [
            "소프트웨어와 생활"
          ],
          "rationale": "결측치·이상치 처리, 데이터 속성 간 관계 탐색, 서로 다른 분석 방법 비교는 ‘데이터 과학’의 ‘데이터 준비와 분석’ 영역 과정·기능이다.",
          "requiredConcepts": [
            "데이터",
            "과학"
          ]
        },
        {
          "unitId": "c-impute",
          "taskId": "c",
          "label": "결측치 대체값",
          "points": 1,
          "key": "21℃",
          "acceptedVariants": [
            "21",
            "21도",
            "21 ℃"
          ],
          "forbiddenConfusions": [],
          "rationale": "결측치를 제외한 기온은 18℃와 24℃이므로 평균은 (18+24)/2=21℃이다."
        },
        {
          "unitId": "d-model",
          "taskId": "d",
          "label": "선택 모델",
          "points": 1,
          "key": "N",
          "acceptedVariants": [
            "모델 N",
            "N 모델"
          ],
          "forbiddenConfusions": [
            "M"
          ],
          "rationale": "같은 검증 자료에서 RMSE가 11.5인 N이 16.0인 M보다 작으므로 제시된 기준에서 예측 오차가 더 작다."
        }
      ],
      "explanation": "과목 A는 ‘소프트웨어와 생활’, 과목 B는 ‘데이터 과학’이다. A의 과정·기능은 데이터를 처리·관리하고 분석 결과의 의미를 파악하는 활동에 대응하고, B는 결측치·이상치 처리와 데이터 관계 탐색, 분석 방법 비교까지 확장한다. 화요일 기온은 (18+24)/2=21℃로 대체한다. 같은 검증 자료에서 RMSE는 작을수록 오차가 작으므로 모델 N을 선택한다.",
      "comparison2015": false,
      "legacyEvidence": {
        "examYear": 2025,
        "paper": "A",
        "question": 7,
        "construct": "과목별 과정·기능을 근거로 선택 과목을 식별하는 기출 구조를 참고하되, 실제 결측치 처리와 모델 성능 비교를 결합하여 단순 과목명 회상형이 되지 않도록 재설계"
      },
      "validationStatus": "v2.3-historical-gap-v730",
      "subjects": [
        "software-life",
        "data-science"
      ],
      "areas": [
        "현상을 분석하는 소프트웨어",
        "데이터 준비와 분석"
      ],
      "sections": [
        "과정·기능"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "software-life",
          "area": "현상을 분석하는 소프트웨어"
        },
        {
          "subject": "data-science",
          "area": "데이터 준비와 분석"
        }
      ],
      "explanationDetail": {
        "examPoint": "2025학년도 전공A에서 확인되는 ‘과목별 과정·기능 → 선택 과목 식별’ 구조가 기존 production에 없었다. 과목명 두 개를 찾는 데서 끝내지 않고, 같은 연계 수업 자료 안에서 결측치 처리와 모델 오차 비교를 실제로 수행하게 하여 교육과정 분류와 전공지식 처리를 결합한다.",
        "watchOut": "‘소프트웨어와 생활’과 ‘데이터 과학’은 모두 데이터를 다루지만 과정·기능의 수준이 다르다. 또한 RMSE는 같은 검증 조건에서 값이 작을수록 오차가 작다는 문제의 조건을 사용해야 하며, 수치가 크다고 더 좋은 모델로 판단하면 안 된다."
      }
    },
    {
      "questionId": "EX-031",
      "curriculumVersion": "2015↔2022",
      "sourceIds": [
        "C15-HI-03-CS-10",
        "C15-HI-03-AC-ST-07",
        "C15-HI-03-AC-EX-07",
        "MI-03-CS-KN-03",
        "MI-03-AC-ST-05",
        "MI-03-AC-EX-03"
      ],
      "sourceType": [
        "내용 체계",
        "성취기준",
        "성취기준 해설"
      ],
      "stem": "다음은 예비 교사가 2015 개정 정보과 교육과정과 2022 개정 정보과 교육과정의 프로그래밍 관련 내용을 비교하여 작성한 수업 전환 자료이다. (가)는 두 교육과정의 내용 체계 일부이고, (나)는 이를 바탕으로 예비 교사와 지도 교사가 나눈 대화이다. <작성 방법>에 따라 서술하시오. [4점]\n\n(가) 내용 체계 일부\n\n교육과정 ㉠\n∙중첩 제어 구조\n∙배열\n∙함수\n\n교육과정 ㉡\n∙순차적인 데이터 저장\n∙중첩 제어 구조\n∙함수와 디버깅\n\n(나) 수업 전환 협의\n\n예비 교사: 일주일 동안 수집한 센서 값을 순서대로 저장하고 처리하는 프로그램을 만들려고 합니다. 2015 개정에서 하던 배열 수업을 그대로 적용하면 되겠지요?\n\n지도 교사: 학교급도 달라졌으니 두 교육과정의 성취기준 해설을 다시 비교해 보세요. 특히 학생이 배열 대신 리스트를 이용해 여러 데이터를 순서대로 저장하고 처리하도록 한 활동을 넣을 수 있는지도 해설에 근거해 판단해 보세요.\n\n예비 교사: 그러면 두 교육과정에서 비슷해 보이는 내용 요소도 범위와 추상화 수준을 확인해야겠네요.\n\n<작성 방법>",
      "tasks": [
        {
          "id": "a",
          "prompt": "(가)의 교육과정 ㉠에 제시된 내용 요소가 2015 개정 정보과 교육과정에서 해당하는 학교급을 쓰시오.",
          "points": 1
        },
        {
          "id": "b",
          "prompt": "(가)의 교육과정 ㉡에 제시된 내용 요소가 2022 개정 정보과 교육과정에서 해당하는 학교급을 쓰시오.",
          "points": 1
        },
        {
          "id": "c",
          "prompt": "(나)에서 학생이 배열 대신 리스트를 사용한 경우, 2022 개정 정보과 교육과정의 성취기준 해설에 비추어 적절한지 여부를 쓰시오.",
          "points": 1
        },
        {
          "id": "d",
          "prompt": "지도 교사가 “순차적인 데이터 저장은 배열 하나만을 뜻하지 않는다.”고 말한 이유를 2015 개정과 2022 개정의 성취기준 해설 차이에 근거하여 서술하시오.",
          "points": 1
        }
      ],
      "answerUnits": [
        {
          "unitId": "a-2015-level",
          "taskId": "a",
          "label": "2015 학교급",
          "points": 1,
          "key": "고등학교",
          "acceptedVariants": [
            "고등",
            "고등학교 정보"
          ],
          "forbiddenConfusions": [
            "중학교"
          ],
          "rationale": "2015 개정의 프로그램 개발 환경, 변수와 자료형, 연산자, 입출력, 중첩 제어 구조, 배열, 함수 등을 포함한 프로그래밍 내용 요소는 고등학교 정보의 문제해결과 프로그래밍 영역에 제시된다.",
          "requiredConcepts": [
            "고등학교"
          ]
        },
        {
          "unitId": "b-2022-level",
          "taskId": "b",
          "label": "2022 학교급",
          "points": 1,
          "key": "중학교",
          "acceptedVariants": [
            "중등",
            "중학교 정보"
          ],
          "forbiddenConfusions": [
            "고등학교"
          ],
          "rationale": "2022 개정의 문제 추상화, 알고리즘 표현 방법, 순차적인 데이터 저장, 논리 연산, 중첩 제어 구조, 함수와 디버깅은 중학교 정보의 알고리즘과 프로그래밍 영역 지식·이해에 제시된다.",
          "requiredConcepts": [
            "중학교"
          ]
        },
        {
          "unitId": "c-list-judgement",
          "taskId": "c",
          "label": "리스트 사용 판단",
          "points": 1,
          "key": "적절하다",
          "acceptedVariants": [
            "적절",
            "가능하다",
            "가능",
            "성취기준 해설에 부합한다",
            "부합한다"
          ],
          "forbiddenConfusions": [
            "부적절하다",
            "불가능하다"
          ],
          "rationale": "2022 개정 [9정03-05] 해설은 배열이나 리스트 등 데이터를 순차적으로 저장할 수 있는 구조를 활용하도록 제시하므로 리스트 사용도 가능하다.",
          "requiredConcepts": [
            "적절"
          ]
        },
        {
          "unitId": "d-scope-difference",
          "taskId": "d",
          "label": "범위 차이",
          "points": 1,
          "key": "2015는 배열의 개념과 구조 및 원소 조작을 명시하지만, 2022는 배열이나 리스트 등 순차적인 데이터 저장 구조로 범위를 일반화한다.",
          "acceptedVariants": [
            "2015는 배열을 명시하고 2022는 배열이나 리스트 등 순차 저장 구조를 활용한다",
            "2015는 배열 중심이고 2022는 배열과 리스트를 포함하는 순차적인 데이터 저장 구조로 일반화한다",
            "2022는 배열뿐 아니라 리스트 등 순차적인 데이터 저장 구조를 포함한다"
          ],
          "forbiddenConfusions": [
            "두 교육과정의 배열 내용은 완전히 동일하다"
          ],
          "rationale": "2015 [12정보04-07] 해설은 배열 구조의 선언·초기화·원소 참조와 변경을 구체적으로 요구한다. 2022 [9정03-05] 해설은 배열이나 리스트 등 순차적으로 저장할 수 있는 구조를 활용하여 많은 데이터를 효과적으로 처리하도록 범위를 넓힌다.",
          "requiredConcepts": [
            "배열",
            "리스트",
            "순차"
          ]
        }
      ],
      "explanation": "2015 개정의 해당 프로그래밍 내용 체계는 고등학교, 2022 개정의 해당 ‘알고리즘과 프로그래밍’ 내용 체계는 중학교에 해당한다. 2015 [12정보04-07]은 배열의 개념과 구조, 배열 원소의 참조·변경 등 배열 자체를 명시적으로 다룬다. 반면 2022 [9정03-05]는 배열이나 리스트 등 데이터를 순차적으로 저장할 수 있는 구조를 활용하여 많은 양의 데이터를 처리하도록 한다. 따라서 리스트를 사용한 활동도 2022의 취지에 부합하며, ‘배열’과 ‘순차적인 데이터 저장’을 완전히 같은 범위로 보면 안 된다.",
      "comparison2015": true,
      "legacyEvidence": {
        "examYear": 2025,
        "paper": "A",
        "question": 6,
        "construct": "2015 문제해결과 프로그래밍과 2022 알고리즘과 프로그래밍의 학교급·내용 범위 변화를 성취기준 해설로 판별하는 비교형 기출 구조를 참고하되, 센서 데이터 저장 수업 전환 상황으로 재구성"
      },
      "validationStatus": "v2.4-curriculum-transition-v740",
      "subjects": [
        "2015-high-info",
        "middle-info"
      ],
      "areas": [
        "문제해결과 프로그래밍",
        "알고리즘과 프로그래밍"
      ],
      "sections": [
        "내용 체계",
        "성취기준",
        "성취기준 해설"
      ],
      "points": 4,
      "curriculumScopes": [
        {
          "subject": "high-info",
          "area": "알고리즘과 프로그래밍"
        },
        {
          "subject": "middle-info",
          "area": "알고리즘과 프로그래밍"
        }
      ],
      "explanationDetail": {
        "examPoint": "2025학년도 전공A 6번에서 확인된 ‘2015↔2022 내용체계 비교 → 학교급 판별 → 성취기준 해설로 차이 설명’ 구조를 production에 처음 도입한다. 단순 용어 대응이 아니라 같은 듯 보이는 배열/순차 저장의 범위 차이를 판단하게 한다.",
        "watchOut": "‘배열’이라는 단어만 보고 두 교육과정을 동일하게 보면 안 된다. 2015는 배열 자체의 개념·구조와 원소 조작을 구체화하고, 2022 중학교는 배열이나 리스트 등을 포괄하는 순차적 저장 구조의 활용으로 일반화한다. 또한 2015의 해당 프로그래밍 내용은 고등학교, 2022의 해당 내용은 중학교라는 학교급 이동도 함께 구분해야 한다."
      }
    }
  ]
};

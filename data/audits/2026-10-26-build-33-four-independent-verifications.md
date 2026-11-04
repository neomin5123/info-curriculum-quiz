# Build 33 독립 전수 검증 — 4문항

공식 채점기준 대조 및 브라우저 E2E는 미실시. A_procedural은 전체 소문항을 독립 계산 및 원본 조건으로 확인했다는 의미이며 확률 90% 이상이라는 뜻이 아니다.

## 2025-A-03 (PDF 131쪽)

- ㉠: **w[i] * input_v[i]** — for i=0..dim-1, dot product sum(w[i]*input_v[i])
- ㉡: **input_v** — C array-to-pointer conversion in function call, passing array name

## 2026-A-06 (PDF 146쪽)

- ㉠: **des[i][j] = 0;**
- ㉡: **arr1[i][k] && arr2[k][j]**
- ⓐ: **0 1**
- ⓑ: **0 1**

## 2026-A-10 (PDF 149쪽)

- max frequency: **1000 Hz** — 24000bits / (6 bits/sample *2 sec)=2000 samples/sec; Nyquist half=1000 Hz
- Network 2 mask: **255.255.255.192 (/26)** — 50 hosts +2 reserved=52 <= 64 addresses; 26 network bits
- misconfigured host and destination: **PC1, 200.10.1.64/26** — Network3 200.10.1.128-191, PC1 .126 belongs to Network2 64-127

## 2026-A-11 (PDF 149쪽)

- reverse-linear collisions and location for 25: **2 collisions, bucket 10**
- quadratic collision count: **10 total**
- quadratic bucket 3 code: **25**


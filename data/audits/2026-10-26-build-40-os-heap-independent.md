# Build 40 — heap sorting, process states

## 2026-B-10 — A (source PDF p.156 inspected)
- Complete 1-indexed min-heap rebuilding and extraction simulated with Python, matching original C algorithm. Initial heap after bottom-up construction: `[1, 10, 20, 40, 30, 50, 70]`.
- Fill ㉠: `child < n && list[child] > list[child+1]`; fill ㉡: `makeHeap(list, i, 1)`.
- Print ⓐ **40**, print ⓑ **2**. Descending result `[70, 50, 40, 30, 20, 10, 1]`.
- All four components independently rederived and matched saved answer. No official marking rubric comparison.

## 2026-B-06 — B (limited examination of stored text)
- The stored orphan scenario (parent exits, child still ready after line 5) is *possible*.
- A zombie scenario (child exits, parent has not yet called `wait`) is *possible*. Whether exact line/state combinations are unique is not established; do not promote to A without original state diagram and official grading interpretation.

## Ledger
- Previous A IDs 23, added **2026-B-10** → unique procedural A = **24**.
- Existing solved answers/explanations unchanged, `2024-B-07` pending. No browser E2E.

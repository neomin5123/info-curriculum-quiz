# Build 48: browser access and input-pipeline verification

- Chromium/Playwright tested with `file:///mnt/data/curri_build48_work/index.html` and `http://127.0.0.1:8765/`: both `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No browser E2E claimed.
- New `tools/validate-cloze-input-pipeline-b48.mjs` evaluates production `inputRows` and production grading code; tests 54 curated source rows and 136 expected input values, including correct/empty/wrong answers, mask, typing. This is an executable integration contract, not a live DOM test.
- All original educational documents and exam answers remain unchanged.

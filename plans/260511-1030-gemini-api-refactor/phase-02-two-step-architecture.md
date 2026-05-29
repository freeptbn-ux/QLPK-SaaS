# Phase 02: Two-Step Architecture Implementation

## Objective
Solve the conflict between Google Search and JSON mode by splitting the process into two separate AI calls.

## Requirements
- **Step 1:** Call Gemini with `tools: [{google_search: {}}]` to get medicine info as plain text/markdown.
- **Step 2:** Call Gemini with `response_mime_type: "application/json"` using the output from Step 1 as context to format it into the required schema.

## Implementation Steps
1. [x] Refactor `src/app/api/medicine-dosage/route.ts` to separate the logic.
2. [x] Implement the first `fetch` call for search (no JSON mode).
3. [x] Implement the second `fetch` call for formatting (no Search tool).
4. [x] Ensure error handling for both steps.
5. [x] Maintain the load-balancing/retry logic across the two steps.

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts` - Major refactor of the POST handler.

## Test Criteria
- [x] Successful response contains valid JSON with search-updated data.
- [x] No 400 error regarding "Tool use with response mime type".

---
Next Phase: [phase-03-validation.md](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260511-1030-gemini-api-refactor/phase-03-validation.md)

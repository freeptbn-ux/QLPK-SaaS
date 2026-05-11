# Phase 01: Environment Cleanup

## Objective
Remove compromised API keys and update the model configuration to a valid stable version.

## Requirements
- Identify and remove leaked keys (Key 4 and Key 12) from `GEMINI_API_KEYS`.
- Keep model string as `gemini-2.5-flash-lite` (user requested).

## Implementation Steps
1. [x] Check `.env` or system environment for `GEMINI_API_KEYS`.
2. [x] Manually (or via script) remove the 4th and 12th keys from the comma-separated list.
3. [x] Update `src/app/api/medicine-dosage/route.ts` to change the model endpoint URL.

## Files to Create/Modify
- `.env` / `.env.local` - Update API keys list.
- `src/app/api/medicine-dosage/route.ts` - Update model name.

## Test Criteria
- [x] API should not return 403 (Permission Denied) due to leaked keys.
- [x] API should not return 404/400 due to invalid model name.

---
Next Phase: [phase-02-two-step-architecture.md](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260511-1030-gemini-api-refactor/phase-02-two-step-architecture.md)

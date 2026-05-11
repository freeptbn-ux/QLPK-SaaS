# Plan: AI Security Hardening (Prompt Injection Fix)
Created: 2026-05-11 10:00
Status: 🟡 In Progress

## Overview
Dự án nhằm vá lỗ hổng Prompt Injection trong API tra cứu liều lượng thuốc (`/api/medicine-dosage`). Chúng ta sẽ sử dụng Zod để validate đầu vào và tái cấu trúc cách gửi yêu cầu tới Gemini (System Instructions + JSON Schema) để đảm bảo AI không bị "bẻ lái".

## Tech Stack
- **Framework:** Next.js Server Actions / API Routes
- **Validation:** Zod
- **AI Model:** Gemini 2.5 Flash-Lite
- **Language:** TypeScript

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | [Validation Layer](phase-01-validation-layer.md) | ⬜ Pending | 0% |
| 02 | [Prompt Restructuring](phase-02-prompt-restructuring.md) | ⬜ Pending | 0% |
| 03 | [Output Schema & Hardening](phase-03-output-schema.md) | ⬜ Pending | 0% |
| 04 | [Testing & Verification](phase-04-testing-verification.md) | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`

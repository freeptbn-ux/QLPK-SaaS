# Plan: Tra cứu liều dùng thuốc bằng Gemini AI

Created: 2026-05-08 19:50
Status: 🟡 In Progress

## Overview

Thêm tính năng **tra cứu liều dùng thuốc bằng AI** vào trang kê đơn (`/patients/[id]/prescribe`).

**Flow:** Bác sĩ kê thuốc → Tên thuốc hiện dạng link → Click vào → **Popup bong bóng hội thoại kiểu truyện tranh Doraemon** xuất hiện → Gọi Gemini API tra cứu liều dùng → Hiển thị kết quả phân theo độ tuổi.

## User Story

> Là bác sĩ, tôi muốn click vào tên thuốc đã kê để xem nhanh liều dùng cho người lớn và trẻ em, giúp tôi kê đơn chính xác hơn mà không cần rời khỏi trang.

## Tech Stack

- **Frontend:** React (Next.js 16) + Framer Motion (animation)
- **Backend API:** Next.js API Route (serverless trên Vercel)
- **AI Model:** Google Gemini `models/gemini-2.5-flash-lite` (REST API)
- **Deploy:** Vercel (serverless functions)

## Key Design Decisions

| Quyết định | Lý do |
|------------|-------|
| API Route server-side (`/api/medicine-dosage`) | Bảo mật Gemini API key, không expose ra client |
| Speech bubble popup (Doraemon style) | UX vui, nhẹ nhàng, không che khuất form kê đơn |
| Không streaming, chờ full response | Response ngắn (~200 từ), không cần stream |
| Cache kết quả trong React state | Tránh gọi API lặp cho cùng 1 thuốc trong session |

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Backend API Route | ⬜ Pending | 0% |
| 02 | Speech Bubble Component | ⬜ Pending | 0% |
| 03 | Tích hợp vào Prescription Form | ⬜ Pending | 0% |
| 04 | Testing & Polish | ⬜ Pending | 0% |
| 05 | Mobile UX Fixes | ⬜ Pending | 0% |

**Tổng:** ~24 tasks | Ước tính: 1-2 sessions

## Quick Commands

- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`

# Plan: Fix Critical Logic Flaws
Created: 2026-05-10 23:16
Status: 🟡 In Progress

## Overview
Kế hoạch này tập trung xử lý 5 lỗi logic "Nguy hiểm" (Critical) được phát hiện trong đợt kiểm tra hệ thống. Đây là những lỗi ảnh hưởng trực tiếp đến bảo mật dữ liệu bệnh nhân, tính chính xác của kho thuốc và tính pháp lý của hệ thống y tế.

## Tech Stack & Tools
- Database: Supabase (PostgreSQL)
- Backend: Next.js Server Actions
- Documentation: [loi.md](../../loi.md)

## Phases Progress

| Phase | Name | Status | Progress | Focus |
|-------|------|--------|----------|-------|
| 01 | **Security & Privacy** | ⬜ Pending | 0% | RLS Leakage & Anonymous Access |
| 02 | **Data Integrity** | ⬜ Pending | 0% | Transactions & History Append |
| 03 | **Audit & Compliance** | ⬜ Pending | 0% | Audit Trail System |

## Fix Details (Critical 1-5)
1. **Flaw #1:** Tạo đơn thuốc không đồng nhất (Transactions).
2. **Flaw #2:** Mất lịch sử y tế (Replacement bug).
3. **Flaw #3:** Lộ dữ liệu thống kê (Multi-tenant leakage).
4. **Flaw #4:** Truy cập ẩn danh (Public RPC access).
5. **Flaw #5:** Thiếu nhật ký thay đổi (Audit Trail).

## Quick Commands
- Bắt đầu Phase 1: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu kiến thức: `/save-brain`

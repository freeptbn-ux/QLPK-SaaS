# Plan: Thêm tính năng "Lịch sử dùng thuốc" cho bệnh nhân
Created: 2026-04-23T10:43
Status: 🟡 In Progress

## Overview
Thêm tính năng "Lịch sử dùng thuốc" giống app cũ (Python/PySide6) vào ứng dụng web QLPK-SaaS.

**Chức năng:** Khi bấm nút trên trang chi tiết bệnh nhân, hệ thống sẽ hiện bảng tổng hợp toàn bộ các loại thuốc mà bệnh nhân đó đã từng được kê, kèm theo số lần kê. Thuốc dùng từ 3 lần trở lên sẽ được in đậm để dễ nhận biết.

## So sánh Code Cũ vs Code Mới

| Tính năng | Code Cũ (Python) | Code Mới (Next.js) |
|-----------|-------------------|---------------------|
| Lịch sử khám bệnh (theo ngày) | ❌ Không có | ✅ Đã có (`PrescriptionHistory.tsx`) |
| Lịch sử dùng thuốc (tổng hợp) | ✅ Có (`HistoryWindow`) | ❌ **CHƯA CÓ** ← Cần thêm |

## Cách Code Cũ hoạt động
- Lấy tất cả `medical_history` của bệnh nhân (theo tên + ngày sinh)
- Dùng Regex tách tên thuốc từ text
- Dùng `Counter` đếm số lần xuất hiện
- Sắp xếp giảm dần theo số lần kê
- In đậm thuốc kê ≥ 3 lần

## Cách Code Mới sẽ làm (đơn giản hơn nhiều)
- Dữ liệu đã có sẵn trong bảng `prescription_details` (liên kết `medicine_id`)
- Chỉ cần query SQL GROUP BY + COUNT, không cần Regex
- Kết quả chính xác hơn code cũ (vì dựa trên dữ liệu có cấu trúc, không phải text)

## Tech Stack
- Backend: Supabase (SQL query qua Server Action)
- Frontend: MUI Dialog + Table
- Không cần cài thêm package nào

## Phases

| Phase | Name | Status | Mô tả |
|-------|------|--------|-------|
| 01 | Server Action | ⬜ Pending | Tạo hàm lấy dữ liệu tổng hợp thuốc |
| 02 | UI Component + Tích hợp | ⬜ Pending | Tạo Dialog hiển thị + gắn nút vào trang bệnh nhân |

**Tổng:** 2 phases | Ước tính: 1 session

## Quick Commands
- Bắt đầu: `/vietcode phase-01-server-action.md`
- Sau đó: `/vietcode phase-02-ui-integration.md`

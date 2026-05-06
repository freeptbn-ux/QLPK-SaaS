# Plan: Tối ưu hóa luồng tìm kiếm bệnh nhân (Patient Search)
Created: 2026-05-06 19:31
Status: 🟡 In Progress

## 📝 Tổng quan
Mục tiêu là cải thiện trải nghiệm người dùng (UX) khi tìm kiếm bệnh nhân. Hiện tại, mỗi lần gõ phím sẽ tạo ra một lịch sử mới trong trình duyệt và có thể gây giật trang. Chúng ta sẽ chuyển sang cơ chế "Replace" và dùng "Transition" để giao diện mượt mà hơn.

## 🛠️ Tech Stack liên quan
- **Frontend:** Next.js (App Router), React (hooks: useTransition, useCallback).
- **UI:** TailwindCSS, Lucide/Hi2 Icons.
- **Backend:** Supabase RPC (đã tối ưu GIN Index).

## 📅 Các giai đoạn (Phases)

| Phase | Tên giai đoạn | Trạng thái | Tiến độ |
|-------|------|--------|----------|
| 01 | Refactor Navigation (Sạch lịch sử) | ⬜ Pending | 0% |
| 02 | Transition & Loading Feedback | ⬜ Pending | 0% |
| 03 | Validation & Final Testing | ⬜ Pending | 0% |

## 🚀 Lệnh nhanh
- Bắt đầu Phase 1: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu kiến thức: `/save-brain`

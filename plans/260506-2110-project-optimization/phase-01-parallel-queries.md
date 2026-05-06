# Phase 01: Parallelize Database Queries
Status: ✅ Completed
Dependencies: None

## Objective
Chuyển đổi các truy vấn tuần tự (Sequential) sang song song (Parallel) bằng `Promise.all` để giảm thời gian chờ đợi dữ liệu từ Supabase.

## Requirements
### Functional
- [x] Cập nhật hàm `getPatientById` trong `src/actions/patients.ts`.
- [x] Đảm bảo cả thông tin bệnh nhân và lịch sử đơn thuốc được fetch cùng lúc.

## Implementation Steps
1. [x] Chỉnh sửa `src/actions/patients.ts`:
   - [x] Tạo các Promise cho `patientPromise` và `prescriptionsPromise`.
   - [x] Sử dụng `const [res1, res2] = await Promise.all([...])`.
   - [x] Xử lý lỗi cho từng kết quả trả về.

## Files to Create/Modify
- `src/actions/patients.ts` - Tối ưu hàm `getPatientById`.

## Test Criteria
- [x] API trả về đầy đủ dữ liệu bệnh nhân và đơn thuốc như cũ.
- [x] Thời gian phản hồi giảm (có thể đo bằng Console log hoặc Network tab).

---
Next Phase: [Phase 02: Suspense & Streaming](phase-02-suspense-streaming.md)

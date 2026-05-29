# Phase 02: Secure Medicine Dosage API
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Khóa API Tra cứu thuốc để chỉ bác sĩ đã đăng nhập mới có thể sử dụng, ngăn chặn việc spam gây tốn chi phí API Gemini.

## Requirements
### Functional
- [x] Gọi hàm `getAuthUser()` ngay đầu API route.
- [x] Trả về lỗi 401 (Unauthorized) nếu không có session hợp lệ.

### Security
- [x] Tuyệt đối không để API public.

## Implementation Steps
1. [x] Mở file `src/app/api/medicine-dosage/route.ts`.
2. [x] Import `getAuthUser` từ module xác thực.
3. [x] Thêm logic kiểm tra: `const user = await getAuthUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts`

## Test Criteria
- [x] Dùng công cụ test API (như Postman/Curl) gọi vào `/api/medicine-dosage` mà không có token -> Phải nhận lỗi 401.
- [x] Gọi API khi đã đăng nhập trên web -> Phải trả về kết quả bình thường.

---
Next Phase: [Phase 03: Documentation & Verification](./phase-03-docs-verification.md)

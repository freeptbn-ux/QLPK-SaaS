# Phase 01: Schema & Standard Design
Status: ✅ Completed

## Objective
Thiết kế lại cấu trúc dữ liệu đầu ra và xác định bộ quy tắc hiển thị "chuẩn" để định hướng cho AI ở các phase sau.

## Requirements
### Functional
- [x] Mở rộng `medicineDosageOutputSchema` để chứa dữ liệu theo cấu trúc mới.
- [x] Xác định các nhóm tuổi nhi khoa tiêu chuẩn:
    - Sơ sinh (0-28 ngày)
    - Nhũ nhi (1-12 tháng)
    - Trẻ em (1-12 tuổi, có thể chia nhỏ)
    - Trên 12 tuổi/Người lớn.

### Non-Functional
- [x] Tính linh hoạt: AI có thể trả về text dạng markdown gạch đầu dòng trong từng trường JSON.

## Implementation Steps
1. [x] Cập nhật `src/lib/validations/medicine.ts`:
    - Giữ nguyên các key chính nhưng thêm hướng dẫn/comment về định dạng text bên trong.
    - Đảm bảo Zod chấp nhận các ký tự `-`, `+`, `\n`.
2. [x] Tạo file mẫu "Gold Standard Response" cho 3 loại thuốc phổ biến:
    - ATERsin (Siro ho)
    - Hapacol (Paracetamol nhi)
    - Augmentin (Kháng sinh hỗn dịch)

## Files to Create/Modify
- `src/lib/validations/medicine.ts` - Cập nhật schema.
- `plans/260511-1051-pediatric-dosage-refactor/gold-standards.md` - (New) Tài liệu tham khảo cho AI.

## Test Criteria
- [x] Schema mới phải parse được dữ liệu có chứa newline (`\n`) và ký tự đặc biệt.

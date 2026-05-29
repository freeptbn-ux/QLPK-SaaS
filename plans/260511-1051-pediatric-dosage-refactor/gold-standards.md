# Gold Standard Medicine Responses

Tài liệu này định nghĩa cấu trúc và nội dung mẫu "chuẩn" mà AI cần tuân thủ khi trả về thông tin liều dùng thuốc, đặc biệt là cho bệnh nhi.

## Quy tắc chung
1. **children_dosage**: Phải chia theo các nhóm tuổi tiêu chuẩn:
    - **Sơ sinh (0-28 ngày)**: Nếu có chỉ định.
    - **Nhũ nhi (1-12 tháng)**: Chi tiết theo cân nặng nếu có thể.
    - **Trẻ em (1-12 tuổi)**: Chia nhỏ theo cân nặng hoặc các mốc tuổi (1-3, 4-6, 7-12).
    - **Trẻ > 12 tuổi**: Thường áp dụng liều người lớn.
2. **Định dạng**: Sử dụng dấu gạch đầu dòng (`-`), xuống dòng (`\n`) để phân tách các ý rõ ràng trong JSON string.
3. **Đơn vị**: Sử dụng mg, ml, gói, viên rõ ràng.

---

## 1. ATERsin (Siro ho)
**medicine_name**: ATERsin (Siro)
**adult_dosage**: 
- Uống 10 - 20 ml/lần.
- Ngày dùng 2 - 3 lần.
**children_dosage**:
- **Trẻ < 3 tuổi**: Uống 2,5 ml/lần.
- **Trẻ 3 - 6 tuổi**: Uống 2,5 - 5 ml/lần.
- **Trẻ 7 - 15 tuổi**: Uống 5 - 10 ml/lần.
- Tần suất: Ngày dùng 2 - 3 lần.
**usage_instructions**:
- Sử dụng cốc đong đi kèm để lấy đúng liều lượng.
- Có thể uống cùng hoặc ngoài bữa ăn.
**description**:
Thuốc tác dụng làm loãng đờm, hỗ trợ điều trị ho trong các bệnh lý đường hô hấp.
**contraindications**:
- Mẫn cảm với bất cứ thành phần nào của thuốc.
- Bệnh nhân bị hen suyễn nặng.
**side_effects**:
- Run tay, nhức đầu, đánh trống ngực.
- Trẻ em có thể gặp rối loạn giấc ngủ hoặc hành vi.

---

## 2. Hapacol (Paracetamol nhi - Gói/Siro)
**medicine_name**: Hapacol (80mg, 150mg, 250mg)
**adult_dosage**: 
- 500mg - 1000mg mỗi 4 - 6 giờ.
- Không quá 4000mg/ngày.
**children_dosage**:
- **Liều tính theo cân nặng**: 10 - 15 mg/kg/liều.
- **Nhũ nhi & Trẻ em**:
    - Trẻ 5 - 8 kg: Dùng gói 80mg.
    - Trẻ 10 - 15 kg: Dùng gói 150mg.
    - Trẻ 16 - 25 kg: Dùng gói 250mg.
- **Khoảng cách**: Cách mỗi 4 - 6 giờ nếu còn sốt.
- **Tối đa**: Không quá 60 mg/kg/ngày hoặc 5 lần/ngày.
**usage_instructions**:
- Hòa tan thuốc bột vào một lượng nước nhỏ cho trẻ uống ngay.
- Chỉ dùng khi trẻ sốt ≥ 38.5°C.
**description**:
Thuốc giảm đau, hạ sốt phổ biến cho trẻ em.
**contraindications**:
- Quá mẫn với paracetamol.
- Người bệnh thiếu hụt glucose - 6 - phosphat dehydrogenase.
**side_effects**:
- Hiếm gặp: Phát ban, buồn nôn.
- Dùng quá liều gây tổn thương gan nghiêm trọng.

---

## 3. Augmentin (Amoxicillin/Clavulanate - Hỗn dịch)
**medicine_name**: Augmentin (250mg/31.25mg hoặc 500mg/62.5mg)
**adult_dosage**: 
- 500mg/62.5mg x 3 lần/ngày hoặc 875mg/125mg x 2 lần/ngày.
**children_dosage**:
- **Sơ sinh (< 3 tháng)**: 30 mg/kg/ngày (tính theo Amoxicillin), chia 2 lần.
- **Trẻ em (< 40kg)**: 
    - Nhiễm khuẩn nhẹ/vừa: 40 - 45 mg/kg/ngày, chia 2 - 3 lần.
    - Nhiễm khuẩn nặng: 80 mg/kg/ngày, chia 2 - 3 lần.
- **Trẻ > 40kg**: Dùng theo liều người lớn.
**usage_instructions**:
- Uống vào đầu bữa ăn để giảm thiểu không dung nạp đường tiêu hóa.
- Pha bột thuốc với nước chín theo đúng vạch hướng dẫn, lắc đều trước khi dùng.
- Bảo quản hỗn dịch đã pha trong tủ lạnh (2 - 8°C) và dùng trong vòng 7 ngày.
**description**:
Kháng sinh phổ rộng điều trị các bệnh nhiễm khuẩn tai mũi họng, đường hô hấp, tiết niệu.
**contraindications**:
- Dị ứng với penicillin hoặc các thành phần của thuốc.
- Tiền sử vàng da/suy gan liên quan đến Augmentin.
**side_effects**:
- Tiêu chảy, buồn nôn, nôn mửa.
- Nhiễm nấm Candida trên da và niêm mạc.

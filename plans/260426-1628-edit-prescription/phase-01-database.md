# Phase 01: Database — RPC `update_prescription`
Status: ✅ Completed
Dependencies: None

## Objective
Tạo Supabase RPC function `update_prescription` xử lý toàn bộ logic chỉnh sửa đơn thuốc trong **một transaction duy nhất**, bao gồm đồng bộ kho thuốc.

## Requirements
### Functional
- [ ] Nhận vào: `prescription_id`, `diagnosis`, `notes`, `prescription_date`, và `items` (JSONB array mới hoàn toàn).
- [ ] So sánh danh sách thuốc cũ vs mới, tính **delta kho thuốc** cho từng loại thuốc.
- [ ] Cập nhật `prescriptions_header`: diagnosis, notes, prescription_date, total_amount.
- [ ] Xóa toàn bộ `prescription_details` cũ rồi insert mới (strategy: delete-then-insert — đơn giản hơn so sánh từng dòng).
- [ ] Cập nhật `medicines.stock_quantity` theo delta.
- [ ] Cập nhật `patients.diagnosis` nếu đây là đơn mới nhất.
- [ ] Rebuild `patients.medical_history` (legacy text).

### Non-Functional
- [ ] Toàn bộ trong 1 transaction (plpgsql function đảm bảo atomicity).
- [ ] Cho phép kho âm (không CHECK constraint chặn).

## Implementation Steps

### Step 1: Tạo file migration
File: `supabase/migrations/20260426163000_add_update_prescription_rpc.sql`

### Step 2: Viết RPC function `update_prescription`

**Logic chi tiết:**

```sql
CREATE OR REPLACE FUNCTION update_prescription(
  p_prescription_id BIGINT,
  p_diagnosis TEXT,
  p_notes TEXT,
  p_prescription_date TIMESTAMPTZ,
  p_items JSONB
) RETURNS VOID AS $$
DECLARE
  v_patient_id BIGINT;
  v_consultation_fee REAL;
  v_old_item RECORD;
  v_item JSONB;
  v_total_medicines REAL := 0;
  v_history_text TEXT := '';
  v_index INTEGER := 1;
  v_latest_prescription_id BIGINT;
BEGIN
  -- 1. Lấy patient_id và consultation_fee từ header hiện tại
  SELECT patient_id, consultation_fee 
  INTO v_patient_id, v_consultation_fee 
  FROM prescriptions_header 
  WHERE id = p_prescription_id;

  -- 2. BÙ KHO: Hoàn trả stock cho tất cả thuốc cũ
  FOR v_old_item IN 
    SELECT medicine_id, quantity 
    FROM prescription_details 
    WHERE prescription_header_id = p_prescription_id
  LOOP
    UPDATE medicines
    SET stock_quantity = stock_quantity + v_old_item.quantity
    WHERE id = v_old_item.medicine_id;
  END LOOP;

  -- 3. XÓA details cũ
  DELETE FROM prescription_details 
  WHERE prescription_header_id = p_prescription_id;

  -- 4. INSERT details mới + TRỪ KHO
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO prescription_details (
      prescription_header_id, medicine_id, quantity, unit_price
    ) VALUES (
      p_prescription_id,
      (v_item->>'medicine_id')::BIGINT,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::REAL
    );

    v_total_medicines := v_total_medicines 
      + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;

    -- Build legacy history text
    v_history_text := v_history_text || v_index || ') ' 
      || (v_item->>'medicine_name') || ' x ' 
      || (v_item->>'quantity') || ' ' 
      || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Trừ kho cho thuốc mới
    UPDATE medicines
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'medicine_id')::BIGINT;
  END LOOP;

  -- 5. Update header
  UPDATE prescriptions_header 
  SET 
    diagnosis = p_diagnosis,
    notes = p_notes,
    prescription_date = p_prescription_date,
    total_amount = v_total_medicines + v_consultation_fee
  WHERE id = p_prescription_id;

  -- 6. Cập nhật patient nếu đây là đơn mới nhất
  SELECT id INTO v_latest_prescription_id
  FROM prescriptions_header
  WHERE patient_id = v_patient_id
  ORDER BY prescription_date DESC
  LIMIT 1;

  IF v_latest_prescription_id = p_prescription_id THEN
    UPDATE patients 
    SET 
      diagnosis = p_diagnosis,
      medical_history = p_diagnosis || E'\n' || v_history_text,
      updated_at = NOW()
    WHERE id = v_patient_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Giải thích strategy "Bù toàn bộ → Xóa → Insert mới → Trừ mới":**
- Đơn giản hơn so với tính delta từng thuốc
- Kết quả cuối cùng giống nhau: `old_stock + old_qty - new_qty = new_stock`
- Atomic trong 1 transaction nên không có race condition

### Step 3: Grant permissions
```sql
GRANT EXECUTE ON FUNCTION update_prescription(BIGINT, TEXT, TEXT, TIMESTAMPTZ, JSONB) 
TO authenticated;
```

### Step 4: Chạy migration trên Supabase
Chạy SQL trên Supabase Dashboard hoặc qua migration runner.

## Files to Create/Modify
- `supabase/migrations/20260426163000_add_update_prescription_rpc.sql` — **NEW**: RPC function

## Test Criteria
- [ ] Gọi RPC với data mới → prescription_details được cập nhật đúng
- [ ] Kho thuốc cũ được bù, kho thuốc mới được trừ
- [ ] Đổi thuốc A→B: kho A tăng, kho B giảm
- [ ] Xóa thuốc khỏi đơn: kho bù đúng số lượng
- [ ] Thêm thuốc mới: kho trừ đúng số lượng
- [ ] `total_amount` được tính lại (tiền thuốc mới + consultation_fee cũ)
- [ ] `patients.diagnosis` chỉ update khi đây là đơn mới nhất
- [ ] Kho âm: không bị block bởi constraint

## Notes
- Strategy "bù toàn bộ rồi trừ lại" tuy có thêm vài UPDATE nhưng **đơn giản, dễ debug, ít bug hơn** so với tính delta.
- Consultation fee KHÔNG đổi (theo yêu cầu), nhưng vẫn cần đọc ra để tính lại total_amount.

---
Next Phase: [Phase 02: Backend — Server Action + Validation](./phase-02-backend.md)

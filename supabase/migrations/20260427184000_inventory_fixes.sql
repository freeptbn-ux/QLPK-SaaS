-- Phase 01: Database & RPC for Inventory Fixes
-- Created: 2026-04-27
-- Objective: Atomic stock adjustment and transaction logging

-- 1. Add CHECK constraint to prevent negative stock (fix existing negative stocks first)
UPDATE medicines SET stock_quantity = 0 WHERE stock_quantity < 0;

ALTER TABLE medicines DROP CONSTRAINT IF EXISTS medicines_stock_quantity_check;
ALTER TABLE medicines ADD CONSTRAINT medicines_stock_quantity_check CHECK (stock_quantity >= 0);

-- 2. Create inventory_transaction_logs table
CREATE TABLE IF NOT EXISTS inventory_transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL REFERENCES clinics(id) DEFAULT 1,
    medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    old_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    adjustment INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and add policies for inventory_transaction_logs
ALTER TABLE inventory_transaction_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view inventory logs in their clinic" ON inventory_transaction_logs;
CREATE POLICY "Users can view inventory logs in their clinic" 
    ON inventory_transaction_logs FOR SELECT 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Admins can manage inventory logs" ON inventory_transaction_logs;
CREATE POLICY "Admins can manage inventory logs" 
    ON inventory_transaction_logs FOR ALL 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Apply clinic_id trigger to inventory_transaction_logs
DROP TRIGGER IF EXISTS tr_set_clinic_id_inventory_logs ON inventory_transaction_logs;
CREATE TRIGGER tr_set_clinic_id_inventory_logs BEFORE INSERT ON inventory_transaction_logs FOR EACH ROW EXECUTE FUNCTION set_clinic_id_from_profile();

-- 5. Create the Atomic Stock Adjustment RPC
CREATE OR REPLACE FUNCTION adjust_medicine_stock(
  p_medicine_id BIGINT,
  p_adjustment INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_quantity INTEGER;
  v_new_quantity INTEGER;
  v_user_id UUID;
  v_clinic_id BIGINT;
BEGIN
  -- Get current user context
  v_user_id := auth.uid();
  v_clinic_id := get_my_clinic_id();

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User has no associated clinic';
  END IF;

  -- Lock the medicine row for update to prevent race conditions
  -- and ensure it belongs to the same clinic
  SELECT stock_quantity INTO v_old_quantity
  FROM medicines
  WHERE id = p_medicine_id AND clinic_id = v_clinic_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Medicine not found or access denied';
  END IF;

  v_new_quantity := v_old_quantity + p_adjustment;

  -- Atomic check for negative stock
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested adjustment: %', v_old_quantity, p_adjustment;
  END IF;

  -- Update medicines
  UPDATE medicines
  SET stock_quantity = v_new_quantity
  WHERE id = p_medicine_id AND clinic_id = v_clinic_id;

  -- Insert log
  INSERT INTO inventory_transaction_logs (
    clinic_id,
    medicine_id,
    user_id,
    old_quantity,
    new_quantity,
    adjustment,
    reason
  ) VALUES (
    v_clinic_id,
    p_medicine_id,
    v_user_id,
    v_old_quantity,
    v_new_quantity,
    p_adjustment,
    p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION adjust_medicine_stock TO authenticated;

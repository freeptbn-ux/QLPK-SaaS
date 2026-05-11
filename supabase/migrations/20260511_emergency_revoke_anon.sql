-- Phase 02: SQL Access Control (Khóa quyền người lạ)
-- Objective: Thu hồi toàn bộ quyền thao tác dữ liệu của người dùng chưa đăng nhập (anon)

-- 1. Thu hồi quyền trên toàn bộ bảng trong schema public để đảm bảo không ai có thể truy cập qua anon key
-- Lưu ý: Supabase mặc định cấp quyền cho anon trên schema public, chúng ta cần thu hồi để ép buộc dùng RLS hoặc Auth
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE USAGE ON SCHEMA public FROM anon;

-- 2. Đảm bảo role authenticated vẫn có quyền truy cập cơ bản
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 3. Kích hoạt RLS cho bảng clinics (trước đây đang bị disabled)
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- 4. Tạo Policy cho clinics
-- Chỉ cho phép người dùng xem clinic mà họ thuộc về (dựa trên clinic_id trong bảng profiles)
-- Policy này giúp bảo vệ thông tin đa chi nhánh (multi-tenancy)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clinics' AND policyname = 'Users can view their own clinic'
    ) THEN
        CREATE POLICY "Users can view their own clinic" ON public.clinics
        FOR SELECT
        USING (
            id IN (
                SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

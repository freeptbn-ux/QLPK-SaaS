-- Phase 01: Grant RPC Permissions (Secure Version)
-- Objective: Chỉ cấp quyền EXECUTE cho authenticated users

-- 1. Cấp quyền trên toàn bộ các hàm hiện có trong schema public
-- Chỉ cho phép người dùng đã đăng nhập thực thi các hàm
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 2. Đảm bảo các hàm được tạo trong tương lai cũng chỉ cấp quyền cho authenticated
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

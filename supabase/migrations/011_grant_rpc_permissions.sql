-- Phase 01: Grant RPC Permissions (Robust Version)
-- Objective: Cấp quyền EXECUTE cho anon và authenticated mà không bị lỗi signature mismatch

-- 1. Cấp quyền trên toàn bộ các hàm hiện có trong schema public
-- Đây là cách an toàn và bao phủ tất cả các RPC functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 2. Đảm bảo các hàm được tạo trong tương lai cũng tự động có quyền này
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

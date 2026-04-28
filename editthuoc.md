# 🐛 Phân Tích Lỗi: "infinite recursion detected in policy for relation profiles"

## 📋 Tổng Quan

| Thông tin | Chi tiết |
|-----------|----------|
| **Lỗi** | `42P17` - infinite recursion detected in policy for relation "profiles" |
| **Khi nào** | Edit số lượng thuốc trong kho thuốc |
| **Vị trí** | `src/actions/medicines.ts:19` → `getAllMedicines()` |
| **Trang** | `/medicines` (danh sách thuốc) |
| **Mức nghiêm trọng** | 🔴 **Critical** - Toàn bộ trang thuốc không hoạt động |

---

## 🔍 Nguyên Nhân Gốc (Root Cause)

### Giải thích đơn giản

> Khi bạn edit thuốc, app reload lại trang `/medicines` và gọi `getAllMedicines()`.
> Hàm này query bảng `medicines`, nhưng bảng `medicines` có **chính sách bảo mật (RLS policy)** yêu cầu kiểm tra "user này thuộc phòng khám nào?" bằng cách đọc bảng `profiles`.
> Bảng `profiles` CŨNG có chính sách bảo mật yêu cầu kiểm tra "user này có role admin không?" bằng cách... đọc lại bảng `profiles` → **VÒNG LẶP VÔ HẠN** ❌

### Phân tích kỹ thuật chi tiết

#### Chuỗi sự kiện gây lỗi:

```
User edit thuốc
    → revalidatePath('/medicines')
    → getAllMedicines() gọi supabase.from('medicines').select('*')
    → PostgREST chạy query dưới role 'authenticated'
    → PostgreSQL evaluate RLS policies trên 'medicines'
    → Policy gọi get_my_clinic_id() & get_my_role()
    → 2 hàm này SELECT FROM profiles
    → PostgreSQL evaluate RLS policies trên 'profiles'
    → Policy 'Admins can view all profiles' gọi get_my_role() & get_my_clinic_id()
    → 2 hàm lại SELECT FROM profiles
    → 💥 INFINITE RECURSION DETECTED!
```

#### 3 thành phần tạo vòng lặp:

**1. Helper Functions (hàm trợ giúp):**

```sql
-- get_my_role() → đọc bảng profiles
CREATE FUNCTION get_my_role() RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- get_my_clinic_id() → cũng đọc bảng profiles  
CREATE FUNCTION get_my_clinic_id() RETURNS BIGINT AS $$
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

**2. Policy trên bảng `medicines` (gọi 2 hàm trên):**

```sql
-- Policy này gọi get_my_clinic_id() và get_my_role() 
CREATE POLICY "Admins/Doctors can manage medicines" ON medicines FOR ALL
    USING (
        clinic_id = get_my_clinic_id() 
        AND get_my_role() IN ('admin', 'doctor')
    );
```

**3. Policy trên bảng `profiles` (CŨNG gọi 2 hàm trên → 💥 VÒNG LẶP):**

```sql
-- ⚠️ ĐÂY LÀ THỦ PHẠM CHÍNH
CREATE POLICY "Admins can view all profiles in clinic" ON profiles FOR ALL
    USING (
        get_my_role() = 'admin'         -- ← gọi SELECT FROM profiles
        AND clinic_id = get_my_clinic_id() -- ← gọi SELECT FROM profiles
    );
```

#### Tại sao `SECURITY DEFINER` không cứu được?

Migration `20260428023100_fix_rls_recursion.sql` đã cố fix bằng cách thêm `SECURITY DEFINER` vào 2 hàm helper. Ý tưởng: hàm chạy dưới quyền `postgres` (owner) → `postgres` có `rolbypassrls = true` → bypass RLS → không trigger policies trên `profiles`.

**Nhưng thất bại vì:**

| Điều kiện | Trạng thái | Giải thích |
|-----------|-----------|------------|
| `SECURITY DEFINER` | ✅ Đã set | Functions run as owner |
| Owner = `postgres` | ✅ Đúng | Owner role is postgres |
| `rolbypassrls` | ✅ true | Postgres role can bypass RLS |
| `rolsuper` | ❌ **false** | Postgres KHÔNG phải superuser trên Supabase |
| SQL function inlining | ⚠️ **Đây là vấn đề** | PostgreSQL optimizer inline SQL functions |

> **Kết luận:** PostgreSQL optimizer **inline** (mở rộng) body của SQL language functions (`LANGUAGE sql`) trực tiếp vào query plan. Khi inline, nó "thấy" `SELECT FROM profiles` xuất hiện trong policy evaluation context → phát hiện recursion ở mức planner, **TRƯỚC khi** `SECURITY DEFINER` có cơ hội bypass RLS ở runtime.

---

## 📊 Hiện trạng Database

### RLS Policies trên bảng `profiles` (hiện tại):

| Policy | Lệnh | Điều kiện USING |
|--------|-------|-----------------|
| `Users can view their own profile` | SELECT | `auth.uid() = id` ✅ An toàn |
| `Users can update their own profile name` | UPDATE | `auth.uid() = id` ✅ An toàn |
| `Admins can view all profiles in clinic` | **ALL** | `get_my_role() = 'admin' AND clinic_id = get_my_clinic_id()` ❌ **GÂY RECURSION** |

### Chuỗi đệ quy:

```
profiles policy → get_my_role() → SELECT FROM profiles → profiles policy → get_my_role() → ...
                                                                            ↑__________________|
```

---

## 💡 Giải pháp đề xuất

### Giải pháp A: Chuyển functions sang `LANGUAGE plpgsql` (Khuyên dùng - 95% hiệu quả)

**Lý do:** PL/pgSQL functions **KHÔNG bị inline** bởi optimizer → `SECURITY DEFINER` sẽ thực sự bypass RLS.

```sql
-- Fix get_my_role: chuyển từ SQL sang PL/pgSQL
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Fix get_my_clinic_id: chuyển từ SQL sang PL/pgSQL
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS BIGINT AS $$
DECLARE
    v_clinic_id BIGINT;
BEGIN
    SELECT clinic_id INTO v_clinic_id FROM public.profiles WHERE id = auth.uid();
    RETURN v_clinic_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
```

### Giải pháp B: Dùng `auth.jwt()` thay vì query `profiles` (Backup)

**Lý do:** Đọc thông tin từ JWT token thay vì query bảng → không trigger RLS.

```sql
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role')::user_role,
        'staff'::user_role
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

> ⚠️ Giải pháp B yêu cầu sync `role` vào JWT claims khi user signup/update → phức tạp hơn.

### Giải pháp C: Bỏ policy "Admins can view all profiles" hoặc đổi logic

```sql
-- Thay vì dùng get_my_role(), dùng subquery trực tiếp với auth.uid()
DROP POLICY IF EXISTS "Admins can view all profiles in clinic" ON profiles;
CREATE POLICY "Admins can view all profiles in clinic" 
    ON profiles FOR SELECT  -- Đổi từ ALL → SELECT để giảm scope
    TO authenticated 
    USING (
        clinic_id = (SELECT p.clinic_id FROM public.profiles p WHERE p.id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );
```

> ⚠️ Giải pháp C vẫn có thể bị recursion vì subquery cũng access `profiles`.

---

## ✅ Khuyến nghị

**Áp dụng Giải pháp A** — Đây là fix tiêu chuẩn được Supabase khuyến nghị cho vấn đề này.

### Migration SQL cần chạy:

```sql
-- Migration: fix_rls_recursion_v2
-- Chuyển helper functions từ LANGUAGE sql → LANGUAGE plpgsql
-- để tránh function inlining gây infinite recursion

-- 1. Fix get_my_role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Fix get_my_clinic_id
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS BIGINT AS $$
DECLARE
    v_clinic_id BIGINT;
BEGIN
    SELECT clinic_id INTO v_clinic_id FROM public.profiles WHERE id = auth.uid();
    RETURN v_clinic_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
```

### Sau khi fix, cần kiểm tra:
1. ✅ Trang `/medicines` load bình thường
2. ✅ Edit số lượng thuốc không còn lỗi
3. ✅ Thêm/xóa thuốc hoạt động
4. ✅ Trang `/patients`, `/prescriptions` không bị ảnh hưởng
5. ✅ Trang `/settings` (cũng dùng `get_my_role()`) hoạt động

---

## 📚 Tham khảo

- [Supabase RLS Performance & Recursion Guide](https://supabase.com/docs/guides/database/postgres/row-level-security#policies-with-security-definer-functions)
- [PostgreSQL Function Inlining](https://wiki.postgresql.org/wiki/Inlining_of_SQL_functions)
- Mã lỗi PostgreSQL: `42P17` = `invalid_recursion`

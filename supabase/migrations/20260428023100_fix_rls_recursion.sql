-- Fix infinite recursion in RLS policies by using SECURITY DEFINER functions

-- 1. Helper function for role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Update get_my_clinic_id to be secure
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS BIGINT AS $$
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Fix profiles policy
DROP POLICY IF EXISTS "Admins can view all profiles in clinic" ON profiles;
CREATE POLICY "Admins can view all profiles in clinic" 
    ON profiles FOR ALL 
    TO authenticated 
    USING (
        get_my_role() = 'admin' AND clinic_id = get_my_clinic_id()
    );

-- 4. Fix patients policy
DROP POLICY IF EXISTS "Admins/Doctors can delete patients" ON patients;
CREATE POLICY "Admins/Doctors can delete patients" 
    ON patients FOR DELETE 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        get_my_role() IN ('admin', 'doctor')
    );

-- 5. Fix medicines policy
DROP POLICY IF EXISTS "Admins/Doctors can manage medicines" ON medicines;
CREATE POLICY "Admins/Doctors can manage medicines" 
    ON medicines FOR ALL 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        get_my_role() IN ('admin', 'doctor')
    );

-- 6. Fix settings policy
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings" 
    ON settings FOR ALL 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        get_my_role() = 'admin'
    );

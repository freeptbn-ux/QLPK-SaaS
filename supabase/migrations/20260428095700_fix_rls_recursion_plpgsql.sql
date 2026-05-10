-- Fix infinite recursion by using plpgsql to prevent function inlining
-- which allows SECURITY DEFINER to correctly bypass RLS on the target table.

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS BIGINT AS $$
DECLARE
    v_clinic_id BIGINT;
BEGIN
    SELECT clinic_id INTO v_clinic_id FROM public.profiles WHERE id = auth.uid();
    RETURN v_clinic_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

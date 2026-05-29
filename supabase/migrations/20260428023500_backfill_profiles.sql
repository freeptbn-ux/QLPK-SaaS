-- Backfill missing profiles for existing users
-- Gives them admin access to clinic 1

INSERT INTO public.profiles (id, full_name, clinic_id, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 1, 'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- =========================================================================
-- Lovable Account Synchronization & Role Verification Script
-- =========================================================================
-- Use this script in your Supabase SQL Editor if you are migrating or syncing
-- accounts from your Lovable prototype to your Vercel deployment database.
--
-- Note: User auth credentials (passwords) live in auth.users. If you use the same 
-- Supabase project ID (wnbgbezfghfkakhnbdfj) on Vercel, auth accounts are already identical!
-- This script ensures their profiles and roles exist with proper permissions.

-- 1. Ensure user profiles exist for all 4 Lovable accounts
INSERT INTO public.profiles (user_id, full_name, school_name, grade_level)
SELECT id, 'Dips Chic', 'Generic High School', 'Freshman (9th)'
FROM auth.users 
WHERE id::text LIKE 'e62d3b5a%'
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name;

INSERT INTO public.profiles (user_id, full_name, school_name, grade_level)
SELECT id, 'Jaylene Alicea', 'Generic High School', 'Freshman (9th)'
FROM auth.users 
WHERE id::text LIKE '8918bde2%'
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name;

INSERT INTO public.profiles (user_id, full_name, school_name, grade_level)
SELECT id, 'Evelyn Lim', 'Generic High School', 'Freshman (9th)'
FROM auth.users 
WHERE id::text LIKE '937cbd74%'
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name;

INSERT INTO public.profiles (user_id, full_name, school_name, grade_level)
SELECT id, 'Ramakrishna Krishna', 'Generic Middle School', '8th Grade'
FROM auth.users 
WHERE id::text LIKE 'd9494eed%'
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name, grade_level = '8th Grade';

-- 2. Ensure Ramakrishna Krishna has the admin role
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id 
  FROM auth.users 
  WHERE id::text LIKE 'd9494eed%'
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT DO NOTHING;
    RAISE NOTICE 'Admin role confirmed for Ramakrishna Krishna (%)', v_admin_id;
  END IF;
END $$;

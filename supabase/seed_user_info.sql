-- =========================================================================
-- Seed Script: Krishna's Info & Brag Sheet Entries from Lovable to Supabase
-- =========================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/wnbgbezfghfkakhnbdfj/sql)

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Try to find the user ID for Krishna or the matching user
  SELECT user_id INTO v_user_id 
  FROM public.profiles 
  WHERE full_name ILIKE '%Ramakrishna%' OR full_name ILIKE '%Krishna%'
  LIMIT 1;

  -- If not found by full_name, find the user from auth.users or profiles
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
  END IF;

  IF v_user_id IS NOT NULL THEN
    -- Update profile
    UPDATE public.profiles
    SET 
      full_name = 'Ramakrishna Krishna',
      grade_level = '8th Grade',
      updated_at = NOW()
    WHERE user_id = v_user_id;

    -- Clean up any existing duplicate test entries with these titles for this user
    DELETE FROM public.brag_sheet_entries 
    WHERE user_id = v_user_id 
      AND title IN (
        'Created LunchLit', 
        'Edited Book', 
        'EY & Microsoft Ai Skills Passport Completion', 
        'Code your Dreams Innovator Award'
      );

    -- 1. Created LunchLit
    INSERT INTO public.brag_sheet_entries (
      user_id,
      title,
      category,
      description,
      impact,
      start_date,
      end_date,
      is_ongoing,
      grade_level,
      school_year,
      hours_spent,
      position_role,
      grades_participated,
      verification_status
    ) VALUES (
      v_user_id,
      'Created LunchLit',
      'leadership',
      'Created LunchLit',
      'Allowed students to have a more efficient school life.',
      '2025-12-01',
      '2026-04-30',
      false,
      '8th Grade',
      '2025-2026',
      33,
      'Founder & Lead Developer',
      ARRAY['8th Grade'],
      'verified'
    );

    -- 2. Edited Book
    INSERT INTO public.brag_sheet_entries (
      user_id,
      title,
      category,
      description,
      impact,
      start_date,
      end_date,
      is_ongoing,
      grade_level,
      school_year,
      hours_spent,
      position_role,
      grades_participated,
      verification_status
    ) VALUES (
      v_user_id,
      'Edited Book',
      'volunteering',
      'I edited the book "The Echoes of Tomorrow" and created the cover.',
      NULL,
      '2025-11-01',
      '2026-05-31',
      false,
      '8th Grade',
      '2025-2026',
      6,
      'Book Editor & Cover Designer',
      ARRAY['8th Grade'],
      'verified'
    );

    -- 3. EY & Microsoft Ai Skills Passport Completion
    INSERT INTO public.brag_sheet_entries (
      user_id,
      title,
      category,
      description,
      impact,
      start_date,
      end_date,
      is_ongoing,
      grade_level,
      school_year,
      hours_spent,
      grades_participated,
      year_received,
      verification_status
    ) VALUES (
      v_user_id,
      'EY & Microsoft Ai Skills Passport Completion',
      'award',
      'Completed the course "AI Skills Passport" offered by EY and Microsoft',
      'Completed the course "AI Skills Passport" offered by EY and Microsoft',
      '2026-01-15',
      '2026-01-15',
      false,
      '8th Grade',
      '2025-2026',
      5,
      ARRAY['8th Grade'],
      '2026',
      'verified'
    );

    -- 4. Code your Dreams Innovator Award
    INSERT INTO public.brag_sheet_entries (
      user_id,
      title,
      category,
      description,
      impact,
      start_date,
      end_date,
      is_ongoing,
      grade_level,
      school_year,
      grades_participated,
      year_received,
      verification_status
    ) VALUES (
      v_user_id,
      'Code your Dreams Innovator Award',
      'award',
      'Won for my work on LunchLIT',
      'Awarded the Code Your Dreams Builder / Innovator Award for building LunchLit to enhance students school experience and productivity.',
      '2026-02-01',
      '2026-02-01',
      false,
      '8th Grade',
      '2025-2026',
      ARRAY['8th Grade'],
      '2026',
      'verified'
    );

    RAISE NOTICE 'Successfully seeded Krishna''s Lovable brag sheet entries for user %', v_user_id;
  ELSE
    RAISE NOTICE 'No user profile found in the database. Please sign up or log in first.';
  END IF;
END $$;

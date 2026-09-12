-- Fix: wellness_logs RLS policies and unique constraint
-- This migration ensures the wellness tab buttons (mood, water tracker) work correctly

-- 1. Ensure RLS is enabled on wellness_logs
ALTER TABLE IF EXISTS public.wellness_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting policies to recreate cleanly
DROP POLICY IF EXISTS "Users can view own wellness logs" ON public.wellness_logs;
DROP POLICY IF EXISTS "Users can insert own wellness logs" ON public.wellness_logs;
DROP POLICY IF EXISTS "Users can update own wellness logs" ON public.wellness_logs;
DROP POLICY IF EXISTS "Users can delete own wellness logs" ON public.wellness_logs;
DROP POLICY IF EXISTS "Users can manage own wellness logs" ON public.wellness_logs;

-- 3. Create comprehensive CRUD policies
CREATE POLICY "Users can view own wellness logs"
  ON public.wellness_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness logs"
  ON public.wellness_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness logs"
  ON public.wellness_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness logs"
  ON public.wellness_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Ensure the unique constraint exists (required for upsert onConflict: 'user_id,log_date')
DO 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'wellness_logs_user_id_log_date_key'
    AND conrelid = 'public.wellness_logs'::regclass
  ) THEN
    ALTER TABLE public.wellness_logs
      ADD CONSTRAINT wellness_logs_user_id_log_date_key UNIQUE (user_id, log_date);
  END IF;
END ;

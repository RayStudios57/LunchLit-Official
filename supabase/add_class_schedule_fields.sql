-- Add block_type and period_number columns to class_schedules table
ALTER TABLE public.class_schedules 
  ADD COLUMN IF NOT EXISTS block_type TEXT DEFAULT 'academic',
  ADD COLUMN IF NOT EXISTS period_number TEXT;

-- Comment on columns for schema documentation
COMMENT ON COLUMN public.class_schedules.block_type IS 'Category: academic, lunch, free, or club';
COMMENT ON COLUMN public.class_schedules.period_number IS 'Label for class period (e.g. Period 1, Advisory, A Lunch)';

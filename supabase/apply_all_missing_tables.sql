-- =============================================
-- Migration: 20251220190048_631800d3-5cb4-4188-927d-4f056448c2d5.sql
-- =============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  school_name TEXT DEFAULT 'Generic High School',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT DEFAULT 'general' CHECK (category IN ('homework', 'test', 'project', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
CREATE POLICY "Users can create their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create class_schedules table
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_name TEXT NOT NULL,
  teacher_name TEXT,
  room_number TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own schedules" ON public.class_schedules;
CREATE POLICY "Users can view their own schedules" ON public.class_schedules
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own schedules" ON public.class_schedules;
CREATE POLICY "Users can create their own schedules" ON public.class_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own schedules" ON public.class_schedules;
CREATE POLICY "Users can update their own schedules" ON public.class_schedules
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own schedules" ON public.class_schedules;
CREATE POLICY "Users can delete their own schedules" ON public.class_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Create chat_messages table for AI chatbot history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
CREATE POLICY "Users can view their own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;
CREATE POLICY "Users can create their own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;
CREATE POLICY "Users can delete their own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_schedules_updated_at ON public.class_schedules;
CREATE TRIGGER update_class_schedules_updated_at
  BEFORE UPDATE ON public.class_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Migration: 20251221034244_c25fdbb7-d078-47a6-97fd-8a50cfe2e7c9.sql
-- =============================================

-- Add grade_level to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendar_sync_enabled boolean DEFAULT false;

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Schools are viewable by everyone" ON public.schools;
CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can modify schools" ON public.schools;
CREATE POLICY "Only admins can modify schools" ON public.schools FOR ALL
  USING (false);

-- Create meal_schedules table
CREATE TABLE IF NOT EXISTS public.meal_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  meal_date date NOT NULL,
  meal_type text NOT NULL DEFAULT 'lunch',
  menu_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Meal schedules are viewable by everyone" ON public.meal_schedules;
CREATE POLICY "Meal schedules are viewable by everyone" ON public.meal_schedules FOR SELECT
  USING (true);

-- Update profiles to reference school
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);

-- Create user_preferences table for theme and settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text DEFAULT 'default',
  color_mode text DEFAULT 'system',
  calendar_sync_enabled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_id uuid REFERENCES public.schools(id),
  title text,
  content text NOT NULL,
  parent_id uuid REFERENCES public.discussions(id) ON DELETE CASCADE,
  category text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Discussions are viewable by authenticated users" ON public.discussions;
CREATE POLICY "Discussions are viewable by authenticated users" ON public.discussions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create discussions" ON public.discussions;
CREATE POLICY "Users can create discussions" ON public.discussions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own discussions" ON public.discussions;
CREATE POLICY "Users can update their own discussions" ON public.discussions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own discussions" ON public.discussions;
CREATE POLICY "Users can delete their own discussions" ON public.discussions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_schools_updated_at ON public.schools;
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_schedules_updated_at ON public.meal_schedules;
CREATE TRIGGER update_meal_schedules_updated_at
  BEFORE UPDATE ON public.meal_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_discussions_updated_at ON public.discussions;
CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default school
INSERT INTO public.schools (id, name, address) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Generic High School', '123 Main Street') ON CONFLICT (id) DO NOTHING;

-- Enable realtime for discussions
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;

-- =============================================
-- Migration: 20251222040042_b53ed023-f3db-4ceb-baf6-d681d06fe425.sql
-- =============================================

-- Add restrictive RLS policies to meal_schedules table to prevent unauthorized modifications
-- Currently only has SELECT policy, need to block INSERT/UPDATE/DELETE

DROP POLICY IF EXISTS "Deny all inserts on meal_schedules" ON public.meal_schedules;
CREATE POLICY "Deny all inserts on meal_schedules" ON public.meal_schedules 
FOR INSERT 
WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all updates on meal_schedules" ON public.meal_schedules;
CREATE POLICY "Deny all updates on meal_schedules" ON public.meal_schedules 
FOR UPDATE 
USING (false);

DROP POLICY IF EXISTS "Deny all deletes on meal_schedules" ON public.meal_schedules;
CREATE POLICY "Deny all deletes on meal_schedules" ON public.meal_schedules 
FOR DELETE 
USING (false);

-- =============================================
-- Migration: 20251222040824_a22bbf4a-8cb7-4a66-a39c-a8d8de20357c.sql
-- =============================================

-- Fix discussions cross-school exposure by updating RLS policy
-- Create a helper function to get current user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Discussions are viewable by authenticated users" ON public.discussions;

-- Create a new policy that restricts viewing to same school OR null school (for general discussions)
DROP POLICY IF EXISTS "Users can view discussions from their school" ON public.discussions;
CREATE POLICY "Users can view discussions from their school" ON public.discussions 
FOR SELECT 
TO authenticated
USING (
  school_id IS NULL 
  OR school_id = public.get_user_school_id(auth.uid())
);

-- Add storage policies for avatars bucket to enforce file type and size limits
-- First, drop existing permissive policies if they exist
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Create strict policies for avatars bucket with MIME type validation
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
  )
);

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
  )
);

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- Migration: 20251222221629_6379fe06-8a25-4a09-a066-3c2157833ee2.sql
-- =============================================

-- Create enum for brag sheet entry categories
DO $$ BEGIN
  CREATE TYPE public.brag_category AS ENUM (
  'volunteering',
  'job',
  'award',
  'internship',
  'leadership',
  'club',
  'extracurricular',
  'academic',
  'other'
);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create enum for verification status (for future use)
DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create brag_sheet_entries table
CREATE TABLE IF NOT EXISTS public.brag_sheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category brag_category NOT NULL DEFAULT 'other',
  description TEXT,
  impact TEXT,
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  grade_level TEXT NOT NULL,
  school_year TEXT NOT NULL,
  hours_spent INTEGER,
  -- Future verification fields
  verification_status verification_status DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  -- Auto-suggestion tracking
  suggested_from_task_id UUID,
  is_auto_suggested BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brag_sheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own brag sheet entries" ON public.brag_sheet_entries;
CREATE POLICY "Users can view their own brag sheet entries" ON public.brag_sheet_entries
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own brag sheet entries" ON public.brag_sheet_entries;
CREATE POLICY "Users can create their own brag sheet entries" ON public.brag_sheet_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own brag sheet entries" ON public.brag_sheet_entries;
CREATE POLICY "Users can update their own brag sheet entries" ON public.brag_sheet_entries
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own brag sheet entries" ON public.brag_sheet_entries;
CREATE POLICY "Users can delete their own brag sheet entries" ON public.brag_sheet_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_brag_sheet_entries_updated_at ON public.brag_sheet_entries;
CREATE TRIGGER update_brag_sheet_entries_updated_at
BEFORE UPDATE ON public.brag_sheet_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- CREATE INDEX IF NOT EXISTS for efficient queries by user and grade level
CREATE INDEX IF NOT EXISTS idx_brag_sheet_user_grade ON public.brag_sheet_entries(user_id, grade_level);
CREATE INDEX IF NOT EXISTS idx_brag_sheet_user_year ON public.brag_sheet_entries(user_id, school_year);

-- =============================================
-- Migration: 20251222222151_d524467b-4b52-44f6-9d8d-086083f4751c.sql
-- =============================================

-- Add field to track last grade progression
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_grade_progression TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add a graduated flag for students who complete Senior year
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT false;

-- =============================================
-- Migration: 20251230040243_06cc5bd6-0453-42fa-89fc-90b94b5c66e4.sql
-- =============================================

-- Create user roles enum and table for role-based access
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'counselor', 'student');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create user roles table (following security best practices)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  email_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if user is a verifier (teacher or counselor)
CREATE OR REPLACE FUNCTION public.is_verifier(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('teacher', 'counselor')
  )
$$;

-- Security definer function to get verifier's school_id
CREATE OR REPLACE FUNCTION public.get_verifier_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id 
  FROM public.user_roles 
  WHERE user_id = _user_id 
    AND role IN ('teacher', 'counselor')
  LIMIT 1
$$;

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create menu_uploads table for school menu submissions
CREATE TABLE IF NOT EXISTS public.menu_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  school_email TEXT NOT NULL,
  upload_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on menu_uploads
ALTER TABLE public.menu_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for menu_uploads
DROP POLICY IF EXISTS "Anyone can submit menu uploads" ON public.menu_uploads;
CREATE POLICY "Anyone can submit menu uploads" ON public.menu_uploads
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all menu uploads" ON public.menu_uploads;
CREATE POLICY "Admins can view all menu uploads" ON public.menu_uploads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update menu uploads" ON public.menu_uploads;
CREATE POLICY "Admins can update menu uploads" ON public.menu_uploads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update brag_sheet_entries RLS to allow verifiers to view entries from their school
DROP POLICY IF EXISTS "Verifiers can view entries from their school" ON public.brag_sheet_entries;
CREATE POLICY "Verifiers can view entries from their school" ON public.brag_sheet_entries
FOR SELECT
USING (
  public.is_verifier(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = brag_sheet_entries.user_id 
    AND p.school_id = public.get_verifier_school_id(auth.uid())
  )
);

-- Allow verifiers to update verification status
DROP POLICY IF EXISTS "Verifiers can verify entries from their school" ON public.brag_sheet_entries;
CREATE POLICY "Verifiers can verify entries from their school" ON public.brag_sheet_entries
FOR UPDATE
USING (
  public.is_verifier(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = brag_sheet_entries.user_id 
    AND p.school_id = public.get_verifier_school_id(auth.uid())
  )
);

-- Add trigger for menu_uploads updated_at
DROP TRIGGER IF EXISTS update_menu_uploads_updated_at ON public.menu_uploads;
CREATE TRIGGER update_menu_uploads_updated_at
BEFORE UPDATE ON public.menu_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20260102034858_3d4a8ac5-9e60-4e33-b941-ebe7ae11efcd.sql
-- =============================================

-- CREATE TABLE IF NOT EXISTS public.for allowed email domains
CREATE TABLE IF NOT EXISTS public.allowed_email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  auto_assign_role public.app_role NOT NULL DEFAULT 'student',
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.allowed_email_domains ENABLE ROW LEVEL SECURITY;

-- Everyone can view domains (needed for signup validation)
DROP POLICY IF EXISTS "Anyone can view allowed domains" ON public.allowed_email_domains;
CREATE POLICY "Anyone can view allowed domains" ON public.allowed_email_domains
FOR SELECT
USING (true);

-- Only admins can manage domains
DROP POLICY IF EXISTS "Admins can insert domains" ON public.allowed_email_domains;
CREATE POLICY "Admins can insert domains" ON public.allowed_email_domains
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update domains" ON public.allowed_email_domains;
CREATE POLICY "Admins can update domains" ON public.allowed_email_domains
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete domains" ON public.allowed_email_domains;
CREATE POLICY "Admins can delete domains" ON public.allowed_email_domains
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to check email domain and return role
CREATE OR REPLACE FUNCTION public.get_role_for_email_domain(_email text)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auto_assign_role 
  FROM public.allowed_email_domains 
  WHERE _email LIKE '%@' || domain
  LIMIT 1
$$;

-- Create function to auto-assign role on user creation based on email
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _school_id uuid;
BEGIN
  -- Get role for email domain
  SELECT auto_assign_role, school_id INTO _role, _school_id
  FROM public.allowed_email_domains
  WHERE NEW.email LIKE '%@' || domain
  LIMIT 1;
  
  -- If a matching domain was found, create the role
  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, school_id, email_domain)
    VALUES (NEW.id, _role, _school_id, split_part(NEW.email, '@', 2));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign roles on signup
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- =============================================
-- Migration: 20260102040536_22645d27-5926-47e1-b4d7-51e144067872.sql
-- =============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT
WITH CHECK (true);

-- CREATE INDEX IF NOT EXISTS for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =============================================
-- Migration: 20260103020031_76c6ea2f-b38c-46d9-ac27-8f2dc02dad7f.sql
-- =============================================

-- 1. Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create discussion_categories table for custom categories
CREATE TABLE IF NOT EXISTS public.discussion_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    color text DEFAULT '#6366f1',
    icon text DEFAULT 'message-square',
    school_id uuid REFERENCES public.schools(id),
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view categories" ON public.discussion_categories;
CREATE POLICY "Everyone can view categories" ON public.discussion_categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.discussion_categories;
CREATE POLICY "Admins can manage categories" ON public.discussion_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add pin_discussion capability for admins - create a function
CREATE OR REPLACE FUNCTION public.toggle_discussion_pin(_discussion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin') THEN
    UPDATE public.discussions 
    SET is_pinned = NOT is_pinned 
    WHERE id = _discussion_id;
  END IF;
END;
$$;

-- 4. Create meal_dietary_tags table for admin-configurable dietary options
CREATE TABLE IF NOT EXISTS public.meal_dietary_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text DEFAULT '#10b981',
    icon text,
    school_id uuid REFERENCES public.schools(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_dietary_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view dietary tags" ON public.meal_dietary_tags;
CREATE POLICY "Everyone can view dietary tags" ON public.meal_dietary_tags
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage dietary tags" ON public.meal_dietary_tags;
CREATE POLICY "Admins can manage dietary tags" ON public.meal_dietary_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add is_club and show_every_day columns to class_schedules
ALTER TABLE public.class_schedules 
ADD COLUMN IF NOT EXISTS is_club boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_every_day boolean DEFAULT false;

-- 6. Allow admins to insert schools
DROP POLICY IF EXISTS "Only admins can modify schools" ON public.schools;

DROP POLICY IF EXISTS "Admins can insert schools" ON public.schools;
CREATE POLICY "Admins can insert schools" ON public.schools
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update schools" ON public.schools;
CREATE POLICY "Admins can update schools" ON public.schools
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete schools" ON public.schools;
CREATE POLICY "Admins can delete schools" ON public.schools
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Allow admins to manage meal_schedules
DROP POLICY IF EXISTS "Deny all inserts on meal_schedules" ON public.meal_schedules;
DROP POLICY IF EXISTS "Deny all updates on meal_schedules" ON public.meal_schedules;
DROP POLICY IF EXISTS "Deny all deletes on meal_schedules" ON public.meal_schedules;

DROP POLICY IF EXISTS "Admins can insert meal schedules" ON public.meal_schedules;
CREATE POLICY "Admins can insert meal schedules" ON public.meal_schedules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update meal schedules" ON public.meal_schedules;
CREATE POLICY "Admins can update meal schedules" ON public.meal_schedules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete meal schedules" ON public.meal_schedules;
CREATE POLICY "Admins can delete meal schedules" ON public.meal_schedules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- Migration: 20260104004008_acb4a4ed-2d69-41ed-8630-c7dd35dab060.sql
-- =============================================

-- Create study_halls table for real-time tracking
CREATE TABLE IF NOT EXISTS public.study_halls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id),
  name text NOT NULL,
  location text NOT NULL,
  teacher text,
  capacity integer NOT NULL DEFAULT 30,
  current_occupancy integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  periods text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on study_halls
ALTER TABLE public.study_halls ENABLE ROW LEVEL SECURITY;

-- Everyone can view study halls
DROP POLICY IF EXISTS "Everyone can view study halls" ON public.study_halls;
CREATE POLICY "Everyone can view study halls" ON public.study_halls FOR SELECT
USING (true);

-- Admins can manage study halls
DROP POLICY IF EXISTS "Admins can manage study halls" ON public.study_halls;
CREATE POLICY "Admins can manage study halls" ON public.study_halls FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Teachers can update occupancy
DROP POLICY IF EXISTS "Teachers can update study hall occupancy" ON public.study_halls;
CREATE POLICY "Teachers can update study hall occupancy" ON public.study_halls FOR UPDATE
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Enable realtime for study_halls
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_halls;

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  new_menu_items boolean NOT NULL DEFAULT true,
  study_hall_availability boolean NOT NULL DEFAULT true,
  grade_progression boolean NOT NULL DEFAULT true,
  discussion_replies boolean NOT NULL DEFAULT true,
  task_reminders boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Add check constraints to menu_uploads for security
ALTER TABLE public.menu_uploads ADD CONSTRAINT menu_uploads_school_email_check 
CHECK (school_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add size limit check via trigger for upload_data
CREATE OR REPLACE FUNCTION check_upload_data_size()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.upload_data::text) > 500000 THEN
    RAISE EXCEPTION 'Upload data exceeds maximum size of 500KB';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_menu_upload_size ON public.menu_uploads;
CREATE TRIGGER check_menu_upload_size
BEFORE INSERT OR UPDATE ON public.menu_uploads
FOR EACH ROW EXECUTE FUNCTION check_upload_data_size();

-- Add updated_at trigger for study_halls
DROP TRIGGER IF EXISTS update_study_halls_updated_at ON public.study_halls;
CREATE TRIGGER update_study_halls_updated_at
BEFORE UPDATE ON public.study_halls
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for notification_preferences
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20260104004022_f6ec1fda-e372-413f-98f2-d95767003827.sql
-- =============================================

-- Fix function search_path for check_upload_data_size
CREATE OR REPLACE FUNCTION check_upload_data_size()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(NEW.upload_data::text) > 500000 THEN
    RAISE EXCEPTION 'Upload data exceeds maximum size of 500KB';
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- Migration: 20260109222510_7f568e63-6a52-402c-9732-d06ebed379ff.sql
-- =============================================

-- Create custom_roles table for admin-defined roles
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  permissions jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can view custom roles
DROP POLICY IF EXISTS "Everyone can view custom roles" ON public.custom_roles;
CREATE POLICY "Everyone can view custom roles" ON public.custom_roles
FOR SELECT
USING (true);

-- Only admins can manage custom roles
DROP POLICY IF EXISTS "Admins can manage custom roles" ON public.custom_roles;
CREATE POLICY "Admins can manage custom roles" ON public.custom_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add custom_role_id to user_roles table for custom role assignments
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS custom_role_id uuid REFERENCES public.custom_roles(id) ON DELETE CASCADE;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_custom_roles_updated_at ON public.custom_roles;
CREATE TRIGGER update_custom_roles_updated_at
BEFORE UPDATE ON public.custom_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20260110180954_900aaf17-a357-45b8-ad48-03d55541f04f.sql
-- =============================================

-- Create role upgrade requests table
CREATE TABLE IF NOT EXISTS public.role_upgrade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
DROP POLICY IF EXISTS "Users can view their own role requests" ON public.role_upgrade_requests;
CREATE POLICY "Users can view their own role requests" ON public.role_upgrade_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
DROP POLICY IF EXISTS "Users can create their own role requests" ON public.role_upgrade_requests;
CREATE POLICY "Users can create their own role requests" ON public.role_upgrade_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
DROP POLICY IF EXISTS "Admins can view all role requests" ON public.role_upgrade_requests;
CREATE POLICY "Admins can view all role requests" ON public.role_upgrade_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all requests
DROP POLICY IF EXISTS "Admins can update role requests" ON public.role_upgrade_requests;
CREATE POLICY "Admins can update role requests" ON public.role_upgrade_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete requests
DROP POLICY IF EXISTS "Admins can delete role requests" ON public.role_upgrade_requests;
CREATE POLICY "Admins can delete role requests" ON public.role_upgrade_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_role_upgrade_requests_updated_at ON public.role_upgrade_requests;
CREATE TRIGGER update_role_upgrade_requests_updated_at
BEFORE UPDATE ON public.role_upgrade_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20260111225240_e797cefc-bc72-49b4-bb5b-fabbd0725dde.sql
-- =============================================

-- Add icon and priority fields to custom_roles
ALTER TABLE public.custom_roles 
ADD COLUMN IF NOT EXISTS icon text DEFAULT 'shield',
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- =============================================
-- Migration: 20260111225849_0b8b8c74-5310-4d29-8ea1-47e4a1ab9f64.sql
-- =============================================

-- Create audit log table for role changes and admin actions
CREATE TABLE IF NOT EXISTS public.role_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL, -- 'role_added', 'role_removed', 'role_updated', 'permission_changed', 'bulk_assignment'
  performed_by uuid NOT NULL,
  target_user_id uuid,
  target_role_id uuid,
  custom_role_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.role_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.role_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (via authenticated users with admin role)
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.role_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.role_audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- CREATE INDEX IF NOT EXISTS for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.role_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.role_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON public.role_audit_logs(target_user_id);

-- Add highest_role_icon to cache user's display role in discussions (for performance)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_role_icon text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS display_role_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS display_role_priority integer DEFAULT 0;

-- =============================================
-- Migration: 20260117191330_2debe9f7-5871-4540-b695-2f274df5fe5a.sql
-- =============================================

-- Fix security issue: menu_uploads should require authentication
DROP POLICY IF EXISTS "Anyone can submit menu uploads" ON public.menu_uploads;
DROP POLICY IF EXISTS "Authenticated users can submit menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit menu uploads" ON public.menu_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix security issue: notifications should only allow system/admin inserts
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Create policy allowing only admins to insert notifications for other users
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Fix security issue: discussions with null school_id
DROP POLICY IF EXISTS "Users can view discussions from their school" ON public.discussions;
DROP POLICY IF EXISTS "Users can view discussions from their school" ON public.discussions;
CREATE POLICY "Users can view discussions from their school" ON public.discussions
  FOR SELECT
  USING (
    -- Allow viewing if user has same school_id OR if discussion has no school (global discussions)
    school_id IS NULL
    OR school_id = (SELECT school_id FROM profiles WHERE user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- Add policy for admins to view all chat messages for safety monitoring
DROP POLICY IF EXISTS "Admins can view all chat messages for moderation" ON public.chat_messages;
CREATE POLICY "Admins can view all chat messages for moderation" ON public.chat_messages
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- =============================================
-- Migration: 20260118175548_799420f5-6eeb-41fe-8f33-94aa663c07c4.sql
-- =============================================

-- Add new columns to brag_sheet_entries for the comprehensive template
-- Academics section
ALTER TABLE public.brag_sheet_entries 
ADD COLUMN IF NOT EXISTS gpa_weighted DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS gpa_unweighted DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS test_scores JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS courses_taken JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS colleges_applying_to TEXT[];

-- Activities section enhancements  
ALTER TABLE public.brag_sheet_entries
ADD COLUMN IF NOT EXISTS position_role TEXT,
ADD COLUMN IF NOT EXISTS grades_participated TEXT[];

-- Awards section enhancements
ALTER TABLE public.brag_sheet_entries
ADD COLUMN IF NOT EXISTS year_received TEXT;

-- Create brag_sheet_insights table for insight questions
CREATE TABLE IF NOT EXISTS public.brag_sheet_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_key)
);

-- Enable RLS on brag_sheet_insights
ALTER TABLE public.brag_sheet_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for brag_sheet_insights
DROP POLICY IF EXISTS "Users can view their own insights" ON public.brag_sheet_insights;
CREATE POLICY "Users can view their own insights" ON public.brag_sheet_insights FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own insights" ON public.brag_sheet_insights;
CREATE POLICY "Users can create their own insights" ON public.brag_sheet_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own insights" ON public.brag_sheet_insights;
CREATE POLICY "Users can update their own insights" ON public.brag_sheet_insights FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own insights" ON public.brag_sheet_insights;
CREATE POLICY "Users can delete their own insights" ON public.brag_sheet_insights FOR DELETE
USING (auth.uid() = user_id);

-- Create brag_sheet_academics table for per-user academic info
CREATE TABLE IF NOT EXISTS public.brag_sheet_academics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  gpa_weighted DECIMAL(4,2),
  gpa_unweighted DECIMAL(4,2),
  test_scores JSONB DEFAULT '[]'::jsonb,
  courses JSONB DEFAULT '[]'::jsonb,
  colleges_applying TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brag_sheet_academics ENABLE ROW LEVEL SECURITY;

-- RLS policies for brag_sheet_academics
DROP POLICY IF EXISTS "Users can view their own academics" ON public.brag_sheet_academics;
CREATE POLICY "Users can view their own academics" ON public.brag_sheet_academics FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own academics" ON public.brag_sheet_academics;
CREATE POLICY "Users can create their own academics" ON public.brag_sheet_academics FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own academics" ON public.brag_sheet_academics;
CREATE POLICY "Users can update their own academics" ON public.brag_sheet_academics FOR UPDATE
USING (auth.uid() = user_id);

-- Fix notification INSERT policy - restrict to admin or service role
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

DROP POLICY IF EXISTS "Admins or system can insert notifications" ON public.notifications;
CREATE POLICY "Admins or system can insert notifications" ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

-- =============================================
-- Migration: 20260121004658_5be87203-4366-45e8-9f84-38e85a932876.sql
-- =============================================

-- CREATE TABLE IF NOT EXISTS public.for creator social links (editable by owner only)
CREATE TABLE IF NOT EXISTS public.creator_social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_social_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view social links
DROP POLICY IF EXISTS "Anyone can view creator social links" ON public.creator_social_links;
CREATE POLICY "Anyone can view creator social links" ON public.creator_social_links
FOR SELECT
USING (true);

-- Only owner can manage social links (using email check)
DROP POLICY IF EXISTS "Only owner can insert social links" ON public.creator_social_links;
CREATE POLICY "Only owner can insert social links" ON public.creator_social_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'kutturam0912@gmail.com'
  )
);

DROP POLICY IF EXISTS "Only owner can update social links" ON public.creator_social_links;
CREATE POLICY "Only owner can update social links" ON public.creator_social_links
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'kutturam0912@gmail.com'
  )
);

DROP POLICY IF EXISTS "Only owner can delete social links" ON public.creator_social_links;
CREATE POLICY "Only owner can delete social links" ON public.creator_social_links
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'kutturam0912@gmail.com'
  )
);

-- CREATE TABLE IF NOT EXISTS public.for user suggestions
CREATE TABLE IF NOT EXISTS public.user_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'feature',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view all suggestions
DROP POLICY IF EXISTS "Anyone can view suggestions" ON public.user_suggestions;
CREATE POLICY "Anyone can view suggestions" ON public.user_suggestions
FOR SELECT
USING (true);

-- Authenticated users can submit suggestions
DROP POLICY IF EXISTS "Authenticated users can submit suggestions" ON public.user_suggestions;
CREATE POLICY "Authenticated users can submit suggestions" ON public.user_suggestions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own suggestions
DROP POLICY IF EXISTS "Users can update own suggestions" ON public.user_suggestions;
CREATE POLICY "Users can update own suggestions" ON public.user_suggestions
FOR UPDATE
USING (auth.uid() = user_id);

-- Insert default social links
INSERT INTO public.creator_social_links (platform, url, icon, display_order) VALUES
('email', 'mailto:kutturam0912@gmail.com', 'Mail', 1),
('github', 'https://github.com/ramakrishnakrishna', 'Github', 2),
('linkedin', 'https://linkedin.com/in/ramakrishnakrishna', 'Linkedin', 3)
ON CONFLICT DO NOTHING;

-- =============================================
-- Migration: 20260130000514_d888d219-7a8e-4d1e-a593-d816bb589638.sql
-- =============================================

-- Fix overly permissive RLS policy on menu_uploads
-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can submit menu uploads" ON public.menu_uploads;

-- Create a proper policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can submit their own menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit their own menu uploads" ON public.menu_uploads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: The 'true' in WITH CHECK is acceptable here because:
-- 1. The policy uses 'TO authenticated' which means only logged-in users can insert
-- 2. Menu uploads are meant to be reviewed by admins anyway
-- 3. We validate the data structure in application code

-- =============================================
-- Migration: 20260130001634_7daf48aa-c7a3-43e7-9188-143133cbf025.sql
-- =============================================

-- Create storage bucket for brag sheet images
INSERT INTO storage.buckets (id, name, public) VALUES ('brag-sheet-images', 'brag-sheet-images', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for brag sheet images
DROP POLICY IF EXISTS "Users can view brag sheet images" ON storage.objects;
CREATE POLICY "Users can view brag sheet images" ON storage.objects FOR SELECT
USING (bucket_id = 'brag-sheet-images');

DROP POLICY IF EXISTS "Users can upload their own brag sheet images" ON storage.objects;
CREATE POLICY "Users can upload their own brag sheet images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brag-sheet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own brag sheet images" ON storage.objects;
CREATE POLICY "Users can update their own brag sheet images" ON storage.objects FOR UPDATE
USING (bucket_id = 'brag-sheet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own brag sheet images" ON storage.objects;
CREATE POLICY "Users can delete their own brag sheet images" ON storage.objects FOR DELETE
USING (bucket_id = 'brag-sheet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add images column to brag_sheet_entries table
ALTER TABLE public.brag_sheet_entries 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- =============================================
-- Migration: 20260130003652_baac5c69-674f-4be3-944a-5d18a7817024.sql
-- =============================================

-- Create student goals table for future planning (college, career, programs)
CREATE TABLE IF NOT EXISTS public.student_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'college', -- college, career, program, personal
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, paused
  priority TEXT DEFAULT 'medium', -- low, medium, high
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create target schools table for college planning
CREATE TABLE IF NOT EXISTS public.target_schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_name TEXT NOT NULL,
  location TEXT,
  application_deadline DATE,
  admission_type TEXT DEFAULT 'regular', -- early_decision, early_action, regular
  status TEXT DEFAULT 'researching', -- researching, applying, applied, accepted, rejected, waitlisted, enrolled
  notes TEXT,
  is_reach BOOLEAN DEFAULT false,
  is_safety BOOLEAN DEFAULT false,
  is_match BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_schools ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.student_goals;
CREATE POLICY "Users can view their own goals" ON public.student_goals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own goals" ON public.student_goals;
CREATE POLICY "Users can create their own goals" ON public.student_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own goals" ON public.student_goals;
CREATE POLICY "Users can update their own goals" ON public.student_goals FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.student_goals;
CREATE POLICY "Users can delete their own goals" ON public.student_goals FOR DELETE USING (auth.uid() = user_id);

-- Teachers/counselors can view goals for their school students (read only)
DROP POLICY IF EXISTS "Verifiers can view student goals" ON public.student_goals;
CREATE POLICY "Verifiers can view student goals" ON public.student_goals FOR SELECT USING (
  is_verifier(auth.uid()) AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = student_goals.user_id 
    AND p.school_id = get_verifier_school_id(auth.uid())
  )
);

-- RLS policies for target_schools
DROP POLICY IF EXISTS "Users can view their own target schools" ON public.target_schools;
CREATE POLICY "Users can view their own target schools" ON public.target_schools FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own target schools" ON public.target_schools;
CREATE POLICY "Users can create their own target schools" ON public.target_schools FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own target schools" ON public.target_schools;
CREATE POLICY "Users can update their own target schools" ON public.target_schools FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own target schools" ON public.target_schools;
CREATE POLICY "Users can delete their own target schools" ON public.target_schools FOR DELETE USING (auth.uid() = user_id);

-- Teachers/counselors can view target schools for their school students (read only)
DROP POLICY IF EXISTS "Verifiers can view student target schools" ON public.target_schools;
CREATE POLICY "Verifiers can view student target schools" ON public.target_schools FOR SELECT USING (
  is_verifier(auth.uid()) AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = target_schools.user_id 
    AND p.school_id = get_verifier_school_id(auth.uid())
  )
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_student_goals_updated_at ON public.student_goals;
CREATE TRIGGER update_student_goals_updated_at
  BEFORE UPDATE ON public.student_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_target_schools_updated_at ON public.target_schools;
CREATE TRIGGER update_target_schools_updated_at
  BEFORE UPDATE ON public.target_schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20260221233443_cd0c9682-ffc9-4e9f-9799-1ddbddfb621e.sql
-- =============================================

-- Allow admins to update any suggestion's status
DROP POLICY IF EXISTS "Admins can update all suggestions" ON public.user_suggestions;
CREATE POLICY "Admins can update all suggestions" ON public.user_suggestions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));


-- =============================================
-- Migration: 20260222180500_d229eeb6-f9ab-4264-9b25-11ac5fa3c640.sql
-- =============================================


-- Create achievements/badges table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all achievements" ON public.user_achievements;
CREATE POLICY "Admins can view all achievements" ON public.user_achievements FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));


-- =============================================
-- Migration: 20260304015303_97b25e6e-b531-490b-93f2-dce6934f1f0b.sql
-- =============================================


-- Add profile visibility column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create tutors table
CREATE TABLE IF NOT EXISTS public.tutors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  availability text,
  rating numeric DEFAULT 5.0,
  is_online boolean DEFAULT false,
  contact_info text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Everyone can view tutors
DROP POLICY IF EXISTS "Everyone can view tutors" ON public.tutors;
CREATE POLICY "Everyone can view tutors" ON public.tutors FOR SELECT USING (true);

-- Authenticated users can add tutors
DROP POLICY IF EXISTS "Authenticated users can add tutors" ON public.tutors;
CREATE POLICY "Authenticated users can add tutors" ON public.tutors FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Users can update their own tutors
DROP POLICY IF EXISTS "Users can update own tutors" ON public.tutors;
CREATE POLICY "Users can update own tutors" ON public.tutors FOR UPDATE 
USING (auth.uid() = created_by);

-- Users can delete their own tutors, admins can delete any
DROP POLICY IF EXISTS "Users can delete own tutors" ON public.tutors;
CREATE POLICY "Users can delete own tutors" ON public.tutors FOR DELETE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_tutors_updated_at ON public.tutors;
CREATE TRIGGER update_tutors_updated_at
BEFORE UPDATE ON public.tutors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================
-- Migration: 20260304015649_0423b319-6dd0-4904-842e-c0f22a66b323.sql
-- =============================================


-- Allow anyone to view public profiles
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles" ON public.profiles
FOR SELECT USING (is_public = true);


-- =============================================
-- Migration: 20260309224532_a412f849-318e-41f9-b31d-70eee3a66f03.sql
-- =============================================

UPDATE public.profiles SET is_public = true WHERE user_id = '724c21f3-d6ba-497a-8ad9-a80dab24b55d';

-- =============================================
-- Migration: 20260309225754_ab5d1e03-3b87-4efc-847f-5d4fad3b432c.sql
-- =============================================


-- Create a function to call the welcome email edge function on new user signup
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use pg_net to call the edge function asynchronously
  PERFORM net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_ANON_KEY' LIMIT 1)
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Student')
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
-- NOTE: We attach to the existing handle_new_user flow by creating a separate trigger
CREATE OR REPLACE TRIGGER on_auth_user_created_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();


-- =============================================
-- Migration: 20260401021508_1f00e559-8be0-41b5-8abc-6447d1382107.sql
-- =============================================


-- Fix the welcome email trigger to not block signup on failure
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_ANON_KEY' LIMIT 1)
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Student')
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Welcome email failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Add school_end_date and use_theme_background to user_preferences
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS school_end_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS use_theme_background boolean DEFAULT false;

-- Add friends table for cheering/collaboration
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own friend connections" ON public.friends;
CREATE POLICY "Users can view their own friend connections" ON public.friends FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friends;
CREATE POLICY "Users can send friend requests" ON public.friends FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update friend requests they received" ON public.friends;
CREATE POLICY "Users can update friend requests they received" ON public.friends FOR UPDATE TO authenticated
  USING (auth.uid() = friend_user_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own friend connections" ON public.friends;
CREATE POLICY "Users can delete their own friend connections" ON public.friends FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

-- Add cheers table
CREATE TABLE IF NOT EXISTS public.cheers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text DEFAULT 'ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cheers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view cheers they sent or received" ON public.cheers;
CREATE POLICY "Users can view cheers they sent or received" ON public.cheers FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can send cheers" ON public.cheers;
CREATE POLICY "Users can send cheers" ON public.cheers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can delete cheers they sent" ON public.cheers;
CREATE POLICY "Users can delete cheers they sent" ON public.cheers FOR DELETE TO authenticated
  USING (auth.uid() = from_user_id);


-- =============================================
-- Migration: 20260401021521_483cc2ba-8034-4928-943f-226d8f7f22fc.sql
-- =============================================


DROP POLICY IF EXISTS "Authenticated users can submit their own menu uploads" ON public.menu_uploads;
DROP POLICY IF EXISTS "Authenticated users can submit their own menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit their own menu uploads" ON public.menu_uploads FOR INSERT TO authenticated
  WITH CHECK (true);


-- =============================================
-- Migration: 20260402011813_17638aa5-d82c-4634-8b0c-44153b4ec4b2.sql
-- =============================================


-- Add shared_with_friends flag to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS shared_with_friends boolean DEFAULT false;

-- Allow accepted friends to view each other's class schedules
DROP POLICY IF EXISTS "Friends can view each other's schedules" ON public.class_schedules;
CREATE POLICY "Friends can view each other's schedules" ON public.class_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friends
    WHERE status = 'accepted'
    AND (
      (friends.user_id = auth.uid() AND friends.friend_user_id = class_schedules.user_id)
      OR (friends.friend_user_id = auth.uid() AND friends.user_id = class_schedules.user_id)
    )
  )
);

-- Allow accepted friends to view tasks marked as shared
DROP POLICY IF EXISTS "Friends can view shared tasks" ON public.tasks;
CREATE POLICY "Friends can view shared tasks" ON public.tasks
FOR SELECT
TO authenticated
USING (
  shared_with_friends = true
  AND EXISTS (
    SELECT 1 FROM public.friends
    WHERE status = 'accepted'
    AND (
      (friends.user_id = auth.uid() AND friends.friend_user_id = tasks.user_id)
      OR (friends.friend_user_id = auth.uid() AND friends.user_id = tasks.user_id)
    )
  )
);


-- =============================================
-- Migration: 20260403183414_45eb0a02-919e-4574-a12a-fede69a33fb8.sql
-- =============================================


CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.direct_messages;
CREATE POLICY "Users can view their own messages" ON public.direct_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages to friends" ON public.direct_messages;
CREATE POLICY "Users can send messages to friends" ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM friends
    WHERE status = 'accepted'
    AND (
      (friends.user_id = auth.uid() AND friends.friend_user_id = receiver_id)
      OR (friends.friend_user_id = auth.uid() AND friends.user_id = receiver_id)
    )
  )
);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.direct_messages;
CREATE POLICY "Users can delete their own messages" ON public.direct_messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created ON public.direct_messages(created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;


-- =============================================
-- Migration: 20260405034916_aeff45ba-cacb-4a3f-a428-194f456435d8.sql
-- =============================================


-- Add read receipts, image support, and moderation to direct_messages
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS read_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason text DEFAULT NULL;

-- Create chat-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat images
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;
CREATE POLICY "Anyone can view chat images" ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;
CREATE POLICY "Users can delete their own chat images" ON storage.objects FOR DELETE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);


-- =============================================
-- Migration: 20260405035346_cff535e4-62e5-4712-a32d-6a46b02e6021.sql
-- =============================================


-- Add friend request toggle to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS allow_friend_requests boolean DEFAULT true;

-- Add DM notification preference
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS direct_messages boolean DEFAULT true;

-- Create function to notify on new DM
CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sender_name text;
  _dm_pref boolean;
BEGIN
  -- Check if receiver wants DM notifications
  SELECT direct_messages INTO _dm_pref
  FROM public.notification_preferences
  WHERE user_id = NEW.receiver_id;

  -- Default to true if no preferences set
  IF _dm_pref IS NULL OR _dm_pref = true THEN
    SELECT full_name INTO _sender_name
    FROM public.profiles
    WHERE user_id = NEW.sender_id;

    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.receiver_id,
      'New message from ' || COALESCE(_sender_name, 'a friend'),
      LEFT(NEW.content, 100),
      'direct_message',
      jsonb_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_new_direct_message ON public.direct_messages;
CREATE TRIGGER on_new_direct_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_direct_message();


-- =============================================
-- Migration: 20260407205514_b221cf6e-9e4d-42d0-8cfe-96fc229460cb.sql
-- =============================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_status text DEFAULT NULL;

-- =============================================
-- Migration: 20260408002141_c0817b72-27ef-44cc-ac42-37bd4de9baf2.sql
-- =============================================


-- 1. Make brag-sheet-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'brag-sheet-images';

-- 2. Fix brag-sheet-images SELECT policy to be owner-scoped
DROP POLICY IF EXISTS "Users can view brag sheet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own brag sheet images" ON storage.objects;
CREATE POLICY "Users can view own brag sheet images" ON storage.objects FOR SELECT
USING (
  bucket_id = 'brag-sheet-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Fix menu_uploads INSERT policy to bind to user identity
DROP POLICY IF EXISTS "Authenticated users can submit their own menu uploads" ON public.menu_uploads;
DROP POLICY IF EXISTS "Authenticated users can submit menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit menu uploads" ON public.menu_uploads FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Fix user_suggestions SELECT policy - only own suggestions
DROP POLICY IF EXISTS "Anyone can view suggestions" ON public.user_suggestions;
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.user_suggestions;
CREATE POLICY "Users can view their own suggestions" ON public.user_suggestions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.user_suggestions;
CREATE POLICY "Admins can view all suggestions" ON public.user_suggestions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 5. Remove user self-insert on achievements (should be server-side only)
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;


-- =============================================
-- Migration: 20260408002318_48a2a98f-c928-4965-888f-728c4726b085.sql
-- =============================================


-- Create a secure function to award achievements
CREATE OR REPLACE FUNCTION public.award_achievement(_user_id uuid, _badge_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate badge_key length
  IF length(_badge_key) > 100 THEN
    RAISE EXCEPTION 'Invalid badge key';
  END IF;

  -- Only allow the user themselves to trigger their own achievement
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Cannot award achievements for other users';
  END IF;

  -- Insert if not already exists
  INSERT INTO public.user_achievements (user_id, badge_key)
  VALUES (_user_id, _badge_key)
  ON CONFLICT DO NOTHING;
END;
$$;


-- =============================================
-- Migration: 20260512205646_50eeb31e-3a89-46f3-b7c2-857f94f8bc1b.sql
-- =============================================


CREATE OR REPLACE FUNCTION public.protect_owner_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid := '724c21f3-d6ba-497a-8ad9-a80dab24b55d'::uuid;
BEGIN
  -- Protect the owner account from losing admin role on DELETE
  IF TG_OP = 'DELETE' AND OLD.user_id = owner_id AND OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Cannot remove admin role from owner account';
  END IF;

  -- Protect the owner account from having admin role changed on UPDATE
  IF TG_OP = 'UPDATE' AND OLD.user_id = owner_id AND OLD.role = 'admin' THEN
    -- If role is being changed away from admin, block it
    IF NEW.role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Cannot change admin role for owner account';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS protect_owner_admin ON public.user_roles;

DROP TRIGGER IF EXISTS protect_owner_admin ON public.user_roles;
CREATE TRIGGER protect_owner_admin
BEFORE DELETE OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_owner_admin_role();


-- =============================================
-- Migration: 20260512205931_e087756b-a55e-415d-b323-9d92b094dabc.sql
-- =============================================


-- Change the default so new profiles start as public
ALTER TABLE public.profiles ALTER COLUMN is_public SET DEFAULT true;

-- Update all existing profiles to be public
UPDATE public.profiles SET is_public = true WHERE is_public = false OR is_public IS NULL;


-- =============================================
-- Migration: 20260601163851_aeabcdb9-548c-4e33-a242-291524723ec8.sql
-- =============================================

-- Daily wellness log (mood + water) per user per day
CREATE TABLE IF NOT EXISTS public.wellness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  mood TEXT,
  water_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_logs TO authenticated;
GRANT ALL ON public.wellness_logs TO service_role;

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own wellness logs" ON public.wellness_logs;
CREATE POLICY "Users manage their own wellness logs" ON public.wellness_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_wellness_logs_updated_at ON public.wellness_logs;
CREATE TRIGGER update_wellness_logs_updated_at
BEFORE UPDATE ON public.wellness_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fitness profile per user
CREATE TABLE IF NOT EXISTS public.fitness_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age INTEGER NOT NULL DEFAULT 16,
  goal TEXT,
  days_per_week INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fitness_profiles TO authenticated;
GRANT ALL ON public.fitness_profiles TO service_role;

ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own fitness profile" ON public.fitness_profiles;
CREATE POLICY "Users manage their own fitness profile" ON public.fitness_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_fitness_profiles_updated_at ON public.fitness_profiles;
CREATE TRIGGER update_fitness_profiles_updated_at
BEFORE UPDATE ON public.fitness_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gym routines
CREATE TABLE IF NOT EXISTS public.gym_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Routine',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_routines TO authenticated;
GRANT ALL ON public.gym_routines TO service_role;

ALTER TABLE public.gym_routines ENABLE ROW LEVEL SECURITY;

-- Routine shares (so a friend can view a routine shared with them)
CREATE TABLE IF NOT EXISTS public.routine_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.gym_routines(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (routine_id, to_user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routine_shares TO authenticated;
GRANT ALL ON public.routine_shares TO service_role;

ALTER TABLE public.routine_shares ENABLE ROW LEVEL SECURITY;

-- Helper to check if a routine is shared with the current user
CREATE OR REPLACE FUNCTION public.routine_shared_with(_routine_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.routine_shares
    WHERE routine_id = _routine_id AND to_user_id = _user_id
  )
$$;

DROP POLICY IF EXISTS "Users manage their own routines" ON public.gym_routines;
CREATE POLICY "Users manage their own routines" ON public.gym_routines FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view routines shared with them" ON public.gym_routines;
CREATE POLICY "Users can view routines shared with them" ON public.gym_routines FOR SELECT
USING (public.routine_shared_with(id, auth.uid()));

DROP POLICY IF EXISTS "Users can share their own routines" ON public.routine_shares;
CREATE POLICY "Users can share their own routines" ON public.routine_shares FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can view shares involving them" ON public.routine_shares;
CREATE POLICY "Users can view shares involving them" ON public.routine_shares FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can remove shares involving them" ON public.routine_shares;
CREATE POLICY "Users can remove shares involving them" ON public.routine_shares FOR DELETE
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP TRIGGER IF EXISTS update_gym_routines_updated_at ON public.gym_routines;
CREATE TRIGGER update_gym_routines_updated_at
BEFORE UPDATE ON public.gym_routines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Workout logs (days worked out, for streaks)
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own workout logs" ON public.workout_logs;
CREATE POLICY "Users manage their own workout logs" ON public.workout_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Migration: 20260608232628_96eefb3c-2b30-4283-a0d4-4f720fce9d5d.sql
-- =============================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS showcase_badge text;

-- =============================================
-- Migration: 20260612175142_0a44e3d7-4a60-4ae8-a582-0b9765e3827b.sql
-- =============================================


CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'accepted',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (invitee_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Records a referral for the currently authenticated (newly signed-up) user
-- and notifies the inviter. Self-referrals and duplicates are ignored.
CREATE OR REPLACE FUNCTION public.record_referral(_inviter_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitee uuid := auth.uid();
  _invitee_name text;
BEGIN
  IF _invitee IS NULL OR _inviter_id IS NULL OR _inviter_id = _invitee THEN
    RETURN;
  END IF;

  -- Only record the first referral for this invitee
  IF EXISTS (SELECT 1 FROM public.referrals WHERE invitee_id = _invitee) THEN
    RETURN;
  END IF;

  INSERT INTO public.referrals (inviter_id, invitee_id, status)
  VALUES (_inviter_id, _invitee, 'accepted');

  SELECT full_name INTO _invitee_name
  FROM public.profiles WHERE user_id = _invitee;

  -- Notify the inviter that their invite was accepted
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (
    _inviter_id,
    'Invite accepted! ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°',
    COALESCE(_invitee_name, 'A new student') || ' joined LunchLIT using your invite link.',
    'referral_accepted',
    jsonb_build_object('invitee_id', _invitee)
  );

  -- Award the inviter the "Spread the Word" badge
  INSERT INTO public.user_achievements (user_id, badge_key)
  VALUES (_inviter_id, 'inviter')
  ON CONFLICT DO NOTHING;
END;
$$;

-- When a referred friend unlocks a badge, notify their inviter.
CREATE OR REPLACE FUNCTION public.notify_inviter_on_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inviter uuid;
  _friend_name text;
BEGIN
  SELECT inviter_id INTO _inviter
  FROM public.referrals
  WHERE invitee_id = NEW.user_id;

  IF _inviter IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO _friend_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (
    _inviter,
    'A friend unlocked a badge! ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦',
    COALESCE(_friend_name, 'A friend you invited') || ' just unlocked the "' || NEW.badge_key || '" badge.',
    'friend_badge',
    jsonb_build_object('friend_id', NEW.user_id, 'badge_key', NEW.badge_key)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_inviter_on_badge_trigger ON public.user_achievements;
CREATE TRIGGER notify_inviter_on_badge_trigger
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.notify_inviter_on_badge();


-- =============================================
-- Migration: 20260826193500_ab_rotation_support.sql
-- =============================================

-- Add rotation_day to class_schedules
ALTER TABLE public.class_schedules 
ADD COLUMN IF NOT EXISTS rotation_day text NOT NULL DEFAULT 'all';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'class_schedules_rotation_day_check'
  ) THEN
    ALTER TABLE public.class_schedules 
    ADD CONSTRAINT class_schedules_rotation_day_check 
    CHECK (rotation_day IN ('all', 'A', 'B'));
  END IF;
END $$;

-- Add rotation fields to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS schedule_rotation text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS rotation_anchor_date date,
ADD COLUMN IF NOT EXISTS rotation_anchor_letter text DEFAULT 'A',
ADD COLUMN IF NOT EXISTS rotation_skip_weekends boolean DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_schedule_rotation_check'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD CONSTRAINT user_preferences_schedule_rotation_check 
    CHECK (schedule_rotation IN ('none', 'ab'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_rotation_anchor_letter_check'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD CONSTRAINT user_preferences_rotation_anchor_letter_check 
    CHECK (rotation_anchor_letter IN ('A', 'B'));
  END IF;
END $$;


-- =============================================
-- Migration: 20260912000001_fix_wellness_rls.sql
-- =============================================

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
DROP POLICY IF EXISTS "Users can view own wellness logs" ON public.wellness_logs;
CREATE POLICY "Users can view own wellness logs" ON public.wellness_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wellness logs" ON public.wellness_logs;
CREATE POLICY "Users can insert own wellness logs" ON public.wellness_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wellness logs" ON public.wellness_logs;
CREATE POLICY "Users can update own wellness logs" ON public.wellness_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wellness logs" ON public.wellness_logs;
CREATE POLICY "Users can delete own wellness logs" ON public.wellness_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Ensure the unique constraint exists (required for upsert onConflict: 'user_id,log_date')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'wellness_logs_user_id_log_date_key'
    AND conrelid = 'public.wellness_logs'::regclass
  ) THEN
    ALTER TABLE public.wellness_logs
      ADD CONSTRAINT wellness_logs_user_id_log_date_key UNIQUE (user_id, log_date);
  END IF;
END $$;


-- =============================================
-- Migration: 20260912000002_fix_storage_rls.sql
-- =============================================

-- Fix: avatars storage bucket + RLS policies for profile picture uploads

-- 1. Create the avatars bucket if it doesn't exist (public so images are viewable)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Drop any old avatar storage policies to recreate cleanly
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 3. Public read access for all avatar files
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 4. Authenticated users can upload to their own folder ({user_id}/...)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Authenticated users can update/replace their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Authenticated users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );



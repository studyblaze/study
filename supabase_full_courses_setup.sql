-- Complete SQL Setup for Courses Table
-- Run this in your Supabase SQL Editor to create the missing courses table

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    tag TEXT,
    level TEXT,
    price NUMERIC DEFAULT 0,
    thumbnail TEXT,
    is_published BOOLEAN DEFAULT false,
    admin_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published and approved courses"
    ON public.courses FOR SELECT
    USING (is_published = true AND admin_approved = true);

CREATE POLICY "Tutors can view their own courses"
    ON public.courses FOR SELECT
    USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert their own courses"
    ON public.courses FOR INSERT
    WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own courses"
    ON public.courses FOR UPDATE
    USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete their own courses"
    ON public.courses FOR DELETE
    USING (auth.uid() = tutor_id);

CREATE POLICY "Admins have full access to courses"
    ON public.courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

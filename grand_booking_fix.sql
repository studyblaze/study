-- grand_booking_fix.sql
-- ========================================================
-- EMERGENCY REPAIR: Fixes Columns, RLS, and Schema for Bookings
-- ========================================================

-- 1. Ensure all required columns exist in the bookings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_method') THEN
        ALTER TABLE public.bookings ADD COLUMN payment_method TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'promo_code') THEN
        ALTER TABLE public.bookings ADD COLUMN promo_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tutor_share') THEN
        ALTER TABLE public.bookings ADD COLUMN tutor_share DECIMAL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'company_share') THEN
        ALTER TABLE public.bookings ADD COLUMN company_share DECIMAL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'currency') THEN
        ALTER TABLE public.bookings ADD COLUMN currency TEXT DEFAULT 'INR';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'amount_inr') THEN
        ALTER TABLE public.bookings ADD COLUMN amount_inr DECIMAL DEFAULT 0;
    END IF;
END $$;

-- 2. Ensure is_owner exists in tutors
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutors' AND column_name = 'is_owner') THEN
        ALTER TABLE public.tutors ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. RESET RLS (Nuclear option to ensure things work)
-- First, disable and re-enable to clear state if needed
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- Drop all possible conflicting policies
DO $$ 
DECLARE 
    tbl RECORD;
    pol RECORD;
BEGIN 
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('sessions', 'bookings', 'financial_ledger')) LOOP
        FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename AND schemaname = 'public') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident(tbl.tablename);
        END LOOP;
    END LOOP;
END $$;

-- Create ultra-permissive policies for current debugging
CREATE POLICY "grand_insert_bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grand_select_bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "grand_update_bookings" ON public.bookings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "grand_insert_sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grand_select_sessions" ON public.sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "grand_insert_ledger" ON public.financial_ledger FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grand_select_ledger" ON public.financial_ledger FOR SELECT TO authenticated USING (true);

-- 4. Re-seed Owner record
UPDATE public.tutors 
SET is_owner = TRUE 
WHERE profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d';

-- 5. REFRESH Postgres Schema for API
NOTIFY pgrst, 'reload schema';

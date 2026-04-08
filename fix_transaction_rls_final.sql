-- FINAL TRANSACTION RLS FIX (MASTER CLEANUP)
-- This script ensures both Students AND Admins can record transactions, 
-- including ₹0.00 (100% OFF) and "Credit to Tutor" transactions.

-- 1. DYNAMICALLY DROP ALL EXISTING POLICIES (NUCLEAR CLEANUP)
-- This ensures no hidden or overlapping policies interfere.
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'transactions' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.transactions';
    END LOOP;
END $$;

-- 2. ENABLE RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. CREATE NEW SELECT POLICY (OWN DATA + ADMINS)
CREATE POLICY "trans_select_policy" 
ON public.transactions FOR SELECT 
TO authenticated
USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. CREATE NEW INSERT POLICY (OWN DATA + ADMINS)
-- This is critical for 100% OFF bookings and Admins booking for students.
CREATE POLICY "trans_insert_policy" 
ON public.transactions FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';

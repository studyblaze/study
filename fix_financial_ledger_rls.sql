-- fix_financial_ledger_rls.sql
-- Adds INSERT and SELECT policies to financial_ledger to support client-side bookings

-- 1. Enable RLS
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- 2. DROP any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins and Users can view relevant ledger" ON public.financial_ledger;
DROP POLICY IF EXISTS "Users view own ledger" ON public.financial_ledger;
DROP POLICY IF EXISTS "Users can insert their own ledger entries" ON public.financial_ledger;

-- 3. SELECT Policy (View own ledger or admin view all)
CREATE POLICY "Admins and Users can view relevant ledger" 
ON public.financial_ledger FOR SELECT 
TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. INSERT Policy (Allow users to record their own payments/earnings)
-- Note: This is required because finalizeBooking in BookingContext.tsx performs client-side inserts.
CREATE POLICY "Users can insert their own ledger entries" 
ON public.financial_ledger FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = user_id
);

-- 5. REFRESH schema
NOTIFY pgrst, 'reload schema';

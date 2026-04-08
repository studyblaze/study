-- 1. FIX WALLET RLS FOR ADMINS
-- Allow admins to see all wallets, while users see their own.
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" 
ON public.wallets FOR SELECT 
TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 2. FIX FINANCIAL LEDGER RLS FOR ADMINS
-- Allow admins to see all ledger entries, while users see their own.
DROP POLICY IF EXISTS "Users view own ledger" ON public.financial_ledger;
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

-- 3. FORCE SYNC SHREYASH KALE BALANCES
-- Shreyash Kale Profile ID: 54fb63ef-cc85-4c65-8d02-0787497a381d
DO $$
DECLARE
    v_shreyash_id UUID := '54fb63ef-cc85-4c65-8d02-0787497a381d';
BEGIN
    -- Update or Insert 142 INR balance
    INSERT INTO public.wallets (user_id, balance, currency)
    VALUES (v_shreyash_id, 142, 'INR')
    ON CONFLICT (user_id) DO UPDATE SET 
        balance = 142,
        updated_at = NOW();

    -- Optional: Ensure a transaction record exists for this balance if not already present
    IF NOT EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE user_id = v_shreyash_id AND amount = 142 AND description LIKE '%10 DKK%'
    ) THEN
        INSERT INTO public.transactions (user_id, amount, description, type, status, currency, amount_inr)
        VALUES (v_shreyash_id, 142, 'Legacy Balance (10 DKK Demo Lessons)', 'bonus', 'completed', 'INR', 142);
    END IF;
END $$;

-- 4. REFRESH PostgREST cache
NOTIFY pgrst, 'reload schema';

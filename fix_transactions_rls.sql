-- 1. Restore Mahbub's Balance
UPDATE public.subscriptions 
SET balance_hours = 4, status = 'active'
WHERE student_id = 'd9ce4e44-a0ce-41a4-aec0-086c697960b0' 
AND tutor_id = 5;

-- 2. Comprehensive RLS for Transactions
-- Update Select Policy
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users and Admins can view transactions" ON public.transactions;

CREATE POLICY "Users and Admins can view transactions" 
ON public.transactions FOR SELECT 
USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Update Insert Policy
DROP POLICY IF EXISTS "Users and Admins can record transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can record transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can spend from their own wallet" ON public.transactions;

CREATE POLICY "Users and Admins can record transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (
    (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') 
    AND 
    (
        (type = 'payment' AND amount <= 0) OR
        (type = 'top_up' AND amount >= 0) OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
);

-- 3. Comprehensive RLS for Wallets
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users and Admins can view wallet" 
ON public.wallets FOR SELECT 
USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update wallets" ON public.wallets;
CREATE POLICY "Admins can update wallets" 
ON public.wallets FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

NOTIFY pgrst, 'reload schema';

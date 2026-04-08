-- FIX TRANSACTION RLS ERROR
-- Problem: Users cannot insert transactions with amount 0 (100% OFF) because of strict < 0 check.
-- Run this in the Supabase SQL Editor

-- 1. Drop the old policy
DROP POLICY IF EXISTS "Users can spend from their own wallet" ON public.transactions;

-- 2. Create a refined policy that allows 0-amount transactions
CREATE POLICY "Users can spend from their own wallet" 
ON public.transactions FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND 
    type = 'payment' AND 
    amount <= 0 -- Changed from < 0 to <= 0 to allow 100% OFF transactions
);

-- 3. Optimization: Notify schema reload
NOTIFY pgrst, 'reload schema';

-- MASTER FIX FOR TRANSACTION RLS ERROR
-- This script cleans up all existing policies on the transactions table and replaces them 
-- with correct, modern policies that support 100% discounts (₹0.00).

-- 1. DROP ALL POTENTIAL CONFLICTING POLICIES
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can spend from their own wallet" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;

-- 2. CREATE CLEAN SELECT POLICY
-- Allows users to see their own transactions, and admins to see all.
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. CREATE CLEAN INSERT POLICY
-- Allows users to create their own transaction records.
-- Supports all amounts (including ₹0.00 for 100% OFF/Demo lessons).
CREATE POLICY "Users can insert their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (
    auth.uid() = user_id
);

-- 4. ENSURE RLS IS ENABLED
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';

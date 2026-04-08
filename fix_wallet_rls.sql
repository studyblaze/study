-- FIX WALLET RLS ERROR
-- Problem: The trigger function update_wallet_balance() runs with the privileges of the user 
-- who triggered the transaction (the Student), but the Student doesn't have RLS permission 
-- to INSERT or UPDATE the public.wallets table.
-- Solution: Update the function to use SECURITY DEFINER so it runs as the owner.

CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update for completed transactions
    IF (NEW.status = 'completed') THEN
        -- Increase/Decrease the user's wallet balance
        INSERT INTO public.wallets (user_id, balance)
        VALUES (NEW.user_id, NEW.amount)
        ON CONFLICT (user_id) DO UPDATE
        SET balance = public.wallets.balance + EXCLUDED.balance,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS safeguard: Ensure users can only SEE their own balance
-- But keep INSERT/UPDATE restricted to the SECURITY DEFINER function.
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" 
ON public.wallets FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Initialize missing wallets for all users just in case
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Reload schema
NOTIFY pgrst, 'reload schema';

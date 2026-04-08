-- RECONCILIATION FOR SHREYASH KALE (Legacy System)
-- GOAL: Clear all "phantom" earnings from subscription bookings and restore balance to ₹142.

BEGIN;

-- 1. DELETE FROM LEDGER (Safe check)
-- This will run only if the table exists, preventing the "relation does not exist" error.
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_ledger' AND table_schema = 'public') THEN
        DELETE FROM public.financial_ledger WHERE user_id = '54fb63ef-cc85-4c65-8d02-0787497a381d';
    END IF;
END $$;

-- 2. DELETE STALE TRANSACTIONS
-- Clear the ₹1,000 "bonus" added by the buggy subscription trigger.
DELETE FROM public.transactions 
WHERE user_id = '54fb63ef-cc85-4c65-8d02-0787497a381d'
AND type = 'bonus' 
AND (amount = 1000 OR amount_inr = 1000);

-- 3. RESET WALLET
-- Set the legacy wallet to EXACTLY ₹142.00.
UPDATE public.wallets 
SET balance = 142.00, 
    updated_at = NOW()
WHERE user_id = '54fb63ef-cc85-4c65-8d02-0787497a381d';

COMMIT;

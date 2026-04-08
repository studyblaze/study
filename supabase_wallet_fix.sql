-- WALLET SYSTEM MIGRATION

-- 1. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('top_up', 'payment', 'refund', 'withdrawal', 'bonus')),
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger to Update Wallet Balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'completed') THEN
        INSERT INTO public.wallets (user_id, balance)
        VALUES (NEW.user_id, NEW.amount)
        ON CONFLICT (user_id) DO UPDATE
        SET balance = public.wallets.balance + EXCLUDED.balance,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_wallet_balance ON public.transactions;
CREATE TRIGGER tr_update_wallet_balance
AFTER INSERT OR UPDATE OF status ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- 4. Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" 
ON public.wallets FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Initialize Wallets for existing users
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

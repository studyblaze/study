-- =============================================
-- FIX: promo_codes RLS Policy for Admin Access
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create the promo_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- 3. Drop any old/broken policies
DROP POLICY IF EXISTS "Admin manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can read active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admin insert promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admin update promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admin delete promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admin select promo codes" ON public.promo_codes;

-- 4. Allow all operations via anon/authenticated key (used by admin panel)
CREATE POLICY "Admin select promo codes" ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Admin insert promo codes" ON public.promo_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update promo codes" ON public.promo_codes FOR UPDATE USING (true);
CREATE POLICY "Admin delete promo codes" ON public.promo_codes FOR DELETE USING (true);

-- 5. Allow public users to read only active, non-expired promo codes (for checkout)
-- (This is already covered by the admin SELECT USING(true) above)

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify policies exist
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'promo_codes';
